'use strict'

define (require) ->
  Tool = require 'visualizer/tool'
  Rect = require 'geom/rect'
  settings = require 'settings'

  class ToolHighlighter extends Tool
    constructor: ->
      super arguments...
      @mousePos = null

    mousemove: (e) ->
      cell = @getCell e
      hoveredIntersection = @getHoveredIntersection cell
      @mousePos = cell
      for id, intersection of @visualizer.world.intersections.all()
        intersection.color = null
      if hoveredIntersection?
        hoveredIntersection.color = settings.colors.hoveredIntersection

    mouseout: ->
      @mousePos = null

    draw: ->
      if @mousePos
        cell = new Rect @mousePos.x, @mousePos.y, 1, 1
        @visualizer.graphics.fillRect cell, settings.colors.hoveredGrid, 0.5
