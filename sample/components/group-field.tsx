import * as React from "react"

type Props = {
    id: string;
    label: string;
}

type State = {
    errors?: any;
}

export class GroupField extends React.Component<Props, State> {

    public element:React.RefObject<any>;
    protected eventErrorsListener;

    constructor(props:Props, context:any) {
        super(props, context);
        this.element = React.createRef();

        this.state = {}
    }

    componentDidMount() {
        // Écoute l'événement.
        if (this.element.current) {
            this.eventErrorsListener = this.element.current.addEventListener('errors', (e: CustomEvent) => {
                console.log("event errors", e);
                let errors = this.state.errors || {};
                errors[`${e.detail.name}`] = e.detail.errors;
                this.setState({errors})
            }, true);
        }
    }

    componentWillUnmount() {
        if (this.element.current) {
            this.element.current.removeEventListener("errors", this.eventErrorsListener, false);   
        }
    }
    
    render():JSX.Element {
        const numberErrors = this.countErrors();

        return (
            <>
                <fieldset ref={this.element}>
                    <legend>{this.props.label + (numberErrors ?` - ${numberErrors} erreur(s)` : "")}</legend>
                    {this.props.children}
                </fieldset> 
            </>
        );
    }

    /**
     * Surcharge de la méthode
     * @param value
     * @returns {InputField}
     */
    setError(errors: any[]): void {
        this.setState({ errors });
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

    countErrors() {
        let number = 0;
        this.state.errors && Object.keys(this.state.errors).forEach(field => {number += this.state.errors[field] && this.state.errors[field].length});
        return number;
    }
}