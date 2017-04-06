/**
 * 走势图插件
 * Created by ghost on 2017/3/10.
 */
(function ($) {
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
     */
    var loadTable = function (tb_id, _x, _y, _columns, _rows, add_func) {
        this.table = document.getElementById(tb_id);
        this.add_func = add_func || function () {
            };
        var rows = this.table.rows,
            table_setting = {x: _x || 0, y: _y || 0, columns: _columns || 0, rows: _rows || 0},
            r,
            row_loop;
        var row_length = rows.length;
        var row_start = table_setting.y < 0 ? (row_length + table_setting.y) : table_setting.y,
            row_end = row_start + table_setting.rows - 1;
        var col_length = rows[row_start].cells.length;
        var col_start = table_setting.x < 0 ? (col_length + table_setting.x ) : table_setting.x;
        var col_end = col_start + table_setting.columns;
        if (col_end > col_length)col_end = col_length;
        if (table_setting.columns <= 0) col_end = col_length + table_setting.column;
        var r_i = row_end;
        // console.log(row_end, row_start, col_end, col_start);
        table_row_loop:
            for (; r_i >= row_start; r_i--) {
                var column = rows[r_i].cells;
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
    var base = {//工具基础对象
        options: {},//配置内容
        setOpts: function (opts) {
            this.options = $.extend(this.options, opts);
        },
        on: function () {//打开功能
            throwToolsErr(this, 'must recover function on')
        },
        off: function () {//关闭功能
            throwToolsErr(this, 'must recover function off')
        }
    };
    //遗漏数据
    var norm_data = $.extend(base, {
        options: {
            elm: '',
            cls: ''
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
    var norm_layer = $.extend(base, {
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
        // _tr_n: [],
        // _td_n: [],
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
        //获取行
        // _cTr: function () {
        //     var row_s = 0;
        //     $(this.options.elm).find('tr').each(function (i, v) {
        //         if (row_s == norm_layer.options.row_s) {
        //             row_s = 0;
        //             return true;
        //         }
        //         row_s++;
        //         norm_layer._tr_n.push($(this).index());
        //     });
        // },
        //获取操作列
        // _cTd: function () {
        //     this._tarTr(0).find(this.options.cel.join(',')).each(function (i, v) {
        //         norm_layer._td_n.push($(this).index());
        //     });
        // },
        // _tarTr: function (row) {
        //     return $(this.options.elm + ' tr:eq(' + row + ')');
        // },
        // _tarTd: function (row, column) {//对应坐标对象
        //     return $(this.options.elm + ' tr:eq(' + row + ')>td:eq(' + column + ')');
        // },
        _tarTdOn: function (obj, cls) {//添加样式
            obj.addClass(cls);
        },
        _tarTdOff: function (obj, cls) {//移除样式
            obj.removeClass(cls);
        },
        // _tarTdIsHit: function (obj) {//是否中奖坐标
        //     return obj.is('[' + this.options.mark + ']');
        // },
        // _cache: function (row, column) {//缓存
        //     if (column in this._handle_arr) {
        //         this['_handle_arr'][column].push(row);
        //     } else {
        //         this['_handle_arr'][column] = [row];
        //     }
        // },
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
        // _handle: function (column, tr_n_index) {//操作坐标
        //     for (var i = this._tr_n.length - 1; i > tr_n_index; i--) {
        //         var row = this._tr_n[i];
        //         this._cache(row, column);
        //     }
        // },
        // _handleNoHit: function () {//处理无中奖列
        //     if (this._td_n.length > 0) {
        //         for (var td_i = 0; td_i < this._td_n.length; td_i++) {
        //             for (var tr_i = 0; tr_i < this._tr_n.length; tr_i++) {
        //                 var row = this['_tr_n'][tr_i];
        //                 var column = this['_td_n'][td_i];
        //                 // this._tarTdOn(this._tarTd(row, column));
        //                 this._cache(row, column);
        //             }
        //         }
        //     }
        // },
        _findHit: function () {
            if ($.isEmptyObject(this._handle_arr)) {
                var rang = this.options.rang;
                var table_scanner = new loadTable(this.options.elm, rang.col, rang.row, rang.cols, rang.rows, this.add);
                table_scanner = null;
                // this._initTable();
                // for (var i = this._tr_n.length - 1; i > 0; i--) {
                //     var row = this._tr_n[i];
                //     var td_i = 0;
                //     var td_length = this._td_n.length;
                //     for (; td_i < td_length;) {
                //         var td_v = norm_layer['_td_n'][td_i];
                //         if (this._tarTdIsHit(this._tarTd(row, td_v))) {
                //             this._handle(td_v, i);
                //             this._td_n.splice(td_i, 1);
                //         } else {
                //             td_i++;
                //         }
                //     }
                // }
                // this._handleNoHit();
                // this._clearTmpData();
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
        // _initTable: function () {
        //     this._cTr();
        //     this._cTd();
        // },
        // _clearTmpData: function () {
        //     this._td_n = [];
        //     this._tr_n = [];
        // },
        on: function () {
            this._findHit();
        },
        off: function () {
            this._cancelHit();
        }
    });
    var main = {
        tools: {
            'yl': norm_data,
            'fc': norm_layer
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
                    var options = _this.data('chart_options') || {};
                    main.ctl(chart, options);
                    $(this).change(function () {
                        var checked = $(this).prop('checked');
                        main.ctl(chart, checked);
                    });
                    if(_this.prop('checked')){
                        _this.trigger('change');
                    }
                }
            });
        }
    };
    $.fn.chart_table = main.init;
})(jQuery);
$(function () {
    $('[name="chart_args[]"]').chart_table();
    // $.chart_table.ctl('fc', {elm: 'data-tab'}, 1);
    // $('[name="chart_args[]"]').change(function () {
    //     if ($(this).val() == 'fc') {
    //         $.chart_table.ctl('fc', $(this).prop('checked'));
    //     }
    // });
});
