#!/usr/bin/env coffee
'use strict'

require './helpers'
World = require './model/world'
settings = require './settings'

measureAverageSpeed = ->
  world = new World()
  world.generateMap()
  world.carsNumber = 50
  results = []
  for i in [0..1000]
    world.onTick 0.1
    # console.log world.instantSpeed
    results.push world.instantSpeed
  (results.reduce (a, b) -> a + b) / results.length

result = measureAverageSpeed()
console.log 'result', result

settings.lightsFlipInterval = 2
result = measureAverageSpeed()
console.log 'result', result

settings.lightsFlipInterval = 3
result = measureAverageSpeed()
console.log 'result', result

settings.lightsFlipInterval = 4
result = measureAverageSpeed()
console.log 'result', result

