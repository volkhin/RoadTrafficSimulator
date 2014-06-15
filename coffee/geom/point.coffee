'use strict'

require '../helpers.coffee'

module.exports =
  class Point
    constructor: (@x = 0, @y = 0) ->

    @property 'length',
      get: ->
        Math.sqrt @x * @x + @y * @y

    @property 'direction',
      get: ->
        Math.atan2 @y, @x

    @property 'normalized',
      get: ->
        new Point @x/@length, @y/@length

    add: (o) ->
      new Point @x + o.x, @y + o.y

    subtract: (o) ->
      new Point @x - o.x, @y - o.y

    mult: (k) ->
      new Point @x * k, @y * k

    divide: (k) ->
      new Point @x / k, @y / k
