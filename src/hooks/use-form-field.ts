import { useContext, useCallback, useRef } from 'react';
import { FormContext, FieldOptions } from "src/contexts/form-context";
import  isNullOrUndefined from 'src/utils/is-null-or-undefined';

const isWindowUndefined = typeof window === undefined;

export function useFormField(/*name, validators, ref*/) {

    const formContext = useContext(FormContext);
    //formContext.current.fields[name] = {validators, ref};
    //const fieldsRef = useRef< { [key: string]: FieldOptions }>({});

    //function register(fieldOptions: FieldOptions | Element | null): ((ref: Element | null) => void) | void;
    function register(ref?: Element | null, fieldOptions?: FieldOptions): ((ref: Element | null) => void) | void {
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
      let name = ref.name || ref.props.name || fieldOptions.name;
      if (!name) {
        return console.warn('Missing name @', ref);
      }
  
      const { type, value } = ref;
      const fieldAttributes = {
        ref,
        ...fieldOptions,
      };
      if(!formContext.current.fields) formContext.current.fields = {};
      formContext.current.fields[name] = fieldAttributes;
      //fieldsRef.current.fields[name] = fieldAttributes;
  
    }

    function unregister(
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

    return {
        register/*: useCallback(register, []),*/,
        unregister
    };
}

export interface ValueElement extends Element {
    name?: string;register
    type?: string;
    value?: string;
    checked?: boolean;
    options?: any;
    props?: any;
}