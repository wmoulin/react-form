"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classNames = require("classnames");
require("src/sass/form.scss");
const React = require("react");
const i18n_utils_1 = require("hornet-js-utils/src/i18n-utils");
const hornet_js_utils_1 = require("hornet-js-utils");
const function_utils_1 = require("src/utils/function-utils");
const messages = require("src/ressources/messages.json");
const i18nMessages = hornet_js_utils_1.Utils.getCls("hornet.internationalization") || messages;
const logger = console;
exports.Form = (props) => {
    const [markRequired, setMarkRequired] = React.useState(props.markRequired || false);
    const fromElt = React.useRef(null);
    // TODO || I18nUtils.getI18n("calendar", undefined, i18nMessages)
    logger.debug("Form render : ", props.id);
    /*
     * RENDER
     * -----------------------------------------------------------------
     */
    /* La validation de formulaire HTML 5 est désactivée (noValidate="true") :
     on s'appuie uniquement sur la validation à la soumission et on a ainsi un rendu cohérent entre navigateurs. */
    const formProps = Object.assign(Object.assign({}, props), { method: "post", onSubmit: function_utils_1.debounce(props.onSubmit || (() => { }), 500), ref: fromElt });
    let formClass = {
        "form-content": true,
        "form-content-sticky": props.sticky
    };
    if (!formProps["encType"] && isMultiPartForm(props.children)) {
        formProps["encType"] = "multipart/form-data";
    }
    const textHtmlProps = {
        lang: props.textLang ? props.textLang : null,
    };
    return (React.createElement("section", { id: "form-content", className: classNames(formClass) },
        React.createElement("form", Object.assign({}, formProps),
            (props.subTitle || props.text
                || (markRequired && !props.isMandatoryFieldsHidden)) ?
                React.createElement("div", { className: "form-titles" },
                    props.subTitle ? React.createElement("h3", { className: "form-soustitre" }, props.subTitle) : null,
                    props.text ?
                        React.createElement("p", Object.assign({ className: "form-texte" }, textHtmlProps), props.text) : null,
                    markRequired ?
                        React.createElement("p", { className: "discret" }, i18n_utils_1.I18nUtils.getI18n("form.fillField", undefined, i18nMessages)) : null)
                : null,
            (props.children) ?
                React.createElement("div", { className: "form-content" }, props.children)
                : null)));
};
exports.Form.defaultProps = {
    sticky: false,
    markRequired: true,
    omitNull: true
};
exports.default = exports.Form;
/**
 * Méthode permettant de déterminer si le formulaire dispose d'un champ de type UploadFileField
 * Dans ce cas, on ajoute la propriété ["encType"] = "multipart/form-data" au formulaire
 * @param items composant enfants du Form
 * @returns {boolean} true si présence d'un input type='file'
 */
function isMultiPartForm(items) {
    let isMultiPart = false;
    React.Children.forEach(items, (child) => {
        if (!isMultiPart) {
            if (child != null) {
                if (child["props"] && child["props"].children) {
                    isMultiPart = isMultiPartForm(child["props"].children);
                }
                if (!isMultiPart && child.type === "file") {
                    isMultiPart = true;
                }
            }
        }
    });
    return isMultiPart;
}
//# sourceMappingURL=index.js.map