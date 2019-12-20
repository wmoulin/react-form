"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const hornet_js_utils_1 = require("hornet-js-utils");
const data_validator_1 = require("src/validation/data-validator");
const logger = console;
function useAjvValidator(schema, validationOptions, customValidators, onBeforeSubmit, onSubmit, calendarLocale, extractData, notifyErrors, cleanFormErrors) {
    const schemaAjv = react_1.useRef(data_validator_1.DataValidator.transformRequiredStrings(schema));
    /**
    * Déclenche la validation du formulaire, notifie les erreurs éventuelles et exécute la fonction
    * onSubmit présente dans les propriétés s'il n'y a pas d'erreurs
    *
    */
    const validateAndSubmit = () => {
        logger.trace("Validation et envoi du formulaire");
        const data = extractData();
        const validationRes = getValidationResult(schemaAjv, data);
        if (!validationRes.valid) {
            notifyErrors(validationRes.errors);
        }
        else {
            cleanFormErrors();
            if (onSubmit) {
                transformDatesToISO(schemaAjv, data, calendarLocale || {});
                onSubmit(data);
            }
        }
    };
    /**
    * Retourne le résultat de la validation et ses éventuelles erreurs
    * @param schema : schéma de validation, par défaut celui du formulaire
    * @param data: data extraites du formulaire à valider
    */
    const getValidationResult = (schema = schemaAjv, dataTovalidate) => {
        const data = dataTovalidate || extractData();
        if (onBeforeSubmit) {
            onBeforeSubmit(data);
        }
        transformDatesToISO(schema, data, calendarLocale || {});
        return new data_validator_1.DataValidator(schema, customValidators, validationOptions).validate(data);
    };
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
}
exports.default = useAjvValidator;
//# sourceMappingURL=use-ajv-validator.js.map