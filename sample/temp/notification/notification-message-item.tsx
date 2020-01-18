import * as React from "react";
/*import { Accordion } from "src/widget/accordion/accordion";
import { Tabs } from "src/widget/tab/tabs";*/

import { I18nUtils } from "hornet-js-utils/src/i18n-utils";
import { Utils } from "hornet-js-utils";
const messages = require("src/ressources/messages.json");
const i18nMessages = Utils.getCls("hornet.internationalization") || messages;

import "./sass/notification.scss";

/**
 * Propriétés D'un élément de message
 */
export interface MessageItemProps {
    field?: string;
    text: string;
    anchor?: string;
    className?: string;
    id?: string;
}

/**
 * Composant MessageItem
 */
export class MessageItem extends React.Component<MessageItemProps, any> {

    setFocus(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        const elem = document.getElementsByName(this.state.field);
        let element = elem && elem.length > 0 ?
            document.getElementsByName(this.state.field)[ 0 ] : document.getElementById(this.state.field);
        if (element && element.focus) {

            /*if (element && element.dataset && element.dataset.tabindex) {
                Tabs.handleFocusOnTab(element);
            }
            else if (element.getAttribute("accordion")) {
                Accordion.handleFocusOnAccordion(element);
            }*/

            element.focus();
        } else {
            element = document.getElementsByName(this.state.field + "$text") ?
                document.getElementsByName(this.state.field + "$text")[ 0 ] :
                document.getElementById(this.state.field + "$text");
            if (element && element.focus) {
                element.focus();
            } else {
                console.error("Impossible de mettre le focus sur l'élément", this.state.field);
            }
        }
    }

    /**
     * Rendu Lien
     * @returns {any}
     * @protected
     */
    protected renderLink() {
        let message = I18nUtils.getI18n(this.state.text, undefined, i18nMessages);
        const element = document.getElementsByName(this.state.field) ?
            document.getElementsByName(this.state.field)[ 0 ] : document.getElementById(this.state.field);
        if (element && element.dataset && element.dataset.tabtitle) {
            message = element.dataset.tabtitle + " - " + message;
        }
        const id = this.props.id ? this.props.id : null;
        return (
            <a href="#" onClick={this.setFocus} className={this.props.className} id={id}>
                {message}
                {this.props.children}
            </a>
        );
    }

    /**
     * Rendu span
     * @returns {any}
     * @protected
     */
    protected renderSpan() {
        return (
            <span className={this.props.className}>
                {I18nUtils.getI18n(this.state.text, undefined, i18nMessages)}
                {this.props.children}
            </span>
        );
    }

    /**
     * @inheritDoc
     */
    render(): JSX.Element {
        return (
            <li>
                {(!this.state.anchor) ? this.renderSpan() : this.renderLink()}
            </li>
        );
    }
}