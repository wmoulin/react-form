import * as React from 'react';
import { useRef } from 'react';
import { ICustomValidation } from 'src/validation/data-validator';

type FormElement = Element | HTMLElement;

export const FormContext = React.createContext<{current: FormAPI}>({current: undefined});
FormContext.displayName = 'FormContext';

export interface FormAPI {
    fields?: { [key: string]: FieldOptions };
}
export type FieldOptions = Partial<{
    required: boolean | string;
    validators: ICustomValidation[];
    name: string;
    type: string;
    ref: Element;
  }>;


