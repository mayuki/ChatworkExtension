/// <reference path="references.d.ts" />
var ChatworkExtension;
(function (ChatworkExtension) {
    var Settings;
    (function (Settings) {
        var Main = (function () {
            function Main() {
            }
            Main.setup = function () {
                var _this = this;
                document.addEventListener('DOMContentLoaded', function () { return _this.readySettingsView(); });
            };
            Main.readySettingsView = function () {
                var _this = this;
                // InjectUserCustomScriptsとextraSettings, statesを待ってから実行
                var waitCount = 2;
                var items;
                var next = function () {
                    if (--waitCount == 0) {
                        try {
                            new Function("var ChatworkExtension = window.ChatworkExtension;" + _this.injectUserCustomScripts.join(";\n"))();
                        }
                        catch (ex) {
                            console.log('ChatworkExtension[InjectUserCustomScripts]: Exception');
                            console.log(ex.message);
                            console.log(ex.stack);
                        }
                        var settingsViewModel = new SettingsViewModel(items.states || {}, items.extraSettings || {});
                        ko.applyBindings(settingsViewModel, document.querySelector('#extensions'));
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
                chrome.storage.sync.get(['extraSettings', 'states'], function (_items) {
                    items = _items;
                    next();
                });
            };
            return Main;
        }());
        Main.injectUserCustomScripts = [];
        Settings.Main = Main;
        var SettingsViewModel = (function () {
            function SettingsViewModel(states, extraSettings) {
                var _this = this;
                this.entries = [];
                this.states = {};
                this.extraSettings = {};
                this.isAdvancedVisible = ko.observable(false);
                this.showAdvanced = function () {
                    _this.isAdvancedVisible(true);
                };
                this.onResetButtonClicked = function () {
                    if (confirm('すべて規定値に戻りますがよろしいですか?')) {
                        _this.entries.forEach(function (x) { return x.value(''); });
                    }
                };
                this.onExtraSettingLocalValueChanged = function (key, newValue) {
                    if (typeof (newValue) == 'string' && newValue != '') {
                        chrome.runtime.sendMessage({ method: 'writeStorage', arguments: [key, newValue] });
                    }
                    else {
                        chrome.runtime.sendMessage({ method: 'writeStorage', arguments: [key, null] });
                    }
                };
                this.onExtraSettingValueChanged = function (key, newValue) {
                    if (typeof (newValue) == 'string' && newValue != '') {
                        _this.extraSettings[key] = newValue;
                    }
                    else {
                        delete _this.extraSettings[key];
                    }
                    chrome.storage.sync.set({
                        extraSettings: _this.extraSettings
                    }, function () { });
                };
                this.onValueChanged = function (key, newValue) {
                    if (typeof (newValue) == 'string' && newValue != '') {
                        _this.states[key] = JSON.parse(newValue);
                    }
                    else {
                        delete _this.states[key];
                    }
                    chrome.storage.sync.set({
                        states: _this.states
                    }, function () { });
                };
                this.states = states;
                this.extraSettings = extraSettings;
                Object.keys(ChatworkExtension.Extensions).forEach(function (key) {
                    var metadata = ChatworkExtension.Extensions[key].metadata;
                    if (metadata.hidden) {
                        return;
                    }
                    var extraSettingValue = (_this.extraSettings[key] != undefined) ? _this.extraSettings[key].toString() : undefined;
                    var extraSettingValueObservable = ko.observable(extraSettingValue);
                    if (metadata.extraSettingLocalOnly) {
                        chrome.runtime.sendMessage({ method: 'readStorage', arguments: [key] }, function (result) {
                            extraSettingValueObservable(result);
                        });
                        extraSettingValueObservable.subscribe(function (newValue) { return _this.onExtraSettingLocalValueChanged(key, newValue); });
                    }
                    else {
                        extraSettingValueObservable.subscribe(function (newValue) { return _this.onExtraSettingValueChanged(key, newValue); });
                    }
                    var currentState = (states[key] != undefined) ? states[key].toString() : undefined;
                    var currentStateObservable = ko.observable(currentState);
                    currentStateObservable.subscribe(function (newValue) { return _this.onValueChanged(key, newValue); });
                    _this.entries.push({
                        title: key,
                        metadata: metadata,
                        value: currentStateObservable,
                        extraSettingValue: extraSettingValueObservable
                    });
                });
            }
            return SettingsViewModel;
        }());
    })(Settings = ChatworkExtension.Settings || (ChatworkExtension.Settings = {}));
})(ChatworkExtension || (ChatworkExtension = {}));
ChatworkExtension.ExtensionManager.setup = function () {
    ChatworkExtension.Settings.Main.setup();
};
