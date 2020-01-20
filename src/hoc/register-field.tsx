import { FormContext, FieldOptions } from "src/contexts/form-context";
import { useContext, useEffect, useRef } from 'react';
import * as React from 'react';
import { useFormField } from 'src/hooks/use-form-field';
import { Class } from 'hornet-js-utils/src/typescript-utils';

export const RegisterField: Class<React.Component<any>> = (WrappedComponent: React.ComponentType<any>, props: any, fieldOptions?: FieldOptions<any>) => {
    
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "WrappedComponent";
  const refContainer = useRef();
  
  // Creating the inner component. The calculated Props type here is the where the magic happens.
  return () => {
    
    const formContext = useContext(FormContext);
    const { register, unregister } = useFormField();

    useEffect(() => {
      return () => {
        unregister(refContainer.current, fieldOptions);
      };
    });

    // this.props comes afterwards so the can override the default ones.
    return <WrappedComponent {...props} ref={(ref) => {refContainer.current = ref; register(ref, fieldOptions);}}/>;

  };
    
}
