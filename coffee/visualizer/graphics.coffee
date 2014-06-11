'use strict'

module.exports =
  class Graphics
    constructor: (@ctx) ->

    fillRect: (rect, style, alpha) ->
      @ctx.fillStyle = style if style?
      _alpha = @ctx.globalAlpha
      @ctx.globalAlpha = alpha if alpha?
      @ctx.fillRect rect.left(), rect.top(), rect.width(), rect.height()
      @ctx.globalAlpha = _alpha

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
