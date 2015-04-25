#!/usr/bin/env coffee
'use strict'

require './helpers'
World = require './model/world'
_ = require 'underscore'
settings = require './settings'
fs = require 'fs'

measureAverageSpeed = (setupCallback) ->
  world = new World()
  map = fs.readFileSync './experiments/map.json', {encoding: 'utf8'}
  console.log map
  # world.generateMap()
  world.load map
  world.carsNumber = 50
  setupCallback?(world)
  results = []
  for i in [0..10000]
    world.onTick 0.2
    # console.log world.instantSpeed
    results.push world.instantSpeed
  (results.reduce (a, b) -> a + b) / results.length


getParams = (world) ->
  params = (i.controlSignals.flipMultiplier for id, i of world.intersections.all())
  # console.log JSON.stringify(params)
  params

settings.lightsFlipInterval = 160

experiment1 = () ->
  out = fs.createWriteStream './experiments/1.data'
  out.write 'multiplier avg_speed\n'
  for multiplier in [0.0001, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 0.75, 1, 2, 3, 4, 5]
    do (multiplier) ->
      result = measureAverageSpeed (world) ->
        i.controlSignals.flipMultiplier = multiplier for id, i of world.intersections.all()
        getParams world
      out.write(multiplier + ' ' +  result + '\n')

experiment2 = () ->
  out = fs.createWriteStream './experiments/2.data'
  out.write 'it avg_speed\n'
  for it in [0..9]
    result = measureAverageSpeed (world) ->
      i.controlSignals.flipMultiplier = Math.random() for id, i of world.intersections.all()
      getParams world
    out.write(it + ' ' +  result + '\n')

experiment3 = () ->
  out = fs.createWriteStream './experiments/3.data'
  out.write 'it avg_speed\n'
  for it in [0..10]
    result = measureAverageSpeed (world) ->
      i.controlSignals.flipMultiplier = 1 for id, i of world.intersections.all()
      i.controlSignals.phaseOffset = 0
      getParams world
    out.write(it + ' ' +  result + '\n')

# experiment1()
# experiment2()
# experiment3()
