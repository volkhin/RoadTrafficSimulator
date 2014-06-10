(function() {
  'use strict';
  define(function() {
    var Pool;
    return Pool = (function() {
      function Pool(factory, pool) {
        var k, v, _ref;
        this.factory = factory;
        this.objects = {};
        if ((pool != null) && (pool.objects != null)) {
          _ref = pool.objects;
          for (k in _ref) {
            v = _ref[k];
            this.objects[k] = this.factory.copy(v);
          }
        }
      }

      Pool.prototype.toJSON = function() {
        return this.objects;
      };

      Pool.prototype.get = function(id) {
        return this.objects[id];
      };

      Pool.prototype.put = function(obj) {
        return this.objects[obj.id] = obj;
      };

      Pool.prototype.pop = function(obj) {
        var id, result, _ref;
        id = (_ref = obj.id) != null ? _ref : obj;
        result = this.objects[id];
        if (typeof result.release === 'function') {
          result.release();
        }
        delete this.objects[id];
        return result;
      };

      Pool.prototype.all = function() {
        return this.objects;
      };

      Pool.prototype.clear = function() {
        return this.objects = {};
      };

      Pool.property('length', {
        get: function() {
          return Object.keys(this.objects).length;
        }
      });

      return Pool;

    })();
  });

}).call(this);
