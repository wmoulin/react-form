import { Event } from "./event-manager";
import { BaseError } from "hornet-js-utils/src/exception/base-error";

export interface AddNotificationEventDetail {
    errors?: any;
    infos?: any;
    warnings?: any;
    notifyId?: string;
    exceptions?: Array<BaseError>;
    personnals?: any;
    idComponent?: string;
    cb?: Function;
}

export interface CleanNotificationEventDetail {
    notifyId?: string;
    idComponent?: string;
}

export interface CleanAllNotificationEventDetail { }

export const ADD_NOTIFICATION_EVENT = new Event<AddNotificationEventDetail>("ADD_NOTIFICATION");
export const CLEAN_NOTIFICATION_EVENT = new Event<CleanNotificationEventDetail>("CLEAN_NOTIFICATION");
export const CLEAN_ALL_NOTIFICATION_EVENT = new Event<CleanAllNotificationEventDetail>("CLEAN_ALL_NOTIFICATION");