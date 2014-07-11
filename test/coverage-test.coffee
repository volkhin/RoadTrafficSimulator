'use strict'

require("blanket")({})

require '../coffee//helpers'
World = require '../coffee/model/world'

describe 'Application', ->

  it 'can run', ->
    world = new World()
    world.generateMap()
    world.carsNumber = 20
    for i in [0..10000]
      world.onTick 0.1
