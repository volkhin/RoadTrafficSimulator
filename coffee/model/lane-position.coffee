'use strict'

require '../helpers'
_ = require 'underscore'

class LanePosition
  constructor: (@car, lane, @position) ->
    @id = _.uniqueId 'laneposition'
    @free = true
    @lane = lane

  @property 'lane',
    get: -> @_lane
    set: (lane) ->
      @release()
      @_lane = lane
      # @acquire()

  @property 'relativePosition',
    get: -> @position / @lane.length

  acquire: ->
    if @lane?.addCarPosition?
      @free = false
      @lane.addCarPosition this

  release: ->
    if not @free and @lane?.removeCar
      @free = true
      @lane.removeCar this

  getNext: ->
    return @lane.getNext this if @lane and not @free

  @property 'nextCarDistance',
    get: ->
      next = @getNext()
      if next
        rearPosition = next.position - next.car.length / 2
        frontPosition = @position + @car.length / 2
        return result =
          car: next.car
          distance: rearPosition - frontPosition
      return result =
        car: null
        distance: Infinity

module.exports = LanePosition
