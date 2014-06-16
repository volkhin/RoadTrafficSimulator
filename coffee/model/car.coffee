'use strict'

require '../helpers.coffee'
_ = require 'underscore'
Trajectory = require './trajectory.coffee'

module.exports =
  class Car
    constructor: (lane, position) ->
      @id = Object.genId()
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

    @property 'safeDistance',
      get: ->
        a = @maxAcceleration
        b = @maxDeceleration
        deltaSpeed = (@speed - @trajectory.nextCarDistance.car?.speed) || 0
        @s0 + @speed * @timeHeadway + @speed * deltaSpeed / (2 * Math.sqrt a*b)

    release: ->
      @trajectory.release()

    getAcceleration: ->
      distanceToNextCar = Math.max @trajectory.distanceToNextCar, 0
      k = 1 - Math.pow @speed/@maxSpeed, 4
      k -= Math.pow @safeDistance/distanceToNextCar, 2
      return @maxAcceleration * k

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
      console.log 'bad IDM' if @trajectory.distanceToNextCar < step
      # step = 0 if @trajectory.distanceToNextCar < step

      if @trajectory.timeToMakeTurn(step)
        return @alive = false if not @nextLane?
        if not @trajectory.canEnterIntersection @nextLane
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
