define(function(require) {
    "use strict";

    var $ = require("jquery"),
        _ = require("underscore"),
        Point = require("geometry/point"),
        Rect = require("geometry/rect"),
        Graphics = require("graphics");

    function Button(title, callback, rect) {
        this.title = title;
        this.callback = callback;
        this.rect = rect;
        this.isPressed = false;
    }

    Button.prototype.getTitle = function() {
        if (typeof this.title === "function") {
            return this.title.call();
        }
        return this.title;
    };

    Button.prototype.call = function() {
        if (this.callback && typeof this.callback === "function") {
            this.callback.call();
        }
    };


    function GUI() {
        this.fps = 10;
        this.canvas = $("#gui")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.lineHeight = 30;
        this.margin = 5;
        this.buttons = [];
        this.fontSize = 12;
        this.colors = {
            buttonBackground: "#ddd",
            buttonPressedBackground: "#bbb",
            buttonTitle: "#333",
        };
        this.graphics = new Graphics(this.ctx);
        setInterval(this.draw.bind(this), 1000 / this.fps);

        var self = this;

        $(this.canvas).click(function(e) {
            var buttons = self.getButtonsByEvent(e);
            _.each(buttons, function(button) {
                button.call();
            });
        });

        $(this.canvas).on("mousedown", function(e) {
            var buttons = self.getButtonsByEvent(e);
            _.each(buttons, function(button) {
                button.isPressed = true;
            });
        });

        $(this.canvas).on("mouseup", function(e) {
            var buttons = self.getButtonsByEvent(e);
            _.each(buttons, function(button) {
                button.isPressed = false;
            });
        });
    }

    GUI.prototype.getButtonsByEvent = function(e) {
        var point = this.getPoint(e);
        return _.filter(this.buttons, function(button) {
            return button.rect.containsPoint(point);
        });
    };

    GUI.prototype.getPoint = function(e) {
        return new Point(
            e.pageX - this.canvas.offsetLeft,
            e.pageY - this.canvas.offsetTop
        );
    };

    GUI.prototype.addButton = function(title, callback) {
        var button = new Button(title, callback, new Rect());
        this.buttons.push(button);
    };

    GUI.prototype.drawButton = function(button) {
        var margin = this.margin;
        var title = button.title;
        if (typeof title === "function") {
            title = title.call();
        }
        this.ctx.font = this.fontSize + "pt Lucida Grant";
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        var textWidth = this.ctx.measureText(title).width;
        button.rect
            .setLeft(this.offsetX + margin)
            .setTop(this.offsetY + margin)
            .setWidth(textWidth + 2 * margin)
            .setHeight(this.lineHeight - margin);
        if (button.rect.getRight() > this.width) {
            return false;
        }
        if (button.isPressed) {
            this.ctx.fillStyle = this.colors.buttonPressedBackground;
        } else {
            this.ctx.fillStyle = this.colors.buttonBackground;
        }
        this.graphics.fillRect(button.rect);
        this.ctx.fillStyle = this.colors.buttonTitle;
        this.ctx.fillText(title, button.rect.getCenter().x, button.rect.getCenter().y);
        this.offsetX = button.rect.getRight();
        return true;
    };

    GUI.prototype.draw = function() {
        this.offsetX = 0;
        this.offsetY = 0;

        this.graphics.clear("white");

        for (var i = 0; i < this.buttons.length; ++i) {
            var button = this.buttons[i];
            if (!this.drawButton(button)) {
                this.offsetY += this.lineHeight;
                this.offsetX = 0;
                this.drawButton(button);
            }
        }
    };

    return GUI;
});
