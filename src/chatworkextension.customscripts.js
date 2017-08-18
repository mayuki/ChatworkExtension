var _this = this;
// チャットテキスト入力エリアでメンバー名の補完を提供
$(function () {
    "use strict";
    if (!document.body.classList.contains('__x-MemberCompletionInTextArea-enabled'))
        return;
    // JSが読み込まれるのを雑に待つ
    setTimeout(function () {
        // ESC対応とIME対応のアダプター
        function CustomTextareaAdapter(element, completer, option) {
            var _this = this;
            element.addEventListener('compositionend', function () { return _this.completer.trigger(_this.getTextFromHeadToCaret(), true); });
            this.initialize(element, completer, option);
        }
        $.extend(CustomTextareaAdapter.prototype, $.fn.textcomplete['Textarea'].prototype, {
            _skipSearch: function (clickEvent) {
                if (clickEvent.keyCode === 27 || clickEvent.keyCode === 40 /* down */ || clickEvent.keyCode === 38 /* up */)
                    return true;
                $.fn.textcomplete['Textarea'].prototype._skipSearch.apply(_this, [clickEvent]);
            }
        });
        $('#_chatText').textcomplete([
            {
                match: /\B@(\w*)$/,
                search: function (term, callback) {
                    var memberIds = RM.getSortedMemberList().filter(function (x) { return x !== AC.myid.toString(); });
                    var re = new RegExp(MigemoJS.getRegExp(term), "i");
                    callback(memberIds.map(function (memberId) {
                        var searchKeys = AC.getSearchKeys(memberId).concat([AC.getTwitter(memberId)]).join(' ');
                        return re.test(searchKeys) ? memberId : null;
                    }).filter(function (x) { return x !== null; }));
                },
                template: function (memberId) {
                    var displayName = CW.is_business && ST.data.private_nickname && !RM.isInternal() ? AC.getDefaultNickName(memberId) : AC.getNickName(memberId);
                    return CW.getAvatarPanel(memberId, { clicktip: true, size: "small" }) + ' <span class="autotrim">' + escape_html(displayName) + "</span>";
                },
                index: 1,
                replace: function (memberId) {
                    var displayName = CW.is_business && ST.data.private_nickname && !RM.isInternal() ? AC.getDefaultNickName(memberId) : AC.getNickName(memberId);
                    return '[To:' + memberId + '] ' + displayName + "\n";
                }
            }
        ], { adapter: CustomTextareaAdapter, appendTo: '.chatInput' });
    }, 1000);
});
// 常にグループ一覧を名前でソートするモード
$(function () {
    if (!document.body.classList.contains('__x-GroupListAlwaysSortedByName-enabled'))
        return;
    var _getSortedRoomList = RL.getSortedRoomList;
    RL.getSortedRoomList = function () {
        return _getSortedRoomList.apply(this, ["name"]);
    };
});
// すべて既読ボタン
$(function () {
    if (!document.body.classList.contains('__x-RoomMarkAsRead-enabled'))
        return;
    var buttonHtml = "\n        <div class=\"chatRoomHeader__markAsRead\" style=\"margin-right: 8px;\">\n            <a class=\"button btnLarge\" href=\"#\">\u2714\u3059\u3079\u3066\u65E2\u8AAD</a>\n        </div>\n    ";
    var temp = document.createElement('div');
    temp.innerHTML = buttonHtml;
    var buttonE = temp.children[0];
    var buttonAnchorE = buttonE.querySelector('a');
    buttonAnchorE.onclick = function () {
        CW.post('gateway.php', { body_params: { cmd: "update_mute_setting", rid: RL.focused_room_id, mute: 1 }, query_params: {} }, function () {
            CW.post('gateway.php', { body_params: { cmd: "update_mute_setting", rid: RL.focused_room_id, mute: 0 }, query_params: {} });
        });
    };
    var actionButtonContainer = document.querySelector('.chatRoomHeader__actionButtonContainer');
    actionButtonContainer.insertAdjacentElement('afterbegin', buttonE);
});
// ToリストをMigemo化するやつ
$(function () {
    if (!document.body.classList.contains('__x-MigemizeToList-enabled'))
        return;
    var widget = $('#_toList').data('cwui-cwListTip');
    widget.getList = function () {
        var a = typeof this.option.list == "function" ? this.option.list.apply(this) : this.option.list, b = [], f = [];
        this.searchbox && (f = this.searchbox.getVal().toLowerCase().replace(/^\s+|\s+$/g, "").split(/\s+/));
        var re = new RegExp(MigemoJS.getRegExp(f.join(' ')), "i");
        for (var i = a.length, h = 0; h < i; h++) {
            var j = "", k = a[h], j = k.keys != void 0 ? k.keys.join(" ") : k.label, j = j.toLowerCase();
            (function () {
                for (var a = 0; a < f.length; a++)
                    if (j.indexOf(f[a]) === -1 && !re.test(j))
                        return;
                b.push(k);
            })();
        }
        return b;
    };
    widget.option.list = function () {
        if (!RM)
            return [];
        var a = RM.getSortedMemberList(), b = [], d = a.length;
        this.data.aid2name = {};
        for (var e = 0; e < d; e++) {
            var f = a[e];
            if (f != AC.myid) {
                var g = CW.is_business && ST.data.private_nickname && !RM.isInternal() ? AC.getDefaultNickName(f) : AC.getNickName(f);
                this.data.aid2name[f] = g;
                b.push({
                    keys: AC.getSearchKeys(f).concat([AC.getTwitter(f)]),
                    value: f,
                    label: CW.getAvatarPanel(f, {
                        clicktip: !1,
                        size: "small"
                    }) + '<p class="autotrim">' + escape_html(g) + "</p>"
                });
            }
        }
        return b;
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
        }
        else {
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
        content.html('<div class="filePreviewDialogArea"><div id="_filePreviewLoading-x-custom" class="contentLoading"><img src="./imagenew/all/common/loader/img_loader_gray.gif" />' +
            L.file_loading + '</div><div class="filePreviewImage"><img id="_filePreviewImage-x-custom" style="visibility:hidden" src="' + url + '"/><div class="filePreviewBlank"><span class="icoFontLinkBlank"></span><span class="icoTextHide">' + L.file_preview_open_newwindow + "<span></div></div></div>");
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
