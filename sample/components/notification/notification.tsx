import * as React from "react";
import { BaseError } from "hornet-js-utils/src/exception/base-error";
//import { Accordion } from "src/widget/accordion/accordion";
import { NotificationContent } from "./notification-content"

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
    prefix?: string;
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
    }

    componentDidMount() {
        if (this.element && this.element.current) {
            this.eventErrorsListener = this.element.current.addEventListener(this.getDerivedEventFromPrefix(), (e: CustomEvent) => {
                console.log("Notification event errors", e);
                let errors = this.state.errors || {};
                errors[`${e.detail.name}`] = e.detail.errors;
                e.stopImmediatePropagation();
                this.setState({errors});
            }, true);
        }
    }

    componentWillUnmount() {
        if (this.element && this.element.current) {
            this.element.current.removeEventListener(this.getDerivedEventFromPrefix(), this.eventErrorsListener, false);   
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
this.props.prefix
this.props.prefix
this.props.prefix
this.props.prefix..this.state.warnings, ...warnings}});
this.props.prefix
this.props.prefix
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
    
    getDerivedEventFromPrefix(){
        return this.props.prefix ? `errors_${this.props.prefix}` : "errors";
    }
}

