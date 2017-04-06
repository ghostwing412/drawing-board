/**
 * 画图工具
 * 1、mousedown坐标开始
 * 2、mousemove利用SVN PATH产生路径图像
 * 3、mouseup根据path信息转换成固定图像到canvas
 * Created by ghost on 2017/3/30.
 */
;(function ($, window, document, undefined) {
    var svg_w3c = 'http://www.w3.org/2000/svg';
    var svgPath = function ($elm, options) {
        this.elm = $($elm);
        this.$elm = this.elm[0];
        this.init();
        this.current_type = 'curve';
        this.type_list = ['curve', 'line', 'square', 'pointToLine', 'eraser'];
        this.tmp_path = null;
        this.canvas = null;
        this.setting = {
            'line_style': {
                color: '#000000',
                width: 1
            }
        };
        this.options(options);
        // this.resize = function () {
        //     var offset = elm.offset();
        //     console.log(offset);
        //     this.left = offset.left;
        //     this.top = offset.top;
        // };
        // this.resize();
    };
    svgPath.prototype = {
        start_core: {x: 0, y: 0},
        end_core: {},
        line_to: [],
        d: '',
        _point_core_collect: [],//点坐标集合
        init: function () {
            var offset = this.elm.offset();
            this.left = offset.left;
            this.top = offset.top;
        },
        options: function (options) {
            this.setting = $.extend({}, this.setting, options);
        },
        setCanvas: function (canvas_obj) {
            this.canvas = canvas_obj;
        },
        setType: function (type) {
            if ($.inArray(type, this.type_list) != -1) {
                this.current_type = type;
            } else {
                console.error('set type is not legal!');
            }
        },
        build: function () {
            this.tmp_path = document.createElementNS(svg_w3c, 'path');
            this.tmp_path.setAttribute('stroke', this.setting.line_style.color);
            this.tmp_path.setAttribute('fill', 'none');
            // this.tmp_path.setAttribute('style', '');
            this.$elm.appendChild(this.tmp_path);
        },
        removePath: function () {
            this.$elm.removeChild(this.tmp_path);
            this.tmp_path = null;
        },
        routeMove: function (x, y) {
            this.d += 'L' + x + "," + y;
        },
        /**
         * 椭圆弧移动
         * @param rx x半径
         * @param ry y半径
         * @param rotation x轴旋转度数
         * @param larc 0|1 弧线小于或者大于180度
         * @param sweep 0|1 逆时针还是顺时针
         * @param x 结束坐标x
         * @param y 结束坐标y
         */
        routeMoveByEllipse: function (rx, ry, rotation, large_arc, sweep, x, y) {
            this.d += "A" + rx + ',' + ry + ',' + rotation + ',' + large_arc + ',' + sweep + ',' + x + ',' + y;
        },
        routeBegin: function (x, y) {
            this.d = "M" + x + ',' + y;
        },
        routeEnd: function () {
            this.d += 'Z';
        },
        line: function (pos_core) {
            this.line_to = pos_core;
            this.routeBegin(this.start_core.x, this.start_core.y);
            this.routeMove(pos_core.x, pos_core.y);
            this.tmp_path.setAttribute('d', this.d);
        },
        lineWithCanvas: function () {
            var position = [
                this.start_core,
                this.line_to
            ];
            this.canvas.draw('line', [position, this.setting.line_style]);
            this.line_to = [];
            this.removePath();
        },
        square: function (pos_core) {
            this.line_to = [
                {x: pos_core.x, y: this.start_core.y},
                {x: pos_core.x, y: pos_core.y},
                {x: this.start_core.x, y: pos_core.y}
            ];
            this.routeBegin(this.start_core.x, this.start_core.y);
            for (var i = 0; i < this.line_to.length; i++) {
                this.routeMove(this.line_to[i].x, this.line_to[i].y);
            }
            this.routeEnd();
            this.tmp_path.setAttribute('d', this.d);
        },
        squareWithCanvas: function () {
            var position = [this.start_core].concat(this.line_to);
            this.canvas.draw('square', [position, this.setting.line_style]);
            this.line_to = [];
            this.removePath();
        },
        curve: function (pos_core) {
            this.routeBegin(this.start_core.x, this.start_core.y);
            var width = Math.abs(pos_core.x - this.start_core.x);
            var height = Math.abs(pos_core.y - this.start_core.y);
            var rate = Math.sqrt(2) / 2;
            var rx = rate * width;
            var ry = rate * height;
            this._curve_attr = {
                end_pos: pos_core,
                radius_x: rx,
                radius_y: ry
            };
            this.routeMoveByEllipse(rx, ry, 0, 1, 0, pos_core.x, pos_core.y);
            this.routeMoveByEllipse(rx, ry, 0, 1, 0, this.start_core.x, this.start_core.y);
            this.tmp_path.setAttribute('d', this.d);
        },
        curveWithCanvas: function () {
            var core_position = {x: 0, y: 0};
            core_position.x = Math.min(this._curve_attr.end_pos.x, this.start_core.x) + Math.abs(this._curve_attr.end_pos.x - this.start_core.x) / 2;
            core_position.y = Math.min(this._curve_attr.end_pos.y, this.start_core.y) + Math.abs(this._curve_attr.end_pos.y - this.start_core.y) / 2;
            this.canvas.draw('curve', [this.start_core.x, this.start_core.y, core_position.x, core_position.y, this._curve_attr.radius_x, this._curve_attr.radius_y, this.setting.line_style]);
            this._curve_attr = {};
            this.removePath();
            // console.log('ellipse' in this.canvas);
        },
        pointToLine: function (pos_core) {
            var _this = this;
            this._point_core_collect.push(pos_core);
            this.routeBegin(this.start_core.x, this.start_core.y);
            $.each(this._point_core_collect, function (i, v) {
                _this.routeMove(v.x, v.y);
            });
            this.tmp_path.setAttribute('d', this.d);
        },
        pointToLineWithCanvas: function () {
            var position = [this.start_core].concat(this._point_core_collect);
            this.canvas.draw('lines', [position, this.setting.line_style]);
            this._point_core_collect = [];
            this.removePath();
        },
        eraser: function (pos_core) {
            if (this.line_to.length == 0) {
                this.line_to.push(this.start_core);
            }
            var start_core = {
                x: pos_core.x - 10,
                y: pos_core.y - 10
            };
            var end_core = {
                x: pos_core.x + 10,
                y: pos_core.y + 10
            };
            this.routeBegin(start_core.x, start_core.y);
            this.routeMoveByEllipse(10, 10, 0, 1, 0, end_core.x, end_core.y);
            this.routeMoveByEllipse(10, 10, 0, 1, 0, start_core.x, start_core.y);
            this.tmp_path.setAttribute('d', this.d);
            this.canvas.draw('eraser', [this.line_to, pos_core, {cap: 'round', 'width': 20}]);
            this.line_to[0] = pos_core;
            // this.tmp_path.arc(pos_core.x, pos_core.y, 10, 0, 2 * Math.PI, false);
            // this._point_core_collect.push(pos_core);
        },
        eraserWithCanvas: function () {
            this.removePath();
        },
        canvasDraw: function () {
            var func = this.current_type + 'WithCanvas';
            this[this.current_type + "WithCanvas"]();
        },
        setStart: function (x, y) {
            console.log(this.left, this.top);
            this.start_core = {x: x - this.left, y: y - this.top};
            this.build();
        },
        move: function (x, y) {
            this[this.current_type]({x: x - this.left, y: y - this.top});
        },
        setEnd: function (x, y) {
            if (this.canvas != null) {
                this.canvasDraw();
            }
        }
    };
    var svgUp = function (event) {
        try {
            $(this).data('mouse_event_type', 'up');
            var data = $(this).data('svgPath');
            $(this).off('mousemove.svgPath').off('mouseup.svgPath');
            data.setEnd(event.clientX, event.clientY);
        } catch (e) {
            console.error(e);
        }
    };
    var svgMove = function (event) {
        $(this).data('mouse_event_type', 'down');
        var data = $(this).data('svgPath');
        data.move(event.clientX, event.clientY);
    };
    var svgDown = function (event) {
        event.preventDefault();
        var step = $(this).data('mouse_event_type');
        if (event.which == 1 && (!step || step == 'up')) {
            var data = $(this).data('svgPath');
            $(this).data('mouse_event_type', 'down');
            data.setStart(event.clientX, event.clientY);
            $(this).on('mousemove.svgPath', svgMove);
            $(this).on('mouseup.svgPath', svgUp);
        }
    };
    $.fn.svgPath = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function () {
            var $this = $(this),
                data = $this.data('svgPath'),
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('svgPath', (data = new svgPath(this, $.extend({}, $.fn.svgPath.defaults, options))));
                $this.on('mousedown', svgDown);
                // $(window).on('resize', function () {
                //     data.resize();
                // });
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
    };
    $.fn.svgPath.defaults = {};
})(jQuery, window, document);
