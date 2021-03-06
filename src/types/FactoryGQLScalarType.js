export default function FactoryGQLScalarType (_this, definition, nameDefault) {
  try {
    let { name, description, serialize, parseValue, parseLiteral } = definition

    return new _this.graphql.GraphQLScalarType({
      name: name || nameDefault,
      description,
      serialize: _this.bindFunction(serialize),
      parseValue: _this.bindFunction(parseValue),
      parseLiteral: _this.bindFunction(parseLiteral)
    })
  } catch (err) {
    console.error('FactoryGQLScalarType', err)
  }
}