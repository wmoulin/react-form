export class Notifications implements INotifications {

  color: string;
  logo: string;
  isAlert?: boolean;
  notifications: Array<INotificationType>;
  canRenderRealComponent: boolean;

  constructor(color?: string, logo?: string, isAlert?: boolean) {
      this.notifications = new Array<INotificationType>();
      this.canRenderRealComponent = false;
      this.isAlert = (isAlert) ? isAlert : false;
      this.color = (color) ? color : "black";
      this.logo = (logo) ? logo : "";
  }

  public getNotifications(): Array<INotificationType> {
      return this.notifications;
  }

  setNotifications(notifs: Array<INotificationType>): void {
      this.notifications = notifs;
  }

  public getCanRenderRealComponent(): boolean {
      return this.canRenderRealComponent;
  }

  addNotification(notification: INotificationType) {
      this.notifications.push(notification);
  }

  addNotifications(notifications: Array<INotificationType>) {
      this.notifications = this.notifications.concat(notifications);
  }

  /**
   * Construit une instance de Notifications contenant une seule notification ayant l'identifiant et le message indiqués
   * @param id identifiant de la notification à créer
   * @param text message de la notification
   */
  static makeSingleNotification(id: string, text: string, alert?:boolean): Notifications {
      const notif: NotificationType = new NotificationType();
      notif.id = id;
      notif.text = text;
      alert ? notif.isAlert = alert : notif.isAlert = false;       
      
      const notifs: Notifications = new Notifications();
      notifs.addNotification(notif);
      
      return notifs;
  }
}

export class NotificationType implements INotificationType {
  id: string;
  text: string;
  anchor: string;
  field: string;
  isAlert?: boolean;
  canRenderRealComponent: boolean;
  additionalInfos: any;

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

export interface INotificationType {
  id: string;
  text: string;
  anchor: string;
  field: string;
  isAlert?: boolean;
  canRenderRealComponent: boolean;
  additionalInfos: AdditionalInfos;
}

export interface AdditionalInfos {
  linkedFieldsName?: Array<string>;
  other?: any;
}

export interface INotifications {
  notifications: Array<INotificationType>;
  canRenderRealComponent: boolean;
}