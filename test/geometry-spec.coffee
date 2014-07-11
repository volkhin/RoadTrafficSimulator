'use strict'

require("blanket")({})

require '../coffee/helpers'
Point = require '../coffee/geom/point'
Rect = require '../coffee/geom/rect'
Segment = require '../coffee/geom/segment'
{expect} = require 'chai'

describe 'Geometry', ->

  describe 'Point', ->

    it 'can be constructed', ->
      point = new Point 1, 2
      expect(point.x).to.equal 1
      expect(point.y).to.equal 2

    it 'supports arithmetic operations', ->
      point = new Point 12, 100
      point2 = new Point 111, 1111
      expect(point.add point2).to.deep.equal new Point 123, 1211
      expect(point.subtract point2).to.deep.equal new Point -99, -1011
      expect(point.mult 5).to.deep.equal new Point 60, 500
      expect(point.divide 4).to.deep.equal new Point 3, 25


  describe 'Segment', ->

    it 'can be constructed', ->
      segment = new Segment new Point(1, 2), new Point(3, 4)
      expect(segment).not.to.be.null

    it 'returns center point', ->
      segment = new Segment new Point(1, 2), new Point(3, 4)
      expect(segment.center).to.deep.equal new Point 2, 3

    it 'splits into n parts', ->
      segment = new Segment new Point(1, 2), new Point(7, 11)
      expected = [
        new Segment(new Point(1, 2), new Point(3, 5)),
        new Segment(new Point(3, 5), new Point(5, 8)),
        new Segment(new Point(5, 8), new Point(7, 11))
      ]
      expect(segment.split(3)).to.deep.equal(expected)
      expect(segment.split(3, true)).to.deep.equal(expected.reverse())

    it 'supports subsegment', ->
      segment = new Segment new Point(1, 2), new Point(11, 17)
      expect(segment.subsegment(0.2, 0.6)).to.deep.equal(
        new Segment new Point(3, 5), new Point(7, 11)
      )


  describe 'Rect', ->

    it 'can be constructed', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect).not.to.be.null

    it 'has getters and setters', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.left()).to.equal 1
      expect(rect.top()).to.equal 2
      expect(rect.right()).to.equal 4
      expect(rect.bottom()).to.equal 6
      expect(rect.width()).to.equal 3
      expect(rect.height()).to.equal 4
      expect(rect.center()).to.deep.equal new Point 2.5, 4

      rect.left(5)
      rect.top(6)
      rect.width(7)
      rect.height(8)

      expect(rect.left()).to.equal 5
      expect(rect.top()).to.equal 6
      expect(rect.width()).to.equal 7
      expect(rect.height()).to.equal 8

    it 'check if it contains the point', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.containsPoint new Point 2, 3).to.be.true
      expect(rect.containsPoint new Point 1, 2).to.be.true
      expect(rect.containsPoint new Point 4, 6).to.be.true
      expect(rect.containsPoint new Point 5, 6).to.be.false
      expect(rect.containsPoint new Point 4, 7).to.be.false
      expect(rect.containsPoint new Point 0, 3).to.be.false
      expect(rect.containsPoint new Point 2, 1).to.be.false

    it 'returns vertices in clockwise order', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.getVertices()).to.deep.equal [
        new Point(1, 2),
        new Point(4, 2),
        new Point(4, 6),
        new Point(1, 6)
      ]

    it 'returns sides in CW', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.getSide 0).to.deep.equal(
        new Segment new Point(1, 2), new Point(4, 2)
      )
      expect(rect.getSide 1).to.deep.equal(
        new Segment new Point(4, 2), new Point(4, 6)
      )
      expect(rect.getSide 2).to.deep.equal(
        new Segment new Point(4, 6), new Point(1, 6)
      )
      expect(rect.getSide 3).to.deep.equal(
        new Segment new Point(1, 6), new Point(1, 2)
      )

    it 'returns sector containing specified point', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.getSectorId new Point 3, -100).to.equal 0
      expect(rect.getSectorId new Point 100, 2).to.equal 1
      expect(rect.getSectorId new Point 0, 100).to.equal 2
      expect(rect.getSectorId new Point -100, 2).to.equal 3
