# RoadTrafficSimulator

Traffic simulator and road lights adjuster using
[Intelligent Driver Model](https://en.wikipedia.org/wiki/Intelligent_driver_model)
and lane-changing model MOBIL. Written in CoffeeScript and HTML5.

Currently it provides only simulator with visualizer but in future releases
traffic lights optimizer will be added to construct best possible schedule and
avoid traffic jams.

## Demo
http://volkhin.com/RoadTrafficSimulator

* Mouse and wheel - scrolling and zoom
* shift + click -- create intersection
* shift + drag from one intersection to another -- create road

Or just press generateMap in control panel and add cars with carsNumber slider.

## Contributing
Feel free to send pull requests and create bug reports/reature requests using
issues. Or just send me your feedback to artem@volkhin.com.
To run simulator

    git clone https://github.com/volkhin/RoadTrafficSimulator
    cd RoadTrafficSimulator
    npm install

And open index.html in your browser. Use **gulp** to rebuild project.

[![Stories in Ready](https://badge.waffle.io/volkhin/roadtrafficsimulator.png?label=ready&title=Ready)](https://waffle.io/volkhin/roadtrafficsimulator)
