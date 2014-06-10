'use strict'

define [], () ->
  class Segment
    constructor: (@source, @target) ->

    center: ->
      @getPoint 0.5

    split: (n, reverse) ->
      order = if reverse then [n - 1 .. 0] else [0 .. n - 1]
      @subsegment k / n, (k + 1) / n for k in order

    vector: ->
      @target.subtract @source

    length: ->
      @vector().length()

    direction: ->
      @vector().direction()

    getPoint: (a) ->
      @source.add (@vector().mult a)

    # getSplit: (k, n) ->
    # TODO

    subsegment: (a, b) ->
      offset = @vector()
      start = @source.add (offset.mult a)
      end = @source.add (offset.mult b)
      new Segment start, end
