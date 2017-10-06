//
// Chatworkのウィンドウコンテキストのほうにねじ込まれるスクリプト
// Chrome拡張のウィンドウコンテキストとやり取りは不可(window.chromeは触れない)
// 
declare var $: any;
declare var $C: any;
declare var MigemoJS: any;
declare var RM: any;
declare var RL: any;
declare var AC: any;
declare var TM: any;
declare var ST: any;
declare var L: any;
declare var escape_html: any;

// チャットテキスト入力エリアでメンバー名の補完を提供
$(() => {
    "use strict";
    if (!document.body.classList.contains('__x-MemberCompletionInTextArea-enabled')) return;

    // JSが読み込まれるのを雑に待つ
    setTimeout(() => {
        // ESC対応とIME対応のアダプター
        function CustomTextareaAdapter(element: any, completer: any, option: any) {
            element.addEventListener('compositionend', () => this.completer.trigger(this.getTextFromHeadToCaret(), true));
            this.initialize(element, completer, option);
        }
        $.extend(CustomTextareaAdapter.prototype, $.fn.textcomplete['Textarea'].prototype, {
            _skipSearch: (clickEvent: any) => {
                if (clickEvent.keyCode === 27 || clickEvent.keyCode === 40 /* down */ || clickEvent.keyCode === 38 /* up */) return true;
                $.fn.textcomplete['Textarea'].prototype._skipSearch.apply(this, [clickEvent]);
            }
        });
        $('#_chatText').textcomplete([
            {
                match: /\B@(\w*)$/,
                search: (term: any, callback: any) => {
                    const memberIds = RM.getSortedMemberList().filter((x: any) => x !== AC.myid.toString());
                    const re = new RegExp(MigemoJS.getRegExp(term), "i");
                    callback(memberIds.map((memberId: any) => {
                        const searchKeys = AC.getSearchKeys(memberId).concat([AC.getTwitter(memberId)]).join(' ');
                        return re.test(searchKeys) ? memberId : null;
                    }).filter((x: any) => x !== null));
                },
                template: (memberId: any) => {
                    const displayName = CW.is_business && ST.data.private_nickname && !RM.isInternal() ? AC.getDefaultNickName(memberId) : AC.getNickName(memberId);
                    return CW.getAvatarPanel(memberId, { clicktip: true, size: "small" }) + ' <span class="autotrim">' + escape_html(displayName) + "</span>";
                },
                index: 1,
                replace: (memberId: any) => {
                    const displayName = CW.is_business && ST.data.private_nickname && !RM.isInternal() ? AC.getDefaultNickName(memberId) : AC.getNickName(memberId);
                    return '[To:' + memberId + '] ' + displayName + "\n";
                }
            }
        ], { adapter: CustomTextareaAdapter, appendTo: '.chatInput' });
    }, 1000);
});

// 常にグループ一覧を名前でソートするモード
$(() => {
    if (!document.body.classList.contains('__x-GroupListAlwaysSortedByName-enabled')) return;

    var _getSortedRoomList = RL.getSortedRoomList;
    RL.getSortedRoomList = function() {
        return _getSortedRoomList.apply(this, ["name"]);
    }
});


// すべて既読ボタン
$(() => {
    if (!document.body.classList.contains('__x-RoomMarkAsRead-enabled')) return;
    
    const buttonHtml = `
        <div class="chatRoomHeader__markAsRead" style="margin-right: 8px;">
            <a class="button btnLarge" href="#">✔すべて既読</a>
        </div>
    `;

    const temp = document.createElement('div');
    temp.innerHTML = buttonHtml;
    const buttonE = temp.children[0];
    const buttonAnchorE = buttonE.querySelector('a');
    buttonAnchorE.onclick = () => {
        CW.post('gateway.php', { body_params: {cmd:"update_mute_setting",rid:RL.focused_room_id,mute:1}, query_params: {} },
            () => {
                CW.post('gateway.php', { body_params: {cmd:"update_mute_setting",rid:RL.focused_room_id,mute:0}, query_params: {} });
            });
    };
    
    const actionButtonContainer = document.querySelector('.chatRoomHeader__actionButtonContainer');
    actionButtonContainer.insertAdjacentElement('afterbegin', buttonE);
});

// ToリストをMigemo化するやつ
$(() => {
    if (!document.body.classList.contains('__x-MigemizeToList-enabled')) return;

    var widget = $('#_toList').data('cwui-cwListTip');
    widget.getList = function () {
        var a = typeof this.option.list == "function" ? this.option.list.apply(this) : this.option.list
            , b = []
            , f = [];
        this.searchbox && (f = this.searchbox.getVal().toLowerCase().replace(/^\s+|\s+$/g, "").split(/\s+/));
        var re = new RegExp(MigemoJS.getRegExp(f.join(' ')), "i");
        for (var i = a.length, h = 0; h < i; h++) {
            var j: any = ""
                , k = a[h]
                , j = k.keys != void 0 ? k.keys.join(" ") : k.label
                , j = j.toLowerCase();
            (function () {
                for (var a = 0; a < f.length; a++)
                    if (j.indexOf(f[a]) === -1 && !re.test(j))
                        return;
                b.push(k)
            })()
        }
        return b
    };
    widget.option.list = function () {
        if (!RM)
            return [];
        var a = RM.getSortedMemberList()
            , b = []
            , d = a.length;
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
                })
            }
        }
        return b
    };
});

// プレビューダイアログをカスタムする
$(() => {
    CW.view.preparePreviewLinkDialog(); // Widgetがじゅんびされてないくさい

    var widget = $("#_previewLinkDialog").data('cwui-cwDialog');
    var origOpen = widget.option.open;
    widget.option.open = function (type: any, url: any) {
        if (type == 'x-image') {
            widget.data.url = url;
            openCustom_Image.apply(widget, arguments);
        } else {
            // オリジナルを呼ぶ
            origOpen.apply(widget, arguments);
        }
    }

    function openCustom_Image(type: any, url: any, e: any, f: any) {
        var i: any = {
            title: url
        };
        var that = this;
        var content = $("#_previewLinkContent");
        content.html('<div class="filePreviewDialogArea"><div id="_filePreviewLoading-x-custom" class="contentLoading"><img src="./imagenew/all/common/loader/img_loader_gray.gif" />' +
            L.file_loading + '</div><div class="filePreviewImage"><img id="_filePreviewImage-x-custom" style="visibility:hidden" src="' + url + '"/><div class="filePreviewBlank"><span class="icoFontLinkBlank"></span><span class="icoTextHide">' + L.file_preview_open_newwindow + "<span></div></div></div>");
        var d = $("#_filePreviewImage-x-custom");
        d.load(function () {
            $("#_filePreviewLoading-x-custom").hide();
            var a = d.width(),
                e = d.height(),
                f = a,
                i = !1;
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
                window.open(url)
            })
            content.find('.filePreviewDialogArea').css({ width: '100%', height: '100%' });
        });

        (function () {
            var e = $C("document"),
                d = e.width(),
                e = e.height(),
                k, l;

            var g = TM.dialog_header_height + TM.dialog_footer_height;

            this.$el.removeClass("previewFullDialog");
            g += TM.preview_dialog_height_padding;
            k = 1120;
            for (l = 840; k > 160 && (d < k + 40 || e < l + g + 40);) k -= 160, l -= 120;
            i.width = k + TM.preview_dialog_width_padding
            i.height = l + TM.dialog_header_height + TM.dialog_footer_height;
            this.setOption(i)
        }).apply(this);
    }
});
