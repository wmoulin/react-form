import { FormContext, FieldOptions } from "src/contexts/form-context";
import { useContext } from 'react';
import * as React from 'react';
import { useFormField } from 'src/hooks/use-form-field.js';
import { Class } from 'hornet-js-utils/src/typescript-utils';

export const RegisterField: Class<React.Component<any>> = (WrappedComponent: React.ComponentType<any>, props: any, fieldOptions?: FieldOptions) => {
    
    const displayName = WrappedComponent.displayName || WrappedComponent.name || "WrappedComponent";

  // Creating the inner component. The calculated Props type here is the where the magic happens.
  return () => {

    const formContext = useContext(FormContext);
    const { register } = useFormField();
    
      // this.props comes afterwards so the can override the default ones.
    return <WrappedComponent {...props} ref={(ref) => {register(ref, fieldOptions);}}/>;

  };
    
}
