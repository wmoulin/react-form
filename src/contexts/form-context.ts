import * as React from 'react';
import { useRef } from 'react';
import { ICustomValidation } from 'src/validation/data-validator';
import { ErrorObject } from 'ajv';

type FormElement = Element | HTMLElement;

export const FormContext = React.createContext<{current: FormAPI}>({current: {test: "coucou"} as any});
FormContext.displayName = 'FormContext';

export interface FormAPI {
    form: Element;
    fields?: { [key: string]: FieldOptions<any> };
    extractData: (boolean?) => Object;
    validateAndSubmit: () => void;
    extractFields(fromElt?:React.MutableRefObject<HTMLFormElement>): { [key: string]: Element[] };
    cleanFormErrors(): void;
    notifyErrors(errors: Array<any>): void;
}
export type FieldOptions<T> = Partial<{
    required: boolean | string;
    validators: ICustomValidation[];
    name: string;
    type: string;
    ref: Element;
    setErrors?(errors: Array<any>): void;
    getCurrentValue?(): T;
    value?: T;
  }>;


