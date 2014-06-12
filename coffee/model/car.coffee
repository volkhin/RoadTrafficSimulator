'use strict'

_ = require 'underscore'
Trajectory = require './trajectory.coffee'

module.exports =
  class Car
    constructor: (lane, position) ->
      @id = Object.genId()
      @color = 255 * Math.random()
      @_speed = 0
      @width = 0.1
      @length = 0.2
      @safeDistance = 1.5 * @length
      @maxSpeed = (4 + Math.random()) / 5 * 4.5
      @acceleration = 1
      @trajectory = new Trajectory @, lane, position
      @alive = true
      @preferedLane = null
      @turnNumber = null

    @property 'coords',
      get: -> @trajectory.coords

    @property 'absolutePosition',
      get: -> @trajectory.current.position
      set: (pos) -> @trajectory.current.position = pos

    @property 'relativePosition',
      get: ->
        current = @trajectory.current
        current.position / current.lane.length
      set: (pos) ->
        @trajectory.current.position = pos * @trajectory.current.lane.length

    @property 'speed',
      get: -> @_speed
      set: (speed) ->
        speed = 0 if speed < 0
        speed = @maxSpeed if speed > @maxSpeed
        @_speed = speed

    @property 'direction',
      get: ->
        @trajectory.direction

    release: ->
      @trajectory.release()

    move: (delta) ->
      if @trajectory.getDistanceToNextCar() - @safeDistance > @speed * delta
        k = 1 - Math.pow @speed/@maxSpeed, 4
        @speed += @acceleration * delta * k
      else
        @speed = 0
      if @preferedLane? and @preferedLane isnt @trajectory.current.lane and
      not @trajectory.isChangingLanes
        switch @turnNumber
          when 0 then @trajectory.changeLaneToLeft()
          when 2 then @trajectory.changeLaneToRight()
      step = @speed * delta
      step = 0 if @trajectory.getDistanceToNextCar() - @safeDistance < step
      @trajectory.moveForward @speed * delta

    pickNextLane: ->
      throw Error 'next lane is already chosen' if @nextLane
      @nextLane = null
      intersection = @trajectory.nextIntersection
      previousIntersection = @trajectory.previousIntersection
      currentLane = @trajectory.current.lane
      possibleRoads = intersection.roads.filter (x) ->
        x.target isnt previousIntersection
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
