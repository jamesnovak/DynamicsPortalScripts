/// DEPENDS ON Common.ui and Common.utilities

/// <reference path="../typings/jquery/jquery.d.ts"/>
'use strict';

/** Constants! */
// TODO add more constants for selectors
const REQUIRED_CLASSNAME: string = "MSFT-requred-field";
const DISABLEDFIELD_CLASSNAME: string = "MSFT-disabled-field";

namespace Common {
    /** Interface to capture a triggering control properties
     * **/
    export interface ITriggerControl {
        id: string,
        type: string,
        value: any
    }
    /** Helper class to clean up the method calls */
    export class triggerControl implements ITriggerControl {
        /**
         * Constructor
         * @param {string} id trigger control id
         * @param {string} type control type - 'check', 'radio', 'optionset', 'text'
         * @param {any} value trigger value for the control
         */
        constructor(id: string, type: string, value: any) {
            this.id = id;
            this.type = type;
            this.value = value;
        }
        id: string;
        type: string;
        value: any;
    }

    export class validators {

        /** 
        * Helper method that will initialize a new control validator for the current page
        * @param {string} controlId schema name of the control being validated
        * @param {string} validatorIdPrefix Prefix appended to the validator name that identifies the type, such as NotNull or FutureDate
        * @param {string} failureMessageMask Message that will be displayed on error. the slug {label} will be replaced with the control label. The slug {label} will be replaced with the value field label
        * @param {PromiseLike<boolean>} evalFunction function to be invoked on validation
        * @param {string=} initialValue Default value for the field
        * @param {string=} validationGroup Group?
        * @return {void}
        **/
        public static addValidator(controlId: string, validatorIdPrefix: string, failureMessageMask: string, evalFunction: () => boolean, initialValue?: string, validationGroup?: string): void {

            if (typeof (Page_Validators) == 'undefined') {
                throw ("Page_Validators is undefined in this web form step");
            }

            // check default params
            if (Common.utilities.isNullUndefinedEmpty(validationGroup))
                validationGroup = "";
            if (Common.utilities.isNullUndefinedEmpty(initialValue))
                initialValue = "";

            // get control label and label text from page
            var controlLabelId: string = controlId + "_label";
            var controlLabel: string = "";

            // need to check if the control label exists.  if not, we want to scroll to the control itself
            if ($("#" + controlLabelId).length == 0) {
                controlLabelId = controlId;
            }
            else {
                controlLabel = $("#" + controlLabelId).text();
            }

            // console.log("controlLabel: " + controlLabel);

            //  replace the slug with the control label text
            var failureMessage = failureMessageMask.replace("{label}", controlLabel);

            // we can't use JQuery objects here!
            var validator: any = document.createElement("span");
            validator.style.display = "none";
            validator.id = validatorIdPrefix + "_" + controlId;
            validator.controltovalidate = controlId;
            validator.errormessage = "<a href='#" + controlLabelId + "'>" + failureMessage + "</a>";
            validator.validationGroup = validationGroup; // Set this if you have set ValidationGroup on the form
            validator.setAttribute("initialvalue", initialValue);
            validator.evaluationfunction = evalFunction;

            // add the page validator and hook the error message click
            Page_Validators.push(validator);
        }

        /**
         * Remove an existing validator from a control 
         * @param validatorId {string} ID of the validator
         */
        public static removeValidator(validatorId: string): void {
            var validators: Array<any> = (<any>window).Page_Validators;

            if (validators == undefined) return;

            for (let validator of validators) {
                var id: string = validator.id;
                if (id.indexOf(validatorId) > -1) {
                    (<any>Array).remove(validators, validator);
                    // return;
                }
            }
            // ensure that the field is not still flagged as required 
            Common.validators.toggleFieldRequired(validatorId, false);
        }

