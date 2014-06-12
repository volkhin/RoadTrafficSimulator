'use strict'

module.exports = {}
Object.genId = ->
  Math.random().toString().substr(2) | 0

Function::property = (prop, desc) ->
  Object.defineProperty @prototype, prop, desc

{}
