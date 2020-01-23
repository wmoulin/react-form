import * as React from "react";

import * as ReactDom from "react-dom";
import { MessageItem } from "./notification-message-item";
import { BaseError } from "hornet-js-utils/src/exception/base-error";
//import { Accordion } from "src/widget/accordion/accordion";
import { ScrollingUtils } from "../../utils/scrolling-utils";
import { SvgSprites } from '../icon/svg-sprites';
import { AlertItem } from './notification-alerts';
import { I18nUtils } from "hornet-js-utils/src/i18n-utils";
import { Utils } from "hornet-js-utils";
const messages = require("src/ressources/messages.json");
const i18nMessages = Utils.getCls("hornet.internationalization") || messages;

import "./sass/notification.scss";

export interface NotificationContentState {
    infos?: any;
    warnings?: any;
    errors?: any;
    exceptions?: Array<BaseError>;
    personnals?: any;
    color?: string;
    logo?: string;

}

/**
 * Propriétés du contenu d'une notification
 */
export interface NotificationContentProps {
    errorsTitle?: string;
    warningsTitle?: string;
    personnalsTitle?: string;
    infosTitle?: string;
    infos?: any;
    warnings?: any;
    errors?: any;
    personnals?: any;
    color?: string;
    logo?: string;
    exceptions?: Array<BaseError>;
    idComponent?: string;
}


/**
 * Type d'erreur 
 */
export enum notificationType {

    ERROR = "error",
    WARNING = "warning",
    PERSONNALS = "personnal",
    INFOS = "info",
    EXCEPTION = "exception",
}

/**
 * Composant Contenu de Notification
 */
export class NotificationContent extends React.Component<NotificationContentProps, any> {

    static firstRender = true;

    width;
    notif;
    listError: any = {};
    btnError: HTMLButtonElement;
    btnInfo: HTMLButtonElement;
    alertInfo: any;

    constructor(props?: NotificationContentProps, context?: any) {
        super(props, context);
        this.state = {
            ...this.state,
            isShowed: true
        }
    }

    componentDidMount() {
        NotificationContent.firstRender = false;
        this.scrollToNotifications();
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        if (prevProps !== this.props) {
            this.scrollToNotifications();
        }
        /** Si il y a des notifications de type erreurs, on place le focus sur 1 er champ */
        if (this.props.errors !== prevProps.errors) {
            if (this.props.errors && Array.isArray(this.props.errors) && this.props.errors.length > 0) {
                setTimeout(() => {
                    document.getElementById(this.props.idComponent).scrollIntoView();
                    window.scroll(window.scrollX, window.scrollY - 59);
                }, 250);
            }
        }
    }

    /**
     * Fait défiler la page courante de façon à afficher le bloc de notifications
     */
    scrollToNotifications() {
        if (this.props.errors || this.props.exceptions) {
            const element = ReactDom.findDOMNode(this) as any;
            if (element) {
                ScrollingUtils.smoothScrollToElementWithStickyHeader(element);
            } else {
                console.warn("Impossible de scroller sur les notifications.");
            }
        }
    }

    /**
     * supprime un message d'information
     * @param info
     */
    protected deleteInfo(info) {
        const index = this.props.infos.indexOf(info);
        if (index >= 0) {
            this.props.infos.splice(index, 1);
            this.forceUpdate();
        }
    }

    /**
     *
     * @param exception
     */
    protected exceptionStackDev(exception: BaseError) {
        let stack;
        if (process.env.NODE_ENV !== "production") {
            const stackToPrint = (exception.err_cause && exception.err_cause.message + "\n" + exception.err_cause.stack) || exception.stack;
            if (stackToPrint) {
                stack = (
                    <div className="stack-dev">
                        <div className="stack-dev-title">{"Development Stacktrace : "}</div>
                        {stackToPrint.split("\n").map(stackLine => {
                            return <div className="stack-dev-line">{stackLine}</div>;
                        })}
                    </div>
                );
            }
        }
        return stack;
    }

