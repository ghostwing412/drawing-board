/**
 * 走势图插件
 * Created by ghost on 2017/3/10.
 */
(function ($, window, document, undefined) {
    var throwToolsErr = function (obj, err) {
        throw err;
    };
    /**
     * 表格读取工具
     * 读取指定ID表格中，2~4参数设定的表格范围内数据
     * @param tb_id 表格ID
     * @param _x 列开始
     * @param _y 行开始
     * @param _columns 列数
     * @param _rows 行数
     * @param add_func 执行插入函数
     * @param is_desc 是否倒序扫描表格
     */
    var loadTable = function (tb_id, _x, _y, _columns, _rows, add_func, is_desc) {
        this.table = document.getElementById(tb_id);
        // this.table = $.myDomCtl.getElementById(tb_id);
        this.add_func = add_func || function () {
            };
        this.rows = this.table.rows;
        this.spaceLine = [];
        var table_setting = {x: _x || 0, y: _y || 0, columns: _columns || 0, rows: _rows || 0},
            r,
            row_loop;
        var row_length = this.rows.length;
        var row_start = table_setting.y < 0 ? (row_length + table_setting.y) : table_setting.y,
            row_end = row_start + table_setting.rows - 1;
        var col_length = this.rows[row_start].cells.length;
        var col_start = table_setting.x < 0 ? (col_length + table_setting.x ) : table_setting.x;
        var col_end = col_start + table_setting.columns;
        if (col_end > col_length)col_end = col_length;
        if (table_setting.columns <= 0) col_end = col_length + table_setting.column;
        if (is_desc != undefined) {
            var r_i = row_end;
            var step = function () {
                    return r_i--;
                },
                stop = function () {
                    return r_i >= row_start;
                }
        } else {
            var r_i = row_start;
            var step = function () {
                    return r_i++;
                },
                stop = function () {
                    return r_i <= row_end;
                }
        }
        table_row_loop:
            for (; stop(); step()) {
                var column = this.rows[r_i].cells;
                var c_i = col_start;
                table_col_loop:
                    for (; c_i < col_end; c_i++) {
                        // console.log(c_i, r_i);
                        var td = column[c_i];
                        if (td === undefined)continue;
                        var check_res = this.add_func(td, r_i, c_i);
                        if (check_res == 'stop_col') {
                            break table_col_loop;
                        }
                        if (check_res == 'stop_row') {
                            break table_row_loop;
                        }
                    }
            }
    };
    loadTable.prototype.isSpaceLine = function (r_i) {
        return this.rows[r_i].cells.length == 1;
    };
    var addClass = function (data, cls) {
        $.each(data, function (i, v) {
            $(v).addClass(cls);
        });
    };
    var removeClass = function (data, cls) {
        $.each(data, function (i, v) {
            $(v).removeClass(cls);
        });
    };
    var base = {//工具基础对象
        options: {},//配置内容
        setOpts: function (opts) {
            // console.log(opts);
            this.options = $.extend(this.options, opts);
        },
        add: function (td, row, column) {

        },
        on: function () {//打开功能
            throwToolsErr(this, 'must recover function on')
        },
        off: function () {//关闭功能
            throwToolsErr(this, 'must recover function off')
        }
    };
    //遗漏数据
    var norm_data = $.extend({}, base, {
        options: {
            elm: '.chart_table',
            cls: 'nonum'
        },
        //展示
        on: function () {
            $(this.options.elm).removeClass(this.options.cls);
        },
        //隐藏
        off: function () {
            $(this.options.elm).addClass(this.options.cls);
        }
    });
    //遗漏分层
    var norm_layer = $.extend({}, base, {
        options: {
            cel: ['tdbg_3', 'tdbg_5'],//操作列标识
            mark: 'hit',//中奖标识
            elm: 'data-tab',//操作顶级元素标识
            rang: {
                col: 4,
                row: 0,
                cols: 54,
                rows: 35
            },
            cls: {5: 'td_index', 15: 'td_index2', 99: 'td_index3'},//操作类名,判断比键小的命中列显示指定值的类名
            row_s: 5//行分割
        },
        _lock_c: [],
        _handle_arr: {},//缓存操作坐标数组
        /**
         * loadTable工具使用函数
         * 注意其中this并非norm_layer本身，会被loadTable替换
         * @param td
         * @param row
         * @param column
         */
        add: function (td, row, column) {
            if (norm_layer.check(td)) {
                if ($.inArray(column, norm_layer._lock_c) == -1) {
                    if (!(column in norm_layer._handle_arr)) {
                        norm_layer._handle_arr[column] = [];
                    }
                    var tmp = {td: td, row: row};
                    norm_layer._handle_arr[column].push(tmp);
                }
            } else {
                norm_layer._lock_c.push(column);
            }
        },
        check: function (td) {//检测指定列且非开奖号码为遗漏单元
            return !td.hasAttribute(this.options.mark) && $.inArray(td.className, this.options.cel) != -1;
        },
        _tarTdOn: function (obj, cls) {//添加样式
            obj.addClass(cls);
        },
        _tarTdOff: function (obj, cls) {//移除样式
            obj.removeClass(cls);
        },
        _loadCache: function (func) {
            for (column in this._handle_arr) {
                var length = this['_handle_arr'][column].length;
                var cls_str = '';
                $.each(this.options.cls, function (len, cls) {
                    if (length <= len) {
                        cls_str = cls;
                        return false;
                    }
                });
                $.each(this['_handle_arr'][column], function (i, row) {
                    func(row, column, cls_str);
                })
            }
        },
        _findHit: function () {
            if ($.isEmptyObject(this._handle_arr)) {
                var rang = this.options.rang;
                var table_scanner = new loadTable(this.options.elm, rang.col, rang.row, rang.cols, rang.rows, this.add, true);
                table_scanner = null;
            }
            this._loadCache(function (row, column, cls) {
                norm_layer._tarTdOn($(row.td), cls);
            })
        },
        _cancelHit: function () {
            if (!$.isEmptyObject(this._handle_arr)) {
                this._loadCache(function (row, column, cls) {
                    norm_layer._tarTdOff($(row.td), cls);
                });
            }
        },
        on: function () {
            this._findHit();
        },
        off: function () {
            this._cancelHit();
        }
    });
    /**
     * 邻号
     */
    var norm_neighboring = $.extend({}, base, {
        options: {
            mark: 'hit',
            elm: 'data-tab',
            cls: 'tdbg_x',
            rang: {
                col: 4,
                row: 0,
                cols: 34,
                rows: 35
            }
        },
        _hit: {},
        _data: [],
        add: function (td, row, column) {
            if (norm_neighboring.check(td)) {
                var key = norm_neighboring.getKey(row, column);
                norm_neighboring._hit[key] = td;
                norm_neighboring.getData(td, row, column, this);
            }
        },
        check: function (td) {
            return td.hasAttribute(this.options.mark);
        },
        getData: function (td, row, column, table) {
            if (row > 0) {
                var n_row = row - 1;
                if (table.isSpaceLine(n_row)) {
                    n_row--;
                }
                $.each([-1, 1], function (i, v) {
                    var key = norm_neighboring.getKey(n_row, column + v);
                    if (key in norm_neighboring._hit) {
                        norm_neighboring._data.push(td);
                    }
                });
            }
        },
        getKey: function (row, column) {
            return row + '-' + column;
        },
        on: function () {
            if ($.isEmptyObject(this._hit)) {
                var rang = this.options.rang;
                var table = new loadTable(this.options.elm, rang.col, rang.row, rang.cols, rang.rows, this.add);
            }
            addClass(this._data, this.options.cls);
        },
        off: function () {
            removeClass(this._data, this.options.cls);
        }
    });
    /**
     * 连号
     */
    var norm_consecutive = $.extend({}, base, {
        options: {
            elm: 'data-tab',
            mark: 'hit',
            rang: {
                col: 4,
                row: 0,
                cols: 34,
                rows: 35
            },
            cls: 'tdbg_lh'
        },
        _hit: {},
        _data: [],
        add: function (td, row, column) {
            if (norm_consecutive.check(td)) {
                norm_consecutive._hit[norm_consecutive.getKey(row, column)] = td;
                norm_consecutive.getData(td, row, column);
            }
        },
        check: function (td) {
            return td.hasAttribute(this.options.mark);
        },
        getKey: function (row, column) {
            return row + '-' + column;
        },
        getData: function (td, row, column) {
            var n_column = column - 1;
            var key = this.getKey(row, n_column);
            if (key in this._hit) {
                this._data.push(td);
            }
        },
        on: function () {
            if ($.isEmptyObject(this._hit)) {
                var rang = this.options.rang;
                var table = new loadTable(this.options.elm, rang.col, rang.row, rang.cols, rang.rows, this.add);
            }
            addClass(this._data, this.options.cls);
        },
        off: function () {
            removeClass(this._data, this.options.cls);
        }
    });
    /**
     * 重号
     */
    var norm_repeat = $.extend({}, base, {
        options: {
            elm: 'data-tab',
            mark: 'hit',
            rang: {
                col: 4,
                row: 0,
                cols: 34,
                rows: 35
            },
            cls: 'tdbg_r'
        },
        _hit: {},
        _data: [],
        add: function (td, row, column) {
            if (norm_repeat.check(td)) {
                norm_repeat._hit[norm_repeat.getKey(row, column)] = td;
                norm_repeat.getData(td, row, column, this);
            }
            // console.log(norm_repeat._hit);
        },
        check: function (td) {
            return td.hasAttribute(this.options.mark);
        },
        getKey: function (row, column) {
            return row + '-' + column;
        },
        getData: function (td, row, column, table) {
            if (row > 0) {
                var n_row = row - 1;
                if (table.isSpaceLine(n_row)) {
                    n_row--;
                }
                var key = this.getKey(n_row, column);
                if (key in this._hit) {
                    this._data.push(td);
                }
            }
        },
        on: function () {
            console.log(this.options);
            if ($.isEmptyObject(this._hit)) {
                var rang = this.options.rang;
                var table = new loadTable(this.options.elm, rang.col, rang.row, rang.cols, rang.rows, this.add);
            }
            addClass(this._data, this.options.cls);
        },
        off: function () {
            removeClass(this._data, this.options.cls);
        }
    });
    var norm_line = $.extend({}, base, {
        options: {
            elm: 'data-tab',
            mark: 'hit',
            rang: {
                col: 34,
                row: 0,
                cols: 4,
                rows: 35
            },
            line: {
                color: 'green',
                width: 1
            },
            ball_hf_width: 8
        },
        _hit: [],
        _data: [],
        _canvas: {},
        _rang_pos: {start: {}, end: {}},
        add: function (td, row, column) {
            // console.log(row, column, td);
            if (norm_line.check(td)) {
                // console.log(td);
                norm_line._hit.push(td);
            }
        },
        check: function (td) {
            return td.hasAttribute(this.options.mark);
        },
        getRangePos: function () {
            var table = document.getElementById(this.options.elm);
            var rang = this.options.rang;
            var rows = table.rows,
                start_td = $(rows[rang.row].cells[rang.col]),
                end_td = $(rows[rang.row + rang.rows - 1].cells[rang.col + rang.cols - 1]);
            var end_tmp_pos = $.extend({}, end_td.offset());
            // console.log(rang.col,rows[rang.row].cells[rang.col], rows[rang.row + rang.rows - 1].cells[rang.col + rang.cols -1]);
            this._rang_pos.start = $.extend({}, start_td.offset());
            this._rang_pos.end = {
                left: end_tmp_pos.left + end_td.outerWidth(),
                top: end_tmp_pos.top + end_td.outerHeight()
            };
            // console.log(this._rang_pos);
        },
        getCorePos: function (td) {
            var td_obj = $(td);
            var offset = td_obj.offset();
            var width = td_obj.outerWidth();
            var height = td_obj.outerHeight();
            // console.log(offset, width, height);
            var top = offset.top + height / 2;
            var left = offset.left + width / 2;
            return {
                top: (top - this._rang_pos.start.top),
                left: (left - this._rang_pos.start.left)
            }
        },
        calculatePos: function (a, b) {
            var pos1 = {},//连线坐标1
                pos2 = {}, //连线坐标2
                x = Math.abs(a.left - b.left), //a,b横向距离
                y = Math.abs(a.top - b.top);//a,b纵向距离
            if (a.left != b.left) {//a,b不在同一列
                var rate = this.options.ball_hf_width / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                var x_rate = x * rate;
                var y_rate = y * rate;
                pos1.y = a.top + y_rate;
                pos2.y = b.top - y_rate;
                if (a.left > b.left) {//a在b的后方
                    pos1.x = a.left - x_rate;
                    pos2.x = b.left + x_rate
                } else if (a.left < b.left) {//a在b的前方
                    pos1.x = a.left + x_rate;
                    pos2.x = b.left - x_rate;
                }
            } else {
                pos1.x = a.left;
                pos1.y = a.top + this.options.ball_hf_width;
                pos2.x = a.left;
                pos2.y = b.top - this.options.ball_hf_width;
            }
            return [pos1, pos2];
        },
        draw: function () {
            if (!$.isEmptyObject(this._canvas)) {
                this._canvas.remove();
            }
            this.getRangePos();
            var core_pos = [], pos = [], i = 0, rang = this.options.rang;
            for (; i < this._hit.length; i++) {
                core_pos.push(this.getCorePos(this._hit[i]));
            }
            i = 0;
            for (; i < core_pos.length - 1; i++) {
                var tmp = this.calculatePos(core_pos[i], core_pos[i + 1]);
                pos.push(tmp[0]);
                pos.push(tmp[1]);
            }
            console.log(pos);
            var canvas_width = this._rang_pos.end.left - this._rang_pos.start.left,
                canvas_height = this._rang_pos.end.top - this._rang_pos.start.top;
            var canvas = new $GW_CANVAS(canvas_width, canvas_height, this._rang_pos.start.top, this._rang_pos.start.left);
            canvas.draw('linesNoLink', [pos, this.options.line]);
            // canvas.linesNoLink(pos, this.options.line);
            var elm = canvas.get();
            document.body.appendChild(elm);
            this._canvas = $(elm);
        },
        on: function () {
            if ($.isEmptyObject(this._canvas)) {
                var rang = this.options.rang;
                var table = new loadTable(this.options.elm, rang.col, rang.row, rang.cols, rang.rows, this.add);
                this.draw();
                $(window).resize(function () {
                    norm_line.draw();
                });
            } else {
                this._canvas.show();
            }
        },
        off: function () {
            if (!$.isEmptyObject(this._canvas)) {
                this._canvas.hide();
            }
        }
    });
    var main = {
        tools: {
            'yl': norm_data,
            'fc': norm_layer,
            'nh': norm_neighboring,
            'lh': norm_consecutive,
            'ch': norm_repeat,
            'nl': norm_line
        },
        ctl: function (tool, opts) {
            if (tool in main.tools) {
                var obj = main['tools'][tool];
                if (typeof opts == 'object') {
                    obj.setOpts(opts);
                    return 1;
                } else {
                    is_on = opts;
                }
                if (is_on) {
                    obj.on();
                } else {
                    obj.off();
                }
            } else {
                return !1;
            }
        },
        init: function () {
            $.each(this, function () {
                var _this = $(this);
                if (_this.data('chart') !== 'undefined') {
                    var chart = _this.data('chart');
                    var options = $.chart_table_config[chart] || _this.data('chart_options') || {};
                    main.ctl(chart, options);
                    $(this).change(function () {
                        var checked = $(this).prop('checked');
                        main.ctl(chart, checked);
                    });
                    if (_this.prop('checked')) {
                        _this.trigger('change');
                    }
                }
            });
        }
    };
    $.fn.chart_table = main.init;
})(jQuery, window, document);
