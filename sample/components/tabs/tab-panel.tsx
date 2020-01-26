import * as React from "react";

type TabPanelProps = React.HTMLAttributes<HTMLDivElement> & {
    name?: string;
    isActive?: boolean;
    tabRef?: (ref: any) => void;
    index?: number;
    divId?: string;
};

export const TabPanelView : React.SFC<TabPanelProps> = ({ id, children, isActive, tabRef, index, divId, ...rest }) => {
    const panelStyle : React.CSSProperties = isActive ? {} : { position: "absolute", top: -9999, left: -9999};
    return (<div
        tabIndex={-1}
        aria-labelledby={`${id}-tab-${index}`}
        //hidden={!isActive}
        style={panelStyle}
        ref={tabRef} {...rest} id={divId}>
        {React.Children.map(children, (child: any) => {return typeof child === "object" ? React.cloneElement(child) : child})}
    </div>)
};

export class TabPanel extends React.Component<TabPanelProps, any>{

    /**
     * @inheritdoc
     */
    render() {
        return(
            <TabPanelView {...this.props} divId={this.getPanelId()}/>
        );
    }

    /**
     * retourne l'identifiant du panel
     */
    getPanelId() {
        return `${this.props.id}-tab-${this.props.index}-tabpanel`;
    }

    /**
     * @inheritdoc
     */
    componentDidMount() {
        //this.trackInputFieldFromChildren(document.getElementById(this.getPanelId()));
    }

    /**
     * Méthode permettant d'ajout des attributs permettant de mapper un onglet à un champ
     * @param node Element HTML
     */
    protected trackInputFieldFromChildren(node) {
        if (node) {
            if (Array.isArray(node)) {
                node.forEach(element => {
                    this.trackInputFieldFromChildren(element);
                });
            } else {
                if ((node.localName === "input" || node.localName === "textarea") && !node.hidden) {
                    node.setAttribute("data-tabId", this.getPanelId());
                    node.setAttribute("data-tabIndex", this.state.index);
                } else if (node.children) {
                    this.trackInputFieldFromChildren(node.children);
                } else if (node instanceof HTMLCollection) {
                    for (let i = 0; i < node.length; i++) {
                        this.trackInputFieldFromChildren(node[i]);
                    }
                }
            }
        }
    }
}
