/// <reference path="references.d.ts" />
var ChatworkExtension;
(function (ChatworkExtension) {
    var ExtensionManager = (function () {
        function ExtensionManager() {
        }
        ExtensionManager.setup = function () {
            var _this = this;
            // states, extraSettings, InjectUserCustomScripts, ExternalInjectUserCustomScripts のデータをとってきてから開始
            var waitCount = 3;
            var next = function () {
                if (--waitCount == 0) {
                    _this.setup_(_this.syncItems.states || {}, _this.syncItems.extraSettings || {});
                }
            };
            chrome.runtime.sendMessage({ method: 'getExternalCustomScripts', arguments: [] }, function (result) {
                Object.keys(result).forEach(function (x) { return _this.injectUserCustomScripts.push(result[x].body); });
                next();
            });
            chrome.runtime.sendMessage({ method: 'readStorage', arguments: ['InjectUserCustomScripts'] }, function (result) {
                if (result) {
                    _this.injectUserCustomScripts.push(result);
                }
                next();
            });
            chrome.storage.sync.get(['states', 'extraSettings'], function (items) {
                _this.syncItems = items;
                next();
            });
        };
        ExtensionManager.setup_ = function (states, extraSettings) {
            var _this = this;
            // InjectUserCustomScriptsだけは特殊扱いで先にevalする
            if (this.injectUserCustomScripts) {
                try {
                    new Function("var ChatworkExtension = window.ChatworkExtension;" + this.injectUserCustomScripts.join(";\n"))();
                }
                catch (ex) {
                    console.log('ChatworkExtension[InjectUserCustomScripts]: Exception');
                    console.log(ex.message);
                    console.log(ex.stack);
                }
            }
            // 無効なやつは読み込まない
            this.LoadExtensionTypes = Object.keys(ChatworkExtension.Extensions).map(function (x) {
                var type = ChatworkExtension.Extensions[x];
                var enable = (states[x] != undefined) ? states[x] : !type.metadata.disableByDefault;
                console.log('ChatworkExtension: ' + x + ' (' + (enable ? 'Enabled' : 'Disabled') + ')');
                return enable ? { name: x, ctor: type } : null;
            }).filter(function (x) { return x != null; });
            this.extensions = this.LoadExtensionTypes.map(function (ext) {
                var instance = new ext.ctor();
                if (extraSettings[ext.name]) {
                    instance.extraSettingValue = extraSettings[ext.name];
                }
                return instance;
            });
            // とりあえず初期化
            this.executeExtensionsEvent(function (x) { return x.initialize(); });
            // DOMContentLoaded を監視してそれをonReadyにする(この時点ではChatworkが初期化されていない)
            document.addEventListener('DOMContentLoaded', function () {
                _this.observeNewChatContent();
                _this.observeNewGroup();
                _this.observeAvatarIconInsertion();
                _this.observeToList();
                _this.executeExtensionsEvent(function (x) { return x.onReady(); });
                // CWオブジェクトはこちら側から見えないのでブリッジで呼び出すためのと
                // Chatwork(CW)のinit_loadedを監視して、これがtrueになったらChatworkの読み込みが完了したとするため
                _this.setupCWBridge();
            });
            //new Utility.ValueObserver(() => (<any>window).CW && CW.init_loaded, () => this.executeExtensionsEvent(x => x.onChatworkReady()));
        };
        /**
         * CWオブジェクトを呼び出すためのブリッジのセットアップ
         */
        ExtensionManager.setupCWBridge = function () {
            var _this = this;
            // callCW メソッドの結果を受け取るやつ
            window.addEventListener('message', function (e) {
                if (e.data.sender == 'ChatworkExtension.Bridge.CWBridge') {
                    var result = e.data.result;
                    var caller = e.data.caller;
                    var isError = e.data.isError;
                    if (ExtensionManager._callBridgeQueue[caller]) {
                        try {
                            ExtensionManager._callBridgeQueue[caller](result, isError);
                        }
                        catch (e) {
                            window.console && console.log(e.toString());
                        }
                        delete ExtensionManager._callBridgeQueue[caller];
                    }
                }
            });
            // InitializeWatcherを差し込んでメッセージを待つのです
            chrome.runtime.connect();
            window.addEventListener('message', function (e) {
                if (e.data.sender == 'ChatworkExtension.Bridge.InitializeWatcher' && e.data.command == 'Ready') {
                    _this.executeExtensionsEvent(function (x) { return x.onChatworkReady(); });
                }
            });
            // ブリッジを差し込むのです
            var scriptE = document.createElement('script');
            scriptE.type = 'text/javascript';
            scriptE.src = chrome.extension.getURL('chatworkextension.bridge.js');
            window.document.body.appendChild(scriptE);
        };
        /**
         * ブリッジを通してCWオブジェクトのメソッドを呼び出します
         */
        ExtensionManager.callCW = function (method, args, callback) {
            var caller = new Date().valueOf() + '-' + (Math.random() * 10000) + callback.toString();
            ExtensionManager._callBridgeQueue[caller] = callback;
            window.postMessage({
                sender: 'ChatworkExtension.ExtensionManager',
                command: 'CallCW',
                method: method,
                arguments: args,
                caller: caller
            }, '*');
        };
        ExtensionManager.executeExtensionsEvent = function (func) {
            this.extensions.forEach(function (x) {
                try {
                    func(x);
                }
                catch (e) {
                    window.console && console.log(e.toString());
                    window.console && console.log(e.stack);
                }
            });
        };
        // Rxにしようかと思いつつデカい気がする
        ExtensionManager.observeNewChatContent = function () {
            var _this = this;
            var timelineE = document.getElementById('_timeLine');
            this.observeAddElement(document.getElementById('_chatContent'), function (addedNode) {
                if (addedNode.classList && addedNode.classList.contains('chatTimeLineMessage')) {
                    var beforeHeight = addedNode.offsetHeight;
                    _this.executeExtensionsEvent(function (x) { return x.onChatMessageReceived(addedNode); });
                    var offset = addedNode.offsetHeight - beforeHeight;
                    if (offset > 0)
                        timelineE.scrollTop += offset;
                }
            });
        };
        ExtensionManager.observeNewGroup = function () {
            var _this = this;
            this.observeAddElement(document.getElementById('_roomListArea'), function (addedNode) {
                if (addedNode.getAttribute('role') == 'listitem') {
                    _this.executeExtensionsEvent(function (x) { return x.onGroupAppear(addedNode); });
                }
            });
        };
        ExtensionManager.observeAvatarIconInsertion = function () {
            var _this = this;
            var applyStyles = function (nodes) {
                _this.executeExtensionsEvent(function (x) { return x.onAvatarsAppear(nodes); });
            };
            this.observeAddElement(document.body, function (addedNode) {
                if (!addedNode.querySelectorAll)
                    return;
                if (addedNode.classList && addedNode.classList.contains('_avatar')) {
                    applyStyles([addedNode]);
                }
                applyStyles(Array.apply(null, addedNode.querySelectorAll('._avatar')));
            });
        };
        ExtensionManager.observeToList = function () {
            var _this = this;
            this.observeAddElement(document.getElementById('_toList'), function (addedNode) {
                if (addedNode.getAttribute('role') == 'listitem') {
                    _this.executeExtensionsEvent(function (x) { return x.onToListItemAdded(addedNode); });
                }
            });
        };
        ExtensionManager.observeAddElement = function (targetElement, onMutated) {
            var lockMutationEvent = false;
            var observer = new WebKitMutationObserver(function (mutations) {
                if (lockMutationEvent)
                    return;
                lockMutationEvent = true;
                mutations.forEach(function (mutation) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        try {
                            onMutated(mutation.addedNodes[i]);
                        }
                        catch (e) {
                            window.console && console.log(e);
                            window.console && console.log(e.stack);
                        }
                    }
                });
                lockMutationEvent = false;
            });
            observer.observe(targetElement, { childList: true, subtree: true, characterData: false, attributes: false });
        };
        return ExtensionManager;
    }());
    ExtensionManager.LoadExtensionTypes = [];
    ExtensionManager.extensions = [];
    ExtensionManager._callBridgeQueue = {};
    ExtensionManager.injectUserCustomScripts = [];
    ChatworkExtension.ExtensionManager = ExtensionManager;
    var ExtensionBase = (function () {
        function ExtensionBase() {
        }
        ExtensionBase.prototype.initialize = function () { };
        ExtensionBase.prototype.onReady = function () { };
        ExtensionBase.prototype.onChatworkReady = function () { };
        ExtensionBase.prototype.onChatMessageReceived = function (element) { };
        ExtensionBase.prototype.onGroupAppear = function (element) { };
        ExtensionBase.prototype.onAvatarsAppear = function (elements) { };
        ExtensionBase.prototype.onToListItemAdded = function (element) { };
        return ExtensionBase;
    }());
    ChatworkExtension.ExtensionBase = ExtensionBase;
    var ExtraSettingType;
    (function (ExtraSettingType) {
        ExtraSettingType[ExtraSettingType["None"] = 0] = "None";
        ExtraSettingType[ExtraSettingType["TextArea"] = 1] = "TextArea";
        ExtraSettingType[ExtraSettingType["Dropdown"] = 2] = "Dropdown";
    })(ExtraSettingType = ChatworkExtension.ExtraSettingType || (ChatworkExtension.ExtraSettingType = {}));
})(ChatworkExtension || (ChatworkExtension = {}));
(function (ChatworkExtension) {
    var Utility;
    (function (Utility) {
        var ValueObserver = (function () {
            function ValueObserver(onCheck, onComplete) {
                var _this = this;
                this._onCheck = onCheck;
                this._onComplete = onComplete;
                this._timer = setInterval(function () {
                    if (_this._onCheck()) {
                        try {
                            _this._onComplete();
                        }
                        catch (e) { }
                        _this.dispose();
                    }
                }, 100);
            }
            ValueObserver.prototype.dispose = function () {
                if (this._timer != null) {
                    clearInterval(this._timer);
                    this._timer = null;
                }
            };
            return ValueObserver;
        }());
        Utility.ValueObserver = ValueObserver;
    })(Utility = ChatworkExtension.Utility || (ChatworkExtension.Utility = {}));
})(ChatworkExtension || (ChatworkExtension = {}));
