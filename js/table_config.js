(function ($) {
    $.chart_table_config = {
        yl: {//遗漏数据
            elm: '.chart-table',
            cls: 'nonum'
        },
        fc: {//遗漏分层
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
        nh: {//邻号
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
        lh: {//连号
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
        ch: {//重号
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
        nl: {
            elm: 'data-tab',
            mark: 'hit',
            rang: {
                col: 39,
                row: 0,
                cols: 16,
                rows: 35
            },
            line: {
                color: 'green',
                width: 1
            },
            shape: {//形状参数
                type: 'square',//curve|square 圆形或者矩形
                attr: {//当时圆形时，此处以圆半径，只使用到width
                    width: 8,//矩形宽的一半
                    height: 18.5//矩形高的一半
                }
            }
        },
        drawing_board: {
            elm: 'data-tab',
            rang: {
                col: 4,
                row: 0,
                cols: 34,
                rows: 35
            },
            svg_button_cls: 'drawing-btn',
            open_cls: 'drawing-open',
            close_cls: 'drawing-close'
        }
    };
})(jQuery);