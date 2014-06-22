'use strict'

require '../helpers.coffee'
Tool = require './tool.coffee'

class Mover extends Tool
  constructor: ->
    super arguments...
    @startPosition = null

  contextmenu: ->
    false

  mousedown: (e) =>
    @startPosition = @getPoint e
    e.stopImmediatePropagation()

  mouseup: =>
    @startPosition = null

  mousemove: (e) =>
    if @startPosition
      offset = @getPoint(e).subtract(@startPosition)
      @visualizer.zoomer.moveCenter offset
      @startPosition = @getPoint e

  mouseout: =>
    @startPosition = null

module.exports = Mover
