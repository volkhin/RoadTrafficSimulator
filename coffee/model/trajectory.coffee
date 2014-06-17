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

    canEnterIntersection: ->
      #TODO right turn is only allowed from the right lane
      nextLane = @car.nextLane
      sourceLane = @current.lane
      unless nextLane
        return true
        # throw Error 'no road to enter'
      intersection = @nextIntersection
      turnNumber = sourceLane.getTurnDirection nextLane
      if turnNumber is 3
        return false
        # throw Error 'no U-turns are allowed'
      if turnNumber is 0 and not sourceLane.isLeftmost
        return false
        # throw Error 'no left turns from this lane'
      if turnNumber is 2 and not sourceLane.isRightmost
        return false
        # throw Error 'no right turns from this lane'
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
      if @timeToMakeTurn() and @canEnterIntersection()
        @_startChangingLanes @car.nextLane, 0, true
        # FIXME should be done in car model
        @car.nextLane = null
        @car.preferedLane = null
        @car.turnNumber = null
      if @isChangingLanes and @temp.position >= @temp.lane.length
        @_finishChangingLanes()
      if @current.lane and not @isChangingLanes and not @car.nextLane
        @car.pickNextLane()

    _changeLane: (nextLane) ->
      throw Error 'already changing lane' if @isChangingLanes
      throw Error 'no next lane' unless nextLane?
      throw Error 'next lane == current lane' if nextLane is @lane
      throw Error 'not neighbouring lanes' unless @lane.road is nextLane.road
      nextPosition = @current.position + 5 * @car.length
      throw Error 'too late to change lane' unless nextPosition < @lane.length
      #TODO: keep old lane after implementing IDM
      @_startChangingLanes nextLane, nextPosition, false

    changeLaneToLeft: ->
      @_changeLane @current.lane.leftAdjacent

    changeLaneToRight: ->
      @_changeLane @current.lane.rightAdjacent

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

    _startChangingLanes: (nextLane, nextPosition, keepOldLine) ->
      throw Error 'already changing lane' if @isChangingLanes
      throw Error 'no next lane' unless nextLane?
      @isChangingLanes = true
      @next.lane = nextLane
      @next.position = nextPosition

      curve = @_getCurve()

      @temp.lane = curve
      @temp.position = 0 # @current.lane.length - @current.position
      @next.position -= @temp.lane.length
      @current.release() unless keepOldLine

    _finishChangingLanes: ->
      throw Error 'no lane changing is going on' unless @isChangingLanes
      @isChangingLanes = false
      # TODO swap current and next
      @current.lane = @next.lane
      @current.position = @next.position or 0
      @next.lane = null
      @next.position = NaN
      @temp.lane = null
      @temp.position = NaN
      @current.lane

    release: ->
      @current?.release()
      @next?.release()
      @temp?.release()
