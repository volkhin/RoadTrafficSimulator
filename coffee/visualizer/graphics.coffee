'use strict'

{PI} = Math
require '../helpers.coffee'

class Graphics
  constructor: (@ctx) ->

  fillRect: (rect, style, alpha) ->
    @ctx.fillStyle = style if style?
    _alpha = @ctx.globalAlpha
    @ctx.globalAlpha = alpha if alpha?
    @ctx.fillRect rect.left(), rect.top(), rect.width(), rect.height()
    @ctx.globalAlpha = _alpha

  drawRect: (rect) ->
    @ctx.beginPath
    vertices = rect.getVertices()
    @ctx.beginPath()
    @moveTo vertices[0]
    @lineTo point for point in vertices[1..]
    @ctx.closePath()

  drawImage: (image, rect) ->
    @ctx.drawImage image, rect.left(), rect.top(), rect.width(), rect.height()

  clear: (color) ->
    @ctx.fillStyle = color
    @ctx.fillRect 0, 0, @ctx.canvas.width, @ctx.canvas.height

  moveTo: (point) ->
    @ctx.moveTo point.x, point.y

  lineTo: (point) ->
    @ctx.lineTo point.x, point.y

  drawLine: (source, target) ->
    @ctx.beginPath()
    @moveTo source
    @lineTo target

  drawSegment: (segment) ->
    @drawLine segment.source, segment.target

  drawCurve: (curve, width, color) ->
    pointsNumber = 10
    @ctx.lineWidth = width
    @ctx.beginPath()
    @moveTo curve.getPoint 0
    for i in [0..pointsNumber]
      point = curve.getPoint i / pointsNumber
      @lineTo point
    if curve.O
      @moveTo curve.O
      @ctx.arc curve.O.x, curve.O.y, width, 0, 2 * PI
    if curve.Q
      @moveTo curve.Q
      @ctx.arc curve.Q.x, curve.Q.y, width, 0, 2 * PI
    @stroke color if color

  drawTriangle: (p1, p2, p3) ->
    @ctx.beginPath()
    @moveTo p1
    @lineTo p2
    @lineTo p3

  fill: (style, alpha) ->
    @ctx.fillStyle = style
    _alpha = @ctx.globalAlpha
    @ctx.globalAlpha = alpha if alpha?
    @ctx.fill()
    @ctx.globalAlpha = _alpha

  stroke: (style) ->
    @ctx.strokeStyle = style
    @ctx.stroke()

  polyline: (points...) ->
    if points.length >= 1
      @ctx.beginPath()
      @moveTo points[0]
      for point in points[1..]
        @lineTo point
      @ctx.closePath()

  save: ->
    @ctx.save()

  restore: ->
    @ctx.restore()

module.exports = Graphics
