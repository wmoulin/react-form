import { FormContext } from "src/contexts/form-context";
import { useContext } from 'react';

export function useFormField(name, validator, field) {
    const formContext = useContext(FormContext);
    formContext.current.fields[name] = {validator, field};
}