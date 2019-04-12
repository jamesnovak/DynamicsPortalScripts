'use strict';
var Common;
(function (Common) {
    var utilities = (function () {
        function utilities() {
        }
        utilities.hideOptionSetValues = function (controlId, optionSetValue) {
            $("#" + controlId + " option[value=" + optionSetValue + "]").hide();
        };
        utilities.selectObjectById = function (elementId) {
            if (elementId.substr(0, 1) != "#") {
                elementId = "#" + elementId;
            }
            return $(elementId);
        };
        utilities.isNullOrUndefined = function (obj) {
            return ((obj === null) || (obj === undefined));
        };
        utilities.isNullUndefinedEmpty = function (obj) {
            switch (typeof (obj)) {
                case 'boolean':
                case 'number':
                    return false;
                case 'string':
                    obj = obj.trim();
                    break;
            }
            return (Common.utilities.isNullOrUndefined(obj) || (obj === ""));
        };
        utilities.trimTextArea = function (controlId) {
            var ctl = Common.utilities.selectObjectById(controlId);
            ctl.val(ctl.val().trim());
        };
        utilities.removeLeadingLineFeed = function (controlId) {
            var ctl = Common.utilities.selectObjectById(controlId);
            if (utilities.isNullOrUndefined(ctl)) {
                return;
            }
            var str = ctl.val();
            if (str != null) {
                str = str.replace(/^(\r\n\t|\n|\r\t)/, "");
                ctl.val(str);
            }
        };
        utilities.removeAllLeadingLineFeeds = function () {
            window.setTimeout(function () {
                $("textarea:not([readonly]):not([disabled])").each(function (i, val) {
                    Common.utilities.removeLeadingLineFeed(val.id);
                });
            }, 500);
        };
        utilities.elementExists = function (elementId) {
            var ctl = Common.utilities.selectObjectById(elementId);
            return (ctl.length > 0);
        };
        return utilities;
    }());
    Common.utilities = utilities;
})(Common || (Common = {}));
Common.utilities.removeAllLeadingLineFeeds();
