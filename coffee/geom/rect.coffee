'use strict'

{abs} = Math
require '../helpers'
_ = require 'underscore'
Point = require './point'
Segment = require './segment'

class Rect
  constructor: (@x, @y, @_width = 0, @_height = 0) ->

  @copy: (rect) ->
    new Rect rect.x, rect.y, rect._width, rect._height

  toJSON: ->
    _.extend {}, this

  area: ->
    @width() * @height()

  left: (left) ->
    @x = left if left?
    @x

  right: (right) ->
    @x = right - @width() if right?
    @x + @width()

  width: (width) ->
    @_width = width if width?
    @_width

  top: (top) ->
    @y = top if top?
    @y

  bottom: (bottom) ->
    @y = bottom - @height() if bottom?
    @y + @height()

  height: (height) ->
    @_height = height if height?
    @_height

  center: (center) ->
    if center?
      @x = center.x - @width() / 2
      @y = center.y - @height() / 2
    new Point @x + @width() / 2, @y + @height() / 2

  containsPoint: (point) ->
    @left() <= point.x <= @right() and @top() <= point.y <= @bottom()

  containsRect: (rect) ->
    @left() <= rect.left() and rect.right() <= @right() and
    @top() <= rect.top() and rect.bottom() <= @bottom()

  getVertices: ->
    [
      new Point(@left(), @top()),
      new Point(@right(), @top()),
      new Point(@right(), @bottom()),
      new Point(@left(), @bottom()),
    ]

  getSide: (i) ->
    vertices = @getVertices()
    new Segment vertices[i], vertices[(i + 1) % 4]

  getSectorId: (point) ->
    offset = point.subtract @center()
    return 0 if offset.y <= 0 and abs(offset.x) <= abs(offset.y)
    return 1 if offset.x >= 0 and abs(offset.x) >= abs(offset.y)
    return 2 if offset.y >= 0 and abs(offset.x) <= abs(offset.y)
    return 3 if offset.x <= 0 and abs(offset.x) >= abs(offset.y)
    throw Error 'algorithm error'

  getSector: (point) ->
    @getSide @getSectorId point

module.exports = Rect
