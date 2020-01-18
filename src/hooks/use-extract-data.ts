import get = require("lodash.get");
import set = require("lodash.set");
import { FormContext } from "src/contexts/form-context";
import { useContext, useCallback } from 'react';
import { MutableRefObject } from 'react';

export type ValueField<T> = {
    getCurrentValue?(): T;
    value: T;
    type: string;
}

export default function useExtractData(formContext:any=useContext(FormContext)) {
    
    /**
     * Extrait les données du formulaire
     * @param removeEmptyStrings indique si les champs ayant pour valeur une chaîne de caractères vide ne doivent pas
     * être présents dans l'objet résultat.
     * @returns {Object}
     */

     //return (fromElt:MutableRefObject<HTMLFormElement>) => {
        formContext.current.extractData = (removeEmptyStrings: boolean = true, onlyRegisterField: boolean = true): Object => {
            const data: Object = {};
            const fields: { [key: string]: Element[] } = formContext.current.extractFields(onlyRegisterField);
            Object.keys(fields).forEach((name) => {
                let field = fields[name] as any as ValueField<any>;
                const value: any = field.getCurrentValue ? field.getCurrentValue() : field.value;
                if ((value !== "" && value !== null && !(field.type === "number" && isNaN(value))) || !removeEmptyStrings) {
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
            });

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

        formContext.current.extractFields = (onlyRegisterField: boolean = true, fromElt:MutableRefObject<HTMLFormElement> = formContext.current.form): { [key: string]: Element[] } => {
            const fields: { [key: string]: Element[] } = {};
            if (fromElt.current) {
                for (let index = 0; index < fromElt.current.elements.length; index++) {
        
                    const item: Element = fromElt.current.elements[index];
                    if(item["name"]) {
                        if (fields[item["name"]]) {
                            fields[item["name"]].push(item);
                        } else {
                            fields[item["name"]] = [item];
                        }
                    }
                }
            }
            Object.keys(formContext.current.fields).forEach((name) => {
                fields[name] = [formContext.current.fields[name].ref];
            });
            return fields;
        }
    //}
}
