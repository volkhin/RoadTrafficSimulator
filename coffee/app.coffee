'use strict'

require './helpers.coffee'
$ = require 'jquery'
Visualizer = require './visualizer/visualizer.coffee'
DAT = require 'dat-gui'
World = require './model/world.coffee'
settings = require './settings.coffee'

updateCanvasSize = ->
  $('canvas').attr
    width: $(window).width()
    height: $(window).height()

$(document).ready ->
  canvas = $('<canvas />', {id: 'canvas'})
  $(document.body).append(canvas)
  updateCanvasSize()
  $(window).resize updateCanvasSize

  window.world = new World
  world.load()
  window.visualizer = new Visualizer world
  visualizer.start()
  gui = new DAT.GUI
  guiWorld = gui.addFolder 'world'
  guiWorld.open()
  guiWorld.add world, 'save'
  guiWorld.add world, 'load'
  guiWorld.add world, 'clear'
  guiWorld.add world, 'generateMap'
  guiVisualizer = gui.addFolder 'visualizer'
  guiVisualizer.open()
  guiVisualizer.add(visualizer, 'running').listen()
  guiVisualizer.add(visualizer, 'debug').listen()
  guiVisualizer.add(visualizer.zoomer, 'scale', 0.1, 2).listen()
  guiVisualizer.add(visualizer, 'timeFactor', 0.1, 10).listen()
  guiWorld.add(world, 'carsNumber').min(0).max(200).step(1).listen()
  guiWorld.add(world, 'instantSpeed').step(0.00001).listen()
  gui.add(settings, 'lightsFlipInterval', 0, 10, 0.01).listen()
