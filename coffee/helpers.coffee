'use strict'

define () ->
  Function::property = (prop, desc) ->
    Object.defineProperty @prototype, prop, desc

  {}
