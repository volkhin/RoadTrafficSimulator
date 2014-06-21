'use strict'

require '../helpers.coffee'
_ = require 'underscore'
Segment = require '../geom/segment.coffee'

module.exports =
  class Lane
    constructor: (@sourceSegment, @targetSegment, @road) ->
      @leftAdjacent = null
      @rightAdjacent = null
      @leftmostAdjacent = null
      @rightmostAdjacent = null
      @carsPositions = {}
      @update()

    toJSON: ->
      obj = _.extend {}, this
      delete obj.carsPositions
      obj

    @property 'sourceSideId',
      get: -> @road.sourceSideId

    @property 'targetSideId',
      get: -> @road.targetSideId

    @property 'isRightmost',
      get: -> this is @.rightmostAdjacent

    @property 'isLeftmost',
      get: -> this is @.leftmostAdjacent

    @property 'leftBorder',
      get: ->
        new Segment @sourceSegment.source, @targetSegment.target

    @property 'rightBorder',
      get: ->
        new Segment @sourceSegment.target, @targetSegment.source

    update: ->
      @middleLine = new Segment @sourceSegment.center, @targetSegment.center
      @length = @middleLine.length
      @direction = @middleLine.direction

    getTurnDirection: (other) ->
      throw Error 'invalid lanes' if @road.target isnt other.road.source
      side1 = @targetSideId
      side2 = other.sourceSideId
      # 0 - left, 1 - forward, 2 - right
      turnNumber = (side2 - side1 - 1 + 8) % 4

    getDirection: ->
      @direction

    getPoint: (a) ->
      @middleLine.getPoint a

    addCarPosition: (carPosition) ->
      throw Error 'car is already here' if carPosition.id of @carsPositions
      @carsPositions[carPosition.id] = carPosition

    removeCar: (carPosition) ->
      throw Error 'removing unknown car' unless carPosition.id of @carsPositions
      delete @carsPositions[carPosition.id]

    getNext: (carPosition) ->
      throw Error 'car is on other lane' if carPosition.lane isnt this
      next = null
      bestDistance = Infinity
      for id, o of @carsPositions
        distance = o.position - carPosition.position
        if not o.free and 0 < distance < bestDistance
          bestDistance = distance
          next = o
      next
