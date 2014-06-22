'use strict'

require '../helpers'

class Segment
  constructor: (@source, @target) ->

  @property 'vector',
    get: ->
      @target.subtract @source

  @property 'length',
    get: ->
      @vector.length

  @property 'direction',
    get: ->
      @vector.direction

  @property 'center',
    get: ->
      @getPoint 0.5

  split: (n, reverse) ->
    order = if reverse then [n - 1 .. 0] else [0 .. n - 1]
    @subsegment k / n, (k + 1) / n for k in order

  getPoint: (a) ->
    @source.add (@vector.mult a)

  subsegment: (a, b) ->
    offset = @vector
    start = @source.add (offset.mult a)
    end = @source.add (offset.mult b)
    new Segment start, end

module.exports = Segment
