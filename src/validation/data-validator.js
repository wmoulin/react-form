"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ajv = require("ajv");
const cloneDeep = require("lodash.clonedeep");
;
;
/**
 * Contient tous les éléments nécessaires à une validation de données
 */
class DataValidator {
    constructor(schema, customValidators, options = DataValidator.DEFAULT_VALIDATION_OPTIONS) {
        this.schema = schema;
        this.customValidators = customValidators;
        this.options = options;
    }
    /**
     * Exécute la validation
     * @param data données à valider
     * @return {IValidationResult} résultat de la validation
     */
    validate(data) {
        let result = {
            valid: true,
            errors: []
        };
        if (this.schema) {
            let ajvInstance = ajv(this.options);
            require('ajv-keywords')(ajvInstance);
            result.valid = ajvInstance.validate(this.schema, data);
            result.errors = ajvInstance.errors || [];
        }
        /* Prise en compte des valideurs customisés éventuels */
        if (this.customValidators) {
            for (let index in this.customValidators) {
                if (this.customValidators[index] && (typeof this.customValidators[index] != "function")) {
                    let customResult = this.customValidators[index].validate(data);
                    if (!customResult.valid && customResult.errors) {
                        result.errors = result.errors.concat(customResult.errors);
                    }
                    result.valid = result.valid && customResult.valid;
                }
            }
        }
        if (result.errors && Array.isArray(result.errors)) {
            for (let index in result.errors) {
                result.errors[index].dataPath = result.errors[index].dataPath.replace("'][", ".").replace("['", "").replace("]", "");
            }
        }
        return result;
    }
    /**
     * Transforme le schéma de validation indiqué en un schéma JSON-Schema valide. Dans le schéma passé en paramètre,
     * le mot clé "required" peut-être spécifié par champ de type string.
     * En sortie les noms champs obligatoires sont regroupés dans un tableau, conformément à la spécification JSON-Schema
     * et le mot-clé "minLength" est utilisé pour les champs obligatoires.
     * Exemple :
     * {
     *  "$schema": "http://json-schema.org/schema#",
     *  "type": "object",
     *  "properties": {
     *      "champ1": {"type": "string", "required": true},
     *      "champ2": {"type": "number"}
     *  }
     * }
     *
     * devient :
     * {
     *  "$schema": "http://json-schema.org/schema#",
     *  "type": "object",
     *  "properties": {
     *      "champ1": {"type": "string", "minLength": 1},
     *      "champ2": {"type": "number"}
     *  },
     *  "required": ["champ1"]
     * }
     *
     * @param hornetSchema schéma de validation
     * @return un schéma json-schema valide
     */
    static transformRequiredStrings(hornetSchema) {
        var resultSchema;
        if (hornetSchema) {
            resultSchema = cloneDeep(hornetSchema);
            resultSchema.required = resultSchema.required || [];
            // TODO à appliquer récursivement, chaque champ pouvant lui même être un objet
            for (var fn in resultSchema.properties) {
                var field = resultSchema.properties[fn];
                if (field.required === true && field.type == "string") {
                    field.minLength = 1;
                    if (resultSchema.required.indexOf(fn) == -1) {
                        resultSchema.required.push(fn);
                    }
                    delete field.required;
                }
            }
            /* Aucune propriété n'est requise : on supprime dans ce cas la propriété required pour être compatible avec ajv */
            if (resultSchema.required.length == 0) {
                delete resultSchema.required;
            }
        }
        return resultSchema;
    }
}
/**
 * Options de validation ajv par défaut, utilisables côté client et serveur (les dates sont supposées être des
 * chaînes de caractères au format ISO 8601)
 */
DataValidator.DEFAULT_VALIDATION_OPTIONS = {
    /* Valide tous les champs : ne s'arrête pas à la première erreur */
    allErrors: true,
    /* Convertit les chaînes de caractères vers le type indiqué dans le schéma de validation */
    coerceTypes: true,
    /* Prend en compte les valeurs par défaut éventuellement présentes dans le schéma */
    useDefaults: true,
    /* Mode de validation complet : impacte les formats date, time, date-time, uri, email, et hostname.
    En mode 'full', les champs de format "email' sont validés en appliquant la RFC 5322. */
    format: "full"
};
exports.DataValidator = DataValidator;

//# sourceMappingURL=data-validator.js.map
