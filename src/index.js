"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classNames = require("classnames");
require("src/sass/form.scss");
const React = require("react");
const i18n_utils_1 = require("hornet-js-utils/src/i18n-utils");
const hornet_js_utils_1 = require("hornet-js-utils");
const data_validator_1 = require("src/validation/data-validator");
const get = require("lodash.get");
const set = require("lodash.set");
const notification_events_1 = require("src/events/notification-events");
const event_manager_1 = require("src/events/event-manager");
const notification_1 = require("src/events/notification");
const intl_messageformat_1 = require("intl-messageformat");
const isEmpty = require("lodash.isempty");
const isString = require("lodash.isstring");
const messages = require("src/ressources/messages.json");
const logger = console;
exports.Form = (props) => {
    const [markRequired, setMarkRequired] = React.useState(props.markRequired || false);
    const fromElt = React.useRef(null);
    const i18nMessages = hornet_js_utils_1.Utils.getCls("hornet.internationalization") || messages;
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
            const schema = data_validator_1.DataValidator.transformRequiredStrings(props.schema);
            const validationRes = getValidationResult(schema, data);
            if (!validationRes.valid) {
                notifyErrors(validationRes.errors);
            }
            else {
                cleanFormErrors();
                if (props.onSubmit) {
                    transformDatesToISO(schema, data, props.calendarLocale || i18n_utils_1.I18nUtils.getI18n("calendar", undefined, i18nMessages) || {});
                    props.onSubmit(data);
                }
            }
        }
    };
    /**
       * Extrait les données du formulaire
       * @param removeEmptyStrings indique si les champs ayant pour valeur une chaîne de caractères vide ne doivent pas
       * être présents dans l'objet résultat.
       * @returns {Object}
       */
    const extractData = (removeEmptyStrings = true) => {
        const data = {};
        const fields = extractFields();
        for (const name in fields) {
            const value = fields[name].getCurrentValue(removeEmptyStrings);
            if ((value !== "" && value !== null && !(fields[name].getType() === "number" && isNaN(value))) || !removeEmptyStrings) {
                set(data, name, value);
            }
            else {
                /* Le champ est vide : si son nom correspond à une arborescence d'objets, on s'assure tout de même
                que l'objet parent existe */
                const lastDotIndex = name.lastIndexOf(".");
                if (lastDotIndex > 0) {
                    const parentPath = name.substring(0, lastDotIndex);
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
                    let isObjectNotEmpty;
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
    };
    const extractFields = () => {
        const fields = {};
        if (fromElt.current) {
            for (let index = 0; index < fromElt.current.elements.length; index++) {
                const item = fromElt.current.elements[index];
                if (item["name"]) {
                    if (fields[item["name"]]) {
                        fields[item["name"]].push(item);
                    }
                    else {
                        fields[item["name"]] = item;
                    }
                }
            }
        }
        return fields;
    };
    /**
     * Déclenche les notifications correspondant aux éventuelles erreurs de validation
     * @param errors erreurs de validation de formulaire, éventuellement vides
     */
    const notifyErrors = (errors) => {
        if (errors) {
            const fieldsMessages = props.formMessages && props.formMessages.fields;
            const genericValidationMessages = i18n_utils_1.I18nUtils.getI18n("form.validation", undefined, i18nMessages);
            const fields = extractFields();
            const notificationsError = getErrors(errors, fields, fieldsMessages, genericValidationMessages);
            /* Post-traitement des notifications concernant les champs d'autocomplétion */
            // TODO processAutocompleteErrors(fields, notificationsError);
            /* Met à jour les erreurs affichées par chaque composant champ */
            Object.keys(fields).forEach((key) => {
                const field = fields[key];
                let errors = notificationsError.getNotifications().filter((error) => {
                    return (error.field === field.name
                        || (error.additionalInfos
                            && error.additionalInfos.linkedFieldsName
                            && error.additionalInfos.linkedFieldsName.indexOf(field.name) > -1));
                });
                if (errors && errors.length > 0) {
                    field.classList.remove("error");
                    field.setAttribute("aria-invalid", "true");
                    field.setAttribute("data-error-msg", errors.map((item) => item.text).join(","));
                }
                else {
                    field.classList.remove("error");
                    field.setAttribute("aria-invalid", "false");
                    field.setAttribute("data-error-msg", "");
                }
            });
            /* Emission des notifications */
            event_manager_1.fireEvent(notification_events_1.ADD_NOTIFICATION_EVENT.withData({ notifyId: props.notifId, idComponent: props.id, errors: notificationsError }));
        }
    };
    /**
     * Supprime les nofifications d'erreurs et les erreurs associées à chaque champ de ce formulaire
     */
    const cleanFormErrors = () => {
        const fields = extractFields();
        for (const fieldName in fields) {
            const field = fields[fieldName];
            // basic html
            field.classList.remove("error");
        }
        event_manager_1.fireEvent(notification_events_1.CLEAN_NOTIFICATION_EVENT.withData({ notifyId: props.notifId, idComponent: props.id }));
    };
    /*
     * RENDER
     * -----------------------------------------------------------------
     */
    /* La validation de formulaire HTML 5 est désactivée (noValidate="true") :
     on s'appuie uniquement sur la validation à la soumission et on a ainsi un rendu cohérent entre navigateurs. */
    const formProps = Object.assign({}, props, { method: "post", onSubmit: debounced(validateAndSubmit, 500), ref: fromElt });
    let formClass = {
        "form-content": true,
        "form-content-sticky": props.sticky
    };
    if (isMultiPartForm(props.children)) {
        formProps["encType"] = "multipart/form-data";
    }
    const textHtmlProps = {
        lang: props.textLang ? props.textLang : null,
    };
    return (React.createElement("section", { id: "form-content", className: classNames(formClass) },
        React.createElement("form", Object.assign({}, formProps),
            (props.subTitle || props.text
                || (markRequired && !props.isMandatoryFieldsHidden)) ?
                React.createElement("div", { className: "form-titles" },
                    props.subTitle ? React.createElement("h3", { className: "form-soustitre" }, props.subTitle) : null,
                    props.text ?
                        React.createElement("p", Object.assign({ className: "form-texte" }, textHtmlProps), props.text) : null,
                    markRequired ?
                        React.createElement("p", { className: "discret" }, i18n_utils_1.I18nUtils.getI18n("form.fillField", undefined, i18nMessages)) : null)
                : null,
            (props.children) ?
                React.createElement("div", { className: "form-content" }, props.children)
                : null)));
};
exports.Form.defaultProps = {
    sticky: false,
    markRequired: true,
    omitNull: true
};
exports.default = exports.Form;
function debounced(func, delay) {
    let timerId;
    return function (...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            func(...args);
            timerId = null;
        }, delay);
    };
}
/**
 * Transforme les valeurs des champs déclarés avec le format "date-time" dans le schéma de validation :
 * effectue la conversion depuis la locale courante, vers le format ISO 8601. Ceci permet une validation isomorphique
 * côté client comme serveur en utilisant le même schéma, et la conversion automatique en objet Date côté backend REST
 * reste possible.
 * @param schema schéma de validation JSON-Schema
 * @param data données de formualaire
 */
