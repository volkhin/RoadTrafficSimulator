require(["geometry/point"], function(Point) {
    describe('Point', function() {
        it('can be constructed by (x;y)', function() {
            var point = new Point(1, 2);
            expect(point.x).toBe(1);
            expect(point.y).toBe(2);
        });

        it('can be constructed from another point', function() {
            var point = new Point(23, 231);
            var secondPoint = new Point(point);
            expect(secondPoint.x).toBe(23);
            expect(secondPoint.y).toBe(231);
        });

        it('raises error on wrong arguments in constructor', function() {
            var oneArgument = function() { new Point(1); }
            expect(oneArgument).toThrow();

            var threeArguments = function() { new Point(1, 2, 3); }
            expect(threeArguments).toThrow();
        });
    });
});
