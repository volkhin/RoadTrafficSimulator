(function() {
  'use strict';
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(function(require) {
    var ControlSignals, settings;
    settings = require('settings');
    return ControlSignals = (function() {
      function ControlSignals() {
        this.time = 0;
        this.flipMultiplier = 1 + (Math.random() * 0.4 - 0.2);
        this.stateNum = 0;
      }

      ControlSignals.prototype.states = [['L', '', 'L', ''], ['FR', '', 'FR', ''], ['', 'L', '', 'L'], ['', 'FR', '', 'FR']];

      ControlSignals.STATE = [
        {
          RED: 0,
          GREEN: 1
        }
      ];

      ControlSignals.property('flipInterval', {
        get: function() {
          return this.flipMultiplier * settings.lightsFlipInterval;
        }
      });

      ControlSignals.prototype._decode = function(str) {
        var state;
        state = [0, 0, 0];
        if (__indexOf.call(str, 'L') >= 0) {
          state[0] = 1;
        }
        if (__indexOf.call(str, 'F') >= 0) {
          state[1] = 1;
        }
        if (__indexOf.call(str, 'R') >= 0) {
          state[2] = 1;
        }
        return state;
      };

      ControlSignals.property('state', {
        get: function() {
          var stringState, x, _i, _len, _results;
          stringState = this.states[this.stateNum % this.states.length];
          _results = [];
          for (_i = 0, _len = stringState.length; _i < _len; _i++) {
            x = stringState[_i];
            _results.push(this._decode(x));
          }
          return _results;
        }
      });

      ControlSignals.prototype.flip = function() {
        return this.stateNum++;
      };

      ControlSignals.prototype.onTick = function(delta) {
        this.time += delta;
        if (this.time > this.flipInterval) {
          this.flip();
          return this.time -= this.flipInterval;
        }
      };

      return ControlSignals;

    })();
  });

}).call(this);
