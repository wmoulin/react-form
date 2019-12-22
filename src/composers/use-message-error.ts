import { useState, useRef, MutableRefObject } from 'react';
import { ErrorObject, DependenciesParams } from 'ajv';
import { CLEAN_NOTIFICATION_EVENT, ADD_NOTIFICATION_EVENT } from "src/events/notification-events";
import { fireEvent } from "src/events/event-manager";
import { Notifications, NotificationType, INotificationType } from "src/events/notification";
import isString = require("lodash.isstring");
import get = require("lodash.get");
import IntlMessageFormat from "intl-messageformat";
import { I18nUtils } from "hornet-js-utils/src/i18n-utils";

export default function useMessageError(fromElt:MutableRefObject<HTMLFormElement>, i18nMessages, extractFields, notifId, id, formMessages) {
    const [errors, setErrors] = useState(null);
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

            erreurNotification.anchor = fieldName + "_anchor";
            erreurNotification.field = fieldName;
            erreurNotification.additionalInfos = error.params;

            let complement: any = { ...error.params };

            // Gestion des champs editables d'un tableau
            if (fields[ fieldName ] && (fields[ fieldName ][0] as any).props && (fields[ fieldName ][0] as any).props.title) {
                const data = fieldName.split(".");
                if (!isNaN(data[ data.length - 2 ] as any)) {
                    fieldName = data[ data.length - 1 ];
                    complement = { complement: (parseInt(data[ data.length - 2 ], 10) + 1).toString() };
                }
            }

            message = extractMessage(error.keyword, fieldName, fieldsMessages, genericValidationMessages, complement, fields[ fieldName ][0]);
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

    return {
        /**S
         * Déclenche les notifications correspondant aux éventuelles erreurs de validation
         * @param errors erreurs de validation de formulaire, éventuellement vides
         */
        notifyErrors: (errors: Array<ErrorObject>): void => {
            if (errors) {
                const fieldsMessages = formMessages && formMessages.fields;
                const genericValidationMessages = I18nUtils.getI18n("form.validation", undefined, i18nMessages);
                const fields: { [key: string]: Element[] } = extractFields(fromElt);

                const notificationsError: Notifications = getErrors(errors, fields, fieldsMessages, genericValidationMessages);

                /* Post-traitement des notifications concernant les champs d'autocomplétion */
                // TODO processAutocompleteErrors(fields, notificationsError);

                /* Met à jour les erreurs affichées par chaque composant champ */
                Object.keys(fields).forEach((key: string) => {
                    const field: HTMLEmbedElement = fields[key][0] as HTMLEmbedElement;

                    let errors = notificationsError.getNotifications().filter((error: INotificationType): boolean => {
                        return (error.field === field.name
                            || (error.additionalInfos
                                && error.additionalInfos.linkedFieldsName
                                && error.additionalInfos.linkedFieldsName.indexOf(field.name) > -1)
                        );
                    });

                    if (errors && errors.length > 0) {
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
                    } else {
                        field.parentElement && field.parentElement.classList.remove("parent-field-error");
                        field.classList.remove("field-error");
                        field.setAttribute("aria-invalid", "false");
                        //field.setAttribute("data-error-msg", "");
                        let nextElt: HTMLElement = field.nextSibling as HTMLElement;
                        if(nextElt &&  nextElt.classList.contains("container-field-error")) {
                            nextElt.classList.replace( "container-field-error-show", "container-field-error-hidden" );
                            nextElt.innerText =  "";
                        }
                    }
                });

                /* Emission des notifications */
                fireEvent(ADD_NOTIFICATION_EVENT.withData({ notifyId: notifId, idComponent: id, errors: notificationsError}));
            }
        },
        /**
         * Supprime les nofifications d'erreurs et les erreurs associées à chaque champ de ce formulaire
         */
        cleanFormErrors: (): void => {
            const fields: { [key: string]: HTMLElement[] } = extractFields(fromElt);
            for (const fieldName in fields) {
                const field: HTMLElement = fields[fieldName][0];

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
        }
    }
}