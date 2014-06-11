'use strict'

$ = require 'jquery'
_ = require 'underscore'
Point = require '../geom/point.coffee'
Rect = require '../geom/rect.coffee'
require('jquery-mousewheel') $

METHODS = [
  'click',
  'mousedown',
  'mouseup',
  'mousemove',
  'mouseout',
  'mousewheel',
  'contextmenu'
]

module.exports =
  class Tool
    constructor: (@visualizer, autobind) ->
      @ctx = @visualizer.ctx
      @canvas = @ctx.canvas
      for method in METHODS when @[method]?
        # TODO: better style?
        @[method] = @[method].bind(@)
      @isBound = false
      @bind() if autobind

    bind: ->
      @isBound = true
      for method in METHODS when @[method]?
        $(@canvas).on method, @[method]

    unbind: ->
      @isBound = false
      for method in METHODS when @[method]?
        $(@canvas).off method, @[method]

    toggleState: ->
      if @isBound then @unbind() else @bind()

    draw: ->

    getPoint: (e) ->
      new Point e.pageX-@canvas.offsetLeft, e.pageY-@canvas.offsetTop

    getCell: (e) ->
      @visualizer.zoomer.toCellCoords @getPoint e

    getHoveredIntersection: (cell) ->
      cellRect = new Rect cell.x, cell.y, 1, 1
      intersections = @visualizer.world.intersections.all()
      for id, intersection of intersections
        return intersection if intersection.rect.containsRect cellRect
