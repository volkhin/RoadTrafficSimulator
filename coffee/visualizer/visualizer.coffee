'use strict'

$ = require 'jquery'
_ = require 'underscore'
Point = require '../geom/point.coffee'
Rect = require '../geom/rect.coffee'
Graphics = require './graphics.coffee'
ToolMover = require './mover.coffee'
ToolIntersectionMover = require './intersection-mover.coffee'
ToolIntersectionBuilder = require './intersection-builder.coffee'
ToolRoadBuilder = require './road-builder.coffee'
ToolHighlighter = require './highlighter.coffee'
Zoomer = require './zoomer.coffee'
settings = require '../settings.coffee'

module.exports =
  class Visualizer
    constructor: (@world) ->
      @$canvas = $('#canvas')
      @canvas = @$canvas[0]
      @ctx = @canvas.getContext('2d')
      @width = @canvas.width
      @height = @canvas.height

      @carImage = new Image
      @carImage.src = 'images/car.png'

      @zoomer = new Zoomer 20, @, true
      @graphics = new Graphics @ctx
      @toolRoadbuilder = new ToolRoadBuilder @, true
      @toolIntersectionBuilder = new ToolIntersectionBuilder @, true
      @toolHighlighter = new ToolHighlighter @, true
      @toolIntersectionMover = new ToolIntersectionMover @, true
      @toolMover = new ToolMover @, true
      @_running = false
      @previousTime = 0
      @timeFactor = 1

    drawIntersection: (intersection, alpha) ->
      color = intersection.color or settings.colors.intersection
      @graphics.fillRect intersection.rect, color, alpha

    drawSignals: (road) ->
      @ctx.save()
      lightsColors = [settings.colors.redLight, settings.colors.greenLight]
      intersection = road.target
      segment = road.targetSide
      sideId = road.targetSideId
      lights = intersection.controlSignals.state[sideId]

      @ctx.lineWidth = 0.1
      @graphics.drawSegment segment.subsegment 0.7, 1.0
      @graphics.stroke lightsColors[lights[0]]
      @graphics.drawSegment segment.subsegment 0.35, 0.65
      @graphics.stroke lightsColors[lights[1]]
      @graphics.drawSegment segment.subsegment 0.0, 0.3
      @graphics.stroke lightsColors[lights[2]]
      @ctx.restore()

    drawRoad: (road, alpha) ->
      throw Error 'invalid road' if not road.source? or not road.target?
      sourceSide = road.sourceSide
      targetSide = road.targetSide

      @graphics.polyline sourceSide.source, sourceSide.target,
      targetSide.source, targetSide.target
      @graphics.fill settings.colors.road, alpha

      @ctx.save()
      for lane in road.lanes
        line = lane.getLeftBorder()
        dashSize = 0.5
        @graphics.drawSegment line
        @ctx.lineWidth = 0.05
        @ctx.lineDashOffset = 1.5 * dashSize
        @ctx.setLineDash [dashSize]
        @graphics.stroke settings.colors.roadMarking
      @ctx.restore()

      @ctx.save()
      @ctx.lineWidth = 0.05
      leftLine = road.leftmostLane.getLeftBorder()
      @graphics.drawSegment leftLine
      @graphics.stroke settings.colors.roadMarking

      rightLine = road.rightmostLane.getRightBorder()
      @graphics.drawSegment rightLine
      @graphics.stroke settings.colors.roadMarking
      @ctx.restore()


    drawCar: (car) ->
      angle = car.direction()
      center = car.coords
      rect = new Rect 0, 0, 1.1*car.length, 1.7*car.width
      rect.center new Point 0, 0
      boundRect = new Rect 0, 0, car.length, car.width
      boundRect.center new Point 0, 0

      @graphics.save()
      @ctx.translate center.x, center.y
      @ctx.rotate angle
      h = car.color
      s = 100
      l = 90 - 40 * car.speed/car.maxSpeed
      style = 'hsl(' + h + ', ' + s + '%, ' + l + '%)'
      @graphics.drawImage @carImage, rect
      @graphics.fillRect boundRect, style, 0.5
      @graphics.restore()

    drawGrid: ->
      box = @zoomer.getBoundingBox()
      return if box.area() >= 2000

      for i in [box.left()..box.right()]
        for j in [box.top()..box.bottom()]
          rect = new Rect i, j, 0.05, 0.05
          @graphics.fillRect rect, settings.colors.gridPoint

    draw: (time) ->
      delta = (time - @previousTime) || 0
      delta = 100 if delta > 100
      @previousTime = time
      @world.onTick @timeFactor*delta/1000

      @graphics.clear settings.colors.background
      @graphics.save()
      @zoomer.transform()
      @drawGrid()
      for id, intersection of @world.intersections.all()
        @drawIntersection intersection, 0.9
      for id, road of @world.roads.all()
        @drawRoad road, 0.9
      for id, road of @world.roads.all()
        @drawSignals road
      for id, car of @world.cars.all()
        @drawCar car
      @toolIntersectionBuilder.draw() # TODO: all tools
      @toolRoadbuilder.draw()
      @toolHighlighter.draw()
      @graphics.restore()
      window.requestAnimationFrame @draw.bind @ if @running

    @property 'running',
      get: -> @_running
      set: (running) ->
        if running then @start() else @stop()

    start: ->
      unless @_running
        @_running = true
        @draw()

    stop: ->
      @_running = false
