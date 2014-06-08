define(function(require) {
  'use strict';

  var _ = require('underscore'),
      settings = require('settings');

  function ControlSignals() {
    this.time = 0;
    this.flipMultiplier = 1 + (Math.random() * 0.4 - 0.2); // 0.8 - 1.2
    this.stateNum = 0;
  }

  ControlSignals.prototype.states = [
    ['L', '', 'L', ''],
    ['FR', '', 'FR', ''],
    ['', 'L', '', 'L'],
    ['', 'FR', '', 'FR']
  ];

  ControlSignals.STATE = {
    RED: 0,
    GREEN: 1
  };

  Object.defineProperty(ControlSignals.prototype, 'flipInterval', {
    get: function() {
      return this.flipMultiplier * settings.lightsFlipInterval;
    }
  });

  Object.defineProperty(ControlSignals.prototype, 'state', {
    get: function() {
      var stringState = this.states[this.stateNum % this.states.length];
      return _.map(stringState, function(pattern) {
        var state = [0, 0, 0];
        if (pattern.indexOf('L') > -1) {
          state[0] = 1;
        }
        if (pattern.indexOf('F') > -1) {
          state[1] = 1;
        }
        if (pattern.indexOf('R') > -1) {
          state[2] = 1;
        }
        return state;
      });
    }
  });

  ControlSignals.prototype.flip = function() {
    this.stateNum++;
  };

  ControlSignals.prototype.onTick = function(delta) {
    this.time += delta;
    if (this.time > this.flipInterval) {
      this.flip();
      this.time -= this.flipInterval;
    }
  };

  return ControlSignals;
});
