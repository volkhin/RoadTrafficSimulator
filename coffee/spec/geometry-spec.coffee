'use strict'

require '../helpers'
Point = require '../geom/point'
Rect = require '../geom/rect'
Segment = require '../geom/segment'

describe 'Geometry', ->

  describe 'Point', ->

    it 'can be constructed', ->
      point = new Point 1, 2
      expect(point.x).toBe 1
      expect(point.y).toBe 2

    it 'supports arithmetic operations', ->
      point = new Point 12, 100
      point2 = new Point 111, 1111
      expect(point.add point2).toEqual new Point 123, 1211
      expect(point.subtract point2).toEqual new Point -99, -1011
      expect(point.mult 5).toEqual new Point 60, 500
      expect(point.divide 4).toEqual new Point 3, 25


  describe 'Segment', ->

    it 'can be constructed', ->
      segment = new Segment new Point(1, 2), new Point(3, 4)
      expect(segment).not.toBeNull()

    it 'returns center point', ->
      segment = new Segment new Point(1, 2), new Point(3, 4)
      expect(segment.center).toEqual new Point 2, 3

    it 'splits into n parts', ->
      segment = new Segment new Point(1, 2), new Point(7, 11)
      expected = [
        new Segment(new Point(1, 2), new Point(3, 5)),
        new Segment(new Point(3, 5), new Point(5, 8)),
        new Segment(new Point(5, 8), new Point(7, 11))
      ]
      expect(segment.split(3)).toEqual(expected)
      expect(segment.split(3, true)).toEqual(expected.reverse())

    it 'supports subsegment', ->
      segment = new Segment new Point(1, 2), new Point(11, 17)
      expect(segment.subsegment(0.2, 0.6)).toEqual(
        new Segment new Point(3, 5), new Point(7, 11)
      )


  describe 'Rect', ->

    it 'can be constructed', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect).not.toBeNull()

    it 'has getters and setters', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.left()).toBe 1
      expect(rect.top()).toBe 2
      expect(rect.right()).toBe 4
      expect(rect.bottom()).toBe 6
      expect(rect.width()).toBe 3
      expect(rect.height()).toBe 4
      expect(rect.center()).toEqual new Point 2.5, 4

      rect.left(5)
      rect.top(6)
      rect.width(7)
      rect.height(8)

      expect(rect.left()).toBe 5
      expect(rect.top()).toBe 6
      expect(rect.width()).toBe 7
      expect(rect.height()).toBe 8

    it 'check if it contains the point', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.containsPoint new Point 2, 3).toBeTruthy()
      expect(rect.containsPoint new Point 1, 2).toBeTruthy()
      expect(rect.containsPoint new Point 4, 6).toBeTruthy()
      expect(rect.containsPoint new Point 5, 6).not.toBeTruthy()
      expect(rect.containsPoint new Point 4, 7).not.toBeTruthy()
      expect(rect.containsPoint new Point 0, 3).not.toBeTruthy()
      expect(rect.containsPoint new Point 2, 1).not.toBeTruthy()

    it 'returns vertices in clockwise order', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.getVertices()).toEqual [
        new Point(1, 2),
        new Point(4, 2),
        new Point(4, 6),
        new Point(1, 6)
      ]

    it 'returns sides in CW', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.getSide 0).toEqual(
        new Segment new Point(1, 2), new Point(4, 2)
      )
      expect(rect.getSide 1).toEqual(
        new Segment new Point(4, 2), new Point(4, 6)
      )
      expect(rect.getSide 2).toEqual(
        new Segment new Point(4, 6), new Point(1, 6)
      )
      expect(rect.getSide 3).toEqual(
        new Segment new Point(1, 6), new Point(1, 2)
      )

    it 'returns sector containing specified point', ->
      rect = new Rect 1, 2, 3, 4
      expect(rect.getSectorId new Point 3, -100).toBe 0
      expect(rect.getSectorId new Point 100, 2).toBe 1
      expect(rect.getSectorId new Point 0, 100).toBe 2
      expect(rect.getSectorId new Point -100, 2).toBe 3
