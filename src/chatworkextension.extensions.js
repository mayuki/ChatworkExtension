/// <reference path="references.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//
// ここにIExtensionを実装したクラス(実装してなくても)をペコペコ並べると勝手に読み込みます。
//
var ChatworkExtension;
(function (ChatworkExtension) {
    var Extensions;
    (function (Extensions) {
        /**
         * CSSを差し込む (ChatworkのCSSより後に差し込みたいのでこうなってる)
         * Chatworkが起動する前に読み込みたいのはstyle_before.cssに。
         */
        var InjectCustomStylesheets = /** @class */ (function (_super) {
            __extends(InjectCustomStylesheets, _super);
            function InjectCustomStylesheets() {
                return _super !== null && _super.apply(this, arguments) || this;
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
        }(ChatworkExtension.ExtensionBase));
        Extensions.InjectCustomStylesheets = InjectCustomStylesheets;
        /**
         * ユーザーカスタムスクリプトを差し込む
         */
        var InjectUserCustomScripts = /** @class */ (function (_super) {
            __extends(InjectUserCustomScripts, _super);
            function InjectUserCustomScripts() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            InjectUserCustomScripts.prototype.onReady = function () {
            };
            InjectUserCustomScripts.metadata = {
                description: "ユーザーカスタムスクリプトを差し込む機能を提供します。",
                advanced: true,
                extraSettingType: ChatworkExtension.ExtraSettingType.TextArea,
                extraSettingLocalOnly: true
            };
            return InjectUserCustomScripts;
        }(ChatworkExtension.ExtensionBase));
        Extensions.InjectUserCustomScripts = InjectUserCustomScripts;
        /**
         * ユーザーCSSを差し込む
         */
        var InjectUserCustomStylesheets = /** @class */ (function (_super) {
            __extends(InjectUserCustomStylesheets, _super);
            function InjectUserCustomStylesheets() {
                return _super !== null && _super.apply(this, arguments) || this;
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
                extraSettingType: ChatworkExtension.ExtraSettingType.TextArea,
                extraSettingLocalOnly: true
            };
            return InjectUserCustomStylesheets;
        }(ChatworkExtension.ExtensionBase));
        Extensions.InjectUserCustomStylesheets = InjectUserCustomStylesheets;
        /**
         * Webページコンテキストで動くカスタムスクリプトを差し込む
         */
        var InjectWebPageContextCustomScripts = /** @class */ (function (_super) {
            __extends(InjectWebPageContextCustomScripts, _super);
            function InjectWebPageContextCustomScripts() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            InjectWebPageContextCustomScripts.prototype.onReady = function () {
                ['chatworkextension.customscripts.js'].forEach(function (src) {
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = chrome.extension.getURL(src);
                    window.document.body.appendChild(script);
                });
                // MigemoJS
                var scriptE = document.createElement('script');
                scriptE.type = 'text/javascript';
                scriptE.src = chrome.extension.getURL('migemojs/migemo.js');
                scriptE.id = 'script-migemojs';
                window.document.body.appendChild(scriptE);
                // jquery-textcomplete
                var scriptE2 = document.createElement('script');
                scriptE2.type = 'text/javascript';
                scriptE2.src = chrome.extension.getURL('jquery-textcomplete/jquery.textcomplete.min.js');
                scriptE2.id = 'script-jquery-textcomplete';
                window.document.body.appendChild(scriptE2);
            };
            InjectWebPageContextCustomScripts.metadata = {
                hidden: true
            };
            return InjectWebPageContextCustomScripts;
        }(ChatworkExtension.ExtensionBase));
        Extensions.InjectWebPageContextCustomScripts = InjectWebPageContextCustomScripts;
        /**
         * グループリストの高さを縮める
         */
        var GroupListAlwaysSortedByName = /** @class */ (function (_super) {
            __extends(GroupListAlwaysSortedByName, _super);
            function GroupListAlwaysSortedByName() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            GroupListAlwaysSortedByName.prototype.onReady = function () {
                document.body.classList.add('__x-GroupListAlwaysSortedByName-enabled');
            };
            GroupListAlwaysSortedByName.metadata = {
                description: "グループリストを常に名前でソートします。",
                disableByDefault: true
            };
            return GroupListAlwaysSortedByName;
        }(ChatworkExtension.ExtensionBase));
        Extensions.GroupListAlwaysSortedByName = GroupListAlwaysSortedByName;
        /**
         * グループリストの高さを縮める
         */
        var ResizeGroupListHeight = /** @class */ (function (_super) {
            __extends(ResizeGroupListHeight, _super);
            function ResizeGroupListHeight() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ResizeGroupListHeight.prototype.onReady = function () {
                document.body.classList.add('__x-ResizeGroupListHeight-enabled');
            };
            ResizeGroupListHeight.metadata = {
                description: "グループリストの高さを縮める変更を提供します。"
            };
            return ResizeGroupListHeight;
        }(ChatworkExtension.ExtensionBase));
        Extensions.ResizeGroupListHeight = ResizeGroupListHeight;
        /**
         * チャットテキスト入力エリアでメンバー名の補完を提供
         */
        var MemberCompletionInTextArea = /** @class */ (function (_super) {
            __extends(MemberCompletionInTextArea, _super);
            function MemberCompletionInTextArea() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            MemberCompletionInTextArea.prototype.onReady = function () {
                document.body.classList.add('__x-MemberCompletionInTextArea-enabled');
            };
            MemberCompletionInTextArea.metadata = {
                description: "チャットテキスト入力エリアでメンバー名の補完を提供します。"
            };
            return MemberCompletionInTextArea;
        }(ChatworkExtension.ExtensionBase));
        Extensions.MemberCompletionInTextArea = MemberCompletionInTextArea;
        /**
         * グループのインクリメンタルな絞り込み
         */
        var IncrementalGroupFilter = /** @class */ (function (_super) {
            __extends(IncrementalGroupFilter, _super);
            function IncrementalGroupFilter() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            IncrementalGroupFilter.prototype.onReady = function () {
                //var filterMenuE = document.getElementById('_chatFilterMenu');
                //filterMenuE.style.height = '74px';
            };
            IncrementalGroupFilter.prototype.onChatworkReady = function () {
                var _this = this;
                this._inputE = document.createElement('input');
                this._inputE.style.width = '100%';
                this._inputE.style.border = 'none';
                this._inputE.style.borderBottom = '1px solid #ccc';
                this._inputE.style.boxShadow = 'none';
                this._inputE.type = 'search';
                this._inputE.placeholder = 'グループ名で絞り込み...'; // FIXME: placeholder属性をlabelとして使うとか最低最悪なのでいつか直す
                this._inputE.addEventListener('change', function () { return _this.updateFilter(); });
                this._inputE.addEventListener('keyup', function () { return _this.updateFilter(); });
                var inputFieldHeaderE = document.createElement('div');
                inputFieldHeaderE.className = 'roomListHeader';
                inputFieldHeaderE.appendChild(this._inputE);
                var sideContentMenuHeader = document.getElementById('_sideContentMenu__header');
                sideContentMenuHeader.insertAdjacentElement('afterend', inputFieldHeaderE);
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
                    var migemoRe = window.MigemoJS.getRegExp(value);
                    this._filterRe = new RegExp((migemoRe ? migemoRe + '|' : '') + value, 'i');
                    [].forEach.call(document.querySelectorAll('#_roomListItems > li'), function (liE) {
                        var label = liE.getAttribute('aria-label');
                        liE.style.display = _this._filterRe.test(label) ? '' : 'none';
                    });
                }
                else {
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
        }(ChatworkExtension.ExtensionBase));
        Extensions.IncrementalGroupFilter = IncrementalGroupFilter;
        /**
         * ピンしているやつにクラスを付ける
         */
        var AddPinnedGroups = /** @class */ (function (_super) {
            __extends(AddPinnedGroups, _super);
            function AddPinnedGroups() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            AddPinnedGroups.prototype.onGroupAppear = function (element) {
                var pin = element.querySelector('.roomListItem__pinContainer--active');
                if (pin != null) {
                    element.classList.add('__x-pinnedLink');
                }
            };
            AddPinnedGroups.metadata = {
                hidden: true
            };
            return AddPinnedGroups;
        }(ChatworkExtension.ExtensionBase));
        Extensions.AddPinnedGroups = AddPinnedGroups;
        /**
         * ピンしているやつにクラスを付ける
         */
        var AddMention = /** @class */ (function (_super) {
            __extends(AddMention, _super);
            function AddMention() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            AddMention.prototype.onGroupAppear = function (element) {
                var badge = element.querySelector('.roomListBadges__unreadBadge--hasMemtion');
                if (badge != null) {
                    element.classList.add('__x-hasMention');
                }
            };
            AddMention.metadata = {
                hidden: true
            };
            return AddMention;
        }(ChatworkExtension.ExtensionBase));
        Extensions.AddMention = AddMention;
        /**
         * シンタックスハイライトするよ
         */
        var SyntaxHighlighter = /** @class */ (function (_super) {
            __extends(SyntaxHighlighter, _super);
            function SyntaxHighlighter() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            SyntaxHighlighter.prototype.onReady = function () {
                var styleE = document.createElement('link');
                styleE.rel = 'stylesheet';
                styleE.href = chrome.extension.getURL('highlightjs/styles/vs.css');
                window.document.head.appendChild(styleE);
                var scriptE = document.createElement('script');
            };
            SyntaxHighlighter.prototype.onChatMessageReceived = function (element) {
                // [code]...[/code]
                var codes = element.querySelectorAll('code.chatCode');
                [].forEach.call(codes, function (elem) {
                    elem.classList.add('hljs');
                    elem.innerHTML = window.hljs.highlightAuto(elem.textContent).value;
                });
                // ```...```
                var pres = element.querySelectorAll('pre');
                [].forEach.call(pres, function (elem) {
                    if (elem.innerHTML.indexOf('```') == -1) {
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
                        var unescapedCode = code.replace(/^\n+/, '')
                            .replace(/<img .*?alt=(["'])(.*?)\1[^>]*>/g, '$2')
                            .replace(/<a .*?href=(["'])(.*?)\1[^>]*>.*?<\/a>/g, '$2')
                            .replace(/<a .*?_previewLink[^>]*>.*?<\/a>/g, '')
                            .replace(/<[^>]+>/g, '')
                            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                        return "<code style='' class='hljs __x-syntaxhighlight-code'>" + (code2 ? 'C# ' : '') + window.hljs.highlightAuto(unescapedCode, languages).value + "</code>";
                    });
                });
            };
            SyntaxHighlighter.metadata = {
                description: "コードのシンタックスハイライトを提供します。"
            };
            return SyntaxHighlighter;
        }(ChatworkExtension.ExtensionBase));
        Extensions.SyntaxHighlighter = SyntaxHighlighter;
        /**
         * フラットスタイル
         */
        var FlatStyle = /** @class */ (function (_super) {
            __extends(FlatStyle, _super);
            function FlatStyle() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            FlatStyle.prototype.onReady = function () {
                document.body.classList.add('__x-FlatStyle-enabled');
            };
            FlatStyle.metadata = {
                description: "フラットスタイルを提供します。"
            };
            return FlatStyle;
        }(ChatworkExtension.ExtensionBase));
        Extensions.FlatStyle = FlatStyle;
        /**
         * Toリストの検索を拡張(Migemo)
         */
        var MigemizeToList = /** @class */ (function (_super) {
            __extends(MigemizeToList, _super);
            function MigemizeToList() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            MigemizeToList.prototype.onReady = function () {
                document.body.classList.add('__x-MigemizeToList-enabled');
            };
            MigemizeToList.metadata = {
                description: "Toリストの検索を拡張する機能を提供します。"
            };
            return MigemizeToList;
        }(ChatworkExtension.ExtensionBase));
        Extensions.MigemizeToList = MigemizeToList;
        /**
         * ルーム内のメッセージをすべて既読
         */
        var RoomMarkAsRead = /** @class */ (function (_super) {
            __extends(RoomMarkAsRead, _super);
            function RoomMarkAsRead() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            RoomMarkAsRead.prototype.onReady = function () {
                document.body.classList.add('__x-RoomMarkAsRead-enabled');
            };
            RoomMarkAsRead.metadata = {
                description: "ルーム内のメッセージをすべて既読にする機能を提供します。"
            };
            return RoomMarkAsRead;
        }(ChatworkExtension.ExtensionBase));
        Extensions.RoomMarkAsRead = RoomMarkAsRead;
        /**
         * キーワード反応
         */
        var KeywordHighlight = /** @class */ (function (_super) {
            __extends(KeywordHighlight, _super);
            function KeywordHighlight() {
                return _super !== null && _super.apply(this, arguments) || this;
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
                extraSettingType: ChatworkExtension.ExtraSettingType.TextArea
            };
            return KeywordHighlight;
        }(ChatworkExtension.ExtensionBase));
        Extensions.KeywordHighlight = KeywordHighlight;
        /**
         * テキストのレスポンスヘッダーを強制的にShift_JISにする
         */
        var RewriteTextResponseContentTypeCharsetShiftJis = /** @class */ (function (_super) {
            __extends(RewriteTextResponseContentTypeCharsetShiftJis, _super);
            function RewriteTextResponseContentTypeCharsetShiftJis() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            RewriteTextResponseContentTypeCharsetShiftJis.prototype.onReady = function () {
                chrome.runtime.sendMessage({ method: 'startTextResponseHeaderCharsetFilter', arguments: [] }, function (result) { });
            };
            RewriteTextResponseContentTypeCharsetShiftJis.metadata = {
                description: "テキストのレスポンスヘッダーを強制的にShift_JISにする機能を提供します。",
                disableByDefault: true
            };
            return RewriteTextResponseContentTypeCharsetShiftJis;
        }(ChatworkExtension.ExtensionBase));
        Extensions.RewriteTextResponseContentTypeCharsetShiftJis = RewriteTextResponseContentTypeCharsetShiftJis;
        /**
         * アバターアイコン差し替えマン
         */
        var AlternateAvatars = /** @class */ (function (_super) {
            __extends(AlternateAvatars, _super);
            function AlternateAvatars() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            AlternateAvatars.prototype.onReady = function () {
                var _this = this;
                this.avatarMapping = {};
                this.catchAllMapping = null;
                // localStorageなので
                chrome.runtime.sendMessage({ method: 'readStorage', arguments: ['AlternateAvatars'] }, function (result) {
                    if (result != null) {
                        (result || '')
                            .split(/\r?\n/)
                            .map(function (x) { return x.replace(/^\s+|\s+$/g, ''); })
                            .filter(function (x) { return !x.match(/^#/); })
                            .map(function (x) { return x.split(/,/); })
                            .filter(function (x) { return x.length == 2; })
                            .reduce(function (r, v) { r[v[0]] = v[1]; return r; }, _this.avatarMapping);
                        _this.catchAllMapping = _this.avatarMapping['*'] || null;
                    }
                });
            };
            AlternateAvatars.prototype.onAvatarsAppear = function (elements) {
                var _this = this;
                elements.forEach(function (x) {
                    if (x.dataset['aid']) {
                        if (_this.avatarMapping[x.dataset['aid']] != null) {
                            x.src = _this.avatarMapping[x.dataset['aid']];
                        }
                        else if (_this.catchAllMapping != null) {
                            x.src = _this.catchAllMapping;
                        }
                    }
                });
            };
            AlternateAvatars.metadata = {
                description: "アバターアイコンを差し替えます。一行ごとユーザのIDと差し替えるアバターアイコンURLを列挙します。",
                advanced: true,
                extraSettingType: ChatworkExtension.ExtraSettingType.TextArea,
                extraSettingLocalOnly: true
            };
            return AlternateAvatars;
        }(ChatworkExtension.ExtensionBase));
        Extensions.AlternateAvatars = AlternateAvatars;
    })(Extensions = ChatworkExtension.Extensions || (ChatworkExtension.Extensions = {}));
})(ChatworkExtension || (ChatworkExtension = {}));
