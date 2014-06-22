'use strict'

{min, max} = Math
require '../helpers.coffee'
Point = require '../geom/point.coffee'
Rect = require '../geom/rect.coffee'
Tool = require './tool.coffee'
settings = require '../settings.coffee'

class Zoomer extends Tool
  constructor: (@defaultZoom, @visualizer, args...) ->
    super @visualizer, args...
    @ctx = @visualizer.ctx
    @canvas = @ctx.canvas
    @_scale = 1
    @screenCenter = new Point @canvas.width / 2, @canvas.height / 2
    @center = new Point @canvas.width / 2, @canvas.height / 2

  @property 'scale',
    get: -> @_scale
    set: (scale) -> @zoom scale, @screenCenter

  toCellCoords: (point) ->
    gridSize = settings.gridSize
    centerOffset = point.subtract(@center).divide(@scale)
    x = centerOffset.x // (@defaultZoom * gridSize) * gridSize
    y = centerOffset.y // (@defaultZoom * gridSize) * gridSize
    new Rect x, y, gridSize, gridSize

  getBoundingBox: (cell1, cell2) ->
    cell1 ?= @toCellCoords new Point 0, 0
    cell2 ?= @toCellCoords new Point @canvas.width, @canvas.height
    x1 = cell1.x
    y1 = cell1.y
    x2 = cell2.x
    y2 = cell2.y
    xMin = min cell1.left(), cell2.left()
    xMax = max cell1.right(), cell2.right()
    yMin = min cell1.top(), cell2.top()
    yMax = max cell1.bottom(), cell2.bottom()
    new Rect xMin, yMin, xMax - xMin, yMax - yMin

  transform: ->
    @ctx.translate @center.x, @center.y
    k = @scale * @defaultZoom
    @ctx.scale k, k

  zoom: (k, zoomCenter) ->
    k ?= 1
    offset = @center.subtract zoomCenter
    @center = zoomCenter.add offset.mult k / @_scale
    @_scale = k

  moveCenter: (offset) ->
    @center = @center.add offset

  mousewheel: (e) =>
    offset = e.deltaY * e.deltaFactor
    zoomFactor = 2 ** (0.001 * offset)
    @zoom @scale * zoomFactor, @getPoint e
    e.preventDefault()

module.exports = Zoomer
