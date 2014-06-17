'use strict'

require '../helpers.coffee'
_ = require 'underscore'
Trajectory = require './trajectory.coffee'

module.exports =
  class Car
    constructor: (lane, position) ->
      @id = _.uniqueId 'car'
      @color = (300 + 240 * Math.random() | 0) % 360
      @_speed = 0
      @width = 1.7
      @length = 3 + 2 * Math.random()
      @maxSpeed = 30
      @s0 = 2
      @timeHeadway = 1.5
      @maxAcceleration = 1
      @maxDeceleration = 3
      @trajectory = new Trajectory @, lane, position
      @alive = true
      @preferedLane = null
      @turnNumber = null

    @property 'coords',
      get: -> @trajectory.coords

    @property 'speed',
      get: -> @_speed
      set: (speed) ->
        speed = 0 if speed < 0
        speed = @maxSpeed if speed > @maxSpeed
        @_speed = speed

    @property 'direction',
      get: -> @trajectory.direction

    release: ->
      @trajectory.release()

    getAcceleration: ->
      nextCarDistance = @trajectory.nextCarDistance
      distanceToNextCar = Math.max nextCarDistance.distance, 0
      a = @maxAcceleration
      b = @maxDeceleration
      deltaSpeed = (@speed - nextCarDistance.car?.speed) || 0
      distanceGap = @s0
      timeGap = @speed * @timeHeadway
      breakGap = @speed * deltaSpeed / (2 * Math.sqrt a*b)
      safeDistance = distanceGap + timeGap + breakGap
      freeRoadCoeff = Math.pow @speed/@maxSpeed, 4
      busyRoadCoeff = Math.pow safeDistance/distanceToNextCar, 2
      coeff = 1 - freeRoadCoeff - busyRoadCoeff
      return @maxAcceleration * coeff

    move: (delta) ->
      acceleration = @getAcceleration()
      @speed += acceleration * delta

      if @preferedLane? and @preferedLane isnt @trajectory.current.lane and
      not @trajectory.isChangingLanes
        switch @turnNumber
          when 0 then @trajectory.changeLaneToLeft()
          when 2 then @trajectory.changeLaneToRight()
      step = @speed * delta
      # TODO: hacks, should have changed speed
      console.log 'bad IDM' if @trajectory.nextCarDistance.distance < step

      if @trajectory.timeToMakeTurn(step)
        return @alive = false if not @nextLane?
        if not @trajectory.canEnterIntersection()
          #FIXME hack
          if step > @trajectory.getDistanceToIntersection()
            step = @trajectory.getDistanceToIntersection()
            @speed = 0
      @trajectory.moveForward step

    pickNextLane: ->
      throw Error 'next lane is already chosen' if @nextLane
      @nextLane = null
      intersection = @trajectory.nextIntersection
      currentLane = @trajectory.current.lane
      possibleRoads = intersection.roads.filter (x) ->
        x.target isnt currentLane.road.source
      return null if possibleRoads.length is 0
      nextRoad = _.sample possibleRoads
      laneNumber = _.random 0, nextRoad.lanesNumber-1
      @nextLane = nextRoad.lanes[laneNumber]
      throw Error 'can not pick next lane' if not @nextLane
      @turnNumber = currentLane.getTurnDirection @nextLane
      @preferedLane = switch @turnNumber
        when 0 then currentLane.leftmostAdjacent
        when 2 then currentLane.rightmostAdjacent
        else null
      @nextLane