function transformDatesToISO(schema, data, calendarLocale) {
    if (schema && schema.properties && data) {
        const propNames = Object.keys(schema.properties);
        let property, propName;
        for (let i = 0; i < propNames.length; i++) {
            propName = propNames[i];
            property = schema.properties[propName];
            if (property.type === "object") {
                /* Appel récursif sur les éventuelles propriétés incluses dans le sous-schéma */
                transformDatesToISO(property, data[propName], calendarLocale);
            }
            else if (property.format === "date-time") {
                if (data[propName]) {
                    const date = hornet_js_utils_1.Utils.dateUtils.parseInTZ(data[propName], calendarLocale.dateFormat, calendarLocale.timeZone);
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
function getErrors(errors, fields, fieldsMessages, genericValidationMessages) {
    const notificationsError = new notification_1.Notifications();
    for (let index = 0; index < errors.length; index++) {
        const error = errors[index];
        const erreurNotification = new notification_1.NotificationType();
        erreurNotification.id = "ACTION_ERREUR_" + index;
        erreurNotification.text = error.message;
        let fieldName = extractFieldName(error);
        let message = null;
        if (fieldName) {
            erreurNotification.anchor = fieldName + "_anchor";
            erreurNotification.field = fieldName;
            erreurNotification.additionalInfos = error.params;
            let complement = Object.assign({}, error.params);
            // Gestion des champs editables d'un tableau
            if (fields[fieldName] && fields[fieldName].props && fields[fieldName].props.title) {
                const data = fieldName.split(".");
                if (!isNaN(data[data.length - 2])) {
                    fieldName = data[data.length - 1];
                    complement = { complement: (parseInt(data[data.length - 2], 10) + 1).toString() };
                }
            }
            message = extractMessage(error.keyword, fieldName, fieldsMessages, genericValidationMessages, complement, fields[fieldName]);
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
function extractFieldName(error) {
    let fieldName = "";
    if (error) {
        if (error.dataPath && error.dataPath.length > 1) {
            let offset = 0;
            if (error.dataPath.charAt(0) === ".") {
                offset = 1;
            }
            fieldName = error.dataPath.substring(offset);
        }
        if (error.keyword === "required") {
            if (error.params && error.params.missingProperty) {
                if (fieldName) {
                    fieldName += ".";
                }
                fieldName += error.params.missingProperty;
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
function extractMessage(keyword, fieldName, fieldsMessages, genericValidationMessages, complement, field) {
    let message;
    const specificMessage = get(fieldsMessages, fieldName + "." + keyword);
    if (isString(specificMessage)) {
        message = specificMessage;
        if (complement) {
            complement["field"] = fieldName;
            console.log("1");
            const intlMsg = new intl_messageformat_1.default(specificMessage);
            message = intlMsg.format(complement);
        }
    }
    else if (genericValidationMessages) {
        const genericMessage = genericValidationMessages[keyword] || genericValidationMessages["generic"];
        if (field && isString(field.state.label) && !isEmpty(field.state.label)) { // on récupére le label associé
            fieldName = field.state.label;
        }
        if (isString(genericMessage)) {
            console.log("2");
            const intlMsg = new intl_messageformat_1.default(genericMessage);
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
function isMultiPartForm(items) {
    let isMultiPart = false;
    React.Children.map(items, (child) => {
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
//# sourceMappingURL=index.js.map