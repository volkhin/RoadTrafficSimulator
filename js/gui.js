define(["jquery", "point", "rect", "graphics"], function($, Point, Rect, Graphics) {
    "use strict";

    function Button(title, callback, rect) {
        this.title = title;
        this.callback = callback;
        this.rect = rect;
    }


    function GUI() {
        this.canvas = $("#gui")[0];
        this.ctx = this.canvas.getContext("2d");
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.gridStep = this.height;
        this.margin = 5;
        this.buttons = [];
        this.fontSize = 12;
        this.colors = {
            buttonBackground: "#ddd",
            buttonTitle: "#333",
        };
        this.graphics = new Graphics(this.ctx);

        var self = this;

        $(this.canvas).click(function(e) {
            var point = self.getPoint(e);
            $.each(self.buttons, function(index, button) {
                if (button.rect.containsPoint(point)) {
                    if (button.callback && typeof button.callback === "function") {
                        button.callback.call();
                    }
                }
            });
        });
    }

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

    GUI.prototype.draw = function() {
        this.graphics.clear("white");
        var offsetX = 0, margin = this.margin;
        for (var i = 0; i < this.buttons.length; ++i) {
            var button = this.buttons[i];
            var title = button.title;
            if (typeof title === "function") {
                title = title.call();
            }
            this.ctx.font = this.fontSize + "pt Lucida Grant";
            var textWidth = this.ctx.measureText(title).width;
            this.ctx.fillStyle = this.colors.buttonBackground;
            button.rect
                .setLeft(offsetX + margin)
                .setTop(margin)
                .setWidth(textWidth + 2 * margin)
                .setHeight(this.gridStep - 2 * margin);
            this.graphics.fillRect(button.rect);
            this.ctx.fillStyle = this.colors.buttonTitle;
            this.ctx.fillText(title, button.rect.getLeft() + margin,
                    this.gridStep / 2 + this.fontSize / 2);
            offsetX += textWidth + 3 * margin;
        }
    };

    return GUI;
});
