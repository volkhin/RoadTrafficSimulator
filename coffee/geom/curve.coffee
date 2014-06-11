'use strict'

Segment = require './segment.coffee'

module.exports =
  class Curve
    constructor: (@A, @B, @O) ->
      @AB = new Segment @A, @B
      @AO = new Segment @A, @O
      @OB = new Segment @O, @B

    @property 'length',
      get: ->
        @AB.length unless @O?
        # FIXME: it's not the real length
        @AB.length

    getPoint: (a) ->
      @AB.getPoint a unless @O?
      p0 = @AO.getPoint(a)
      p1 = @OB.getPoint(a)
      (new Segment p0, p1).getPoint a

    getDirection: (a) ->
      @AB.direction unless @O?
      p0 = @AO.getPoint(a)
      p1 = @OB.getPoint(a)
      (new Segment p0, p1).direction
