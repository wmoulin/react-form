"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const notification_events_1 = require("src/events/notification-events");
const event_manager_1 = require("src/events/event-manager");
const notification_1 = require("src/events/notification");
const isString = require("lodash.isstring");
const get = require("lodash.get");
const intl_messageformat_1 = require("intl-messageformat");
const i18n_utils_1 = require("hornet-js-utils/src/i18n-utils");
function useMessageError(fromElt, i18nMessages, extractFields, notifId, id, formMessages) {
    const [errors, setErrors] = react_1.useState(null);
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
                if (fields[fieldName] && fields[fieldName][0].props && fields[fieldName][0].props.title) {
                    const data = fieldName.split(".");
                    if (!isNaN(data[data.length - 2])) {
                        fieldName = data[data.length - 1];
                        complement = { complement: (parseInt(data[data.length - 2], 10) + 1).toString() };
                    }
                }
                message = extractMessage(error.keyword, fieldName, fieldsMessages, genericValidationMessages, complement, fields[fieldName][0]);
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
                const intlMsg = new intl_messageformat_1.default(specificMessage, i18nMessages.locale);
                message = intlMsg.format(complement);
            }
        }
        else if (genericValidationMessages) {
            const genericMessage = genericValidationMessages[keyword] || genericValidationMessages["generic"];
            if (field && field.id) {
                var labels = document.getElementsByTagName('LABEL');
                for (var i = 0; i < labels.length; i++) {
                    if (labels[i].htmlFor != '' && labels[i].htmlFor == field.id) {
                        fieldName = labels[i].innerText;
                    }
                }
            }
            if (isString(genericMessage)) {
                const intlMsg = new intl_messageformat_1.default(genericMessage, i18nMessages.locale);
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
        notifyErrors: (errors) => {
            if (errors) {
                const fieldsMessages = formMessages && formMessages.fields;
                const genericValidationMessages = i18n_utils_1.I18nUtils.getI18n("form.validation", undefined, i18nMessages);
                const fields = extractFields(fromElt);
                const notificationsError = getErrors(errors, fields, fieldsMessages, genericValidationMessages);
                /* Post-traitement des notifications concernant les champs d'autocomplétion */
                // TODO processAutocompleteErrors(fields, notificationsError);
                /* Met à jour les erreurs affichées par chaque composant champ */
                Object.keys(fields).forEach((key) => {
                    const field = fields[key][0];
                    let errors = notificationsError.getNotifications().filter((error) => {
                        return (error.field === field.name
                            || (error.additionalInfos
                                && error.additionalInfos.linkedFieldsName
                                && error.additionalInfos.linkedFieldsName.indexOf(field.name) > -1));
                    });
                    if (errors && errors.length > 0) {
                        field.parentElement && field.parentElement.classList.add("parent-field-error");
                        field.classList.add("field-error");
                        field.setAttribute("aria-invalid", "true");
                        //field.setAttribute("data-error-msg", errors.map((item) => item.text).join(","));
                        let nextElt = field.nextSibling;
                        if (!nextElt || !nextElt.classList.contains("container-field-error")) {
                            let errorField = document.createElement("div");
                            errorField.innerText = errors.map((item) => item.text).join(",");
                            errorField.classList.add("container-field-error");
                            field.parentElement.insertBefore(errorField, field.nextSibling);
                        }
                        else {
                            nextElt.classList.replace("container-field-error-hidden", "container-field-error-show");
                            nextElt.innerText = errors.map((item) => item.text).join(",");
                        }
                    }
                    else {
                        field.parentElement && field.parentElement.classList.remove("parent-field-error");
                        field.classList.remove("field-error");
                        field.setAttribute("aria-invalid", "false");
                        //field.setAttribute("data-error-msg", "");
                        let nextElt = field.nextSibling;
                        if (nextElt && nextElt.classList.contains("container-field-error")) {
                            nextElt.classList.replace("container-field-error-show", "container-field-error-hidden");
                            nextElt.innerText = "";
                        }
                    }
                });
                /* Emission des notifications */
                event_manager_1.fireEvent(notification_events_1.ADD_NOTIFICATION_EVENT.withData({ notifyId: notifId, idComponent: id, errors: notificationsError }));
            }
        },
        /**
         * Supprime les nofifications d'erreurs et les erreurs associées à chaque champ de ce formulaire
         */
        cleanFormErrors: () => {
            const fields = extractFields(fromElt);
            for (const fieldName in fields) {
                const field = fields[fieldName][0];
                // basic html
                field.classList.remove("field-error");
                field.parentElement && field.parentElement.classList.remove("parent-field-error");
                let nextElt = field.nextSibling;
                if (nextElt && nextElt.classList.contains("container-field-error")) {
                    nextElt.classList.replace("container-field-error-show", "container-field-error-hidden");
                    nextElt.innerText = "";
                }
            }
            event_manager_1.fireEvent(notification_events_1.CLEAN_NOTIFICATION_EVENT.withData({ notifyId: notifId, idComponent: id }));
        }
    };
}
exports.default = useMessageError;
//# sourceMappingURL=use-message-error.js.map