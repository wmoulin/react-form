import * as React from "react"
import { FormContext } from 'src/contexts/form-context';

export interface Props {
    id: string;
    label: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    value?: string;
    defaultValue?: string;
}
export interface State {
    value?: string;
    valued?: boolean;
    errors?: any[];
}

export class InputField extends React.Component<Props, State> {

    //static contextType = FormContext;
    public element;
    constructor(props:Props, context:any) {
        super(props, context);
        this.state = {
            value: this.props.value
        }
        this.element = React.createRef();
    }
    
    render():JSX.Element {
        return (
            <>
                <label htmlFor={this.props.id} id={this.props.id + "Label"} className="label-content" >
                    {this.props.label}
                </label>
                <input type={"text"} required={this.props.required} disabled={this.props.disabled} readOnly={this.props.readonly}
                value={this.state.value} defaultValue={this.props.defaultValue} ref={this.element}></input>
                {this.renderError()}
            </>
        );
    }

    /**
     * Surcharge de la méthode
     * @param value
     * @returns {InputField}
     */
    getCurrentValue(): any {
        return this.state.value;
    }

    /**
     * Surcharge de la méthode
     * @param value
     * @returns {InputField}
     */
    setCurrentValue(value: any): void {
        this.setState({ value, valued: (value !== "" && value) });
    }

    /**
     * Surcharge de la méthode
     * @param value
     * @returns {InputField}
     */
    setErrors(errors: any[]): void {
        this.setState({ errors }, () => {
            this.element.current.dispatchEvent(new CustomEvent('errors', { 'detail': {errors, name: this.props.name} }));
        });
    }

    renderError(): JSX.Element {
        return (
            this.state.errors && this.state.errors.length > 0 ?
                <div className="fielderror-container">
                    {this.state.errors.map((error: any, i: number) => {
                        return <div key={error.id} className="fielderror-content formmgr-message-text"
                            id={`${this.props.id}-${i}-error`}>{error.text}</div>;
                    })}
                </div> : null
        );
    }
}