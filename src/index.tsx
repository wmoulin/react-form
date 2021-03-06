import * as classNames from "classnames";
import "./sass/form.scss";
import * as React from 'react';
import { I18nUtils } from "hornet-js-utils/src/i18n-utils";
import { Utils } from "hornet-js-utils";
import { debounce } from "./utils/debounce";
import { FormContext, FormAPI } from "./contexts/form-context";
import useExtractData from "./hooks/use-extract-data";
import useAjvValidator from "./hooks/ajv/use-ajv-validator";
import useNotifyAjvError from "./hooks/ajv/use-notify-ajv-error";
import { Notification } from '../sample/components/notification/notification';

const messages = require("./ressources/messages.json");
const i18nMessages = Utils.getCls("hornet.internationalization") || messages;

const logger = console;

export type FormProps = {
    sticky?: boolean;
    omitNull?: boolean;
    calendarLocale?: {dateFormat: any, timeZone: any};
    addMarkRequired?: boolean;
} | any;

export const Form: React.FC<FormProps> = (props: FormProps) => {
    
    const [markRequired, setMarkRequired] = React.useState(props.addMarkRequired || false);
    const fromElt = React.useRef(null);
    const apiRef = React.useRef({} as FormAPI);
    apiRef.current.form = fromElt as any;

    useAjvValidator(props.schema, props.validationOptions, props.customValidators, props.onBeforeSubmit, props.onSubmit, props.calendarLocale, apiRef);
    useNotifyAjvError(props.notifId, props.id, props.formMessages, apiRef);

    logger.debug("Form render : ", props.id);

    /*
     * RENDER
     * -----------------------------------------------------------------
     */
    /* La validation de formulaire HTML 5 est désactivée (noValidate="true") :
     on s'appuie uniquement sur la validation à la soumission et on a ainsi un rendu cohérent entre navigateurs. */
    const { omitNull , sticky, calendarLocale, addMarkRequired, ...domProps} = props;
    const formProps = {...domProps,
        method: "post",
        onSubmit: debounce(() => {
            logger.debug("Form validateAndSubmit : ", props.id);

            apiRef.current.validateAndSubmit()
        }, 300),
        ref: fromElt,
    };

    let formClass = {
        "form-content": true,
        "form-content-sticky": props.sticky
    }

    if ( !formProps["encType"] && isMultiPartForm(props.children)) {
        formProps["encType"] = "multipart/form-data";
    }
    
    const textHtmlProps = {
        lang: props.textLang ? props.textLang : null,
    };

    useExtractData(apiRef);
    
    return (
        <section id={`${props.id}-form-content`} className={classNames(formClass)}>
            <FormContext.Provider value={apiRef}>
                <Notification id={`${props.id}-form-notification`} >
                    <form {...formProps} >
                        {(props.subTitle || props.text
                            || (markRequired && !props.isMandatoryFieldsHidden)) ?
                            <div className="form-titles">
                                {props.subTitle ? <h3 className="form-soustitre">{props.subTitle}</h3> : null}
                                {props.text ?
                                    <p className="form-texte" {...textHtmlProps}>{props.text}</p> : null}
                                {markRequired ?
                                    <p className="discret">{I18nUtils.getI18n("form.fillField", undefined, i18nMessages)}</p> : null}
                            </div>
                            : null}
                        {(props.children) ?
                            <div className="form-content">
                                {props.children}
                            </div>
                            : null}
                    </form>
                </Notification>
            </FormContext.Provider>
        </section>
    );
};

Form.defaultProps = {
    sticky: false,
    addMarkRequired: true,
    omitNull: true
} as Partial<FormProps>;

export default Form;

/**
 * Méthode permettant de déterminer si le formulaire dispose d'un champ de type UploadFileField
 * Dans ce cas, on ajoute la propriété ["encType"] = "multipart/form-data" au formulaire
 * @param items composant enfants du Form
 * @returns {boolean} true si présence d'un input type='file'
 */
function isMultiPartForm(items: React.ReactChild[]): boolean {

    let isMultiPart: boolean = false;

    React.Children.forEach(items, (child: React.ReactChild) => {
        if (!isMultiPart) {
            if (child != null) {
                if (child["props"] && child["props"].children) {
                    isMultiPart = isMultiPartForm(child["props"].children);
                }
                if (!isMultiPart && (child as any).type === "file") {
                    isMultiPart = true;
                }
            }
        }
    });

    return isMultiPart;
}

   