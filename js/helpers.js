(function() {
  'use strict';
  define(function() {
    Function.prototype.property = function(prop, desc) {
      return Object.defineProperty(this.prototype, prop, desc);
    };
    return {};
  });

}).call(this);
