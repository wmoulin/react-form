import { FormContext, FieldOptions } from "src/contexts/form-context";
import { useContext } from 'react';
import  isNullOrUndefined from 'src/utils/is-null-or-undefined';

const isWindowUndefined = typeof window === undefined;

export function useFormField() {
    const formContext = useContext(FormContext);
    
    function register<Element>(
        fieldOptions?: FieldOptions,
      ): (ref: Element | null) => void;
    function register<Element>(
        ref: Element | null,
        fieldOptions?: FieldOptions,
      ): ((ref: Element | null) => void) | void {
        if (isWindowUndefined) {
          return;
        }
    
        if (!isNullOrUndefined(ref)) {
          registerFieldsRef(ref as any, fieldOptions);
          return;
        }
    
        return (ref: Element | null) =>
          ref && registerFieldsRef(ref as any, fieldOptions);
    }

    function registerFieldsRef(
        ref: ValueElement,
        fieldOptions: FieldOptions = {},
      ): void {
        if (!ref.name) {
          return console.warn('Missing name @', ref);
        }
    
        const { name, type, value } = ref;
        const fieldAttributes = {
          ref,
          ...fieldOptions,
        };
        
        formContext.current.fields[name] = fieldAttributes;
    
    
      }
}

  export interface ValueElement extends Element {
    name?: string;
    type?: string;
    value?: string;
    checked?: boolean;
    options?: any;
  }



