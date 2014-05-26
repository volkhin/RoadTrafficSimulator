define(["jquery", "visualizer", "gui", "world"], function($, Visualizer, GUI, World) {
    function App() {
        this.FPS = 30;
    }

    App.prototype.init = function() {
        this.world = new World();
        this.world.load();
        this.visualizer = new Visualizer(this.world);
        this.gui = new GUI();
        this.gui.addButton("save", this.world.save.bind(this.world));
        this.gui.addButton("load", this.world.load.bind(this.world));
        this.gui.addButton("clear", this.world.clear.bind(this.world));
        this.gui.addButton("add car", this.world.addRandomCar.bind(this.world));
        this.gui.addButton("del cars", this.world.removeAllCars.bind(this.world));
        setInterval(this.visualizer.draw.bind(this.visualizer), 1000 / this.FPS);
        setInterval(this.world.onTick.bind(this.world), 1000 / this.FPS);
        setInterval(this.gui.draw.bind(this.gui), 1000 / this.FPS);
    };

    return App;
});
