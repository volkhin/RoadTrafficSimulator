define(["point", "rect"], function(Point, Rect) {

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
        this.colors = {
            buttonBackground: "#bbb",
            buttonTitle: "#333",
        };

        var self = this;

        $(this.canvas).click(function(e) {
            var point = self.getPoint(e);
            $.each(self.buttons, function(index, button) {
                if (button.rect.containsPoint(point)) {
                    button.callback.call();
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
        var offset = this.buttons.length * this.gridStep;
        var width = this.gridStep - this.margin;
        var height = this.gridStep - 2 * this.margin;
        var rect = new Rect(offset + this.margin, this.margin, width, height);
        var button = new Button(title, callback, rect);
        this.buttons.push(button);
    };

    GUI.prototype.draw = function() {
        for (var i = 0; i < this.buttons.length; ++i) {
            var button = this.buttons[i];
            var rect = button.rect;
            this.ctx.fillStyle = this.colors.buttonBackground;
            this.ctx.fillRect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
            this.ctx.fillStyle = this.colors.buttonTitle;
            this.ctx.fillText(button.title, rect.getLeft(), rect.getCenter().y);
        }
    };

    return GUI;
});
