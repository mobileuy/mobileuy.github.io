function removeQuotes(string) {
    if (typeof string === 'string' || string instanceof String) {
        string = string.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
    }
    return string;
}

function getBreakpoint(element) {
    var style = null;
    if ( window.getComputedStyle && window.getComputedStyle(element, '::before') && window.getComputedStyle(element, '::before').content != "" ) {
        style = window.getComputedStyle(element, '::before');
        style = style.content;
    } else {
        if (typeof window.getComputedStyle === "undefined") {
            window.getComputedStyle = function (el) {
                this.el = el;
                this.getPropertyValue = function (prop) {

                    var style = el.currentStyle || el.style;

                    if (typeof prop === "undefined" || typeof style === "undefined") {
                        return null;
                    }

                    var re = /(\-([a-z]){1})/g;
                    if (re.test(prop)) {
                        prop = prop.replace(re, function () {
                            return arguments[2].toUpperCase();
                        });
                    }
                    return style[prop] ? style[prop] : null;
                };
                return this;
            }
        }
        style = window.getComputedStyle(document.getElementsByTagName('head')[0]);
        style = style.getPropertyValue('font-family');
    }

    style = style || "{}";
    return JSON.parse(removeQuotes(style));
}