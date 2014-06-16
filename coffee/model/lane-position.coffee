'use strict'

require '../helpers.coffee'

module.exports =
  class LanePosition
    constructor: (@car, lane, @position) ->
      @id = Object.genId()
      @free = true
      @lane = lane

    @property 'lane',
      get: -> @_lane
      set: (lane) ->
        @release()
        @_lane = lane
        @acquire()

    @property 'relativePosition',
      get: -> @position/@lane.length

    acquire: ->
      if @lane?.addCarPosition?
        @free = false
        @lane.addCarPosition @

    release: ->
      if not @free and @lane?.removeCar
        @free = true
        @lane.removeCar @

    getNext: ->
      return @lane.getNext @ if @lane and not @free

    @property 'nextCarDistance',
      get: ->
        next = @getNext()
        if next
          rearPosition = next.position - next.car.length/2
          frontPosition = @position + @car.length/2
          return result =
            car: next.car
            distance: rearPosition - frontPosition
        return result =
          car: null
          distance: Infinity
