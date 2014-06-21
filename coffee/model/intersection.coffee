'use strict'

require '../helpers'
_ = require 'underscore'
ControlSignals = require './control-signals'
Rect = require '../geom/rect'

module.exports =
  class Intersection
    constructor: (@rect) ->
      @id = _.uniqueId 'intersection'
      @roads = []
      @inRoads = []
      @controlSignals = new ControlSignals this

    @copy: (intersection) ->
      intersection.rect = Rect.copy intersection.rect
      result = Object.create Intersection::
      _.extend result, intersection
      result.roads = []
      result.inRoads = []
      result.controlSignals = new ControlSignals result
      result

    toJSON: ->
      obj =
        id: @id
        rect: @rect

    update: ->
      road.update() for road in @roads
      road.update() for road in @inRoads
