/// <reference path="../typings/jquery/jquery.d.ts"/>

'use strict';

namespace Common {

    /** Collection of methods enabling general UI manipulation */
    export class ui {

        /** 
         */
        public static AnimateHideAndShow() {
            return !$("#loader").is(":visible"); // do not animate when loader is shown.
        }

        /**
         * 
         * @param element
         */
        public static AnimateHideElement(element: JQuery) {
            if (!Common.ui.AnimateHideAndShow()) {
                element.hide();
            }
            else {
                var activeElement = $(document.activeElement); // code for maintaining scroll position as elements are added/removed
                var doc = $(document);
                var currentOffset = 0;
                if (activeElement) {
                    var top = 0;
                    if (!Common.utilities.isNullUndefinedEmpty(activeElement.offset())) {
                        top = activeElement.offset().top;
                    }
                    currentOffset = top - doc.scrollTop();
                }

                element.slideUp('fast', () => {
                    if (activeElement) {
                        var top = 0;
                        if (!Common.utilities.isNullUndefinedEmpty(activeElement.offset())) {
                            top = activeElement.offset().top;
                        }
                        doc.scrollTop(top - currentOffset);
                    }
                });
            }
        }
        /**
         * 
         * @param element
         */
        public static AnimateShowElement(element: JQuery) {
            if (!Common.ui.AnimateHideAndShow()) {
                element.show();
            }
            else {
                var activeElement = $(document.activeElement); // code for maintaining scroll position as elements are added/removed
                var doc = $(document);
                var currentOffset = 0;
                if (activeElement) {
                    var top = 0;
                    if (!Common.utilities.isNullUndefinedEmpty(activeElement.offset())) {
                        top = activeElement.offset().top;
                    }
                    currentOffset = top - doc.scrollTop();
                }

                element.slideDown('fast', () => {
                    if (activeElement) {
                        var top = 0;
                        if (!Common.utilities.isNullUndefinedEmpty(activeElement.offset())) {
                            top = activeElement.offset().top;
                        }
                        doc.scrollTop(top - currentOffset);
                    }
                });
            }
        }

        /**
         * Select the first Input field on the form.  Adding a delay to account for inconsistenices in load of Modal Entity forms
         * */
        public static FocusOnFirstField() {
            window.setTimeout(function () { $('select:visible:not([readonly]):first, input:visible:not([readonly]):not([type=checkbox]):first').first().focus(); }, 200);
        }

        /** This function makes fields read only true or not read only 
        takes field name (#msft_person_name for example) and true or false.
        The readonly class is necessary to make the field view consistent with the way that ADX displays read only fields.**/
        public static MakeFieldReadOnly = function (readField: string, param: boolean) {
            $(readField).prop("readonly", param);
            if (!param)
                $(readField).removeClass("readonly");
            else
                $(readField).addClass("readonly");
        };

        /**
         * Function that hides optionset values in the portal
         * @param controlId target control for the OptionSet 
         * @param optionSetValue OptionSet value to hide
         */

