"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classnames_1 = require("classnames");
require("src/sass/form.scss");
const logger = console;
function Form(props) {
    const theme = useContext(ThemeContext);
    const classes = {
        form: true,
        clear: true,
        /* Application du style CSS readonly à tout le bloc lorsque tous les champs sont en lecture seule */
        readonly: this.state.readOnly,
    };
    logger.debug("Form render : ", this.state.id);
    /* La validation de formulaire HTML 5 est désactivée (noValidate="true") :
     on s'appuie uniquement sur la validation à la soumission et on a ainsi un rendu cohérent entre navigateurs. */
    const formProps = {
        props, : .id,
        props, : .name,
        className: this.state.className,
        method: "post",
        onSubmit: this._submitHornetForm,
        noValidate: true,
        onChange: this.state.onFormChange ? this.state.onFormChange : undefined,
        ref: this.registerForm,
    };
    let formClass = 'form-content';
    if (this.isMultiPartForm(this.state.children)) {
        formProps["encType"] = "multipart/form-data";
    }
    if (this.state.isSticky) {
        formClass += ' form-content-sticky';
    }
    const textHtmlProps = {
        lang: this.props.textLang ? this.props.textLang : null,
    };
    // hook for filter html standards props 
    return (React.createElement("section", { id: "form-content", className: formClass },
        React.createElement("div", { className: classnames_1.default(classes) },
            React.createElement("form", Object.assign({}, htmlProps, formProps),
                (this.state.subTitle || this.state.text
                    || (this.state.markRequired && !this.state.isMandatoryFieldsHidden)) ?
                    React.createElement("div", { className: "form-titles" },
                        this.state.subTitle ? React.createElement("h3", { className: "form-soustitre" }, this.state.subTitle) : null,
                        this.state.text ?
                            React.createElement("p", Object.assign({ className: "form-texte" }, textHtmlProps), this.state.text) : null,
                        this.state.markRequired && !this.state.isMandatoryFieldsHidden ?
                            React.createElement("p", { className: "discret" }, this.i18n("form.fillField")) : null)
                    : null,
                (this.state.children) ?
                    React.createElement("div", { className: "form-content" },
                        React.createElement("div", null, this.state.children))
                    : null))));
}
exports.default = Form;
Form.defaultProps;
FormProps = {
    sticky: false,
};
//# sourceMappingURL=index.js.map