/**
 * 画板工具
 * Created by ghost on 2017/4/5.
 */
;(function ($, window, document, undefined) {
    $.fn.drawingBoard = function (option) {
        var setting = $.extend({
            'open_btn': 'drawing-open',
            'close_btn': 'drawing-close',
            'svg_buttong_cls': 'drawing-svg-btn'
        }, option);
        var $this = $(this);
        var svg_pos = $.myDomCtl.getRangPos($.myDomCtl.myGetElementById(option.elm), option.rang);
        var svg_width = svg_pos.end.left - svg_pos.start.left,
            svg_height = svg_pos.end.top - svg_pos.start.top;
        var svg = $.myDomCtl.buildSvg(svg_width, svg_height, svg_pos.start.top, svg_pos.start.left);
        var svg_jquery_obj = $(svg);
        var canvas = new $GW_CANVAS(svg_width, svg_height, svg_pos.start.top, svg_pos.start.left);
        $this.append(canvas.get());
        $this.append(svg_jquery_obj);
        svg_jquery_obj.svgPath();
        svg_jquery_obj.svgPath('setCanvas', canvas);
        var button_click = function (e) {
            var type = $(this).data('drawing_type');
            if (type) {
                svg_jquery_obj.svgPath('setType', type);
            }
        };
        var resize = function () {
            var svg_pos = $.myDomCtl.getRangPos($.myDomCtl.myGetElementById(option.elm), option.rang);
            $.myDomCtl.setSvgPos(svg, svg_pos.start.top, svg_pos.start.left);
            svg_jquery_obj.svgPath('init');
            canvas.setPos(svg_pos.start.top, svg_pos.start.left);
        };
        $(window).resize(resize);
        $('.' + setting.svg_button_cls).on('click.drawing_board', button_click);
        $('.' + setting.open_btn).on('click.drawing_board', function (e) {
            $this.show();
        });
        $('.' + setting.close_btn).on('click.drawing_board', function (e) {
            $this.hide();
        });
        return this;
    };
})(jQuery, window, document);
$(function () {
    var drawing_board_config = $.chart_table_config.drawing_board;
    $('.drawing-board-content').drawingBoard(drawing_board_config);
});
