/// <reference path="../typings/jquery/jquery.d.ts"/>

/** Class containing common utilties */


'use strict';
/**
 * Overall namespace containing the various script classes:
 * Common.[[utilities]]
 * Common.[[ui]]
 * Common.[[validators]]
 * */
namespace Common {
    /**
     * Primary class for utility methods
     * */
    export class utilities {

        //funciton that hides optionset values in the portal

        public static hideOptionSetValues(controlId: string, optionSetValue: string)
        {
            $("#" + controlId + " option[value=" + optionSetValue + "]").hide();
        }

        // Function that sets a local session variable to false
        public static setSessionToNotCached(): void {
            if (typeof (Storage) != undefined) {
                sessionStorage.setItem("cached", "false");
            }
        }
    
        /**
         * Helper method to determine whether a year is a leap year
         * @param year
         */
        public static isLeapYear(year: number):Boolean {
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
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

        public static getQueryStringValue(name: string): string {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars[name];
        }
    }
}

// apply some general clean up across the board 
Common.utilities.removeAllLeadingLineFeeds();
