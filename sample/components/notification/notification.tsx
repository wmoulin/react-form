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

/**
 * Propriétés du composant Notification
 */
export interface NotificationProps {
    errorsTitle?: string;
    infosTitle?: string;
    personnalsTitle?: string;
    warningsTitle?: string;
    infos?: any;
    errors?: any;
    warnings?: any;
    exceptions?: Array<BaseError>;
    id: string;
    personnals?: any;
    color?: string;
    logo?: string;
}

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
 * Composant Notification
 */
export class Notification extends React.Component<NotificationProps, any> {

    static INSTANCES = {};
    static ORDER = [];
    protected eventErrorsListener;
    public element:React.RefObject<any>;
    static defaultProps = {
        color: "black"
        
    };

    constructor(props?: NotificationProps, context?: any) {
        super(props, context);
        this.state = {...props};
        this.element = React.createRef();
/*            this.listen(ADD_NOTIFICATION_EVENT, (ev) => {
                const state: NotificationContentState = {};
                if (ev.detail.errors) state.errors = ev.detail.errors.getNotifications();
                if (ev.detail.infos) state.infos = ev.detail.infos.getNotifications();
                if (ev.detail.exceptions) state.exceptions = ev.detail.exceptions;
                if (ev.detail.warnings) state.warnings = ev.detail.warnings.getNotifications();
                if (ev.detail.personnals) {
                    state.personnals = ev.detail.personnals.getNotifications();
                    state.color = ev.detail.personnals.color;
                    state.logo = ev.detail.personnals.logo;
                }

                if (!ev.detail.id || !(ev.detail.id in Notification.INSTANCES)) {
                    ev.detail.id = Notification.ORDER[Notification.ORDER.length - 1];
                }
                Notification.INSTANCES[ ev.detail.id ].setState(state, ev.detail.cb);
            });

            this.listen(CLEAN_NOTIFICATION_EVENT, (ev) => {
                if (!ev.detail.id) {
                    ev.detail.id = Notification.ORDER[Notification.ORDER.length - 1];
                }
                else if (Notification.INSTANCES[ev.detail.id]) {
                    Notification.INSTANCEfalse.id].setState({
                        infos: null,
                        errors: null,
                        exceptions: null,false
                        warnings: null,
                        personnals: null,
                    });
                }
                else if (ev.detail.id) {
                    let idComponent = Notification.ORDER[Notification.ORDER.length - 1];
                    if (ev.detail.idComponent) {
                        idComponent = ev.detail.idComponent;
                    }
                    const messages = [];
                    const currentNotification = Notification.INSTANCES[idComponent];

                    if (currentNotification && currentNotification.state) {
                        currentNotification.state.infos.map((message) => {
                            if (message.id === ev.detail.id) {
                                currentNotification.deleteInfo(message);
                            }
                        });
                    }
     public element:React.RefObject<any>;           }
            });

            this.listen(CLEAN_ALL_NOTIFICATION_EVENT, (ev) => {
                for (const id in Notification.INSTANCES) {
                    this.fire(CLEAN_NOTIFICATION_EVENT.withData({ id, idComponent: undefined }));
                }
            });

        }*/
    }

    componentDidMount() {
        if (this.element && this.element.current) {
            this.eventErrorsListener = this.element.current.addEventListener('errors', (e: CustomEvent) => {
                console.log("Notification event errors", e);
                let errors = this.state.errors || {};
                errors[`${e.detail.name}`] = e.detail.errors;
                this.setState({errors})
            }, true);
        }
    }

    componentWillUnmount() {
        if (this.element && this.element.current) {
            this.element.current.removeEventListener("errors", this.eventErrorsListener, false);   
        }
    }
    /**
     * @inheritDoc
     */
    render(): JSX.Element {
        console.debug("Notification render : ", this.props.id);

        return (
            <div id={this.props.id} ref={this.element}>
                <NotificationContent
                    errorsTitle={this.state.errorsTitle}
                    errors={this.state.errors}
                    warningsTitle={this.state.warningsTitle}
                    warnings={this.state.warnings}
                    personnalsTitle={this.state.personnalsTitle}
                    personnals={this.state.personnals}
                    infosTitle={this.state.infosTitle}
                    infos={this.state.infos}
                    exceptions={this.state.exceptions}
                    color={this.state.color}
                    logo={this.state.logo}
                    ref={(component) => {
                        if (component === null) {
                            delete Notification.INSTANCES[this.props.id];
                            const idx = Notification.ORDER.indexOf(this.props.id);
                            Notification.ORDER.splice(idx, 1);
                        } else {
                            if (this.props.id in Notification.INSTANCES) {
                                const idx = Notification.ORDER.indexOf(this.props.id);
                                Notification.ORDER.splice(idx, 1);
                            }
                            Notification.ORDER.push(this.props.id);
                            Notification.INSTANCES[this.props.id] = component;
                        }
                    }}
                    idComponent={this.props.id}
                />
                {this.props.children}
            </ div>);
    }

    /**
     * Permet de setter les notifications de type INFO
     * @param infos 
     */
    setInfos(infos) {
        this.setState({infos: {...this.state.infos, ...infos}});
    }

    /**
     * Permet de setter les notifications de type WARNING
     * @param warnings 
     */
    setWarnings(warnings) {
        this.setState({warnings: {...this.state.warnings, ...warnings}});
    }

    /**
     * Permet de setter les notifications de type ERROR
     * @param errors 
     */
    setErrors(errors) {
        this.setState({errors: {...this.state.errors, ...errors}});
    }

    /**
     * Permet de setter les notifications de type EXCEPTION
     * @param exceptions 
     */
    setExceptions(exceptions) {
        this.setState({exceptions: {...this.state.exceptions, ...exceptions}});
    }
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

    constructor(props?: NotificationProps, context?: any) {
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
        if (prevState !== this.state) {
            this.scrollToNotifications();
        }
        /** Si il y a des notifications de type erreurs, on place le focus sur 1 er champ */
        if (this.state.errors !== prevState.errors) {
            if (this.state.errors && Array.isArray(this.state.errors) && this.state.errors.length > 0) {
                const element = document.getElementsByName(
                    this.state.errors[0].field) ?
                    document.getElementsByName(this.state.errors[0].field)[0] :
                    document.getElementById(this.state.errors[0].field);
                /*if (element && element.focus) {
                    Accordion.handleFocusOnAccordion(element);
                    element.focus();
                } else {*/
                    setTimeout(() => {
                        document.getElementById(this.props.idComponent).scrollIntoView();
                        window.scroll(window.scrollX, window.scrollY - 59);
                    }, 250);
                /*}*/
            }
        }
    }

    /**
     * Fait défiler la page courante de façon à afficher le bloc de notifications
     */
    scrollToNotifications() {
        if (this.state.errors || this.state.exceptions) {
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
        const index = this.state.infos.indexOf(info);
        if (index >= 0) {
            this.state.infos.splice(index, 1);
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
    renderMessage(errors: [], notifType) {
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
        const { exceptions, errors, warnings, infos, personnals } = this.state;
        return (
            <span>
                {(exceptions && exceptions.length > 0) ? this.renderMessage(exceptions, notificationType.EXCEPTION) : null}
                {(errors && errors.length > 0) ? this.renderMessage(errors, notificationType.ERROR) : null}
                {(warnings && warnings.length > 0) ? this.renderMessage(warnings, notificationType.WARNING) : null}
                {(infos && infos.length > 0) ? this.renderMessage(infos, notificationType.INFOS) : null}
                {(personnals && personnals.length > 0) ? this.renderMessage(personnals, notificationType.PERSONNALS) : null}
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