        public static hideOptionSetValues(controlId: string, optionSetValue: string) {
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
        /**
         * Helper method that will render escaped HTML in elements, such as field labels or sections 
         * @param controlId
         */
        public static renderLabelContents(controlId: string): void {
            Common.utilities.selectObjectById(controlId).each(
                function () {
                    // grab the text of the element
                    var b = $(this).text();
                    // clear all current child elements
                    $(this).empty();
                    // render the text into a new element.  wrap in a span so that the text is not ignored
                    $(this).append($("<span>" + b + "</span>"));
                }
            );
        }

        /** Helper method to remove an additional emdash for fields flagged as readonly.
         * These are added by the Portal scripts and we don't know why!
         * Need a better implementation of this one
         */
        public static clearExtraEmdash(): void {
            window.setTimeout(function () { $("div.text-muted:contains('—')").remove() }, 500);
        }

        /**
         * adds to optionset text for when the requirement exceeds the max length of a crm option set
         * @param option The HTMLelement id
         * @param format uses a {0} to place the addition before or after what's already there 
         */
        public static addToOptionsetText(option: string, format: string) {
            // for the label text, we only want the text elements. Option sets include an additional span, so we need to skip that bit.
            // grab the label and the text element only
            var label = $("label[for='" + option + "']");
            var labelTextEl = label.contents()
                .filter(
                    function () {
                        return this.nodeType == 3;
                    });
            var text = format.replace("{0}", labelTextEl.text());
            label.text(text);
        }

        /**
         * Make all controls on form Read Only
         * @param {Array<string>} datePickIds list of date picker controls
         */
        public static makeFormReadOnly(datePickIds?: Array<string>): void {
            // disable inputs on the forms
            $('input[type=text], select, textarea').each(function () {
                $(this).attr('readonly', 'readonly');
            })

            $('input[type=checkbox]:not(:checked), input[type=radio]:not(:checked)').each(function () {
                $(this).attr('disabled', 'disabled');
            })

            $('input[type=checkbox]').click(function (evt) {
                evt.preventDefault();
            })

            // handle option sets
            $('option:not(:selected)').prop('disabled', 'disabled');

            if (!utilities.isNullUndefinedEmpty(datePickIds)) {
                for (var i: number = 0; i < datePickIds.length; i++) {
                    var dpId: string = datePickIds[i];
                    Common.ui.disableDatePick(dpId);
                }
            }
        }

        /**
         * Helper method that will hide a tab on the page
         * @param {string} tabSelector tab being hidden, either be a tab ID or a selector for the tab
         * @param {boolean} clearValues optional flag indicating whether to clear the values when hiding tab.  default to false
         */
        public static hideTab(tabSelector: string, clearValues?: boolean): void {
            var tab: JQuery = Common.ui.getTab(tabSelector);
            Common.ui.AnimateHideElement(tab);

            // grab the tab header, which is an H2 element
            var header: JQuery = tab.prev("h2");
            if (header.length > 0) {
                Common.ui.AnimateHideElement(header);
            }

            // clear values too 
            if (clearValues === true) {
                Common.ui.clearTabValues(tabSelector);
            }
        }

        /** Helper method that set a tab visible on a form
        * @param {string} tabSelector tab being hidden.  this can either be a tab ID or a selector for the tab
        * @return {void}
        **/
        public static showTab(tabSelector: string): void {
            var tab: JQuery = Common.ui.getTab(tabSelector);
            Common.ui.AnimateShowElement(tab);

            // grab the tab header, which is an H2 element
            var header: JQuery = tab.prev("h2");
            if (header.length > 0) {
                Common.ui.AnimateShowElement(header);
            }
        }

        /**
         * Helper method to return a tab element
         * @param {string} tabSelector tab being retrieved. this can either be a tab ID or a selector for the tab
         */
        public static getTab(tabSelector: string) {
            var tab: JQuery = $(Common.ui.valdiateTabSelector(tabSelector));
            return tab;
        }

        /**
         * Get the section DIV for the given section name
         * @param sectionName
         */
        public static getSection(sectionName: string): JQuery {
            var selector: string = "table.section[data-name='" + sectionName + "']";
            var section = $(selector);
            return section;
        }

        /**
         * Get the lable for a given section 
         * @param sectionName
         */
        public static getSectionLabel(sectionName: string): string {
            var section: JQuery = Common.ui.getSection(sectionName);
            var label: string = "";
            if (section.length > 0) {
                var head: any = section.parent().find('.section-title').first();
                if (head.length > 0) {
                    var headEl: any = head[0];
                    if (headEl.childNodes.length > 1) {
                        label = $(headEl.firstChild).text();
                    }
                    else {
                        label = $(headEl.firstChild).text();
                    }
                }
            }
            return label;
        }

        public static getTabLabel(tabName: string): string {
            //var selector: string = "div#EntityFormView div.tab.clearfix[data-name='" + tabName + "']";
            //var element: JQuery = $(selector);
            var tab: JQuery = Common.ui.getTab(tabName);
            var label: string = "";
            if (tab.length > 0) {
                label = tab.prev("h2.tab-title").text();
            }
            return label;
        }

        /**
         *  Helper method to clear all fields in a tab, set each value to null
         * @param tabSelector
         * @param datePickIds
         */
        public static clearTabValues(tabSelector: string, datePickIds?: Array<string>): void {
            // var ctl: JQuery = $(Common.ui.valdiateTabSelector(tabSelector));
            var tab: JQuery = Common.ui.getTab(tabSelector);
            Common.ui.clearChildElements(tab);
        }

        /**
         * For a control such as a section or tab, set all child field values to null
         * @param ctl {JQuery} UI element 
         */
        public static clearChildElements(ctl: JQuery): void {

            // clear out all data entry fields in a particular tab
            $('input[type=text], select, textarea', ctl).each(function () {
                $(this).val(null);
            });

            // "uncheck" checkboxes and radio buttons
            $('input[type=checkbox]:checked, input[type=radio]:checked', ctl).each(function () {
                $(this).attr("checked", null);
                $(this).trigger("change");
            });
        }

        /**
         * Helper method to hide a section
         * @param sectionDataName {string} the name of the section
         */
        public static hideSection(sectionDataName: string, clearValues?: boolean) {
            Common.ui.toggleSection(sectionDataName, true, clearValues);
        }

        /**
         * Helper method to show a section
         * @param sectionDataName {string} the name of the section
         */
        public static showSection(sectionDataName: string) {
            Common.ui.toggleSection(sectionDataName, false);
        }

        /**
         * Helper method that will toggle display of the section and it's header text
         * @param sectionDataName {string} name of the section
         * @param hide {boolean} if true, hide the section, otherwise show
         */
        public static toggleSection(sectionDataName: string, hide: boolean, clearValues?: boolean) {
            var section: JQuery = Common.ui.getSection(sectionDataName);

            if (hide === true) {
                section.hide();
                section.prev().hide();

                // clear values too 
                if (clearValues === true) {
                    Common.ui.clearChildElements(section);
                }
            }
            else {
                section.show();
                section.prev().show();
            }
        }

        /** Helper method to return the correct selector for the tab on the form
        * @param {string} tabSelector tab id/selector being evaluated. if a tabID is passed, a selector is returned
        * @return {string} updated selector for the tab
        **/
        private static valdiateTabSelector(tabSelector: string): string {
            // if this is just the tab name, append the selector 
            if (!(tabSelector.lastIndexOf(".tab[data-name", 0) === 0)) {
                tabSelector = ".tab[data-name='" + tabSelector + "']";
            }
            return tabSelector;
        }

        /**
         * Helper method that will add a print button
        *   @return {void}
         */
        public static addPrintButton(): void {
            let ctl: JQuery = $("#NextButton");
            var button: JQuery = $('<input type="button" onclick="window.print()" class="btn btn-primary button next submit-btn" value="Print" />');
            ctl.parent().after(button);
        }

        /** Helper method that will toggle the display of all tabs in the list of Ids
        *   @param {Array<string>} tabIdList list of tab control Ids
        *   @param {boolean} hide flag indicating whether to hide or show.  default to true
        **/
        public static toggleTabDisplay(tabIdList: Array<string>, hide?: boolean, clearValues?: boolean): void {
            // default to hide tab
            if (Common.utilities.isNullOrUndefined(hide)) {
                hide = true;
            }
            for (let tabId of tabIdList) {
                if (hide) {
                    Common.ui.hideTab(tabId, clearValues);
                }
                else {
                    Common.ui.showTab(tabId);
                }
            }
        }

        /** Helper method that will apply the mask to the SSN field for the given control
        * @param {string} controlId control being masked
        * @return {void}
        **/
        public static maskSSN(controlId: string): void {

            $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.3/jquery.mask.js", () => {
                var ctl: any = $("#" + controlId); // use any to bypass TS compilation error
                ctl.mask("000-00-0000");
            });
        }

        /** Helper method that will apply the mask all date fields on a form 
        * @return {void}
        **/
        public static maskDate(): void {
            // apply the placeholder for the dates
            $("[data-date-format='M/D/YYYY']").attr("placeholder", "MM/DD/YYYY");

            $("div.text-muted:contains('—')").remove(); // need to remove first
            $('input.datetime').each((index, ctlDT) => {
                $("#" + ctlDT.id).next().data("DateTimePicker").options({ format: 'MM/DD/YYYY' });
                $("#" + ctlDT.id).next().children("input").attr("id", ctlDT.id + "_input");
                Common.ui.mask(ctlDT.id + "_input", "00/00/0000");
            });
        }

        /** Helper to add artibrary masking
        * @param controlId
        **/
        public static mask(controlId: string, maskPattern: string): void {
            Common.ui.ensureMaskJsLoaded();

            var ctl: any = $("#" + controlId); // use any to bypass TS compilation error
            ctl.mask(maskPattern);
        }

        public static unmask(controlId: string): void {
            Common.ui.ensureMaskJsLoaded();
            var ctl: any = $("#" + controlId); // use any to bypass TS compilation error
            ctl.unmask();
        }

        /** Helper method that will apply the mask initials
                * @param {string} controlId control being masked
        * @return {void}
        **/
        public static maskInitials(controlId: string): void {
            Common.ui.ensureMaskJsLoaded();

            var ctl: any = $("#" + controlId); // use any to bypass TS compilation error
            ctl.mask("SSS");
        }

