'use strict'

define [], () ->
  class Point
    constructor: (@x = 0, @y = 0) ->

    add: (o) ->
      new Point @x + o.x, @y + o.y

    subtract: (o) ->
      new Point @x - o.x, @y - o.y

    mult: (k) ->
      new Point @x * k, @y * k

    divide: (k) ->
      new Point @x / k, @y / k

    normalize: ->
      length = @length()
      new Point @x / length, @y / length

    length: ->
      Math.sqrt @x * @x + @y * @y

    direction: ->
      Math.atan2 @y, @x
