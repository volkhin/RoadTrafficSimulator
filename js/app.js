define(function(require) {
    "use strict";

    var Visualizer = require("visualizer"),
        DAT = require("dat"),
        World = require("world");

    function App() {
    }

    App.prototype.init = function() {
        this.world = new World();
        this.world.load();
        this.world.start();
        this.visualizer = new Visualizer(this.world);
        this.visualizer.start();

        this.gui = new DAT.GUI();
        this.gui.add(this.world, "save");
        this.gui.add(this.world, "load");
        this.gui.add(this.world, "clear");
        this.gui.add(this.visualizer, "running").name("visualize").listen();
        this.gui.add(this.world, "running").name("simulate").listen();
        this.gui.add(this.visualizer.zoomer, "scale", 0.1, 2).listen();
        this.gui.add(this.world, "carsNumber").min(0).step(1).listen();
        this.gui.add(this.world, "instantSpeed").step(0.00001).listen();
    };

    return App;
});
