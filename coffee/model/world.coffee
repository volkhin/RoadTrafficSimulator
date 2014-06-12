'use strict'

$ = require 'jquery'
_ = require 'underscore'
Car = require './car.coffee'
Intersection = require './intersection.coffee'
Road = require './road.coffee'
Pool = require './pool.coffee'
Rect = require '../geom/rect.coffee'

module.exports =
  class World
    constructor: ->
      @set {}

    @property 'instantSpeed',
      get: ->
        speeds = _.map @cars.all(), (car) -> car.speed
        return 0 if speeds.length is 0
        return (_.reduce speeds, (a, b) -> a + b) / speeds.length

    set: (obj) ->
      obj ?= {}
      @intersections = new Pool Intersection, obj.intersections
      @roads = new Pool Road, obj.roads
      @cars = new Pool Car, obj.cars
      @carsNumber = 0

    save: ->
      data = $.extend {}, @
      delete data.cars
      localStorage.world = JSON.stringify data

    load: ->
      data = localStorage.world
      data = data and JSON.parse data
      return unless data?
      @clear()
      @carsNumber = data.carsNumber or 0
      for id, intersection of data.intersections
        @addIntersection Intersection.copy intersection
      for id, road of data.roads
        road = Road.copy road
        road.source = @getIntersection road.source
        road.target = @getIntersection road.target
        @addRoad road

    generateMap: (minX = -2, maxX = 2, minY = -2, maxY = 2) ->
      @clear()
      intersectionsNumber = (0.8 * (maxX - minX + 1) * (maxY - minY + 1)) | 0
      map = {}
      while intersectionsNumber > 0
        x = _.random minX, maxX
        y = _.random minY, maxY
        unless map[[x, y]]?
          map[[x, y]] = intersection = new Intersection new Rect 5*x, 5*y, 1, 1
          @addIntersection intersection
          intersectionsNumber--
      for x in [minX..maxX]
        previous = null
        for y in [minY..maxY]
          intersection = map[[x, y]]
          if intersection?
            @addRoad new Road intersection, previous if previous?
            @addRoad new Road previous, intersection if previous?
            previous = intersection
      for y in [minY..maxY]
        previous = null
        for x in [minX..maxX]
          intersection = map[[x, y]]
          if intersection?
            @addRoad new Road intersection, previous if previous?
            @addRoad new Road previous, intersection if previous?
            previous = intersection
      null


    clear: ->
      @set {}

    onTick: (delta) ->
      throw Error 'delta > 1' if delta > 1
      @refreshCars()
      for id, intersection of @intersections.all()
        intersection.controlSignals.onTick delta
      for id, car of @cars.all()
        car.move delta
        @removeCar car unless car.alive

    refreshCars: ->
      @carsNumber = 0 if @roads.length is 0
      @addRandomCar() while @cars.length < @carsNumber
      @removeRandomCar() while @cars.length > @carsNumber

    addRoad: (road) ->
      @roads.put road
      road.source.roads.push road
      road.target.inRoads.push road
      road.update()

    getRoad: (id) ->
      @roads.get id

    addCar: (car) ->
      @cars.put car

    getCar: (id) ->
      @cars.get(id)

    removeCar: (car) ->
      @cars.pop car

    addIntersection: (intersection) ->
      @intersections.put intersection

    getIntersection: (id) ->
      @intersections.get id

    addRandomCar: ->
      road = _.sample @roads.all()
      if road?
        lane = _.sample road.lanes
        @addCar new Car lane if lane?

    removeRandomCar: ->
      car = _.sample @cars.all()
      if car?
        @removeCar car