    /**
    * Rendu d'un message
    * @returns {any}
    */
    renderMessage(errors: any[], notifType) {
        const idMessages = [];

        const generateMessage = (exception: BaseError, index) => {
            let text = "";
            let stack;
            try {
                text = exception.message != null && exception.message !== "" ?
                    exception.message : I18nUtils.getI18n("error.message." + exception.code, exception.args, i18nMessages);
                stack = this.exceptionStackDev(exception);
            } catch (e) {
                console.error("Impossible de récupérer l'exception d'origine", e, "Exception d'origine : ", exception);
                text = e.message;
            }
            const messageItemKey = (exception.code) ? exception.code : "message-item-" + index;
            return <MessageItem key={messageItemKey} text={text} className="error-message-text">{stack}</MessageItem>;
        };

        const messages = errors.map((message: any) => {
            if (notifType === notificationType.EXCEPTION) {
                if (Array.isArray(message.message)) {
                    return message.message.map(generateMessage);
                } else {
                    return generateMessage(message, 0);
                }
            } else {
                idMessages.push(message.id);
                return <MessageItem key={message.id} anchor={message.anchor} {...message}
                    className={notifType + "-message-text"} />;
            }
        });

        let button;
        const ariaControls = this.inferAriaControls(notifType);
        if (notifType !== notificationType.INFOS) {
            button = <button type="button" className="error-button-open" ref={(btnError) => (this.btnError = btnError)}
                onClick={this.handleClickShowError.bind(this)} aria-controls={ariaControls}
                title={I18nUtils.getI18n("notification.hideShowTitle", undefined, i18nMessages)} aria-expanded={true} >
                    <SvgSprites icon={"top"} tabIndex={ -1 }/>
                    <SvgSprites icon={"bottom"} tabIndex={ -1 }/>
                </button>;
        } else {
            button = <button type="button" className="info-button" ref={(btnInfo) => (this.btnInfo = btnInfo)}
                onClick={this.handleClickRemove.bind(this, idMessages)} title={I18nUtils.getI18n("notification.deleteTitle", undefined, i18nMessages)} >
                <SvgSprites icon={"close"} tabIndex={ -1 }/></button>;
        }

        const customContainertStyle = (notifType === notificationType.PERSONNALS) ? { border: "0.063em solid " + this.state.color } : {};
        const customContentStyle = (notifType === notificationType.PERSONNALS) ? {
            color: this.state.color,
            backgroundImage: "url('" + this.state.logo + "')",
        } : {};
        const ulStyle = (notifType === notificationType.PERSONNALS) ? { color: this.state.color } : {};
        let icoColor = 'red';
        
        notifType = (notifType === notificationType.EXCEPTION) ? "error" : notifType;

        const displayAlert = errors.map((display: any) => display ? display.isAlert : null);

        if(notifType === 'info' && displayAlert && displayAlert.indexOf(true) != -1) {
            return <AlertItem
                        action={() => this.handleClickRemove(messages.map(message => message.key))}
                        message={messages}
                        showed={this.state.isShowed}
                        button={button}
                        ref={(alertInfo) => (this.alertInfo = alertInfo)} />;
        } else {
            return (
                <section>
                    <div className={"messageBox " + notifType + "Box " + notifType + "-message"} style={customContainertStyle}>
                        <div ref={(elt) => {
                            this.notif = elt;
                        }}>
                            {button}
                            <h1 className={"title" + notifType + " " + notifType + "-message-title"}
                                style={customContentStyle}>
                                <span>
                                    <SvgSprites
                                        icon={notifType}
                                        color={notifType === 'warning' ? icoColor = 'orange' : notifType === 'info' ? icoColor = 'green' : icoColor }
                                        height="1.5em"
                                        width="1.5em" tabIndex={-1}/>
                                </span>
                                {this._getTitle()}
                            </h1>
                            <ul style={ulStyle} className={notifType + "-message-list"} role="alert"
                                id={ariaControls} ref={(listError) => {
                                    if (listError && !this.listError[this.props.idComponent + notifType]) {
                                        this.listError[this.props.idComponent + notifType] = listError;
                                        this.width = listError.clientWidth;
                                    }
                                }} >
                                {messages}
                            </ul>
                        </div>
                    </div >
                </section >
            )
        }
        
    }

    /**
     * @inheritDoc
     */
    render(): JSX.Element {
        const { exceptions, errors, warnings, infos, personnals } = this.props;
        return (
            <span>
                {(exceptions && Object.values(exceptions).length > 0) ? this.renderMessage(Object.values(exceptions).map(elt => elt[0]) as any[], notificationType.EXCEPTION) : null}
                {(errors && Object.values(errors).length > 0) ? this.renderMessage(Object.values(errors).map(elt => elt[0]), notificationType.ERROR) : null}
                {(warnings && Object.values(warnings).length > 0) ? this.renderMessage([...Object.values(warnings)], notificationType.WARNING) : null}
                {(infos && Object.values(infos).length > 0) ? this.renderMessage([...Object.values(infos)], notificationType.INFOS) : null}
                {(personnals && Object.values(personnals).length > 0) ? this.renderMessage([...Object.values(personnals)], notificationType.PERSONNALS) : null}
            </span>
        );
    }

    /**
     * Affiche le titre de la notification
     */
    protected _getTitle() {

        if (this.state.infos) { return this.state.infosTitle || I18nUtils.getI18n("notification.infosTitle", undefined, i18nMessages); }
        if (this.state.warnings) { return this.state.warningsTitle || I18nUtils.getI18n("notification.warningsTitle", undefined, i18nMessages); }
        if (this.state.personnals) { return (this.state.personnalsTitle) || I18nUtils.getI18n("notification.personnalsTitle", undefined, i18nMessages); }
        if (this.state.errors || this.state.exceptions) { return this.state.errorsTitle || I18nUtils.getI18n("notification.errorsTitle", undefined, i18nMessages); }
    }

    /**
     * Affiche/Masque les erreurs dans la zone de notification
     *
     */
    handleClickShowError(e) {

        // change l'orientation de la fleche
        if (this.btnError && this.btnError.classList.contains("error-button-open")) {
            this.btnError.classList.add("error-button-close");
            this.btnError.classList.remove("error-button-open");
            this.btnError.setAttribute("aria-expanded", "false");
        } else {
            this.btnError.classList.add("error-button-open");
            this.btnError.classList.remove("error-button-close");
            this.btnError.setAttribute("aria-expanded", "true");
        }

        // affiche ou masque la liste
        if (this.listError) {

            const errorList = this.listError[this.props.idComponent + notificationType.ERROR]
                || this.listError[this.props.idComponent + notificationType.PERSONNALS]
                || this.listError[this.props.idComponent + notificationType.WARNING];

            if (errorList && errorList.classList && errorList.classList.contains("close")) {
                errorList.classList.remove("close");
            } else {
                errorList.classList.add("close");
            }

        }
        this.notif.style.width = (this.width) / 16 + "em";
    }

    /**
     * Suppression de la notification success(info)
     * @param items
     */
    handleClickRemove(items) {
        this.setState({ isShowed: false });
    }

    /**
     * Déduit la valeur de l'attribut aria-controls du button
     * @param {string} - notifType : le type de notification
     * @returns {string} - la valeur de l'attribut
     */
    inferAriaControls(notifType: string): string {
        // Les notifications de type EXCEPTION sont considérées comme des erreurs
        const realNotifType = notifType === notificationType.EXCEPTION ? "error" : notifType;
        return `${realNotifType}-message-list`;
    }
}