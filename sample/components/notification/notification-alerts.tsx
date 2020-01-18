import * as React from "react";

/**
 * Propriétés D'un élément de message
 */
export interface AlertItemProps {
    title?: string;
    action: any;
    message: any;
    button: any;
    //active / désactive l'animation de l'alerte
    showed?: any;
}

/**
 * Composant MessageItem
 */
export class AlertItem extends React.Component<AlertItemProps, any> {

    render(): JSX.Element {
        return (
            <div className="notification__wrapper">
                <div
                    className="notification__close"
                    onClick={this.props.action}>
                </div>
                <div className={this.state.showed ? 'notification__info' : 'notification__info isHide'}>
                    {this.props.button}
                    <ul>
                        {this.props.message}
                    </ul>
                </div>
            </div>
        );
    }
}