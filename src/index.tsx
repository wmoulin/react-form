import * as classNames from "classnames";
import * as ajv from "ajv";
import "src/sass/form.scss";
import * as React from 'react';
import { I18nUtils } from "hornet-js-utils/src/i18n-utils";
import { Utils } from "hornet-js-utils";
import { DataValidator, IValidationResult } from 'src/validation/data-validator';
import get = require("lodash.get");
import set = require("lodash.set");
import { ErrorObject, DependenciesParams } from 'ajv';
import { CLEAN_NOTIFICATION_EVENT, ADD_NOTIFICATION_EVENT } from "src/events/notification-events";
import { fireEvent } from "src/events/event-manager";
import { Notifications, NotificationType, INotificationType } from "src/events/notification";
import IntlMessageFormat from "intl-messageformat";
import isEmpty = require("lodash.isempty");
import isString = require("lodash.isstring");
const messages = require("src/ressources/messages.json");
const i18nMessages = Utils.getCls("hornet.internationalization") || messages;

const logger = console;

export type FormProps = {
    sticky?: boolean;
    omitNull?: boolean;
    calendarLocale?: {dateFormat: any, timeZone: any};
} | any;

type FormElement = React.Element | React.HtmlElement;

export const Form: React.FC<FormProps> = (props: FormProps) => {
    const [markRequired, setMarkRequired] = React.useState(props.markRequired || false);
    const fromElt = React.useRef(null);
    

    logger.debug("Form render : ", props.id);

     /**
     * Déclenche la validation du formulaire, notifie les erreurs éventuelles et exécute la fonction
     * onSubmit présente dans les propriétés s'il n'y a pas d'erreurs
     *
     */
    const validateAndSubmit = () => {
         
        if (fromElt) {
            logger.trace("Validation et envoi du formulaire");

            const data = extractData(props.omitNull);
            const schema = DataValidator.transformRequiredStrings(props.schema);

            const validationRes: IValidationResult = getValidationResult(schema, data);

            if (!validationRes.valid) {
                notifyErrors(validationRes.errors);
            } else {
                cleanFormErrors();
                if (props.onSubmit) {
                    transformDatesToISO(schema, data, props.calendarLocale || I18nUtils.getI18n("calendar", undefined, i18nMessages) || {});
                    props.onSubmit(data);
                }
            }
        }
    }

        /**
     * Retourne le résultat de la validation et ses éventuelles erreurs
     * @param schema : schéma de validation, par défaut celui du formulaire
     * @param data: data extraites du formulaire à valider
     */
    const getValidationResult = (schema = DataValidator.transformRequiredStrings(props.schema), dataTovalidate?: any) : IValidationResult => {
        const data = dataTovalidate || extractData(props.omitNull);
        if (props.onBeforeSubmit) {
            props.onBeforeSubmit(data);
        }
        const options: ajv.Options = props.validationOptions;
        transformDatesToISO(schema, data, props.calendarLocale || I18nUtils.getI18n("calendar", undefined, i18nMessages) || {});
        return new DataValidator(schema, props.customValidators, options).validate(data);
    }

  /**
     * Extrait les données du formulaire
     * @param removeEmptyStrings indique si les champs ayant pour valeur une chaîne de caractères vide ne doivent pas
     * être présents dans l'objet résultat.
     * @returns {Object}
     */
    const extractData = (removeEmptyStrings: boolean = true): Object => {
        const data: Object = {};
        const fields: { [key: string]: FormElement } = extractFields();
        for (const name in fields) {
            const value: any = fields[name].value;
            if ((value !== "" && value !== null && !(fields[name].getType() === "number" && isNaN(value))) || !removeEmptyStrings) {
                set(data, name, value);
            } else {
                /* Le champ est vide : si son nom correspond à une arborescence d'objets, on s'assure tout de même
                que l'objet parent existe */
                const lastDotIndex = name.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    const parentPath: string = name.substring(0, lastDotIndex);
                    if (get(data, parentPath) == null) {
                        set(data, parentPath, {});
                    }
                }
            }
        }
        // Parcourir l'objet data et remplacer la valeur des sous objets contenant que des objets vides ex :{id: "", libelle: ""} par null
        if (data && !removeEmptyStrings) {
            Object.keys(data).forEach((key) => {
                const currentData = data[key];

                if (currentData && Object.keys(currentData) && Object.keys(currentData).length > 0) {
                    let isObjectNotEmpty: boolean;
                    let i = 0;
                    while (i < Object.keys(currentData).length && !isObjectNotEmpty) {
                        if (currentData[Object.keys(currentData)[i]]) {
                            isObjectNotEmpty = true;
                        }
                        i++;
                    }
                    if (!isObjectNotEmpty) {
                        data[key] = null;
                    }
                }
            });
        }
        return data;
    }

        const extractFields = (): { [key: string]: FormElement } => {
            const fields: { [key: string]: FormElement } = {};
            if (fromElt.current) {
                for (let index = 0; index < fromElt.current.elements.length; index++) {
    
                    const item: Element = fromElt.current.elements[index];
                    if (item["name"]) {
                        if (fields[item["name"]]) {
                            fields[item["name"]].push(item);
                        } else {
                            fields[item["name"]] = item;
                        }
                    }
                }
            }
            return fields;
        }

    /**
     * Déclenche les notifications correspondant aux éventuelles erreurs de validation
     * @param errors erreurs de validation de formulaire, éventuellement vides
     */
    const notifyErrors = (errors: Array<ErrorObject>): void => {
        if (errors) {
            const fieldsMessages = props.formMessages && props.formMessages.fields;
            const genericValidationMessages = I18nUtils.getI18n("form.validation", undefined, i18nMessages);
            const fields: { [key: string]: FormElement } = extractFields();

            const notificationsError: Notifications = getErrors(errors, fields, fieldsMessages, genericValidationMessages);

            /* Post-traitement des notifications concernant les champs d'autocomplétion */
            // TODO processAutocompleteErrors(fields, notificationsError);

            /* Met à jour les erreurs affichées par chaque composant champ */
            Object.keys(fields).forEach((key: string) => {
                const field: FormElement = fields[key];

                let errors = notificationsError.getNotifications().filter((error: INotificationType): boolean => {
                    return (error.field === field.name
                        || (error.additionalInfos
                            && error.additionalInfos.linkedFieldsName
                            && error.additionalInfos.linkedFieldsName.indexOf(field.name) > -1)
                    );
                });

                if (errors && errors.length > 0) {
                    field.classList.remove("error");
                    field.setAttribute ("aria-invalid", "true");
                    field.setAttribute("data-error-msg", errors.map((item) => item.text).join(",")); 
                } else {
                    field.classList.remove("error");
                    field.setAttribute("aria-invalid", "false");
                    field.setAttribute("data-error-msg", ""); 
                }
            });

            /* Emission des notifications */
            fireEvent(ADD_NOTIFICATION_EVENT.withData({ notifyId: props.notifId, idComponent: props.id, errors: notificationsError}));
        }
    }

    
    /**
     * Supprime les nofifications d'erreurs et les erreurs associées à chaque champ de ce formulaire
     */
    const cleanFormErrors = (): void => {
        const fields: { [key: string]: FormElement } = extractFields();
        for (const fieldName in fields) {
            const field: FormElement = fields[fieldName];

            // basic html
            field.classList.remove("error");
        }
        fireEvent(CLEAN_NOTIFICATION_EVENT.withData({ notifyId: props.notifId, idComponent: props.id }));
    }

    /*
     * RENDER
     * -----------------------------------------------------------------
     */
    /* La validation de formulaire HTML 5 est désactivée (noValidate="true") :
     on s'appuie uniquement sur la validation à la soumission et on a ainsi un rendu cohérent entre navigateurs. */

     const formProps = {...props,  // TODO filter form attributes
        method: "post",
        onSubmit: debounced(validateAndSubmit, 500),
        ref: fromElt,
    };

    let formClass = {
        "form-content": true,
        "form-content-sticky": props.sticky
    }

    if (isMultiPartForm(props.children)) {
        formProps["encType"] = "multipart/form-data";
    }

    const textHtmlProps = {
        lang: props.textLang ? props.textLang : null,
    };

    return (
        <section id="form-content" className={classNames(formClass)}>
            <form {...formProps}>
                {(props.subTitle || props.text
                    || (markRequired && !props.isMandatoryFieldsHidden)) ?
                    <div className="form-titles">
                        {props.subTitle ? <h3 className="form-soustitre">{props.subTitle}</h3> : null}
                        {props.text ?
                            <p className="form-texte" {...textHtmlProps}>{props.text}</p> : null}
                        {markRequired ?
                            <p className="discret">{I18nUtils.getI18n("form.fillField", undefined, i18nMessages)}</p> : null}
                    </div>
                    : null}
                {(props.children) ?
                    <div className="form-content">
                        {props.children}
                    </div>
                    : null}
            </form>
        </section>
    );




};

