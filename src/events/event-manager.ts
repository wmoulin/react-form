import { Utils } from "hornet-js-utils";
import * as nodeUtil from "util";
import assign = require("lodash.assign");

const logger = console;

declare global {
    interface Window {
        CustomEvent: CustomEvent;
        Event: Event<any>;
    }
}

/* Inclusion du polyfill pour support du constructeur CustomEvent pour IE >= 9 */
if (typeof window !== "undefined" && typeof window.CustomEvent !== "function" && document.createEvent) {
    (function () {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            const evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = (window.Event as any).prototype;
        window.CustomEvent = CustomEvent as any;
    })();
}


/**
 * Reprend la structure de la classe Event JavaScript
 */
export class BaseEvent {
    bubbles: boolean;
    cancelBubble: boolean;
    cancelable: boolean;
    currentTarget: EventTarget;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    returnValue: boolean;
    srcElement: Element;
    target: EventTarget;
    timeStamp: number;
    type: string;
    initEvent(eventTypeArg: string, canBubbleArg: boolean, cancelableArg: boolean) { }
    preventDefault() { }
    stopImmediatePropagation() { }
    stopPropagation() { }
    static AT_TARGET: number;
    static BUBBLING_PHASE: number;
    static CAPTURING_PHASE: number;
    constructor(type: string, eventInitDict?: EventInit) { }
}



export class Event<EventDetailInterface> extends BaseEvent {
    // héritage de BaseEvent pour permettre l'autocomplétion/compilation typescript sur les attributs classiques des Event
    // même si en réalité c'est pas directement un Event qui est déclenché mais un clone
    name: string;
    detail: EventDetailInterface;

    constructor(name: string) {
        super(name);
        this.name = name;
    }

    /**
     * @returns {Event<EventDetailInterface>} un clone de cet évènement
     */
    protected clone(): Event<EventDetailInterface> {
        const cloned: Event<EventDetailInterface> = new Event<EventDetailInterface>(this.name);
        /* On ne peut cloner les autres attributs : cela déclenche une erreur de type Illegal invocation*/
        return cloned;
    }

    /**
     * @param data détail de l'évènement à créer
     * @returns {Event} un clone de cet évènement alimenté avec le détail indiqué
     */
    withData(data: EventDetailInterface): Event<EventDetailInterface> {
        /* Avec Chrome 50, on ne peut utiliser clone ou cloneDeep sur une instance de Event :
        en effet Event.toString() renvoie  [object Event], et cette signature ne fait pas partie des éléments
        clonables de lodash
        (cf. lodash.baseCLone() : https://github.com/lodash/lodash/blob/master/dist/lodash.js#L2330
        et https://github.com/lodash/lodash/blob/master/dist/lodash.js#L70)
        */
        const cloneEvent: Event<EventDetailInterface> = this.clone();
        cloneEvent.detail = data;
        return cloneEvent;
    }
}

export function listenWindowEvent(eventName: string, callback: EventListener, capture: boolean = true) {
    window.addEventListener(eventName, callback, capture);
}

export function listenOnceWindowEvent(eventName: string, callback: EventListener, capture: boolean = true) {
    const wrapped = function () {
        // on supprime le listener pour simuler l'écoute unique de l'évènement
        removeWindowEvent(eventName, wrapped, capture);
        callback.apply(undefined, arguments);
    };
    listenWindowEvent(eventName, wrapped, capture);
}

export function removeWindowEvent(eventName: string, callback: EventListener, capture: boolean = true) {
    window.removeEventListener(eventName, callback, capture);
}

export function listenEvent<T extends Event<any>>(event: T, callback: (ev: T) => void, capture: boolean = true) {
    if (!Utils.isServer) {
        listenWindowEvent(event.name, callback as any, capture);
    } else {
        logger.warn("Event.listenEvent can't be called from nodejs !!");
    }
}

export function listenOnceEvent<T extends Event<any>>(event: T, callback: (ev: T) => void, capture: boolean = true) {
    if (!Utils.isServer) {
        listenOnceWindowEvent(event.name, callback as any, capture);
    } else {
        logger.warn("Event.listenOnceEvent can't be called from nodejs !!");
    }
}

export function removeEvent<T extends Event<any>>(event: T, callback: (ev: T) => void, capture: boolean = true) {
    if (!Utils.isServer) {
        removeWindowEvent(event.name, callback as any, capture);
    } else {
        logger.warn("Event.removeWindowEvent can't be called from nodejs !!");
    }
}

export function fireEvent<T extends Event<any>>(event: T, eventOptions: any = {}) {
    if (!Utils.isServer) {

        const ev = new CustomEvent(event.name, { detail: event.detail, bubbles: true, cancelable: true, ...eventOptions});

        window.dispatchEvent(ev);
    } else {
        logger.warn("Event.fireEvent can't be called from nodejs !!");
    }
}