'use strict'

require '../helpers.coffee'
Tool = require './tool.coffee'
Intersection = require '../model/intersection.coffee' # TODO: decouple

class ToolIntersectionBuilder extends Tool
  constructor: ->
    super arguments...
    @tempIntersection = null
    @mouseDownPos = null

  mousedown: (e) =>
    @mouseDownPos = @getCell e
    if e.shiftKey
      @tempIntersection = new Intersection @mouseDownPos
      e.stopImmediatePropagation()

  mouseup: =>
    if @tempIntersection
      @visualizer.world.addIntersection @tempIntersection
      @tempIntersection = null
    @mouseDownPos = null

  mousemove: (e) =>
    if @tempIntersection
      rect = @visualizer.zoomer.getBoundingBox @mouseDownPos, @getCell e
      @tempIntersection.rect = rect

  mouseout: =>
    @mouseDownPos = null
    @tempIntersection = null

  draw: =>
    if @tempIntersection
      @visualizer.drawIntersection @tempIntersection, 0.4

module.exports = ToolIntersectionBuilder
