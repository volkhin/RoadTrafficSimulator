'use strict'

define (require) ->
  Tool = require 'visualizer/tool'
  Intersection = require 'model/intersection' # TODO: decouple
  Rect = require 'geom/rect'

  class ToolIntersectionBuilder extends Tool
    constructor: ->
      super arguments...
      @tempIntersection = null
      @mouseDownPos = null

    mousedown: (e) ->
      @mouseDownPos = @getCell e
      if e.shiftKey
        rect = new Rect @mouseDownPos.x, @mouseDownPos.y, 1, 1
        @tempIntersection = new Intersection rect
        e.stopImmediatePropagation()

    mouseup: ->
      if @tempIntersection
        @visualizer.world.addIntersection @tempIntersection
        @tempIntersection = null
      @mouseDownPos = null

    mousemove: (e) ->
      if @tempIntersection
        rect = @visualizer.zoomer.getBoundingBox @mouseDownPos, @getCell e
        @tempIntersection.rect = rect

    mouseout: ->
      @mouseDownPos = null
      @tempIntersection = null

    draw: ->
      if @tempIntersection
        @visualizer.drawIntersection @tempIntersection, 0.4
