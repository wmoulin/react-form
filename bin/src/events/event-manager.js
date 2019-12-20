"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hornet_js_utils_1 = require("hornet-js-utils");
const nodeUtil = require("util");
const logger = console;
/* Inclusion du polyfill pour support du constructeur CustomEvent pour IE >= 9 */
if (typeof window !== "undefined" && typeof window.CustomEvent !== "function" && document.createEvent) {
    (function () {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            const evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    })();
}
/**
 * Reprend la structure de la classe Event JavaScript
 */
class BaseEvent {
    constructor(type, eventInitDict) { }
    initEvent(eventTypeArg, canBubbleArg, cancelableArg) { }
    preventDefault() { }
    stopImmediatePropagation() { }
    stopPropagation() { }
}
exports.BaseEvent = BaseEvent;
class Event extends BaseEvent {
    constructor(name) {
        super(name);
        this.name = name;
    }
    /**
     * @returns {Event<EventDetailInterface>} un clone de cet évènement
     */
    clone() {
        const cloned = new Event(this.name);
        /* On ne peut cloner les autres attributs : cela déclenche une erreur de type Illegal invocation*/
        return cloned;
    }
    /**
     * @param data détail de l'évènement à créer
     * @returns {Event} un clone de cet évènement alimenté avec le détail indiqué
     */
    withData(data) {
        /* Avec Chrome 50, on ne peut utiliser clone ou cloneDeep sur une instance de Event :
        en effet Event.toString() renvoie  [object Event], et cette signature ne fait pas partie des éléments
        clonables de lodash
        (cf. lodash.baseCLone() : https://github.com/lodash/lodash/blob/master/dist/lodash.js#L2330
        et https://github.com/lodash/lodash/blob/master/dist/lodash.js#L70)
        */
        const cloneEvent = this.clone();
        cloneEvent.detail = data;
        return cloneEvent;
    }
}
exports.Event = Event;
if (!hornet_js_utils_1.Utils.isServer) {
    nodeUtil.inherits(BaseEvent, Event);
}
function listenWindowEvent(eventName, callback, capture = true) {
    window.addEventListener(eventName, callback, capture);
}
exports.listenWindowEvent = listenWindowEvent;
function listenOnceWindowEvent(eventName, callback, capture = true) {
    const wrapped = function () {
        // on supprime le listener pour simuler l'écoute unique de l'évènement
        removeWindowEvent(eventName, wrapped, capture);
        callback.apply(undefined, arguments);
    };
    listenWindowEvent(eventName, wrapped, capture);
}
exports.listenOnceWindowEvent = listenOnceWindowEvent;
function removeWindowEvent(eventName, callback, capture = true) {
    window.removeEventListener(eventName, callback, capture);
}
exports.removeWindowEvent = removeWindowEvent;
function listenEvent(event, callback, capture = true) {
    if (!hornet_js_utils_1.Utils.isServer) {
        listenWindowEvent(event.name, callback, capture);
    }
    else {
        logger.warn("Event.listenEvent can't be called from nodejs !!");
    }
}
exports.listenEvent = listenEvent;
function listenOnceEvent(event, callback, capture = true) {
    if (!hornet_js_utils_1.Utils.isServer) {
        listenOnceWindowEvent(event.name, callback, capture);
    }
    else {
        logger.warn("Event.listenOnceEvent can't be called from nodejs !!");
    }
}
exports.listenOnceEvent = listenOnceEvent;
function removeEvent(event, callback, capture = true) {
    if (!hornet_js_utils_1.Utils.isServer) {
        removeWindowEvent(event.name, callback, capture);
    }
    else {
        logger.warn("Event.removeWindowEvent can't be called from nodejs !!");
    }
}
exports.removeEvent = removeEvent;
function fireEvent(event, eventOptions = {}) {
    if (!hornet_js_utils_1.Utils.isServer) {
        const ev = new CustomEvent(event.name, Object.assign({ detail: event.detail, bubbles: true, cancelable: true }, eventOptions));
        window.dispatchEvent(ev);
    }
    else {
        logger.warn("Event.fireEvent can't be called from nodejs !!");
    }
}
exports.fireEvent = fireEvent;
//# sourceMappingURL=event-manager.js.map