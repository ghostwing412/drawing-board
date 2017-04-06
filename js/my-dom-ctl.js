/**
 * DOM对象操作控制
 * Created by ghost on 2017/4/5.
 */
;(function ($, window, document, undefined) {
    $.myDomCtl = {
        svg_w3c: 'http://www.w3.org/2000/svg',
        _element_ids: {},
        buildSvg: function (width, height, top, left) {
            var elm = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            elm.setAttribute('width', width);
            elm.setAttribute('height', height);
            this.setSvgPos(elm, top, left);
            // elm.setAttribute('style','position:absolute;top:'+top+'px;left:'+left+'px');
            return elm;
        },
        setSvgPos: function (svg, top, left) {
            svg.setAttribute('style', 'position:absolute;top:' + top + 'px;left:' + left + 'px;');
        },
        /**
         * 根据表格参数获取范围区域
         * @param table 表格DOM对象
         * @param rang 范围参数
         * @returns {{start: null, end: null}} 范围坐标
         */
        getRangPos: function (table, rang) {
            var rows = table.rows,
                _rang_pos = {start: null, end: null},
                start_td = $(rows[rang.row].cells[rang.col]),
                end_td = $(rows[rang.row + rang.rows - 1].cells[rang.col + rang.cols - 1]);
            var end_tmp_pos = $.extend({}, end_td.offset());
            _rang_pos.start = $.extend({}, start_td.offset());
            _rang_pos.end = {
                left: end_tmp_pos.left + end_td.outerWidth(),
                top: end_tmp_pos.top + end_td.outerHeight()
            };
            return _rang_pos;
        },
        /**
         * 获取指定ID的DOM对象
         * 相同ID进行缓存
         * @param id
         * @returns {*}
         */
        myGetElementById: function (id) {
            if (!(id in this._element_ids)) {
                this._element_ids[id] = document.getElementById(id);
            }
            return this._element_ids[id];
        }
    };
})(jQuery, window, document);