        /**
         * Helper method that tells us if a control has a validator 
         * @param validatorId {string} ID of the control being checked
         * @return {bool}  true/false indicating whether a validator exists
         */
        public static hasValidator(validatorId: string): boolean {
            var validators: Array<any> = (<any>window).Page_Validators;

            if (validators == undefined) return;

            for (let validator of validators) {
                var id: string = validator.id;
                if (id.indexOf(validatorId) > -1) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Ensures that a date is on or after a min date, on or before a max date, or between both dates.
         * @param {string} controlId Date control being validated
         * @param {Date} minDate min date allowed for the control
         * @param {Date} maxDate max date allowed for the control
         */
        public static addDateRangeValidator(controlId: string, minDate?: Date, maxDate?: Date): void {
            
            var validatorPrefix: string = "DateRangeValidator";
            var messageMask: string = null;

            // make sure the control exists~
            if (!Common.utilities.elementExists(controlId)) {
                throw ("Error: unable to find the control with Id: " + controlId);
            }

            if (minDate == null && maxDate == null) {
                throw ("Error: minDate and maxDate cannot both be null.");
            }
            else if (minDate == null && maxDate != null) {
                validatorPrefix = "MaxDateValidator";
                messageMask = "{label} must be a date on or before " + maxDate.toLocaleDateString() + ".";
            }
            else if (minDate != null && maxDate == null) {
                validatorPrefix = "MinDateValidator";
                messageMask = "{label} must be a date on or after " + minDate.toLocaleDateString() + ".";
            }
            else {
                messageMask = "{label} must be a date between " + minDate.toLocaleDateString() + " and " + minDate.toLocaleDateString() + ".";
            }
            // add the validator to the control
            Common.validators.addValidator(controlId,
                validatorPrefix,
                messageMask,
                () => {
                    var isValid = true;
                    var dateVal = $("#" + controlId).val();

                    if (dateVal != null) {
                        // compare the date from the control to the date ranges specified 
                        var newDate = new Date(dateVal);
                        var newDateTime: number = newDate.getTime();

                        // compare according to the provided date values
                        if (minDate == null && maxDate != null) {
                            if (newDateTime > maxDate.getTime()) {
                                isValid = false;
                            }
                        }
                        else if (minDate != null && maxDate == null) {
                            if (newDateTime < minDate.getTime()) {
                                isValid = false;
                            }
                        }
                        else {
                            if (newDateTime < minDate.getTime() ||
                                newDateTime > maxDate.getTime()) {
                                isValid = false;
                            }
                        }
                    }
                    return isValid;
                });
        }

        /**
         * Ensure that a date is or or before a given date
         * @param {string} controlId Date control being validated
         * @param {Date} maxDate max date allowed for the control
         */
        public static addMaxDateValidator(controlId: string, maxDate: Date): void {
            Common.validators.addDateRangeValidator(controlId, null, maxDate);
        }

        /**
         * Ensure that a date is on or after a given date
         * @param {string} controlId Date control being validated
         * @param {Date} minDate  min date allowed for the control
         */
        public static addMinDateValidator(controlId: string, minDate: Date): void {
            this.addDateRangeValidator(controlId, minDate);
        }

        /** Injects a new control validator that restricts users from entering dates set in the future
        * @param {string} controlId schema name of the control being validated
        * @return {void}
        **/
        public static addFutureDateValidator(controlId: string): void {

            // make sure the control exists~
            if (!Common.utilities.elementExists(controlId)) {
                throw ("Error: unable to find the control with Id: " + controlId);
            }

            // use the common method to add the future date validation
            Common.validators.addValidator(controlId,
                "FutureDateValidator",
                "{label} cannot be set to a future date.",
                () => {
                    var isValid = true;
                    var dateVal = $("#" + controlId).val();
                    if (dateVal != null) {
                        // compare time values of date objects
                        var newDate = new Date(dateVal), now = new Date();

                        // TODO - use UTC conversions?
                        if (newDate.getTime() > now.getTime()) {
                            isValid = false;
                        }
                    }
                    return isValid;
                }
            );
        }

        /** Injects a list of general null check validators that will ensure that a value is not null
        * @param {string} controlIdList array of schema control names value being checked for null
        * @return {void}
        **/
        public static addMultipleNullValidators(controlIdList: Array<string>): void {
            for (var i = 0; i < controlIdList.length; i++) {
                Common.validators.addNullValidator(controlIdList[i]);
            }
        }

        /** Injects a new control validator that will ensure that a value is not null
        * @param {string} controlId schema name of the control value being checked for null
        * @return {void}
        **/
        public static addNullValidator(controlId: string, failureMessageMask?: string): void {

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please provide a value for {label}.";
            }

            validators.toggleFieldRequired(controlId, true);

            // use the helper method to inject the null dependent null value check
            Common.validators.addValidator(controlId,
                "GeneralNullValidator",
                failureMessageMask,
                () => {
                    var isValid: boolean = true;
                    // handle radio buttons
                    if ($("#" + controlId + " input[type='radio']").length > 0) {
                        if ($("#" + controlId + " input[type='radio']:checked").length == 0) {
                            isValid = false;
                        }
                    }
                    else {
                        // standard controls, text box, select, etc
                        // fail if null, undefined, or empty string
                        var value: string = $("#" + controlId).val();
                        isValid = !Common.utilities.isNullUndefinedEmpty(value);
                    }

                    return isValid;
                }
            );
        }

        /**
         * Validator to ensure that the grid contains a minimum number of rows.
         * Note: the min/max must be <= the grid rows displayed because we can't paginate grid
         * @param {string} gridId  id if the grid being evaluated
         * @param {number} minRows minimum number of rows
         * @param {number} maxRows minimum number of rows
         * @param {string} failureMessageMask message to be displayed when validation fails
         * @param exactMatch
         */
        public static addGridNumRowsValidator(gridId: string, minRows?: number, maxRows?: number, failureMessageMask?: string, exactMatch?: boolean): void {
            // do we want an exact match of selected value vs row count
            if (Common.utilities.isNullUndefinedEmpty(exactMatch)) {
                exactMatch = false;
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "The selected value in {label} does not match the number of items in the grid.";
            }

            // make sure we allow multiple validators!
            var validatorId: string = "GridNumRowsValidator_" + gridId;

            // use the helper method to inject the null dependent null value check
            Common.validators.addValidator(gridId,
                validatorId,
                failureMessageMask,
                () => {
                    var isValid: boolean = true;
                    console.log("isValid: " + isValid + ", minRows: " + minRows + ", maxRows: " + maxRows);
                    // get the number of rows in the grid
                    // TODO move this into helper function?
                    var rowCount: number = $("#" + gridId + " div.view-grid table tbody tr[data-id]").length;

                    // see if the pager is there with pages
                    var hasPageControl: boolean = !$("#" + gridId + " div.view-pagination").is(":hidden");
                    console.log("rowCount: " + rowCount + ", hasPageControl: " + hasPageControl);

                    // check min rows
                    if (!isNaN(minRows as any) && (minRows != null)) {
                        isValid = (rowCount >= minRows);
                    }

                    if (isValid && !isNaN(maxRows as any) && (maxRows != null)) {
                        isValid = (rowCount <= maxRows);
                    }
                    console.log("isValid: " + isValid + "rowCount: " + rowCount + ",  minRows: " + minRows + ", maxRows: " + maxRows);

                    return isValid;
                }
            );
        }
        /**
         * Validator to ensure that the grid linked to a numeric value contains rows.
         * Note: this is specific to a number select and a grid row size of 10~
         * @param {string} controlId id of the numeric value selector
         * @param {string} gridId  id if the grid being evaluated
         * @param {string} failureMessageMask message to be displayed when validation fails
         * @param exactMatch
         */
        public static addGridRequiredRowsValidator(controlId: string, gridId: string, failureMessageMask?: string, exactMatch?: boolean): void {
            // leave if no element 
            var id: string = "#" + controlId;
            if ($(id).length == 0) {
                console.log("invalid id: " + controlId);
                return;
            }

            // do we want an exact match of selected value vs row count
            if (Common.utilities.isNullUndefinedEmpty(exactMatch)) {
                exactMatch = false;
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "The selected value in {label} does not match the number of items in the grid.";
            }

            // make sure we allow multiple validators!
            var validatorId: string = "GridRequiredRowsValidator_" + controlId;

            // use the helper method to inject the null dependent null value check
            Common.validators.addValidator(controlId,
                validatorId,
                failureMessageMask,
                () => {
                    var isValid: boolean = true;

                    // TODO now only works on select with option set values!
                    var controlValue: string = $("#" + controlId + " option:selected").text().trim();

                    console.log("id:" + controlId + ", controlValue: '" + controlValue + "', controlValue.length: " + controlValue.length);
                    // get the selected number 
                    // the option values contain 10+, or it can be empty.  so check for isNaN
                    if (controlValue.length > 0) {
                        // parseint on 10+ returns 10, so safe to do here
                        var selectedNumber: number = parseInt(controlValue);

                        // get the number of rows in the grid
                        // TODO move this into helper function?
                        var rowCount: number = $("#" + gridId + " div.view-grid table tbody tr[data-id]").length;

                        // see if the pager is there with pages
                        var hasPageControl: boolean = !$("#" + gridId + " div.view-pagination").is(":hidden");

                        console.log("rowCount: " + rowCount + ", controlValue: " + controlValue + ", isNaN(controlValue): " + isNaN(controlValue as any) + ", selectedNumber: " + selectedNumber);
                        console.log("hasPageControl: " + hasPageControl);

                        // match the exact number
                        // if they select 10+, then only make sure it's >= 10
                        if (isNaN(controlValue as any)) {
                            // if the page control is being shown, we know they have more than 10
                            // otherwise match the number
                            isValid = (rowCount >= selectedNumber) || (hasPageControl);
                        } else {
                            // if less than 10 is selected, only match exact number if no pager is shown
                            isValid = (rowCount == selectedNumber) && (!hasPageControl);
                        }
                    }
                    return isValid;
                }
            );
        }

        /** Injects a new control validator that will validate the contents of a text field if a check box has been checked
         * Modified to handle both a string or string array of valueControlId's in order to affect multiple fields 
         * @param {Common.triggerControl} triggerCtl control schema name and control type('check', 'radio', 'optionset', 'text') that will trigger the validation and value determine whether the validation should occur
         * @param {string | string[]} valueControlId schema name of the control value being checked for null
         * @param {string} failureMessageMask optional mask for the message to be displayed. The slug {label} will be replaced with the value field label
         * @param {boolean} addLinkedEnableToggle optional flag indicating whether to toggle the value control enabled when trigger is met
         * @param {string} validationGroup validation group for evaluating this validator
         * @param {boolean} clearField inidicates whether or not the field should be cleared if enabled/disabled
         * @returns {void}
         */
        public static addLinkedNullValidator( triggerCtl: triggerControl, valueControlId: string | string[], failureMessageMask?: string,
            addLinkedEnableToggle?: boolean, validationGroup?: string, clearField?: boolean): void {
            // debugger
            // check our parameters, set default
            if (Common.utilities.isNullUndefinedEmpty(addLinkedEnableToggle)) {
                addLinkedEnableToggle = false;
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please provide a value for {label}.";
            }

            //check to see if valueControlId is a string or string array 
            // make it an array if a string so we can use the same code for the loop
            if (typeof valueControlId === 'string') {
                valueControlId = [valueControlId];
            }

            // iterate
            $.each(valueControlId, (i, val) => {
                // add the required marker to the trigger control
                Common.validators.addRequiredMarkingHandler(triggerCtl, val, false);

                // if indicated, add the enable toggle to the target value control
                if (addLinkedEnableToggle) {
                    Common.validators.addLinkedEnableToggle(triggerCtl, val, clearField);
                }

                // use the helper method to inject the null dependent null value check
                Common.validators.addValidator(val,
                    "DependentNullValidator",
                    failureMessageMask,
                    () => {
                        var isValid: boolean = true;
                        var isTriggered: boolean = Common.validators.isControlTriggered(triggerCtl);

                        // if the trigger control Id is checked, then ensure valueControl is not null
                        if (isTriggered == true) {
                            var value = null;
                            // element for a radio is a span that contains child inputs.  so check to see of this element has children that are radios.
                            // if none of them are checked, then it's null
                            if ($("#" + val + " input[type='radio']").length > 0) {
                                if ($("#" + val + " input[type='radio']:checked").length > 0) {
                                    value = true;
                                }
                            }
                            else {
                                value = $("#" + val).val();
                            }
                            // fail if null, undefined, or empty string
                            if (Common.utilities.isNullUndefinedEmpty(value)) {
                                isValid = false;
                            }
                        }
                        return isValid;
                    },
                    null,
                    validationGroup
                );
            });
        }

        /** Adds a validator that will ensure that a min number of check boxes have been checked for a specific section
            @param {string} sectionName     name of the section that contains the group of checkboxes
            @param {string} validationGroup     validation group for the checkboxes
            @param {boolean} minChecked         min number of items to be checked
            @param {string} failureMessageMask  failure message when the min number of items is not checked
        **/
        public static addMinCheckedValidator(sectionName: string, validationGroup: string, minChecked?: number, failureMessageMask?: string) {
            // select the section by name 
            var selector: string = "table.section[data-name='" + sectionName + "']";
            var section: JQuery = Common.ui.getSection(sectionName);
            var sectionLabel:string = Common.ui.getSectionLabel(sectionName);

            if (Common.utilities.isNullUndefinedEmpty(minChecked)) {
                minChecked = 1;
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please check at least " + minChecked + " item(s) in the section '" + sectionLabel + "'";
            }

            // get ID of the first checkbox so we can attach a validator 
            var controlId: string = Common.validators.GetCheckBoxControlId(section);

            Common.validators.addValidator(controlId,
                "MinCheckedRequired",
                failureMessageMask,
                () => {
                    // check to see if any checked 
                    var checkedCount: number = $(selector + " tbody tr td.cell.checkbox-cell input[type='checkbox']:checked").length;
                    var isValid: boolean = (checkedCount >= minChecked);

                    return isValid;
                },
                null,
                validationGroup
            );
        }

        /** Adds a validator that will ensure that a max number of check boxes have been checked for a specific section
            @param {string} sectionName     name of the section that contains the group of checkboxes
            @param {string} validationGroup     validation group for the checkboxes
            @param {boolean} maxChecked         max number of items to be checked.  Default: 1
            @param {string} failureMessageMask  failure message when the max number of items is not checked
        **/
        public static addMaxCheckedValidator(sectionName: string, validationGroup: string, maxChecked?: number, failureMessageMask?: string) {
            // select the section by name 
            var selector: string = "table.section[data-name='" + sectionName + "']";
            var sectionLabel = Common.ui.getSectionLabel(sectionName);
            var section: JQuery = Common.ui.getSection(sectionName);

            if (Common.utilities.isNullUndefinedEmpty(maxChecked)) {
                maxChecked = 1;
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please check at most " + maxChecked + " item(s) in the section '" + sectionLabel + "'";
            }

            // get ID of the first checkbox so we can attach a validator 
            var controlId: string = Common.validators.GetCheckBoxControlId(section);

            Common.validators.addValidator(controlId,
                "MaxCheckedRequired",
                failureMessageMask,
                () => {
                    // check to see if any checked 
                    var checkedCount: number = $(selector + " tbody tr td.cell.checkbox-cell input[type='checkbox']:checked").length;
                    var isValid: boolean = (checkedCount <= maxChecked);

                    return isValid;
                },
                null,
                validationGroup
            );
        }
        /**
         *  Helper method to get the control Id of the first checkbox in a section
         * @param section {JQuery} section element 
         */
        private static GetCheckBoxControlId(section: JQuery): string
        {
            // get the list of checkboxes in the section and grab the ID
            var firstCheck: JQuery = $(" tbody tr td.cell.checkbox-cell input[type='checkbox']", section).first();
            var controlId: string = firstCheck.attr("id");

            return controlId;
        }

        /** Helper method that will enable or disable a target control based on another trigger control
        * @param {Common.triggerControl} triggerCtl control schema name and control type('check', 'radio', 'optionset', 'text') that will trigger the validation and value determine whether the validation should occur
        * @param {string} controlId schema name of the control value being checked enable/disable
        * @param {boolean} clearField indicates whether or not to clear a field when enabled/disabled
        **/
        public static addLinkedEnableToggle(triggerCtl: triggerControl, controlId: string, clearField?: boolean): void {

            // grab the target trigger control.
            var trigger: JQuery = Common.utilities.selectObjectById(triggerCtl.id);

            // if this is a radio button, we need to trigger on the group change to account for deselect.
            // so get the name and use that as the selector
            if (triggerCtl.type == "radio") {
                var name = trigger.attr("name");
                // select the controls with the same name as the trigger target
                trigger = $("input[name='" + name + "']", trigger.parent());
            }

            // add the change handler
            trigger.change(() => {
                var isTriggered: boolean = Common.validators.isControlTriggered(triggerCtl);
                var ctl: JQuery = Common.utilities.selectObjectById(controlId);

                if (Common.utilities.isNullUndefinedEmpty(clearField)) {
                    clearField = true;
                }
                Common.ui.toggleElementEnabled(controlId, isTriggered, clearField);
            });

            // manually perform the "trigger" logic now, with the clear field as null so that we don't inadvertently wipe out the value
            var isTriggeredInit: boolean = Common.validators.isControlTriggered(triggerCtl);

            Common.ui.toggleElementEnabled(controlId, isTriggeredInit, false);
        }

        /** Helper method that will determine whether our trigger control is ... triggered!
         * @param {Common.triggerControl} triggerCtl control schema name and control type('check', 'radio', 'optionset', 'text') that will trigger the validation and value determine whether the validation should occur
         **/
        public static isControlTriggered(triggerCtl: triggerControl): boolean {
            var isTriggered: boolean = false;
            switch (triggerCtl.type) {
                case "check":
                case "radio":
                    var isChecked = $("#" + triggerCtl.id).is(":checked");

                    // if true/false passed, compare against checked value. allows to link to UNCHECKED
                    if (typeof (triggerCtl.value) === "boolean") {
                        isTriggered = (triggerCtl.value == isChecked);
                    }
                    else {
                        isTriggered = isChecked;
                    }
                    break;

                case "optionset":
                    var valueNum: number = $("#" + triggerCtl.id + " option:selected").val();
                    isTriggered = (valueNum == triggerCtl.value);
                    break;

                case "text":
                    var valueStr: string = $("#" + triggerCtl.id).val();
                    isTriggered = (valueStr == triggerCtl.value);
                    break;
            }
            return isTriggered;
        }

        /** Helper method that will attach the red asterisk reqired marker to an input control when a control is 
         * @param {Common.triggerControl} triggerCtl control schema name and control type('check', 'radio', 'optionset', 'text') that will trigger the validation and value determine whether the validation should occur
         * @param {string} valueControlId schema name of the control value being checked for null
        **/
        public static addRequiredMarkingHandler(triggerCtl: triggerControl, valueControlId: string, useClassName?: boolean): void {
            // add the required marker to the trigger control
            var trigger: JQuery = Common.utilities.selectObjectById(triggerCtl.id);

            // if this is a radio button, we need to react to the check of each in the group.
            // so get all inputs in the parent and attach change to that!
            if (triggerCtl.type == "radio") {
                trigger = trigger.parent().find("input[type='radio']");
            }

            trigger.change(
                () => {
                    var isTriggered: boolean = Common.validators.isControlTriggered(triggerCtl);
                    Common.validators.toggleFieldRequired(valueControlId, isTriggered, useClassName);
                }
            );

            // fire the on change event here so that the validator runs on initial load
            trigger.trigger("change");
        }

        /** Hide/show the red asterisk next to a field label to indicate required
        *    NOTE: this is dependent upon the .MSFT-requred-field::after css element present in the Page definition custom CSS
        *   @param {string} controlId control being flagged as required
        *   @param {boolean} useClassName option flag indicating whether to use CSS or inject an element
        **/
        public static toggleFieldRequired(controlId: string, required?: boolean, useClassName?: boolean): void {

            var controlLabelId: string = controlId + "_label";

            var ctl: JQuery = Common.utilities.selectObjectById(controlLabelId);
            Common.validators.toggleElementRequired(ctl, required, useClassName);
        }

        /** Helper function that will add a Required indicator on a Section header
        *    NOTE: this is dependent upon the .MSFT-requred-field::after css element present in the Page definition custom CSS
        *   @param {string} sectionName name of the section in the CRM entity form
        *   @param {boolean} required option flag indicating whether to add or remove reqiured flag
        *   @param {boolean} useClassName option flag indicating whether to use CSS or inject an element
        **/
        public static toggleSectionRequired(sectionName: string, required?: boolean, useClassName?: boolean): void {

            //var selector: string = "table.section[data-name='" + sectionDataName + "']";
            //var element: JQuery = $(selector);

            var section: JQuery = Common.ui.getSection(sectionName);
            if (section.length > 0) {
                Common.validators.toggleElementRequired(section.prev(), required, useClassName);
            }
        }

        /** Helper function that will add a Required indicator on a Tab header
        *    NOTE: this is dependent upon the .MSFT-requred-field::after css element present in the Page definition custom CSS
        *   @param {string} tabName name of the tab in the CRM entity form
        *   @param {boolean} required option flag indicating whether to add or remove reqiured flag
        *   @param {boolean} useClassName option flag indicating whether to use CSS or inject an element
        **/
        public static toggleTabRequired(tabName: string, required?: boolean, useClassName?: boolean): void {

            // var selector: string = "div#EntityFormView div.tab.clearfix[data-name='" + tabName + "']";
            // var element: JQuery = $(selector);
            var tab: JQuery = Common.ui.getTab(tabName);
            
            if (tab.length > 0) {
                Common.validators.toggleElementRequired(tab.prev(), required, useClassName);
            }
        }

        /**
         * Helper method to toggled the required indicator
         * @param {JQuery} element UI element being flagged as require
         * @param {boolean} required is required or not 
         * @param {boolean} useClassName use a class name instead of the injected element
         */
        public static toggleElementRequired(element: JQuery, required?: boolean, useClassName?: boolean): void {
            if (element.length > 0) {
                var validatorId = element.attr("id") + "_required_indicator";

                // allow for message override
                if (Common.utilities.isNullUndefinedEmpty(required)) {
                    required = true;
                }
                if (Common.utilities.isNullUndefinedEmpty(useClassName)) {
                    useClassName = true;
                }

                if (required) {
                    if (useClassName) {
                        element.addClass(REQUIRED_CLASSNAME);
                    }
                    else {
                        // insert the DIV after the element 
                        if (!Common.utilities.elementExists(validatorId)) {
                            var div: JQuery = $("<div class='validators' id='" + validatorId + "'/>");
                            div.html(" *");
                            div.insertAfter(element);
                        }
                    }
                }
                else {
                    if (useClassName) {
                        element.removeClass(REQUIRED_CLASSNAME);
                    }
                    else {
                        $("#" + validatorId).remove();
                    }
                }
            }
        }
    }
}