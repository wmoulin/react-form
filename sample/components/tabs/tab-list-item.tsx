import * as React from "react";

import { TabListItemProps } from "./tab-list";

export const TabListItemView: React.SFC<React.HTMLAttributes<HTMLButtonElement> & TabListItemProps> = ({ isDeletable, deleteButtonTitle,
     deleteTabFunction, isActive, errors, tabRef, children, ...rest }) => {
    const deleteButtonClasses = isActive ? "delete-tab-button delete-tab-button-selected" : "delete-tab-button";

    return (
        <React.Fragment>
            <button ref={tabRef} type={"button"} aria-controls={`${rest.id}-tabpanel`} {...rest}>
                {children}
            </button>
            {isDeletable ?
                    <button id={`${rest.id}-tab-delete-tab-button`}
                        type={"button"}
                        className={deleteButtonClasses}
                        onClick={deleteTabFunction}
                        title={deleteButtonTitle ? deleteButtonTitle : null}
                    >
                        <span className={"tabs-button-label"}>
                            {deleteButtonTitle ? deleteButtonTitle : null}
                        </span>
                    </button> : null}
        </React.Fragment>
    );
};

export class TabListItem extends React.Component<any, any> {
    render() {
        return(
            <TabListItemView {...this.props}/>
        );
    }
}
