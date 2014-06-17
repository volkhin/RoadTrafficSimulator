'use strict'

module.exports = {}

Function::property = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc
