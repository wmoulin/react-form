import { HornetProps } from "src/widget/form/abstract-field";
import { HtmlAttributes } from "src/widget/form/html-const-attributes";
import assign = require("lodash.assign");

/**
 * Object contenant toutes les propriétés standards HTML définies dans HornetHTMLAttributes.
 * Sert à vérifier si une propriété est une propriété standard HTML.
 */
export const HTML_ATTRIBUTES: HornetProps = assign(
    HtmlAttributes.HTML_NON_STANDARD_ATTRIBUTES,
    HtmlAttributes.HTML_RDFA_ATTRIBUTES, HtmlAttributes.HTML_STANDARD_CONFIG_ATTRIBUTES,
    HtmlAttributes.HTML_STANDARD_PRESENTATION_ATTRIBUTES, HtmlAttributes.HTML_STANDARD_FORM_ATTRIBUTES,
    HtmlAttributes.HTML_STANDARD_GLOBAL_ATTRIBUTES, HtmlAttributes.HTML_STANDARD_MEDIA_ATTRIBUTES,
    HtmlAttributes.HTML_STANDARD_META_ATTRIBUTES,
    HtmlAttributes.REACT_CLIPBOARD_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_COMPOSE_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_FOCUS_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_FORM_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_IMAGE_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_KEYBOARD_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_MEDIA_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_BASIC_MOUSE_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_DRAG_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_SELECT_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_TOUCH_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_SCROLL_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_WHEEL_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_ANIMATION_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_TRANSITION_DOM_ATTRIBUTES,
    HtmlAttributes.REACT_BASIC_DOM_ATTRIBUTES);