Form.defaultProps = {
    sticky: false,
    markRequired: true,
    omitNull: true
} as Partial<FormProps>;

export default Form;


function debounced(func, delay) {
    let timerId;
    return function (...args) {
        args[0].preventDefault();
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func(...args);
        timerId = null;
      }, delay);
    }
  }

    /**
     * Transforme les valeurs des champs déclarés avec le format "date-time" dans le schéma de validation :
     * effectue la conversion depuis la locale courante, vers le format ISO 8601. Ceci permet une validation isomorphique
     * côté client comme serveur en utilisant le même schéma, et la conversion automatique en objet Date côté backend REST
     * reste possible.
     * @param schema schéma de validation JSON-Schema
     * @param data données de formualaire
     */
    function transformDatesToISO(schema: any, data: any, calendarLocale): void {
        if (schema && schema.properties && data) {
            const propNames: string[] = Object.keys(schema.properties);
            let property: any, propName: string;
            for (let i: number = 0; i < propNames.length; i++) {
                propName = propNames[i];
                property = schema.properties[propName];
                if (property.type === "object") {
                    /* Appel récursif sur les éventuelles propriétés incluses dans le sous-schéma */
                    transformDatesToISO(property, data[propName], calendarLocale);
                } else if (property.format === "date-time") {
                    if (data[propName]) {
                        const date: Date = Utils.dateUtils.parseInTZ(
                            data[propName], calendarLocale.dateFormat, calendarLocale.timeZone);
                        if (date) {
                            /* La chaîne de caractères est une date valide pour la locale : on convertit en représentation ISO 8601.*/
                            data[propName] = date.toISOString();
                        }
                        /* Sinon la valeur incorrecte est conservée*/
                    }
                }
            }
        }
    }

        /**
     * Traite les erreurs de validation de formulaire : renvoie des notifications d'erreur.
     * @param errors liste d'erreurs éventuellement vide
     * @param fields Liste des champs du formulaire
     * @param fieldsMessages messages spécifiques aux champs du formulaire
     * @param genericValidationMessages messages d'erreur génériques
     * @return {Notifications} les notifications correspondant aux erreurs de validation
     */
    function getErrors(errors: Array<ErrorObject>, fields: { [ key: string ]: FormElement }, fieldsMessages?: any, genericValidationMessages?: any): Notifications {
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
                if (fields[ fieldName ] && fields[ fieldName ].props && fields[ fieldName ].props.title) {
                    const data = fieldName.split(".");
                    if (!isNaN(data[ data.length - 2 ] as any)) {
                        fieldName = data[ data.length - 1 ];
                        complement = { complement: (parseInt(data[ data.length - 2 ], 10) + 1).toString() };
                    }
                }

                message = extractMessage(error.keyword, fieldName, fieldsMessages, genericValidationMessages, complement, fields[ fieldName ]);
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
   function extractMessage(keyword: string, fieldName: string, fieldsMessages?: any, genericValidationMessages?: any, complement?: any, field?: FormElement): string {
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
           if (field && isString(field.state.label) && !isEmpty(field.state.label)) { // on récupére le label associé
               fieldName = field.state.label;
           }
           if (isString(genericMessage)) {
            console.log("2");
               const intlMsg = new IntlMessageFormat(genericMessage, i18nMessages.locale);
               message = intlMsg.format({ field: fieldName });
           }
       }
       return message;
   }

   /**
     * Méthode permettant de déterminer si le formulaire dispose d'un champ de type UploadFileField
     * Dans ce cas, on ajoute la propriété ["encType"] = "multipart/form-data" au formulaire
     * @param items
     * @returns {boolean}
     */
    function isMultiPartForm(items: Array<React.ReactChild>): boolean {

        let isMultiPart: boolean = false;

        React.Children.map(items, (child: React.ReactChild) => {
            if (!isMultiPart) {
                if (child != null) {
                    if (child["props"] && child["props"].children) {
                        isMultiPart = isMultiPartForm(child["props"].children);
                    }
                    if (!isMultiPart && child.type === "file") {
                        isMultiPart = true;
                    }
                }
            }
        });

        return isMultiPart;
    }

   