/// <reference path="chatworkextension.core.ts" />
declare var CW: any;

declare class WebKitMutationObserver {
    constructor(func: Function);
    observe(element: HTMLElement, options: {}): void;
}