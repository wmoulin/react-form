import * as classNames from "classnames";
import * as React from "react";
import * as _ from "lodash";

import { TabList } from "./tab-list";
import { TabPanels } from "./tab-panels";

import "./sass/tabs.scss";

export interface TabsLiteProps extends React.HTMLAttributes<HTMLDivElement> {
    /** onglet actif par defaut */
    defaultTab?: number;
    /** onglet actif */
    activeTab?: number | string;
    /** fonction appelée au changement du tab */
    onTabChange?: (newTabIndex: number) => void;
    /** description */
    description?: string;
    /** fonction appelée avant qu'un table passe de visible a hidden */
    beforeHideTab?: (index?: number) => void;
    /** fonction appelée après qu'un table passe de hidden a visible */
    afterShowTab?: (index?: number) => void;
    /** fonction d'ajout de tab */
    addTabFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void | void | Function;
    /** titre du bouton d'ajout */
    addButtonTitle?: string;
    /** fonction de suppression de tab */
    deleteTabFunction?: (event: React.MouseEvent<HTMLButtonElement>) => void | void | Function;
    /** titre du bouton de suppression */
    deleteButtonTitle?: string;
}

export interface TabsLiteState {
    activeTab: number | string;
    errors: number;
}

const noop = () => {};

const listen = function(index, evt) {
    this.setActiveTab(index, () => (evt.srcElement || evt.target).focus());
    var elem = evt.srcElement || evt.target;
    console.log("focus: " + (elem as any).name);
};

export class TabsLite extends React.Component<TabsLiteProps, any> {

    /**tableau des ref des tabListItem */
    tabRefs : HTMLElement[] = [];
    /**tableau des ref des tabPanel */
    tabPanelRefs : HTMLElement[] = [];
    /**tableau des ref des tabPanel */
    tabPanelListener : Function[] = [];
    /**tableau des erreurs par tab
     * (true si il ya des erreurs, false sinon) */
    tabErrors : boolean[] = [];

    tabContainrerPanelRefs : HTMLElement;

    static defaultProps = {
        defaultTab: 0,
        onTabChange: noop,
        id: "tabs"};

    /**
     * @inheritdoc
     */
    constructor(props?: TabsLiteProps, context?: any) {
        super(props, context);

        this.state = {
            ...this.state,
            activeTab: this.getActiveTab({ activeTab: this.props.defaultTab }),
            errors: []};
    }

    /**
     * @inheritdoc
     */
    componentDidMount() {
        this.tabContainrerPanelRefs && this.tabContainrerPanelRefs.addEventListener("ADD_NOTIFICATION_EVENT", this.handleNotificationEvent)
        this.tabContainrerPanelRefs && this.tabContainrerPanelRefs.addEventListener("CLEAN_NOTIFICATION_EVENT", this.handleNotificationEvent)
        this.tabContainrerPanelRefs && this.tabContainrerPanelRefs.addEventListener("CLEAN_ALL_NOTIFICATION_EVENT", this.handleNotificationEvent)
    }

    /**
     * @inheritDoc
     */
    componentWillUnmount() : void {
        this.tabContainrerPanelRefs && this.tabContainrerPanelRefs.removeEventListener("ADD_NOTIFICATION_EVENT", this.handleNotificationEvent);
        this.tabContainrerPanelRefs && this.tabContainrerPanelRefs.removeEventListener("CLEAN_NOTIFICATION_EVENT", this.handleNotificationEvent);
        this.tabContainrerPanelRefs && this.tabContainrerPanelRefs.removeEventListener("CLEAN_ALL_NOTIFICATION_EVENT", this.handleNotificationEvent);
    }

    /**
     * indique si le tabs possède un onglet actif
     */
    isActiveTabControlled = () : boolean => {
        return this.props.activeTab !== undefined;
    }

    /**
     * retourne l'onglet actif
     */
    getActiveTab = (state = this.state, props = this.props) => {
        return this.isActiveTabControlled() ? props.activeTab : state.activeTab;
    }

    /**
     * change l'onglet actif
     * @param index index de l'onglet a activé
     */
    setActiveTab = (index: number, afterShowTab: Function = noop) : void => {
        const correctedTabIndex = index > this.tabRefs.length - 1 ? 0 : index < 0 ? this.tabRefs.length - 1 : index;
        const cb =
            this.getActiveTab() === correctedTabIndex
                ? noop
                : () => {
                      this.props.onTabChange(correctedTabIndex);
                      this.setFocusOnTab();
                      afterShowTab();
                      if (this.props.afterShowTab) this.props.afterShowTab(index);
                  };
        if (this.props.beforeHideTab) this.props.beforeHideTab(index);
        this.setState({ activeTab: correctedTabIndex }, cb);
    }

    /**
     * mets le focus sur l'onglet actif
     */
    setFocusOnTab = (): void => {
        if (this.tabRefs[this.state.activeTab]) {
            this.tabRefs[this.state.activeTab].focus();
        }
    }

    /**
     * gestion de la navigation clavier
     */
    keyDownHandlers = {
        ArrowRight() {
            this.setActiveTab(this.state.activeTab + 1);
        },
        ArrowLeft() {
            this.setActiveTab(this.state.activeTab - 1);
        },
        Home() {
            this.setActiveTab(0);
        },
        End() {
            this.setActiveTab(this.tabRefs.length - 1);
        },
    };

    onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) : void => {
        if (this.keyDownHandlers[event.key]) {
            this.keyDownHandlers[event.key].call(this, event);
        }
    }

    /**
     * retourne les props de la div container
     */
    getContainerProps() : any {
        const { className, defaultTab, activeTab, description, onTabChange, ...rest } = _.omit(this.props, [
            "addTabFunction",
            "addButtonTitle",
            "deleteTabFunction",
            "deleteButtonTitle"]);

        return {
            ...rest,
            className: classNames("tabs-lite", className),
        };
    }

    /**
     * Références des tabsListItems
     * @param ref référence
     * @param index index du tabListItem
     */
    tabRef = (ref: HTMLElement, index: number) : void => {
        this.tabRefs[index] = ref;
        
    }

    /**
     * Références des tabPanel
     * @param ref référence
     * @param index index du tabPanel
     */
    tabPanelRef = (ref: HTMLElement, index: number) : void => {
        if(!ref && this.tabPanelRefs[index]) {
            this.tabPanelRefs[index].removeEventListener('focus', this.tabPanelListener[index] as any, true);
        }
        this.tabPanelRefs[index] = ref;
        this.tabPanelListener[index] = listen.bind(this, index);
        ref && ref.addEventListener('focus', this.tabPanelListener[index] as any, true);
    }

    /**
     * retourne un tableau de référence des tabListItem
     */
    getTabsRef() : HTMLElement[] {
        return this.tabRefs;
    }

    /**
     * retourne un tableau de référence des tabPanel
     */
    getTabsPanelRef() : HTMLElement[] {
        return this.tabPanelRefs;
    }

    /**
     * @inheritdoc
     */
    render(): JSX.Element {
        const { id, children, description } = this.props;
        const activeTab = this.getActiveTab();

        return (
            <div {...this.getContainerProps()} ref={this.tabContainrerPanelRefs}>
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        let props = { ...child.props };
                        if (child.type === TabList) {
                            props = {
                                ...child.props,
                                id,
                                activeTab,
                                "aria-label": description,
                                onTabClick: this.setActiveTab,
                                onTabKeyDown: this.onKeyDown,
                                tabRef: this.tabRef,
                                deleteTabFunction: this.props.deleteTabFunction,
                                deleteButtonTitle: this.props.deleteButtonTitle,
                                addTabFunction: this.props.addTabFunction,
                                addButtonTitle: this.props.addButtonTitle,
                                errors: this.state.errors,
                                tabErrors: this.tabErrors};
                        } else if (child.type === TabPanels) {
                            props = { ...child.props, id, activeTab , tabRef: this.tabPanelRef};
                        }

                        return <child.type {...props} />;
                    }

                    return child;
                })}
            </div>
        );
    }

    /**
    * Gère les notifications en calculant le nombre d'erreurs pour chaque tab
    * @param {HornetEvent} ev
    */
    protected handleNotificationEvent(ev: any) {

        // on va boucler sur tous les tabs pour rechercher les champs en erreur
        this.tabPanelRefs.map((element, index) => {
            let errors: number = 0;
            if (ev && ev.detail && ev.detail.errors && ev.detail.errors.notifications) {
                ev.detail.errors.notifications.map((error) => {
                    // recherche de l'élément en erreur à travers son attribut name
                    const fieldInError = document.getElementsByName(error.field);
                    if (fieldInError && fieldInError[ 0 ] != null) {
                        const elt = fieldInError[ 0 ];
                        if (elt && elt.dataset && elt.dataset.tabindex &&
                            parseInt(elt.dataset.tabindex, 10) === index) {
                            errors += 1;
                        }
                    }
                });
            }
            if (errors > 0) {
                this.tabRefs[index].setAttribute("data-badge", errors.toString());
                if (this.tabRefs[index]["className"].indexOf(" badge-selected-items-before-tab") < 0) {
                    this.tabRefs[index]["className"] += " badge-selected-items-before-tab";
                }
                this.tabErrors[index] = true;
            }else {
                if (this.tabRefs[index]["className"].indexOf(" badge-selected-items-before-tab") >= 0) {
                    this.tabRefs[index]["className"].replace(" badge-selected-items-before-tab", "");
                }
                this.tabErrors[index] = false;
            }
        });
    }
}