/// <reference path="chatwork.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ChatworkExtension;
(function (ChatworkExtension) {
    //
    // ここにIExtensionを実装したクラス(実装してなくても)をペコペコ並べると勝手に読み込みます。
    //
    (function (Extensions) {
        /**
        * CSSを差し込む (ChatworkのCSSより後に差し込みたいのでこうなってる)
        * Chatworkが起動する前に読み込みたいのはstyle_before.cssに。
        */
        var InjectCustomStylesheets = (function (_super) {
            __extends(InjectCustomStylesheets, _super);
            function InjectCustomStylesheets() {
                _super.apply(this, arguments);
            }
            InjectCustomStylesheets.prototype.onReady = function () {
                var styleE = document.createElement('link');
                styleE.rel = 'stylesheet';
                styleE.href = chrome.extension.getURL('style.css');
                window.document.head.appendChild(styleE);
                //(<HTMLElement>window.document.querySelector('#_sideContentTitle')).style.height = '0';
            };
            InjectCustomStylesheets.metadata = {
                description: "カスタムスタイルシートを提供します。この拡張を無効にした場合、他の拡張に影響が出る場合があります。",
                advanced: true
            };
            return InjectCustomStylesheets;
        })(ChatworkExtension.ExtensionBase);
        Extensions.InjectCustomStylesheets = InjectCustomStylesheets;

        /**
        * ユーザーカスタムスクリプトを差し込む
        */
        var InjectUserCustomScripts = (function (_super) {
            __extends(InjectUserCustomScripts, _super);
            function InjectUserCustomScripts() {
                _super.apply(this, arguments);
            }
            InjectUserCustomScripts.prototype.onReady = function () {
            };
            InjectUserCustomScripts.metadata = {
                description: "ユーザーカスタムスクリプトを差し込む機能を提供します。",
                advanced: true,
                extraSettingType: 1 /* TextArea */,
                extraSettingLocalOnly: true
            };
            return InjectUserCustomScripts;
        })(ChatworkExtension.ExtensionBase);
        Extensions.InjectUserCustomScripts = InjectUserCustomScripts;

        /**
        * ユーザーCSSを差し込む
        */
        var InjectUserCustomStylesheets = (function (_super) {
            __extends(InjectUserCustomStylesheets, _super);
            function InjectUserCustomStylesheets() {
                _super.apply(this, arguments);
            }
            InjectUserCustomStylesheets.prototype.onReady = function () {
                chrome.runtime.sendMessage({ method: 'readStorage', arguments: ['InjectUserCustomStylesheets'] }, function (result) {
                    if (result != null) {
                        var styleE = document.createElement('style');
                        styleE.textContent = result;
                        window.document.head.appendChild(styleE);
                    }
                });
            };
            InjectUserCustomStylesheets.metadata = {
                description: "ユーザーCSSを差し込む機能を提供します。",
                advanced: true,
                extraSettingType: 1 /* TextArea */,
                extraSettingLocalOnly: true
            };
            return InjectUserCustomStylesheets;
        })(ChatworkExtension.ExtensionBase);
        Extensions.InjectUserCustomStylesheets = InjectUserCustomStylesheets;

        /**
        * Webページコンテキストで動くカスタムスクリプトを差し込む
        */
        var InjectWebPageContextCustomScripts = (function (_super) {
            __extends(InjectWebPageContextCustomScripts, _super);
            function InjectWebPageContextCustomScripts() {
                _super.apply(this, arguments);
            }
            InjectWebPageContextCustomScripts.prototype.onReady = function () {
                ['chatworkextension.customscripts.js'].forEach(function (src) {
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = chrome.extension.getURL(src);
                    window.document.body.appendChild(script);
                });
            };
            InjectWebPageContextCustomScripts.metadata = {
                hidden: true
            };
            return InjectWebPageContextCustomScripts;
        })(ChatworkExtension.ExtensionBase);
        Extensions.InjectWebPageContextCustomScripts = InjectWebPageContextCustomScripts;

        /**
        * グループリストの高さを縮める
        */
        var GroupListAlwaysSortedByName = (function (_super) {
            __extends(GroupListAlwaysSortedByName, _super);
            function GroupListAlwaysSortedByName() {
                _super.apply(this, arguments);
            }
            GroupListAlwaysSortedByName.prototype.onReady = function () {
                document.body.classList.add('__x-GroupListAlwaysSortedByName-enabled');
            };
            GroupListAlwaysSortedByName.metadata = {
                description: "グループリストを常に名前でソートします。",
                disableByDefault: true
            };
            return GroupListAlwaysSortedByName;
        })(ChatworkExtension.ExtensionBase);
        Extensions.GroupListAlwaysSortedByName = GroupListAlwaysSortedByName;

        /**
        * グループリストの高さを縮める
        */
        var ResizeGroupListHeight = (function (_super) {
            __extends(ResizeGroupListHeight, _super);
            function ResizeGroupListHeight() {
                _super.apply(this, arguments);
            }
            ResizeGroupListHeight.prototype.onReady = function () {
                document.body.classList.add('__x-ResizeGroupListHeight-enabled');
            };
            ResizeGroupListHeight.metadata = {
                description: "グループリストの高さを縮める変更を提供します。"
            };
            return ResizeGroupListHeight;
        })(ChatworkExtension.ExtensionBase);
        Extensions.ResizeGroupListHeight = ResizeGroupListHeight;

        /**
        * グループのインクリメンタルな絞り込み
        */
        var IncrementalGroupFilter = (function (_super) {
            __extends(IncrementalGroupFilter, _super);
            function IncrementalGroupFilter() {
                _super.apply(this, arguments);
            }
            IncrementalGroupFilter.prototype.onReady = function () {
                var filterMenuE = document.getElementById('_chatFilterMenu');
                filterMenuE.style.height = '74px';
            };

            IncrementalGroupFilter.prototype.onChatworkReady = function () {
                var _this = this;
                this._inputE = document.createElement('input');
                this._inputE.style.left = '3px';
                this._inputE.style.top = '40px';
                this._inputE.style.width = '95%';
                this._inputE.style.position = 'absolute';
                this._inputE.type = 'search';
                this._inputE.placeholder = 'グループ名で検索'; // FIXME: placeholder属性をlabelとして使うとか最低最悪なのでいつか直す

                this._inputE.addEventListener('change', function () {
                    return _this.updateFilter();
                });
                this._inputE.addEventListener('keyup', function () {
                    return _this.updateFilter();
                });

                var filterMenuE = document.getElementById('_chatFilterMenu');
                filterMenuE.style.height = '74px';
                filterMenuE.appendChild(this._inputE);
            };

            IncrementalGroupFilter.prototype.onGroupAppear = function (element) {
                if (this._filterRe == null) {
                    return;
                }
                var label = element.getAttribute('aria-label');
                element.style.display = this._filterRe && this._filterRe.test(label) ? '' : 'none';
            };

            IncrementalGroupFilter.prototype.updateFilter = function () {
                var _this = this;
                var value = this._inputE.value;

                if (value != null && value != '') {
                    this._filterRe = new RegExp(value, 'i');
                    [].forEach.call(document.querySelectorAll('#_roomListItems > li'), function (liE) {
                        var label = liE.getAttribute('aria-label');
                        liE.style.display = _this._filterRe.test(label) ? '' : 'none';
                    });
                } else {
                    this._filterRe = null;
                    [].forEach.call(document.querySelectorAll('#_roomListItems > li'), function (liE) {
                        liE.style.display = '';
                    });
                }
            };
            IncrementalGroupFilter.metadata = {
                description: "グループのインクリメンタルな絞り込み機能を提供します。"
            };
            return IncrementalGroupFilter;
        })(ChatworkExtension.ExtensionBase);
        Extensions.IncrementalGroupFilter = IncrementalGroupFilter;

        /**
        * ピンしているやつにクラスを付ける
        */
        var AddPinnedGroups = (function (_super) {
            __extends(AddPinnedGroups, _super);
            function AddPinnedGroups() {
                _super.apply(this, arguments);
            }
            AddPinnedGroups.prototype.onGroupAppear = function (element) {
                var pin = element.querySelector('.chatListPin');
                if (pin == null) {
                    return;
                }
                if (!pin.classList.contains('chatListPinOff')) {
                    pin.parentElement.classList.add('__x-pinnedLink');
                }
            };
            AddPinnedGroups.metadata = {
                hidden: true
            };
            return AddPinnedGroups;
        })(ChatworkExtension.ExtensionBase);
        Extensions.AddPinnedGroups = AddPinnedGroups;

        /**
        * Office 365のリンクをプレビューにする
        */
        var ReplaceO365PreviewLinks = (function (_super) {
            __extends(ReplaceO365PreviewLinks, _super);
            function ReplaceO365PreviewLinks() {
                _super.apply(this, arguments);
            }
            ReplaceO365PreviewLinks.prototype.onChatMessageReceived = function (element) {
                var anchors = element.querySelectorAll('a[href*="sourcedoc="]');
                [].forEach.call(anchors, function (elem) {
                    var anchorE = document.createElement('a');
                    anchorE.target = '_blank';

                    //anchorE.href = elem.href;
                    anchorE.className = '_previewLink timelineLinkAppend';
                    anchorE.textContent = 'プレビュー';
                    anchorE.setAttribute('data-url', elem.href);
                    anchorE.setAttribute('data-type', 'x-o365');
                    elem.insertAdjacentElement('afterend', anchorE);
                });
            };
            ReplaceO365PreviewLinks.metadata = {
                description: "SharePointやOneDriveのドキュメントへのリンクにプレビューを提供します。"
            };
            return ReplaceO365PreviewLinks;
        })(ChatworkExtension.ExtensionBase);
        Extensions.ReplaceO365PreviewLinks = ReplaceO365PreviewLinks;

        /**
        * シンタックスハイライトするよ
        */
        var SyntaxHighlighter = (function (_super) {
            __extends(SyntaxHighlighter, _super);
            function SyntaxHighlighter() {
                _super.apply(this, arguments);
            }
            SyntaxHighlighter.prototype.onReady = function () {
                var styleE = document.createElement('link');
                styleE.rel = 'stylesheet';
                styleE.href = chrome.extension.getURL('highlightjs/styles/vs.css');
                window.document.head.appendChild(styleE);

                var scriptE = document.createElement('script');
            };

            SyntaxHighlighter.prototype.onChatMessageReceived = function (element) {
                var pres = element.querySelectorAll('pre');
                [].forEach.call(pres, function (elem) {
                    if (elem.innerHTML.indexOf('```') == -1 && !elem.innerHTML.match(/^C#/m)) {
                        return;
                    }
                    elem.innerHTML = elem.innerHTML.replace(/^```([^\n]*)([\s\S]*?)^```|^C#\s+([\s\S]*)/mg, function (match, type, code, code2) {
                        var languages;
                        code = code || code2;
                        if (type) {
                            languages = [type];
                        }
                        if (code2) {
                            languages = ['cs'];
                        }
                        var unescapedCode = code.replace(/^\n+/, '').replace(/<img .*?alt=(["'])(.*?)\1[^>]*>/g, '$2').replace(/<a .*?href=(["'])(.*?)\1[^>]*>.*?<\/a>/g, '$2').replace(/<a .*?_previewLink[^>]*>.*?<\/a>/g, '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

                        return "<code style='' class='hljs __x-syntaxhighlight-code'>" + (code2 ? 'C# ' : '') + window.hljs.highlightAuto(unescapedCode, languages).value + "</code>";
                    });
                });
            };
            SyntaxHighlighter.metadata = {
                description: "コードのシンタックスハイライトを提供します。"
            };
            return SyntaxHighlighter;
        })(ChatworkExtension.ExtensionBase);
        Extensions.SyntaxHighlighter = SyntaxHighlighter;

        /**
        * フラットスタイル
        */
        var FlatStyle = (function (_super) {
            __extends(FlatStyle, _super);
            function FlatStyle() {
                _super.apply(this, arguments);
            }
            FlatStyle.prototype.onReady = function () {
                document.body.classList.add('__x-FlatStyle-enabled');
            };
            FlatStyle.metadata = {
                description: "フラットスタイルを提供します。"
            };
            return FlatStyle;
        })(ChatworkExtension.ExtensionBase);
        Extensions.FlatStyle = FlatStyle;

        /**
        * キーワード反応
        */
        var KeywordHighlight = (function (_super) {
            __extends(KeywordHighlight, _super);
            function KeywordHighlight() {
                _super.apply(this, arguments);
            }
            KeywordHighlight.prototype.onReady = function () {
                var values = (this.extraSettingValue || '').replace(/^\s+|\s+$/g, '');
                if (values) {
                    this.keywordRe = new RegExp(values.replace(/\r?\n/g, '|'), "i");
                }
            };

            KeywordHighlight.prototype.onChatMessageReceived = function (element) {
                if (this.keywordRe) {
                    if (this.keywordRe.test(element.querySelector('pre').textContent)) {
                        element.classList.add('x-keyword-highlighted');
                        element.classList.add('chatTimeLineMessageMention');
                    }
                }
            };
            KeywordHighlight.metadata = {
                description: "キーワード機能を提供します。改行でキーワードを区切ることで複数指定できます。",
                extraSettingType: 1 /* TextArea */
            };
            return KeywordHighlight;
        })(ChatworkExtension.ExtensionBase);
        Extensions.KeywordHighlight = KeywordHighlight;
    })(ChatworkExtension.Extensions || (ChatworkExtension.Extensions = {}));
    var Extensions = ChatworkExtension.Extensions;
})(ChatworkExtension || (ChatworkExtension = {}));
