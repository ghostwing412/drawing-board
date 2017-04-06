/**
 * CANVAS画布
 * Created by ghost on 2017/3/16.
 */
var $GW_CANVAS = $GW_CANVAS || {};
$GW_CANVAS = (function (window) {
    var canvas_api = function (obj) {
        this.setting = {
            color: '#fff',
            width: 2,
            cap: 'butt'
        };
        this.area = obj.getContext("2d");
    };
    canvas_api.prototype.options = function (opts) {
        this.setting = $.extend(this.setting, opts);
        return this;
    };
    canvas_api.prototype.lineStyle = function (opts) {
        if (typeof opts != 'object') {
            opts = {};
        }
        opts = $.extend({}, this.setting, opts);
        for (type in opts) {
            switch (type) {
                case 'cap':
                    this.area.lineCap = opts.cap;
                    break;
                case 'color':
                    this.area.strokeStyle = opts.color;
                    break;
                case 'width':
                    this.area.lineWidth = opts.width;
                    break;
            }
        }
        return this;
    };
    // canvas_api.prototype.line = function (start, end, opts) {
    //     this.area.save();
    //     this.area.beginPath();
    //     this.lineStyle(opts);
    //     this.area.moveTo(start.x, start.y);
    //     this.area.lineTo(end.x, end.y);
    //     this.area.stroke();
    //     this.area.restore();
    //     return this;
    // };
    canvas_api.prototype.line = function (tags, opts) {
        this.area.save();
        this.area.beginPath();
        this.lineStyle(opts);
        this.area.moveTo(tags[0].x, tags[0].y);
        this.area.lineTo(tags[1].x, tags[1].y);
        this.area.stroke();
        this.area.restore();
    };
    canvas_api.prototype.square = function (tags, opts) {
        this.area.save();
        this.area.beginPath();
        this.lineStyle(opts);
        this.area.moveTo(tags[0].x, tags[0].y);
        this.area.lineTo(tags[1].x, tags[1].y);
        this.area.lineTo(tags[2].x, tags[2].y);
        this.area.lineTo(tags[3].x, tags[3].y);
        this.area.closePath();
        this.area.stroke();
        this.area.restore();
    };
    canvas_api.prototype.lines = function (tags, opts) {
        this.area.save();
        this.area.beginPath();
        this.lineStyle(opts);
        this.area.moveTo(tags[0].x, tags[0].y);
        var i = 1;
        for (; i < tags.length; i++) {
            // var tmp = tags[i];
            // this.area.moveTo(tmp.x, tmp.y);
            // console.log(tags);
            this.area.lineTo(tags[i].x, tags[i].y);
        }
        this.area.stroke();
        this.area.restore();
    };
    canvas_api.prototype.linesNoLink = function (tags, opts) {
        console.log(this.area, tags);
        this.area.save();
        this.area.beginPath();
        this.lineStyle(opts);
        var i = 0;
        for (; i < tags.length - 1;) {
            var start = tags[i++];
            var end = tags[i++];
            this.area.moveTo(start.x, start.y);
            this.area.lineTo(end.x, end.y);
        }
        this.area.stroke();
        this.area.restore();
    };
    canvas_api.prototype.curve = function (x, y, core_x, core_y, radiusX, radiusY, opts) {
        this.area.save();
        this.area.beginPath();
        this.lineStyle(opts);
        // this.area.moveTo(x, y);
        this._ellipse(core_x, core_y, radiusX, radiusY, 0, 0, 2 * Math.PI, true);
        this.area.closePath();
        this.area.stroke();
    };
    canvas_api.prototype.eraser = function (start, end, opts) {
        this.area.save();
        this.area.beginPath();
        this.lineStyle(opts);
        var tmp_gco = this.area.globalCompositeOperation;
        this.area.globalCompositeOperation = 'destination-out';
        this.area.moveTo(start.x, start.y);
        this.area.lineTo(end.x, end.y);
        // this.area.fill();
        this.area.stroke();
        this.area.restore();
        this.area.globalCompositeOperation = tmp_gco;

    };
    canvas_api.prototype.clear = function (obj) {
        this.area.clearRect(0, 0, obj.width, obj.height);
    };
    /**
     * 椭圆弧
     * @param x 圆心坐标x
     * @param y 圆心坐标y
     * @param radiusX x轴半径
     * @param radiusY y轴半径
     * @param rotation 椭圆旋转角度
     * @param startAngle 椭圆起始角弧度
     * @param endAngle 椭圆结束角弧度
     * @param antiClockwise true|false 逆时针或者顺时针
     */
    canvas_api.prototype._ellipse = function (x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
        this.area.translate(x, y);
        this.area.rotate(rotation);
        this.area.scale(radiusX, radiusY);
        this.area.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
        this.area.restore();
    };
    var canvas = function (width, height, top, left) {
        this.elm = document.createElement('canvas');
        this.width = width;
        this.height = height;
        this.top = top;
        this.left = left;
        this.style();
        this.api = new canvas_api(this.elm);
    };
    canvas.prototype.style = function () {
        this.elm.width = this.width;
        this.elm.height = this.height;
        this.elm.style.position = 'absolute';
        this.elm.style.top = this.top + 'px';
        this.elm.style.left = this.left + 'px';
    };
    canvas.prototype.setPos = function (top, left) {
        this.top = top;
        this.left = left;
        this.style();
    };
    canvas.prototype.draw = function (type, args) {
        if (type in this.api) {
            this.api[type].apply(this.api, args);
        } else {
            console.error('canvas can`t active this command!');
        }
    };
    canvas.prototype.clear = function () {
        this.api.clear(this.elm);
    };
    // canvas.prototype.setLines = function (lines, opts) {
    //     this.api.lines(lines, opts);
    // };
    // // canvas.prototype
    // canvas.prototype.linesNoLink = function (lines, opts) {
    //     this.api.linesNoLink(lines, opts);
    // };
    canvas.prototype.get = function () {
        return this.elm;
    };
    return canvas;
})();