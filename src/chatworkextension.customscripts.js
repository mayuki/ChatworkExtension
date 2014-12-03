
// 常にグループ一覧を名前でソートするモード
$(function () {
    if (!document.body.classList.contains('__x-GroupListAlwaysSortedByName-enabled'))
        return;

    var _getSortedRoomList = RL.getSortedRoomList;
    RL.getSortedRoomList = function () {
        return _getSortedRoomList.apply(this, ["name"]);
    };
});

// プレビューダイアログをカスタムする
$(function () {
    CW.view.preparePreviewLinkDialog(); // Widgetがじゅんびされてないくさい

    var widget = $("#_previewLinkDialog").data('cwui-cwDialog');
    var origOpen = widget.option.open;
    widget.option.open = function (type, url) {
        if (type == 'x-image') {
            widget.data.url = url;
            openCustom_Image.apply(widget, arguments);
        } else {
            // オリジナルを呼ぶ
            origOpen.apply(widget, arguments);
        }
    };

    function openCustom_Image(type, url, e, f) {
        var i = {
            title: url
        };
        var that = this;
        var content = $("#_previewLinkContent");
        content.html('<div class="filePreviewDialogArea"><div id="_filePreviewLoading-x-custom" class="contentLoading"><img src="./imagenew/all/common/loader/img_loader_gray.gif" />' + L.file_loading + '</div><div class="filePreviewImage"><img id="_filePreviewImage-x-custom" style="visibility:hidden" src="' + url + '"/><div class="filePreviewBlank"><span class="icoFontLinkBlank"></span><span class="icoTextHide">' + L.file_preview_open_newwindow + "<span></div></div></div>");
        var d = $("#_filePreviewImage-x-custom");
        d.load(function () {
            $("#_filePreviewLoading-x-custom").hide();
            var a = d.width(), e = d.height(), f = a, i = !1;
            a > 600 && (e *= 600 / f, f = 600, i = !0);
            e > 300 && (f *= 300 / e, e = 300, i = !0);
            a = {
                visibility: "visible",
                maxWidth: '100%',
                maxHeight: '100%'
            };

            //if (i) a.width = Math.round(f), a.height = Math.round(e);
            d.css(a);
            d.click(function () {
                window.open(url);
            });
            content.find('.filePreviewDialogArea').css({ width: '100%', height: '100%' });
        });

        (function () {
            var e = $C("document"), d = e.width(), e = e.height(), k, l;

            var g = TM.dialog_header_height + TM.dialog_footer_height;

            this.$el.removeClass("previewFullDialog");
            g += TM.preview_dialog_height_padding;
            k = 1120;
            for (l = 840; k > 160 && (d < k + 40 || e < l + g + 40);)
                k -= 160, l -= 120;
            i.width = k + TM.preview_dialog_width_padding;
            i.height = l + TM.dialog_header_height + TM.dialog_footer_height;
            this.setOption(i);
        }).apply(this);
    }
});

// プレビューダイアログの背景をクリックしたら閉じるやつ
$(function () {
    if (!document.body.classList.contains('__x-ClosePreviewDialogOnBackgroundClicked-enabled'))
        return;

    $(document).on('click', '._cwDGBase:visible', function (e) {
        $(e.target).find('.dialog').data('cwui-cwDialog').close();
    });
});
