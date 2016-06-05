import _ from 'lodash'
import * as graphql from 'graphql'
import CustomGraphQLDateType from 'graphql-custom-datetype'
import rethinkdbdash from 'rethinkdbdash'
let r = rethinkdbdash()
let factory = require('../index')(graphql)
factory.registerTypes({
  DateTime: CustomGraphQLDateType
})

/* make sure tables exist */
function createTable (db, name) {
  return r.db(db).tableCreate(name).run().then(function () {
    console.log('RETHINKDB: Created Table', name, 'on', db)
  }).catch(function (err) {
    console.log('RETHINKDB: Table', name, 'on', db, 'exists')
  })
}
let tables = {
  user: { db: 'test', table: 'user' }
}
_.forEach(tables, function (type) {
  if (type.db && type.table) createTable(type.db, type.table)
})

//  get user list
let getUsers = function () {
  return r.db(tables.user.db).table(tables.user.table).run()
}

//  purge users
let purgeUsers = function () {
  return r.db(tables.user.db).table(tables.user.table).delete().run().then(function () {
    return 200
  }).catch(function (err) {
    return 500
  })
}

//  create function
let createUser = function (obj, args) {
  let changeLog = args.changeLog || { user: 'SYSTEM', message: 'CREATED RECORD' }
  _.merge(changeLog, { date: new Date(), type: 'CREATE' })
  return r.db(tables.user.db).table(tables.user.table)
    .insert({
      _metadata: {
        recordId: r.uuid(),
        version: null,
        validFrom: null,
        validTo: null,
        changeLog: [changeLog]
      },
      id: r.uuid(),
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


let schema = {
  types: {
    EnumChangeLogTypes: {
      $$type: 'Enum',
      CREATE: 'CREATE',
      UPDATE: 'UPDATE',
      BRANCH: 'BRANCH',
      FORK: 'FORK',
      MERGE: 'MERGE',
      PUBLISH: 'PUBLISH',
      VERSION: 'VERSION',
      INFO: 'INFO'
    },
    _ChangeLog: {
      date: { type: 'DateTime', nullable: true },
      type: { type: 'EnumChangeLogTypes', nullable: true },
      user: { type: 'String', nullable: true},
      message: { type: 'String', nullable: true }
    },
    _ChangeLogInput: {
      $$type: 'Input',
      user: { type: 'String', nullable: true },
      message: { type: 'String', nullable: true }
    },
    _VersionMetadata: {
      recordId: { type: 'String', nullable: true },
      version: { type: 'String', nullable: true },
      validFrom: { type: 'DateTime', nullable: true },
      validTo: { type: 'DateTime', nullable: true },
      changeLog: { type: ['_ChangeLog'], nullable: true }
    },
    User: {
      _metadata: { type: '_VersionMetadata', nullable: true },
      id: { type: 'String', primary: true },
      firstName: { type: 'String' },
      lastName: { type: 'String' },
      email: { type: 'String', nullable: true }
    }
  },
  schemas: {
    Users: {
      query: {
        users: {
          type: ['User'],
          resolve: getUsers
        }
      },
      mutation: {
        create: {
          type: 'User',
          args: {
            firstName: { type: 'String' },
            lastName: { type: 'String' },
            email: { type: 'String', nullable: true },
            changeLog: { type: '_ChangeLogInput', nullable: true }
          },
          resolve: createUser
        },
        purge: {
          type: 'Int',
          resolve: purgeUsers
        }
      }
    }
  }
}

let lib = factory.make(schema)

let testCreateGQL = `mutation Mutation {
  create(
    firstName: "john",
    lastName: "doe",
    email: "jdoe@x.com"
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

// lib.Users(testCreateGQL)
// lib.Users(testPurgeGQL)
lib.Users(testGetGQL)
  .then(function (result) {
    _.forEach(result.errors, function (e, i) {
      result.errors[i] = e.message
    })
    console.log(JSON.stringify(result, null, '  '))
  })