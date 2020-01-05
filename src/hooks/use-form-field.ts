import { FormContext } from "src/contexts/form-context";
import { useContext } from 'react';

export function useFormField(name, validators, ref) {
    const formContext = useContext(FormContext);
    formContext.current.fields[name] = {validators, ref};
}