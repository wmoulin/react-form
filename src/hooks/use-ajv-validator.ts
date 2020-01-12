import { useRef, useContext } from 'react';
import { FormContext } from "src/contexts/form-context";
import * as ajv from "ajv";
import { Utils } from "hornet-js-utils";
import { DataValidator, IValidationResult, ICustomValidation } from 'src/validation/data-validator';

const logger = console;

export default function useAjvValidator(schema, validationOptions: ajv.Options, customValidators: ICustomValidation[], onBeforeSubmit, onSubmit, calendarLocale, notifyErrors, cleanFormErrors, formContext:any = useContext(FormContext)) {

    const schemaAjv = useRef(DataValidator.transformRequiredStrings(schema));
    
    /**
    * Déclenche la validation du formulaire, notifie les erreurs éventuelles et exécute la fonction
    * onSubmit présente dans les propriétés s'il n'y a pas d'erreurs
    *
    */
    formContext.current.validateAndSubmit = () => {

        logger.trace("Validation et envoi du formulaire");

        const data = formContext.current.extractData();

        const validationRes: IValidationResult = getValidationResult(schemaAjv.current, data);

        if (!validationRes.valid) {
            notifyErrors(validationRes.errors);
        } else {
            cleanFormErrors();
            if (onSubmit) {
                transformDatesToISO(schemaAjv, data, calendarLocale || {});
                onSubmit(data);
            }
        }

    };

    /**onBeforeSubmit
    * Retourne le résultat de la validation et ses éventuelles erreurs
    * @param schema : schéma de validation, par défaut celui du formulaire
    * @param data: data extraites du formulaire à valider
    */
    const getValidationResult = (schema = schemaAjv, dataTovalidate?: any): IValidationResult => {
        const data = dataTovalidate || formContext.current.extractData();
        if (onBeforeSubmit) {
            onBeforeSubmit(data);
        }

        transformDatesToISO(schema, data, calendarLocale || {});
        return new DataValidator(schema, customValidators, validationOptions).validate(data);
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

}