import * as React from 'react';
import { useRef } from 'react';
import { ICustomValidation } from 'src/validation/data-validator';

type FormElement = Element | HTMLElement;

export const FormContext = React.createContext<{current: FormAPI}>({current: {test: "coucou"} as any});
FormContext.displayName = 'FormContext';

export interface FormAPI {
    form: Element;
    fields?: { [key: string]: FieldOptions };
    extractData: (boolean?) => Object;
    validateAndSubmit: () => void;
    extractFields(fromElt?:React.MutableRefObject<HTMLFormElement>): { [key: string]: Element[] };
}
export type FieldOptions = Partial<{
    required: boolean | string;
    validators: ICustomValidation[];
    name: string;
    type: string;
    ref: Element;
  }>;