        /** Helper method to mask telephone/fax number to US (XXX-XXX-XXXX) and international (+XXX XXXXXXXXXXX) formats
          * @param controlId control being masked
          */
        public static maskPhoneNumber(controlId: string): void {
            Common.ui.ensureMaskJsLoaded();

            let intCtl: JQuery = $("#" + controlId + '_international');
            if (!Common.utilities.isNullUndefinedEmpty(intCtl)) {
                let intChangeFunction = () => {
                    Common.ui.unmask(controlId);
                    if (!intCtl.is(":checked")) {
                        Common.ui.mask(controlId, "000-000-0000");
                        $("#" + controlId).attr("placeholder", "XXX-XXX-XXXX");
                    }
                    else {
                        Common.ui.mask(controlId, "+00 0000000000");
                        $("#" + controlId).attr("placeholder", "+XX XXXXXXXXXX");
                    }
                }

                intCtl.change(intChangeFunction);
                intChangeFunction();
            }
        }

        public static ensureMaskJsLoaded(): void {
            //console.log('ensureMaskJsLoaded called');
            // if ($("#maskJS").length == 0) {
            //    $('head').append('<script id="maskJS" src="https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.15/jquery.mask.js"></script>');
            //}
        }

        /**
         * Restrict input to non special characters only
         * @param controlId control being filtered 
         */
        public static restrictSpecialCharacters(controlId: string): void {

            $("#" + controlId).on('keypress', function (event) {

                var pattern: RegExp = /^[A-Za-z ``'.-]+$/;

                if (!pattern.test(event.key)) {
                    return false;
                }
            });
        }

        /** Helper method that will disable a check control
        * @param {string} controlId control being disabled
        * @return {void}
        **/
        public static disableCheck(controlId: string): void {
            var ctl: JQuery = Common.utilities.selectObjectById(controlId);
            ctl.removeAttr('checked');
            ctl.attr('disabled', 'disabled');
        }

        /** Helper method that will enable a check control
        * @param {string} controlId control being enabled
        * @return {void}
        **/
        public static enableCheck(controlId: string): void {
            var ctl: JQuery = Common.utilities.selectObjectById(controlId);
            ctl.removeAttr('disabled');
        }

        /** Toggle the enabled state for a list of check controls 
        * @param {Array<string>} controlIdList list of controls to be toggled
        * @param {boolean} enable flag indicating whether to enable
        * @return {void}
        **/
        public static toggleCheckEnabled(controlIdList: Array<string>, enable?: boolean): void {
            // default to hide tab
            if (Common.utilities.isNullOrUndefined(enable)) {
                enable = true;
            }

            for (let controlId of controlIdList) {
                if (enable) {
                    Common.ui.enableCheck(controlId);
                }
                else {
                    Common.ui.disableCheck(controlId);
                }
            }
        }
        /** Helper method that will toggle a generic element enabled / disabled.
        *   @param {string} elementId id of the element being toggled 
        *   @param {boolean} enable flag indicating whether to toggle the item enabled or disabled
        *   @param {boolean} clearValue flag indicating whether to clear the value
        *   @param {boolean} hide flag indicating whether to hide the element
        *   @return {void}
        **/
        public static toggleElementEnabled(elementId: string, enable?: boolean, clearValue?: boolean, hide?: boolean): void {
            if (Common.utilities.isNullUndefinedEmpty(clearValue)) {
                clearValue = false;
            }
            if (Common.utilities.isNullUndefinedEmpty(enable)) {
                enable = false;
            }
            if (Common.utilities.isNullOrUndefined(hide)) {
                hide = false;
            }

            var ctl: JQuery = Common.utilities.selectObjectById(elementId);
            // disable the element. hide if the additional params set
            if (enable) {
                if (ctl.parents(".form-readonly").length == 0) {
                    ctl.removeAttr('readonly');
                }
                if (hide) {
                    Common.ui.showElement(elementId);
                }
            }
            else {
                ctl.attr('readonly', true);
                if (hide) {
                    Common.ui.hideElement(elementId)
                }
                // only clear the value on hide/disable
                if (clearValue == true) {
                    ctl.val(null);
                    if (ctl.prop("tagName").toLowerCase() == "textarea") {
                        ctl.empty();
                    }
                    // maybe be a lookup with the name field also needing to be cleared
                    var ctl_name: JQuery = Common.utilities.selectObjectById(elementId + "_name");
                    if (!Common.utilities.isNullUndefinedEmpty(ctl_name)) {
                        ctl_name.val(null);
                    }
                    // maybe be a radio button (option set as radio button)
                    $("#" + elementId + " input[type=radio]:checked").attr('checked', false);
                    // maybe be a checkbox
                    $("input[type=checkbox]:checked" + "#" + elementId).attr('checked', false);

                    // in case there are triggers on this
                    $("#" + elementId).change();
                }
            }
        }

        public static hideElement(controlId: string): void {
            Common.ui.toggleElementDisplay(controlId, true);
        }

        public static showElement(controlId: string): void {
            Common.ui.toggleElementDisplay(controlId, false)
        }

        public static toggleElementDisplay(controlId: string, hide: boolean): void {

            var ctl: JQuery = Common.utilities.selectObjectById(controlId);
            let fieldContainer = ctl.parents("td.cell");

            if (!Common.utilities.isNullOrUndefined(fieldContainer)) {
                if (hide) {
                    Common.ui.AnimateHideElement(fieldContainer);
                }
                else {
                    Common.ui.AnimateShowElement(fieldContainer);
                }
            }
            else {
                if (hide) {
                    Common.ui.AnimateHideElement(ctl);
                }
                else {
                    Common.ui.AnimateShowElement(ctl);
                }
            }
        }

        /** Helper method that will toggle multiple generic elements enabled / disabled.
        *   @param {Array<string>} elementIdList array of element Ids to be toggled
        *   @param {boolean} enable flag indicating whether to toggle the item enabled or disabled
        *   @param {boolean} clearValue flag indicating whether to clear the value
        *   @return {void}
        **/
        public static toggleElementsEnabled(elementIdList: Array<string>, enable?: boolean, clearValue?: boolean, hide?: boolean): void {
            for (let elementId of elementIdList) {
                Common.ui.toggleElementEnabled(elementId, enable, clearValue, hide)
            }
        }
        /**  Helper method to disable the date Picker control
        *   @param {string} controlId control id of the date picker control
        *   @return {void}
        **/
        public static disableDatePick(controlId: string): void {
            var cal: JQuery = Common.utilities.selectObjectById(controlId);
            cal.next().data("DateTimePicker").destroy();
        }
        /**
         * Set the Text of a Label
         * @param field
         * @param labelText
         */
        public static setLabelText(field: string, labelText: string): void {
            // needs to be called before modals
            let label: JQuery = $('#' + field + '_label');
            if (!Common.utilities.isNullOrUndefined(label)) {
                label.html(labelText);
            }
        }
        public static getLabelText(field: string): string {
            let label: JQuery = $('#' + field + '_label');
            return label.html();
        }
    }
}
Common.ui.clearExtraEmdash();
