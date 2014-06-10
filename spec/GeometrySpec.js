/* global describe, it, xit, expect */
define(function(require) {
  'use strict';

  require('helpers');
  var Point = require('geom/point'),
      Rect = require('geom/rect'),
      Segment = require('geom/segment');

  describe('Point', function() {
    it('can be constructed by (x;y)', function() {
      var point = new Point(1, 2);
      expect(point.x).toBe(1);
      expect(point.y).toBe(2);
    });

    xit('throws an error on wrong arguments in constructor', function() {
      var noArguments = function() { return new Point(); };
      expect(noArguments).toThrow();

      var oneArgument = function() { return new Point(1); };
      expect(oneArgument).toThrow();

      var threeArguments = function() { return new Point(1, 2, 3); };
      expect(threeArguments).toThrow();
    });

    it('supports arithmetic operations', function() {
      var point = new Point(12, 100);
      var point2 = new Point(111, 1111);
      expect(point.add(point2)).toEqual(new Point(123, 1211));
      expect(point.subtract(point2)).toEqual(new Point(-99, -1011));
      expect(point.mult(5)).toEqual(new Point(60, 500));
      expect(point.divide(4)).toEqual(new Point(3, 25));
    });
  });

  describe('Rect', function() {
    it('can be constructed', function() {
      var rect = new Rect(1, 2, 3, 4);
      expect(rect).toBeDefined();
    });

    xit('throws an error when constructed with wrong arguments', function() {
      var call = function() { return new Rect(); };
      expect(call).toThrow();
    });

    it('has getters and setters', function() {
      var rect = new Rect(1, 2, 3, 4);
      expect(rect.left()).toBe(1);
      expect(rect.right()).toBe(4);
      expect(rect.top()).toBe(2);
      expect(rect.bottom()).toBe(6);
      expect(rect.width()).toBe(3);
      expect(rect.height()).toBe(4);
      expect(rect.center()).toEqual(new Point(2.5, 4));

      rect.left(5)
      rect.top(6);
      rect.width(7);
      rect.height(8);

      expect(rect.left()).toBe(5);
      expect(rect.top()).toBe(6);
      expect(rect.width()).toBe(7);
      expect(rect.height()).toBe(8);
    });

    it('check if it contains the point', function() {
      var rect = new Rect(1, 2, 3, 4);
      expect(rect.containsPoint(new Point(2, 3))).toBeTruthy();
      expect(rect.containsPoint(new Point(1, 2))).toBeTruthy();
      expect(rect.containsPoint(new Point(4, 6))).toBeTruthy();
      expect(rect.containsPoint(new Point(5, 6))).not.toBeTruthy();
      expect(rect.containsPoint(new Point(4, 7))).not.toBeTruthy();
      expect(rect.containsPoint(new Point(0, 3))).not.toBeTruthy();
      expect(rect.containsPoint(new Point(2, 1))).not.toBeTruthy();
    });

    it('returns its vertices in clockwise order', function() {
      var rect = new Rect(1, 2, 3, 4);
      var expected = [
        new Point(1, 2),
        new Point(4, 2),
        new Point(4, 6),
        new Point(1, 6)
      ];
      expect(rect.getVertices()).toEqual(expected);
    });

    it('returns its sides in CW', function() {
      var rect = new Rect(1, 2, 3, 4);
      expect(rect.getSide(0)).toEqual(
          new Segment(new Point(1, 2), new Point(4, 2)));
      expect(rect.getSide(1)).toEqual(
          new Segment(new Point(4, 2), new Point(4, 6)));
      expect(rect.getSide(2)).toEqual(
          new Segment(new Point(4, 6), new Point(1, 6)));
      expect(rect.getSide(3)).toEqual(
          new Segment(new Point(1, 6), new Point(1, 2)));
    });

    it('returns sector containing point', function() {
      var rect = new Rect(1, 2, 3, 4);
      var points = [
        new Point(3, -100),
        new Point(100, 2),
        new Point(0, 100),
        new Point(-100, 2)
      ];
      for (var i = 0; i < 4; i++) {
        expect(rect.getSectorId(points[i])).toBe(i);
      }
    });
  });

  describe('Segment', function() {
    it('can be constructed from 2 points', function() {
      var segment = new Segment(new Point(1, 2), new Point(3, 4));
      expect(segment).not.toBeNull();
    });

    it('return center point', function() {
      var segment = new Segment(new Point(1, 2), new Point(3, 4));
      expect(segment.center()).toEqual(new Point(2, 3));
    });

    it('splits into n parts', function() {
      var segment = new Segment(new Point(1, 2), new Point(7, 11));
      var expected = [
        new Segment(new Point(1, 2), new Point(3, 5)),
        new Segment(new Point(3, 5), new Point(5, 8)),
        new Segment(new Point(5, 8), new Point(7, 11))
      ];
      expect(segment.split(3)).toEqual(expected);
    });

    it('supports reverse split', function() {
      var segment = new Segment(new Point(1, 2), new Point(7, 11));
      var expected = [
        new Segment(new Point(5, 8), new Point(7, 11)),
        new Segment(new Point(3, 5), new Point(5, 8)),
        new Segment(new Point(1, 2), new Point(3, 5))
      ];
      expect(segment.split(3, true)).toEqual(expected);
    });

    xit('returns k-th part of n-split', function() {
      var segment = new Segment(new Point(1, 2), new Point(11, 17));
      expect(segment.getSplit(3, 5)).toEqual(
          new Segment(new Point(7, 11), new Point(9, 14)));
    });

    it('supports subsegment', function() {
      var segment = new Segment(new Point(1, 2), new Point(11, 17));
      expect(segment.subsegment(0.2, 0.6)).toEqual(
          new Segment(new Point(3, 5), new Point(7, 11)));
    });
  });
});
