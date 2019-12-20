"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Notifications {
    constructor(color, logo, isAlert) {
        this.notifications = new Array();
        this.canRenderRealComponent = false;
        this.isAlert = (isAlert) ? isAlert : false;
        this.color = (color) ? color : "black";
        this.logo = (logo) ? logo : "";
    }
    getNotifications() {
        return this.notifications;
    }
    setNotifications(notifs) {
        this.notifications = notifs;
    }
    getCanRenderRealComponent() {
        return this.canRenderRealComponent;
    }
    addNotification(notification) {
        this.notifications.push(notification);
    }
    addNotifications(notifications) {
        this.notifications = this.notifications.concat(notifications);
    }
    /**
     * Construit une instance de Notifications contenant une seule notification ayant l'identifiant et le message indiqués
     * @param id identifiant de la notification à créer
     * @param text message de la notification
     */
    static makeSingleNotification(id, text, alert) {
        const notif = new NotificationType();
        notif.id = id;
        notif.text = text;
        alert ? notif.isAlert = alert : notif.isAlert = false;
        const notifs = new Notifications();
        notifs.addNotification(notif);
        return notifs;
    }
}
exports.Notifications = Notifications;
class NotificationType {
    constructor() {
        this.id = "";
        this.text = "";
        this.anchor = "";
        this.field = "";
        this.canRenderRealComponent = false;
    }
    toString() {
        return "id:" + this.id + ", text:" + this.text;
    }
}
exports.NotificationType = NotificationType;
//# sourceMappingURL=notification.js.map