require(["serializer"], function(serializer) {
    describe('Serializer', function() {
        var __localStorage = null;

        beforeEach(function() {
            __localStorage = window.localStorage;
            window.localStorage = {};
        });

        afterEach(function() {
            window.localStorage = __localStorage;
        });

        it('works for simple objects', function() {
            var obj = {a: 1, b: 2, c: {d: 3, e: 4}};
            serializer.save("name1", obj);
            expect(window.localStorage.name1).not.toBeUndefined();
            expect(window.localStorage).toEqual({name1: obj});
        });
    });
});
