'use strict'

require '../helpers.coffee'
settings = require '../settings.coffee'

module.exports =
  class ControlSignals
    constructor: (@intersection) ->
      @time = 0
      @flipMultiplier = 1 + (Math.random() * 0.4 - 0.2) # 0.8 - 1.2
      @stateNum = 0

    states: [
      ['L', '', 'L', ''],
      ['FR', '', 'FR', ''],
      ['', 'L', '', 'L'],
      ['', 'FR', '', 'FR']
    ]

    @STATE = [RED: 0, GREEN: 1]

    @property 'flipInterval',
      get: => @flipMultiplier * settings.lightsFlipInterval

    _decode: (str) ->
      state = [0, 0, 0]
      state[0] = 1 if 'L' in str
      state[1] = 1 if 'F' in str
      state[2] = 1 if 'R' in str
      state

    @property 'state',
      get: =>
        stringState = @states[@stateNum % @states.length]
        if @intersection.roads.length <= 2
          stringState = ['LFR', 'LFR', 'LFR', 'LFR']
        (@_decode x for x in stringState)

    flip: =>
      @stateNum += 1

    onTick: (delta) =>
      @time += delta
      if @time > @flipInterval
        @flip()
        @time -= @flipInterval
