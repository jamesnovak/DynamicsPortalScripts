/// <reference path="../typings/jquery/jquery.d.ts"/>

'use strict';

namespace Common {
    /**
     * Primary class for utility methods
     * */
    export class utilities {

        /**
         * Function that hides optionset values in the portal
         * @param controlId target control for the OptionSet 
         * @param optionSetValue OptionSet value to hide
         */

        public static hideOptionSetValues(controlId: string, optionSetValue: string)
        {
            $("#" + controlId + " option[value=" + optionSetValue + "]").hide();
        }

        /** Wrapper for selecting an element in JQuery, will ensure that the element Id has a #prefix
        *   @param {string} elementId html element being selected
        *   @return {JQuery}
        **/
        public static selectObjectById(elementId: string): JQuery {
            if (elementId.substr(0, 1) != "#") {
                elementId = "#" + elementId;
            }
            return $(elementId);
        }

        /** Helper method that will check to see if a value is either null or undefined
        * @param {string} obj object being validated
        * @return {boolean}
        **/
        public static isNullOrUndefined(obj: any): boolean {
            return ((obj === null) || (obj === undefined));
        }

        /** Helper method that will check to see if a value is either null, undefined, or an empty string
        * @param {string} obj object being validated
        * @return {boolean}
        **/
        public static isNullUndefinedEmpty(obj: any): boolean {

            switch (typeof (obj)) {
                case 'boolean':
                case 'number':
                    return false;
                case 'string':
                    obj = obj.trim();
                    break;
            }

            return (Common.utilities.isNullOrUndefined(obj) || (obj === ""));
        }

        /**
         * Helper method to trim leading and trailing spaces from an element, like text area
         * @param controlId
         */
        public static trimTextArea(controlId: string): void {
            var ctl: JQuery = Common.utilities.selectObjectById(controlId);
            ctl.val(ctl.val().trim());
        }

        /**
         * Helper method to remove the extraneous line feed added to a text box by the portal
         * @param controlId
         */
        public static removeLeadingLineFeed(controlId: string): void {

            var ctl: JQuery = Common.utilities.selectObjectById(controlId);

            // ignore disabled/readonly
            if (utilities.isNullOrUndefined(ctl)) {
                return;
            }
            var str: string = ctl.val();
            if (str != null) {
                str = str.replace(/^(\r\n\t|\n|\r\t)/, "");
                ctl.val(str);
            }
        }

        /**
         * Removes extra line feeds on all text boxes on load.
         */
        public static removeAllLeadingLineFeeds() {
            // 
            window.setTimeout(function () {
                $("textarea:not([readonly]):not([disabled])").each((i, val) => {
                    Common.utilities.removeLeadingLineFeed(val.id);
                });
            },
            500);
        }

        /** Helper method to check if element in page exists 
        * @return {boolean}
        **/
        public static elementExists(elementId):boolean {
            // make sure the control exists~
            var ctl: JQuery = Common.utilities.selectObjectById(elementId);

            return (ctl.length >  0);
        }
    }
}

// apply some general clean up across the board 
Common.utilities.removeAllLeadingLineFeeds();
