import startswith = require ("lodash.startswith");
import endswith = require ("lodash.endswith");
import * as React from "react";

import "./sass/icons.scss";
import "./sprite/sprites.svg";

export interface SvgSpritesProps {
    icon: string;
    width?: string;
    height?: string;
    url?: string;
    color?: string;
    classAdded?: string;
    tabIndex?: number;
    ariaLabel?: string;
}

/**
 * Class permettant d'afficher un ico svg précis
 * 
 */
export class SvgSprites extends React.Component<SvgSpritesProps, any> {
    static defaultProps = {
        url: "/img/sprites.svg",
        height: '1.7em',
        width: '1.7em',
        color: '#FFF',
        tabIndex: 0
    };

    render() {
        const urlSprite = this.genUrlStatic(this.props.url);
        const aria = this.props.ariaLabel ? this.props.ariaLabel : "";

        return (
            <svg
                height={this.props.height}
                width={this.props.width}
                viewBox='0 0 24 24'
                className={`icon icon-${this.props.icon} ${ this.props.classAdded ? this.props.classAdded : "" }`}
                fill={this.props.color}
                tabIndex={this.props.tabIndex}
                aria-hidden="true"
                aria-label={ aria }>
                    <use xlinkHref={`${urlSprite}#ico-${this.props.icon}`} />
            </svg>
        );
    }

    genUrlStatic(path: string):string {
        let retour = path;

        const contextPath = "";
        if (startswith(path, "/") && !startswith(path, contextPath)) {
            // On ne prend que les urls relatives à la racine (=> commence par "/")
            // On ne concatène que lorsque ca ne commence pas déja par le contextPath
            retour = contextPath + "" + path;
        }

        if (endswith(retour, "/")) {
            // On enlève toujours le dernier slash
            retour = retour.substr(0, retour.length - 1);
        }

        return retour;
    }
}