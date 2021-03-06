/*
 * This example requires that a rethinkdb server be running locally on the default port
 * Also, this example should be run with npm run example
 * Also I use this example for testing so it has a lot of extra code and comments
 */
import _ from 'lodash'
import * as graphql from 'graphql'
import CustomGraphQLDateType from 'graphql-custom-datetype'
import rethinkdbdash from 'rethinkdbdash'
import GraphQLFactory from '../src'
// import GraphQLFactory from '../index'
// import preCompile from '../src/compile'
// import access from './access'

let r = rethinkdbdash()
let factory = GraphQLFactory(graphql)

class Title {
  constructor (title, year) {
    this.title = title
    this.year = year
  }
}

/* make sure tables exist */
function createTable (db, name) {
  return r.db(db).tableCreate(name).run().then(function () {
    console.log('RETHINKDB: Created Table', name, 'on', db)
  }).catch(function (err) {
    console.log('RETHINKDB: Table', name, 'on', db, 'exists')
  })
}
let tables = {
  User: { db: 'test', table: 'user' }
}

_.forEach(tables, function (type) {
  if (type.db && type.table) createTable(type.db, type.table)
})

//  get user list
let getUsers = function (source, args, context, info) {
  // console.log(this.utils.getRootFieldDef(info, '_tableName'))

  let typeName = this.utils.getReturnTypeName(info)
  let db = this.globals.db.main
  let config = db.tables[typeName]
  let cursor = db.cursor

  return cursor.db(config.db).table(config.table).run()
}

//  purge users
let purgeUsers = function (source, args, context, info) {
  console.log('Type Config', this.utils.getTypeConfig(info))
  return r.db(tables.User.db).table(tables.User.table).delete().run().then(function () {
    return 200
  }).catch(function (err) {
    return 500
  })
}

//  create function
let createUser = function (obj, args, context, info) {

  let typeName = this.utils.getReturnTypeName(info)
  let db = this.globals.db.main
  let config = db.tables[typeName]
  let cursor = db.cursor

  let changeLog = args.changeLog || { user: 'SYSTEM' }
  _.merge(changeLog, { date: new Date(), type: 'CREATE' })
  return cursor.db(config.db).table(config.table)
    .insert({
      _metadata: {
        recordId: cursor.uuid(),
        version: null,
        validFrom: null,
        validTo: null,
        changeLog: [changeLog]
      },
      id: cursor.uuid(),
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email
    }, {
      returnChanges: true
    })
    .run()
    .then(function (result) {
      if (result.changes.length > 0) return result.changes[0].new_val
      return result
    })
}

let lib = {}

