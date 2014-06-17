'use strict'

require '../helpers.coffee'
LanePosition = require './lane-position.coffee'
Curve = require '../geom/curve.coffee'
_ = require 'underscore'

module.exports =
  class Trajectory
    constructor: (@car, lane, position) ->
      position ?= 0
      @current = new LanePosition @car, lane, position
      @current.acquire()
      @next = new LanePosition @car
      @temp = new LanePosition @car
      @isChangingLanes = false

    @property 'lane',
      get: -> @temp.lane or @current.lane

    @property 'absolutePosition',
      get: -> if @temp.lane? then @temp.position else @current.position

    @property 'relativePosition',
      get: -> @absolutePosition/@lane.length

    @property 'direction',
      get: -> @lane.getDirection @relativePosition

    @property 'coords',
      get: -> @lane.getPoint @relativePosition

    @property 'nextCarDistance',
      get: ->
        a = @current.nextCarDistance
        b = @next.nextCarDistance
        result = if a.distance < b.distance then a else b
        if @getDistanceToIntersection() < result.distance and
        not @isChangingLanes and not @canEnterIntersection()
          result =
            car: null
            distance: @getDistanceToIntersection()
        return result

    @property 'nextIntersection',
      get: ->
        @current.lane.road.target

    @property 'previousIntersection',
      get: ->
        @current.lane.road.source

    isValidTurn: ->
      #TODO right turn is only allowed from the right lane
      nextLane = @car.nextLane
      sourceLane = @current.lane
      throw Error 'no road to enter' unless nextLane
      turnNumber = sourceLane.getTurnDirection nextLane
      throw Error 'no U-turns are allowed' if turnNumber is 3
      if turnNumber is 0 and not sourceLane.isLeftmost
        throw Error 'no left turns from this lane'
      if turnNumber is 2 and not sourceLane.isRightmost
        throw Error 'no right turns from this lane'
      return true

    canEnterIntersection: ->
      nextLane = @car.nextLane
      sourceLane = @current.lane
      return true unless nextLane
      intersection = @nextIntersection
      turnNumber = sourceLane.getTurnDirection nextLane
      sideId = sourceLane.road.targetSideId
      intersection.controlSignals.state[sideId][turnNumber]

    getDistanceToIntersection: ->
      @current.lane.length - @car.length - @current.position

    timeToMakeTurn: (plannedStep = 0) ->
      @getDistanceToIntersection() <= plannedStep and not @isChangingLanes

    moveForward: (distance) ->
      distance = Math.max distance, 0
      @current.position += distance
      @next.position += distance
      @temp.position += distance
      if @timeToMakeTurn() and @canEnterIntersection() and @isValidTurn()
        @_startChangingLanes @car.nextLane, 0
        # FIXME should be done in car model
        @car.nextLane = null
        @car.preferedLane = null
        @car.turnNumber = null
      tempRelativePosition = @temp.position / @temp.lane.length
      if @isChangingLanes and tempRelativePosition >= 0.5 and @next.free
        @current.release()
        @next.acquire()
      if @isChangingLanes and tempRelativePosition >= 1
        @_finishChangingLanes()
      if @current.lane and not @isChangingLanes and not @car.nextLane
        @car.pickNextLane()

    changeLane: (nextLane) ->
      throw Error 'already changing lane' if @isChangingLanes
      throw Error 'no next lane' unless nextLane?
      throw Error 'next lane == current lane' if nextLane is @lane
      throw Error 'not neighbouring lanes' unless @lane.road is nextLane.road
      nextPosition = @current.position + 5 * @car.length
      throw Error 'too late to change lane' unless nextPosition < @lane.length
      @_startChangingLanes nextLane, nextPosition

    _getIntersectionLaneChangeCurve: ->

    _getAdjacentLaneChangeCurve: ->
      p1 = @current.lane.getPoint @current.relativePosition
      p2 = @next.lane.getPoint @next.relativePosition
      distance = p2.subtract(p1).length
      direction = @current.lane.middleLine.vector.normalized
      control = p1.add direction.mult distance/2
      curve = new Curve p1, p2, control

    _getCurve: ->
      # FIXME: race condition due to using relativePosition on intersections
      @_getAdjacentLaneChangeCurve()

    _startChangingLanes: (nextLane, nextPosition) ->
      throw Error 'already changing lane' if @isChangingLanes
      throw Error 'no next lane' unless nextLane?
      @isChangingLanes = true
      @next.lane = nextLane
      @next.position = nextPosition

      curve = @_getCurve()

      @temp.lane = curve
      @temp.position = 0 # @current.lane.length - @current.position
      @next.position -= @temp.lane.length

    _finishChangingLanes: ->
      throw Error 'no lane changing is going on' unless @isChangingLanes
      @isChangingLanes = false
      # TODO swap current and next
      @current.lane = @next.lane
      @current.position = @next.position or 0
      @current.acquire()
      @next.lane = null
      @next.position = NaN
      @temp.lane = null
      @temp.position = NaN
      @current.lane

    release: ->
      @current?.release()
      @next?.release()
      @temp?.release()
