'use strict'

require '../helpers.coffee'
Tool = require './tool.coffee'

class ToolIntersectionMover extends Tool
  constructor: ->
    super arguments...
    @intersection = null

  mousedown: (e) =>
    intersection = @getHoveredIntersection @getCell e
    if intersection
      @intersection = intersection
      e.stopImmediatePropagation()

  mouseup: =>
    @intersection = null

  mousemove: (e) =>
    if @intersection
      cell = @getCell e
      @intersection.rect.left(cell.x)
      @intersection.rect.top(cell.y)
      @intersection.update()

  mouseout: =>
    @intersection = null

module.exports = ToolIntersectionMover