let definition = {
  globals: {
    db: {
      main: {
        cursor: r,
        tables: tables
      }
    }
  },
  functions: {
    createUser,
    purgeUsers,
    getUsers
  },
  fields: {
    Create: {
      create: {
        type: 'User',
        args: {
          firstName: { type: 'String', nullable: false  },
          lastName: { type: 'String', nullable: false  },
          email: { type: 'String'},
          changeLog: { type: '_ChangeLogInput', nullable: false }
        },
        resolve: 'createUser'
      }
    },
    Purge: {
      purge: {
        type: 'Int',
        resolve: 'purgeUsers'
      }
    }
  },
  externalTypes: {
    DateTime: CustomGraphQLDateType
  },
  types: {
    EnumChangeLogTypes: {
      type: 'Enum',
      values: {
        CREATE: 'CREATE',
        UPDATE: 'UPDATE',
        BRANCH: 'BRANCH',
        FORK: 'FORK',
        MERGE: 'MERGE',
        PUBLISH: 'PUBLISH',
        VERSION: 'VERSION',
        INFO: 'INFO'
      }
    },
    _ChangeLog: {
      type: ['Object', 'Input'],
      fields: {
        date: { type: 'DateTime', omitFrom: ['Input'] },
        type: { type: 'EnumChangeLogTypes', omitFrom: ['Input'] },
        user: { type: 'String' },
        message: {
          Object: 'String',
          Input: { type: 'String', nullable: false }
        }
      }
    },
    _VersionMetadata: {
      fields: {
        recordId: { type: 'String' },
        version: { type: 'String' },
        validFrom: { type: 'DateTime' },
        validTo: { type: 'DateTime' },
        changeLog: { type: ['_ChangeLog'] }
      }
    },
    User: {
      fields: {
        _metadata: { type: '_VersionMetadata' },
        id: { type: 'String', primary: true },
        firstName: { type: 'String', nullable: false },
        lastName: { type: 'String', nullable: false  },
        email: { type: 'String' }
      }
    },
    Type1: {
      fields: {
        title: { type: 'String' },
        type1: { type: 'String' }
      }
    },
    Type2: {
      fields: {
        title: { type: 'String' },
        type2: { type: 'String' }
      }
    },
    TestUnion1: {
      type: 'Union',
      types: [ 'Type1', 'Type2' ],
      resolveType: function (value, info) {
        if (value.type1) return this._types[0]
        else if (value.type2) return this._types[1]
      }
    },
    TitleInterface: {
      type: 'Interface',
      fields: {
        title: { type: 'String' }
      }
    },
    Title: {
      interfaces: [ 'TitleInterface' ],
      fields: {
        title: { type: 'String' },
        year: { type: 'Int' }
      },
      isTypeOf: (value) => value instanceof Title
    },
    UsersQuery: {
      fields: {
        users: {
          type: ['User'],
          resolve: 'getUsers',
          _tableName: 'stuff'
        },
        union1: {
          type: 'TestUnion1',
          resolve: function () {
            return { title: 'i am a title', type1: 'im a type1' }
          }
        },
        interface1: {
          type: 'Title',
          interfaces: [ 'TitleInterface' ],
          resolve: function () {
            return new Title('interface title', 2016)
          }
        }
      }
    } /* ,
    UsersMutation: {
      customStuff: {
        v: 1
      },
      extendFields: {
        'Create': { create: [{ type: 'User' }, { name: 'createUser', type: 'User' }] },
        'Purge': { purge: { type: 'String' } }
      }
    } */
  },
  schemas: {
    Users: {
      query: 'UsersQuery',
      // mutation: 'UsersMutation'
      mutation: {
        customStuff: {
          v: 1
        },
        extendFields: {
          'Create': { create: [{ type: 'User' }, { name: 'createUser', type: 'User' }] },
          'Purge': { purge: { type: 'String' } }
        }
      }
    }
  }
}


// console.log(lib._definitions.types['_ChangeLogInput']._fields.message)
// console.log(lib._definitions.schemas.Users._mutationType._fields.create.args[3].type)
// console.log(lib._definitions.schemas.Users._mutationType._fields.create.args[3].type._fields.message.type)

let testCreateGQL = `mutation Mutation {
  createUser(
    firstName: "john",
    lastName: "doe",
    email: "jdoe@x.com",
    changeLog: {
      user: "jdoe",
      message: "new record"
    }
  )
  {
    id, firstName, lastName, email,
    _metadata {
      recordId, version, validFrom, validTo,
      changeLog {
        date, type, user, message
      }
    }
  }
}`

let testPurgeGQL = `mutation Mutation {
  purge
}`

let testGetGQL = `{
  users {
    id, firstName, lastName, email,
    _metadata {
      recordId, version, validFrom, validTo,
      changeLog {
        date, type, user, message
      }
    }
  }
}`

let testGetUnionGQL = `{
  union1 {
    ... on Type1 {
      title,
      type1
    }
    ... on Type2 {
      title,
      type2
    }
  }
}`

let testGetInterfaceGQL = `{
  interface1 {
    title,
    year
  }
}`

// make lib
_.merge(lib, factory.make(definition))
// let compiled = preCompile(access)
// console.log(JSON.stringify(compiled, null, '  '))
// console.log(compiled.types)
// console.log(compiled.types.AccessMutation.fields)
/*
_.forEach(compiled.types, (v, k) => {
  console.log(k, JSON.stringify(_.omit(v, '_typeDef'), null, '  '))
})
console.log('===========SCHEMAS')
console.log(compiled.schemas)
*/
// process.exit()



lib.Users(testGetGQL).then((res) => {
  console.log(JSON.stringify(res, null, '  '))
  process.exit()
})


/*
lib.Users(testCreateGQL)
// lib.Users(testPurgeGQL)
// lib.Users(testGetGQL)
// lib.Users(testGetUnionGQL)

// lib.Users(testGetInterfaceGQL)
  .then(function (result) {
    _.forEach(result.errors, function (e, i) {
      result.errors[i] = e.message
    })
    console.log(JSON.stringify(result, null, '  '))
  })

  */