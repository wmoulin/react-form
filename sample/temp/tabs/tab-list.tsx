import * as classNames from "classnames";
import * as React from "react";

const noop = () => {};

type TabListProps = React.HTMLAttributes<HTMLDivElement> & {
    activeTab?: number | string;
    onTabClick?: (index: number) => void;
    onTabKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    tabRef?: (ref: HTMLElement, index: number) => void;
    addTabFunction?:  (event: React.MouseEvent<HTMLButtonElement>) => void | void | Function ;
    addButtonTitle?: string;
    deleteButtonTitle?: string
    deleteTabFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void | void | Function;
    tabErrors?: boolean[];
};

export type TabListItemProps = {
    name?: string;
    isActive?: boolean;
    tabRef?: (ref) => void;
    isDeletable?: boolean;
    deleteButtonTitle?: string
    deleteTabFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void | void | Function;
    errors?: number;
};

export const TabListView: React.SFC<TabListProps> = ({ id, activeTab, onTabClick, onTabKeyDown, tabRef,
     addTabFunction, addButtonTitle, deleteButtonTitle, deleteTabFunction, tabErrors= [], children, ...rest }) => (
    <div role="tablist" id={`${id}-tablist`} {...rest}>
        {React.Children.map(children, (child, index) => {
            if (React.isValidElement<any>(child)) {
                const isActive = typeof activeTab === "number" ? index === activeTab : child.props.name === activeTab;
                const props = {
                    ...child.props,
                    id: `${id}-tab-${index}`,
                    role: "tab",
                    tabIndex: isActive ? 0 : -1,
                    className: classNames({ active: isActive, "badge-selected-items-before-tab" : tabErrors[index] }),
                    "aria-selected": isActive,
                    onClick: () => {
                        onTabClick(index);
                    },
                    onKeyDown: onTabKeyDown,
                    tabRef: (ref) => {
                        tabRef(ref, index);
                    },
                    isActive,
                    deleteButtonTitle,
                    deleteTabFunction};

                return <child.type {...props} />;
            }
            return child;
        })}
        {addTabFunction ?
            <button className={"tabs-add-button test-tabs-add-button"}
                type={"button"}
                title={addButtonTitle ? addButtonTitle : null}
                onClick={addTabFunction}
                id={`${id}-tab-add-button`}
            >
                <span className={"tabs-button-label"}>
                    {addButtonTitle ? addButtonTitle : null}
                </span>
            </button>
            : null}
    </div>
);

export class TabList extends React.Component<any, any> {

    static defaultProps = {
        tabRef: noop,
        onTabClick: noop,
    };

    /**
     * @inheritdoc
     */
    render() {
        return(
            <TabListView {...this.props}/>
        );
    }
}
