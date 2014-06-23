'use strict'

{min, max} = Math
require '../helpers'
_ = require 'underscore'
Lane = require './lane'
settings = require '../settings'

class Road
  constructor: (@source, @target) ->
    @id = _.uniqueId 'road'
    @lanes = []
    @lanesNumber = null
    @update()

  @copy: (road) ->
    result = Object.create Road::
    _.extend result, road
    result.lanes ?= []
    result

  toJSON: ->
    obj =
      id: @id
      source: @source.id
      target: @target.id

  @property 'length',
    get: -> @targetSide.target.subtract(@sourceSide.source).length

  @property 'leftmostLane',
    get: -> @lanes[@lanesNumber - 1]

  @property 'rightmostLane',
    get: -> @lanes[0]

  getTurnDirection: (other) ->
    throw Error 'invalid roads' if @target isnt other.source
    side1 = @targetSideId
    side2 = other.sourceSideId
    # 0 - left, 1 - forward, 2 - right
    turnNumber = (side2 - side1 - 1 + 8) % 4

  update: ->
    throw Error 'incomplete road' unless @source and @target
    @sourceSideId = @source.rect.getSectorId @target.rect.center()
    @sourceSide = @source.rect.getSide(@sourceSideId).subsegment 0.5, 1.0
    @targetSideId = @target.rect.getSectorId @source.rect.center()
    @targetSide = @target.rect.getSide(@targetSideId).subsegment 0, 0.5
    @lanesNumber = min(@sourceSide.length, @targetSide.length) | 0
    @lanesNumber = max 2, @lanesNumber / settings.gridSize | 0
    sourceSplits = @sourceSide.split @lanesNumber, true
    targetSplits = @targetSide.split @lanesNumber
    if not @lanes? or @lanes.length < @lanesNumber
      @lanes ?= []
      for i in [0..@lanesNumber - 1]
        @lanes[i] ?= new Lane sourceSplits[i], targetSplits[i], this
    for i in [0..@lanesNumber - 1]
      @lanes[i].sourceSegment = sourceSplits[i]
      @lanes[i].targetSegment = targetSplits[i]
      @lanes[i].leftAdjacent = @lanes[i + 1]
      @lanes[i].rightAdjacent = @lanes[i - 1]
      @lanes[i].leftmostAdjacent = @lanes[@lanesNumber - 1]
      @lanes[i].rightmostAdjacent = @lanes[0]
      @lanes[i].update()

module.exports = Road
