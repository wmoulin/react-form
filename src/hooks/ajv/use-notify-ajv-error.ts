import { useRef, useContext, Component } from 'react';
import { FormContext } from "../../contexts/form-context";
import { Utils } from "hornet-js-utils";
import { fireEvent } from "../../events/event-manager";
import { ADD_NOTIFICATION_EVENT, CLEAN_NOTIFICATION_EVENT } from "../../events/notification-events";
import { Notifications, NotificationType, INotificationType } from "../../events/notification";
import { ErrorObject, DependenciesParams } from 'ajv';
import isString = require("lodash.isstring");
import get = require("lodash.get");
import IntlMessageFormat from "intl-messageformat";
import { I18nUtils } from "hornet-js-utils/src/i18n-utils";

const messages = require("../../ressources/messages.json");
const i18nMessages = Utils.getCls("hornet.internationalization") || messages;
const logger = console;

export default function useNotifyAjvError(notifId, id, formMessages, formContext:any = useContext(FormContext)) {

    /**
     * Déclenche les notifications correspondant aux éventuelles erreurs de validation
     * @param errors erreurs de validation de formulaire, éventuellement vides
     */
    formContext.current.notifyErrors = (errors: Array<ErrorObject>): void => {
        if (errors) {
            const fieldsMessages = formMessages && formMessages.fields;
            const genericValidationMessages = I18nUtils.getI18n("form.validation", undefined, i18nMessages);
            const fields: { [key: string]: Element[] } = formContext.current.extractFields();

            const notificationsError: Notifications = getErrors(errors, fields, fieldsMessages, genericValidationMessages);
            const dispatchEvent = (elt, errors, name) => {
                elt.dispatchEvent(new CustomEvent('errors', { 'detail': {errors, name, id: formContext.current.form.current.id, stopOnFirst: true} }));
            };
            /* Post-traitement des notifications concernant les champs d'autocomplétion */
            // TODO processAutocompleteErrors(fields, notificationsError);

            /* Met à jour les erreurs affichées par chaque composant champ */
            Object.keys(fields).forEach((key: string) => {
                const field: HTMLEmbedElement & Component = fields[key][0] as any;

                let errors = notificationsError.getNotifications().filter((error: INotificationType): boolean => {
                    return (error.field === key
                        || (error.additionalInfos
                            && error.additionalInfos.linkedFieldsName
                            && error.additionalInfos.linkedFieldsName.indexOf(key) > -1)
                    );
                });

                if (errors && errors.length > 0) {
                    if(field.setState && typeof field.setState == "function") {
                        if ((field as any).setErrors && typeof (field as any).setErrors == "function") {
                            (field as any).setErrors(errors, () => {
                                dispatchEvent(formContext.current.form.current, errors, (field.props as any).name);
                            })
                        } else {
                            field.setState({errors: errors}, () => {
                                dispatchEvent(formContext.current.form.current, errors, (field.props as any).name);
                            });
                        }
                    } else {
                        field.parentElement && field.parentElement.classList.add("parent-field-error");
                        field.classList.add("field-error");
                        field.setAttribute ("aria-invalid", "true");
                        //field.setAttribute("data-error-msg", errors.map((item) => item.text).join(","));
                        let nextElt: HTMLElement = field.nextSibling as HTMLElement;
                        if(!nextElt ||  !(nextElt as HTMLElement).classList.contains("container-field-error")) {
                            let errorField = document.createElement("div");
                            errorField.innerText =  errors.map((item) => item.text).join(",");
                            errorField.classList.add("container-field-error");
                            field.parentElement.insertBefore(errorField, field.nextSibling);
                        } else {
                            nextElt.classList.replace( "container-field-error-hidden", "container-field-error-show" );
                            nextElt.innerText =  errors.map((item) => item.text).join(",");
                        }
                        dispatchEvent(field, errors, field.name);
                    }
                } else {
                    if(field.setState && typeof field.setState == "function") {
                        if ((field as any).setErrors && typeof (field as any).setErrors == "function") {
                            (field as any).setErrors(undefined, () => {
                                dispatchEvent(formContext.current.form.current, errors, (field.props as any).name);
                            })
                        } else {
                            field.setState({errors: undefined}, () => {
                                dispatchEvent(formContext.current.form.current, errors, (field.props as any).name);
                            });
                        }
                    } else {
                        field.parentElement && field.parentElement.classList.remove("parent-field-error");
                        field.classList && field.classList.remove("field-error");
                        field.setAttribute("aria-invalid", "false");
                        //field.setAttribute("data-error-msg", "");
                        let nextElt: HTMLElement = field.nextSibling as HTMLElement;
                        if(nextElt &&  nextElt.classList.contains("container-field-error")) {
                            nextElt.classList.replace( "container-field-error-show", "container-field-error-hidden" );
                            nextElt.innerText =  "";
                        }
                        dispatchEvent(field, errors, field.name);
                    }
                }
            });

            /* Emission des notifications */
            fireEvent(ADD_NOTIFICATION_EVENT.withData({ notifyId: notifId, idComponent: id, errors: notificationsError}));
        }
    };

    /**
     * Supprime les nofifications d'erreurs et les erreurs associées à chaque champ de ce formulaire
     */
    formContext.current.cleanFormErrors = (): void => {
        const fields: { [key: string]: Element[] } = formContext.current.extractFields();
        for (const fieldName in fields) {
            const field: Element = fields[fieldName][0];

            // basic html
            field.classList.remove("field-error");
            field.parentElement && field.parentElement.classList.remove("parent-field-error");
            let nextElt: HTMLElement = field.nextSibling as HTMLElement;
            if(nextElt && nextElt.classList.contains("container-field-error")) {
                nextElt.classList.replace( "container-field-error-show", "container-field-error-hidden" );
                nextElt.innerText =  "";
            }
        }
        fireEvent(CLEAN_NOTIFICATION_EVENT.withData({ notifyId: notifId, idComponent: id }));
    };



    /**
     * Extrait le nom du champ depuis l'erreur de validation indiquée
     * Le nom du champ peut être un "path" tel que "ville.pays.id".
     * @param error une erreur de validation ajv
     * @return le nom du champ, ou une chaîne vide si non renseigné
     */
    function extractFieldName(error: ErrorObject): string {
        let fieldName: string = "";
        if (error) {
            if (error.dataPath && error.dataPath.length > 1) {
                let offset: number = 0;
                if (error.dataPath.charAt(0) === ".") {
                    offset = 1;
                }
                fieldName = error.dataPath.substring(offset);
            }
            if (error.keyword === "required") {
                if (error.params && (error.params as DependenciesParams).missingProperty) {
                    if (fieldName) {
                        fieldName += ".";
                    }
                    fieldName += (error.params as DependenciesParams).missingProperty;
                }
            }
        }
        return fieldName;
    }

    /**
     * Traite les erreurs de validation de formulaire : renvoie des notifications d'erreur.
     * @param errors liste d'erreurs éventuellement vide
     * @param fields Liste des champs du formulaire
     * @param fieldsMessages messages spécifiques aux champs du formulaire
     * @param genericValidationMessages messages d'erreur génériques
     * @return {Notifications} les notifications correspondant aux erreurs de validation
     */
    function getErrors(errors: Array<ErrorObject>, fields: { [ key: string ]: Element[] }, fieldsMessages?: any, genericValidationMessages?: any): Notifications {
        
        
        const notificationsError: Notifications = new Notifications();

        for (let index: number = 0; index < errors.length; index++) {
            const error = errors[ index ];
            const erreurNotification = new NotificationType();
            erreurNotification.id = "ACTION_ERREUR_" + index;
            erreurNotification.text = error.message;
            let fieldName: string = extractFieldName(error);

            let message: string = null;
            if (fieldName) {
                let element = fields[ fieldName ] ? fields[ fieldName ][0] : undefined;
                erreurNotification.anchor = fieldName + "_anchor";
                erreurNotification.field = fieldName;
                erreurNotification.additionalInfos = error.params;
                (erreurNotification as any).element = element;

                let complement: any = { ...error.params };

                // Gestion des champs editables d'un tableau
                if (element) {
                    const data = fieldName.split(".");
                    if (!isNaN(data[ data.length - 2 ] as any)) {
                        fieldName = data[ data.length - 1 ];
                        complement = { complement: (parseInt(data[ data.length - 2 ], 10) + 1).toString() };
                    }
                }

                message = extractMessage(error.keyword, fieldName, fieldsMessages, genericValidationMessages, complement, element);
                if (message) {
                    /* Surcharge du message produit par ajv */
                    erreurNotification.text = message;
                }
            }
            notificationsError.addNotification(erreurNotification);
        }
        return notificationsError;
    }

    /**
     * Génère le message d'erreur correspondant au mot-clé et au champ indiqués
     * @param keyword mot clé de validation json-schema
     * @param fieldName nom du champ (peut être un "path" tel que "ville.pays.id")
     * @param fieldsMessages messages spécifiques aux champs du formulaire
     * @param genericValidationMessages messages d'erreur génériques
     * @param complement
     * @return le message ou undefined lorsqu'aucun n'est défini pour le mot-clé indiqué
     */
    function extractMessage(keyword: string, fieldName: string, fieldsMessages?: any, genericValidationMessages?: any, complement?: any, field?: Element): string {
        let message: string;
        const specificMessage: any = get(fieldsMessages, fieldName + "." + keyword);
    
        if (isString(specificMessage)) {
    
            message = specificMessage;
            if (complement) {
                complement[ "field" ] = fieldName;
                const intlMsg = new IntlMessageFormat(specificMessage, i18nMessages.locale);
                message = intlMsg.format(complement);
            }
    
        } else if (genericValidationMessages) {
            const genericMessage: any = genericValidationMessages[ keyword ] || genericValidationMessages[ "generic" ];
            
            if(field && field.id){
                var labels:HTMLCollection = document.getElementsByTagName('LABEL');
                for (var i = 0; i < labels.length; i++) {
                    if ((labels[i] as HTMLLabelElement).htmlFor != '' && (labels[i] as HTMLLabelElement).htmlFor == field.id) {
                        fieldName = (labels[i] as HTMLLabelElement).innerText;         
                    }
                }
            }
    
            if (isString(genericMessage)) {
                const intlMsg = new IntlMessageFormat(genericMessage, i18nMessages.locale);
                message = intlMsg.format({ field: fieldName });
            }
        }
        return message;
    }
  

}