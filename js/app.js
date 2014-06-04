define(function(require) {
    "use strict";

    var Visualizer = require("visualizer"),
        GUI = require("GUI"),
        World = require("World");

    function App() {
    }

    App.prototype.init = function() {
        var self = this;
        this.world = new World();
        this.world.load();
        this.visualizer = new Visualizer(this.world);
        this.visualizer.start();

        this.gui = new GUI();

        this.gui.addButton(
            function() {
                return self.visualizer.isRunning ? "Stop" : "Start";
            },
            function() {
                if (self.visualizer.isRunning) {
                    self.visualizer.stop.call(self.visualizer);
                } else {
                    self.visualizer.start.call(self.visualizer);
                }
            }
        );

        this.gui.addButton("Save", this.world.save.bind(this.world));
        this.gui.addButton("Load", this.world.load.bind(this.world));
        this.gui.addButton("Clear", this.world.clear.bind(this.world));

        this.gui.addButton(function() {
            return "speed: " + self.world.getInstantSpeed().toFixed(2);
        }, null);

        this.gui.addButton("Add car", this.world.addRandomCar.bind(this.world));

        this.gui.addButton("Add 10 cars", function() {
            for (var i = 0; i < 10; i++) {
                self.world.addRandomCar.call(self.world);
            }
        });

        this.gui.addButton("Del cars", this.world.removeAllCars.bind(this.world));

        this.gui.addButton(function() {
            return "Cars: " + self.world.cars.length;
        }, null);

        this.gui.addButton("-", this.visualizer.zoomer.zoomOut.bind(this.visualizer.zoomer));

        this.gui.addButton(function() {
            return Math.floor(100 * self.visualizer.zoomer.scale) + "%";
        }, this.visualizer.zoomer.zoomNormal.bind(this.visualizer.zoomer));

        this.gui.addButton("+", this.visualizer.zoomer.zoomIn.bind(this.visualizer.zoomer));

        this.gui.addButton(function() {
            var state = self.visualizer.toolMover.isBound ? "on" : "off";
            return "move(" + state + ")";
        }, this.visualizer.toolMover.toggleState.bind(this.visualizer.toolMover));
    };

    return App;
});
