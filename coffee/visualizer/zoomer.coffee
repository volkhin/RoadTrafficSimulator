'use strict'

define (require) ->
  Point = require 'geom/point'
  Rect = require 'geom/rect'
  Tool = require 'visualizer/tool'

  class Zoomer extends Tool
    constructor: (@defaultZoom, @visualizer, args...) ->
      super @visualizer, args...
      @ctx = @visualizer.ctx
      @width = @ctx.canvas.width
      @height = @ctx.canvas.height
      @_scale = 1
      @screenCenter = new Point @width/2, @height/2
      @center = new Point @width/2, @height/2

    @property 'scale',
      get: -> @_scale
      set: (scale) -> @zoom scale, @screenCenter

    toCellCoords: (point) ->
      centerOffset = point.subtract(@center).divide(@scale)
      x = Math.floor centerOffset.x/@defaultZoom
      y = Math.floor centerOffset.y/@defaultZoom
      new Point x, y

    getBoundingBox: (cell1, cell2) ->
      cell1 ?= @toCellCoords new Point 0, 0
      cell2 ?= @toCellCoords new Point @width, @height
      x1 = cell1.x
      y1 = cell1.y
      x2 = cell2.x
      y2 = cell2.y
      [x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)]
      [y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)]
      new Rect x1, y1, x2-x1+1, y2-y1+1

    transform: ->
      @ctx.translate @center.x, @center.y
      k = @scale*@defaultZoom
      @ctx.scale k, k

    zoom: (k, zoomCenter) ->
      k ?= 1
      offset = @center.subtract zoomCenter
      @center = zoomCenter.add offset.mult k/@_scale
      @_scale = k

    moveCenter: (offset) ->
      @center = @center.add offset

    mousewheel: (e) ->
      offset = e.deltaY*e.deltaFactor
      zoomFactor = Math.pow 2, 0.001 * offset
      @zoom @scale*zoomFactor, @getPoint e
      e.preventDefault()
