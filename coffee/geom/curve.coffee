'use strict'

require '../helpers'
Segment = require './segment'

class Curve
  constructor: (@A, @B, @O, @Q) ->
    @AB = new Segment @A, @B
    @AO = new Segment @A, @O
    @OQ = new Segment @O, @Q
    @QB = new Segment @Q, @B
    @_length = null

  @property 'length',
    get: ->
      if not @_length?
        pointsNumber = 10
        prevoiusPoint = null
        @_length = 0
        for i in [0..pointsNumber]
          point = @getPoint i / pointsNumber
          @_length += point.subtract(prevoiusPoint).length if prevoiusPoint
          prevoiusPoint = point
      return @_length

  getPoint: (a) ->
    # OPTIMIZE avoid points and segments
    p0 = @AO.getPoint(a)
    p1 = @OQ.getPoint(a)
    p2 = @QB.getPoint(a)
    r0 = (new Segment p0, p1).getPoint a
    r1 = (new Segment p1, p2).getPoint a
    (new Segment r0, r1).getPoint a

  getDirection: (a) ->
    # OPTIMIZE avoid points and segments
    p0 = @AO.getPoint(a)
    p1 = @OQ.getPoint(a)
    p2 = @QB.getPoint(a)
    r0 = (new Segment p0, p1).getPoint a
    r1 = (new Segment p1, p2).getPoint a
    (new Segment r0, r1).direction

module.exports = Curve
