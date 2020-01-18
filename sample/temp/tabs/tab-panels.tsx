import * as React from "react";

type TabPanelsProps = React.HTMLAttributes<HTMLDivElement> & {
    activeTab?: number | string;
    tabRef?: (ref, index: number) => void;
};

export const TabPanelsView: React.SFC<TabPanelsProps> = ({ id, activeTab, tabRef, children, ...rest }) => (
    <div id={`${id}-tab-panels`} {...rest}>
        {React.Children.map(children, (child, index) => {
            if (React.isValidElement<any>(child)) {
                return React.cloneElement(child as any, {
                    role: "tabpanel",
                    isActive: typeof activeTab === "number" ? index === activeTab : child.props.name === activeTab,
                    index,
                    id,
                    tabRef: (ref: HTMLElement) => {
                        tabRef(ref, index);
                    }},
                );
            }

            return child;
        })}
    </div>
);

export class TabPanels extends React.Component<any, any> {
    render() {
        return(
            <TabPanelsView {...this.props}/>
        );
    }
}
