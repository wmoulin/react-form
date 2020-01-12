import { FormContext, FieldOptions } from "src/contexts/form-context";
import { useContext } from 'react';
import  isNullOrUndefined from 'src/utils/is-null-or-undefined';

const isWindowUndefined = typeof window === undefined;

export function useFormField() {
    const formContext = useContext(FormContext);
    
    return {
      register: function<Element>(
          ref?: Element | null,
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
      },
      unregister: function<Element>(
        ref?: Element | null,
        fieldOptions?: FieldOptions,
      ): ((ref: Element | null) => void) | void {
        if (isWindowUndefined) {
          return;
        }
    
        if (!isNullOrUndefined(ref)) {
          unregisterFieldsRef(ref as any, fieldOptions);
          return;
        }
    
        return (ref: Element | null) =>
          ref && unregisterFieldsRef(ref as any, fieldOptions);
      }
    }

    function registerFieldsRef(
        ref: ValueElement,
        fieldOptions: FieldOptions = {},
      ): void {
        let name = "";
        if (ref.name) {
          name = ref.name;
        } else if (fieldOptions.name) {
          name = fieldOptions.name;
        } else {
          return console.warn('Missing name @', ref);
        }
    
        const { type, value } = ref;
        const fieldAttributes = {
          ref,
          ...fieldOptions,
        };
        if(!formContext.current.fields) formContext.current.fields = {};
        formContext.current.fields[name] = fieldAttributes;
    
    
    }
    function unregisterFieldsRef(
        ref: ValueElement,
        fieldOptions: FieldOptions = {},
      ): void {
        let name = "";
        if (ref.name) {
          name = ref.name;
        } else if (fieldOptions.name) {
          name = fieldOptions.name;
        } else {
          return console.warn('Missing name @', ref);
        }
        if(!formContext.current.fields[name]) {
          return console.warn('Missing field in FormContext with name', name);
        }
        delete formContext.current.fields[name];
    
    }
}

  export interface ValueElement extends Element {
    name?: string;
    type?: string;
    value?: string;
    checked?: boolean;
    options?: any;
  }



