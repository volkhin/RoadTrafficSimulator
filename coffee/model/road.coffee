'use strict'

require '../helpers.coffee'
$ = require 'jquery'
_ = require 'underscore'
Lane = require './lane.coffee'

module.exports =
  class Road
    constructor: (@source, @target) ->
      @id = Object.genId()
      @lanes = []
      @lanesNumber = null
      @update()

    @copy: (road) ->
      result = Object.create Road::
      $.extend result, road
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
      get: -> @lanes[@lanesNumber-1]

    @property 'rightmostLane',
      get: -> @lanes[0]

    update: ->
      throw Error 'incomplete road' unless @source and @target
      @sourceSideId = @source.rect.getSectorId @target.rect.center()
      @sourceSide = @source.rect.getSide(@sourceSideId).subsegment 0.5, 1.0
      @targetSideId = @target.rect.getSectorId @source.rect.center()
      @targetSide = @target.rect.getSide(@targetSideId).subsegment 0, 0.5
      @lanesNumber = Math.min(@sourceSide.length, @targetSide.length) | 0
      @lanesNumber = Math.max 2, @lanesNumber
      sourceSplits = @sourceSide.split @lanesNumber, true
      targetSplits = @targetSide.split @lanesNumber
      if not @lanes? or @lanes.length < @lanesNumber
        @lanes ?= []
        for i in [0..@lanesNumber-1]
          @lanes[i] ?= new Lane sourceSplits[i], targetSplits[i], @
      for i in [0..@lanesNumber-1]
        @lanes[i].sourceSegment = sourceSplits[i]
        @lanes[i].targetSegment = targetSplits[i]
        @lanes[i].leftAdjacent = @lanes[i+1]
        @lanes[i].rightAdjacent = @lanes[i-1]
        @lanes[i].leftmostAdjacent = @lanes[@lanesNumber-1]
        @lanes[i].rightmostAdjacent = @lanes[0]
