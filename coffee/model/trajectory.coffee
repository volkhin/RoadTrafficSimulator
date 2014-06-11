'use strict'

define (require) ->
  LanePosition = require 'model/lane-position'
  Curve = require 'geom/curve'

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
      get: -> @absolutePosition/@lane.length()

    @property 'direction',
      get: -> @lane.getDirection @relativePosition

    @property 'coords',
      get: -> @lane.getPoint @relativePosition

    getDistanceToNextCar: ->
      Math.min @current.getDistanceToNextCar(), @next.getDistanceToNextCar()

    getNextIntersection: -> #TODO: property
      @current.lane.road.target

    getPreviousIntersection: -> #TODO property
      @current.lane.road.source

    canEnterIntersection: (nextLane) ->
      #TODO right turn is only allowed from the right lane
      sourceLane = @current.lane
      throw Error 'no road to enter' unless nextLane
      intersection = @getNextIntersection()
      turnNumber = sourceLane.getTurnDirection nextLane
      throw Error 'no U-turns are allowed' if turnNumber is 3
      if turnNumber is 0 and not sourceLane.isLeftmost
        throw Error 'no left turns from this lane'
      if turnNumber is 2 and not sourceLane.isRightmost
        throw Error 'no right turns from this lane'
      sideId = sourceLane.road.targetSideId
      intersection.controlSignals.state[sideId][turnNumber]

    moveForward: (distance) ->
      laneEnding = @current.position + @car.length >= @current.lane.length()
      if laneEnding and not @isChangingLanes
        switch
          when not @car.nextLane? then @car.alive = false
          when @canEnterIntersection @car.nextLane
            @startChangingLanes @car.nextLane, 0, true
            # FIXME should be done in car model
            @car.nextLane = null
            @car.preferedLane = null
            @car.turnNumber = null
          else
            # FIXME should be dont in car model
            @car.speed = 0
            distance = 0
      @current.position += distance
      @next.position += distance
      @temp.position += distance
      if @isChangingLanes and @temp.position >= @temp.lane.length()
        @finishChangingLanes()
      if @current.lane and not @isChangingLanes and not @car.nextLane
        @car.pickNextLane()

    changeLane: (nextLane) ->
      throw Error 'already changing lane' if @isChangingLanes
      throw Error 'no next lane' unless nextLane?
      throw Error 'next lane == current lane' if nextLane is @lane
      throw Error 'not neighbouring lanes' unless @lane.road is nextLane.road
      nextPosition = @current.position + 5 * @car.length
      throw Error 'too late to change lane' unless nextPosition < @lane.length()
      @startChangingLanes nextLane, nextPosition, false

    changeLaneToLeft: ->
      @changeLane @current.lane.leftAdjacent

    changeLaneToRight: ->
      @changeLane @current.lane.rightAdjacent

    startChangingLanes: (nextLane, nextPosition, keepOldLine) ->
      throw Error 'already changing lane' if @isChangingLanes
      throw Error 'no next lane' unless nextLane?
      @isChangingLanes = true
      @next.lane = nextLane
      @next.position = nextPosition
      p1 = @current.lane.getPoint @current.relativePosition
      p2 = @next.lane.getPoint @next.relativePosition
      distance = p2.subtract(p1).length()
      direction = @current.lane.middleLine.vector().normalize()
      control = p1.add direction.mult distance/2
      @temp.lane = new Curve p1, p2, control
      @temp.position = 0
      @next.position -= @temp.lane.length()
      @current.release() unless keepOldLine

    finishChangingLanes: ->
      throw Error 'no lane changing is going on' unless @isChangingLanes
      @isChangingLanes = false
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
