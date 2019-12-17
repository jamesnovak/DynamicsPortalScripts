/// DEPENDS ON Common.ui and Common.utilities

/// <reference path="../typings/jquery/jquery.d.ts"/>
'use strict';

/** Constants! */
// TODO add more constants for selectors
const REQUIRED_CLASSNAME: string = "MSFT-requred-field";
const DISABLEDFIELD_CLASSNAME: string = "MSFT-disabled-field";

/**
 * General namespace for all Portal related scripts.
 * This can be modified for a business or project but all references will need to be updated
 * @preferred
 */
namespace Common {

    /** Interface that defines triggering control parameter
     * This is intended to group properties for Trigger controls rather than long lists
     * **/
    export interface ITriggerControl {
        id: string,
        type: string,
        value: any,
        inverseValue?: boolean
    }
    /** Implementation of [[ITriggerControl]] used as a method parameter in several linked validators
     */
    export class triggerControl implements ITriggerControl {
        /**
         * Constructor
         * @param {string} id trigger control id
         * @param {string} type control type - 'check', 'radio', 'optionset', 'text'
         * @param {any} value trigger value(s) for the control (pass)
         * @param {boolean?} inverseValue trigger on all but the value(s) provideds
         */
        constructor(id: string, type: string, value: any, inverseValue?: boolean) {
            this.id = id;
            this.type = type;
            this.value = value;
            this.inverseValue = inverseValue;
        }
        id: string;
        type: string;
        value: any;
        inverseValue?: boolean;
    }

    /**
     * Contains custom Portal Validators and related helper utilities 
     * Extending functionality described here: [Adding custom JavaScript](https://docs.microsoft.com/en-us/dynamics365/customer-engagement/portals/add-custom-javascript)
     * */
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
                console.log ("Page_Validators is undefined in this web form step");
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

            // prevent duplicates for same validation added multiple times
            // TODO: may want to remove previous one and replace instead
            if (!Common.validators.hasValidator(validator.id)) {
            // add the page validator and hook the error message click
            Page_Validators.push(validator);
        }
        }

        /**
         * Remove an existing validator from a control. 
         * If passing the control Id, all validators for that control will be removed.
         * 
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
            Common.validators.toggleFieldRequired(validatorId, false, false);
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
                //if (id.indexOf(validatorId) > -1) {
                //    return true;
                //}
                if (id.indexOf(validatorId, id.length - validatorId.length) !== -1) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Ensures that a number is greater than or equal to a min number, less than or equal to a min number, between both, inclusive.
         * @param {string} controlId Number control being validated
         * @param {number} minNumber min number allowed for the control
         * @param {number} maxNumber max number allowed for the control
         */
        public static addNumberRangeValidator(controlId: string, minNumber?: number, maxNumber?: number, messageMaskOverride?: string): void {
            var validatorPrefix: string = "NumberRangeValidator";
            var messageMask: string = null;

            // make sure the control exists~
            if (!Common.utilities.elementExists(controlId)) {
                throw ("Error: unable to find the control with Id: " + controlId);
            }

            if (minNumber == null && maxNumber == null) {
                throw ("Error: minNumber and maxNumber cannot both be null.");
            }
            else if (minNumber == null && maxNumber != null) {
                validatorPrefix = "MaxNumberValidator";
                messageMask = "{label} must be less than or equal to " + maxNumber + ".";
            }
            else if (minNumber != null && maxNumber == null) {
                validatorPrefix = "MinNumberValidator";
                messageMask = "{label} must be greater than or equal to " + minNumber + ".";
            }
            else {
                messageMask = "{label} must be a a number between " + minNumber + " and " + maxNumber + ", inclusive.";
            }

            if (!Common.utilities.isNullUndefinedEmpty(messageMaskOverride)) {
                messageMask = messageMaskOverride;
            }

            // add the validator to the control
            Common.validators.addValidator(controlId,
                validatorPrefix,
                messageMask,
                () => {
                    var isValid = true;
                    var val = $("#" + controlId).val();

                    if (!Common.utilities.isNullUndefinedEmpty(val)) {
                        if (minNumber == null && maxNumber != null) {
                            if (val > maxNumber) {
                                isValid = false;
                            }
                        }
                        else if (minNumber != null && maxNumber == null) {
                            if (val < minNumber) {
                                isValid = false;
                            }
                        }
                        else {
                            if (val < minNumber ||
                                val > maxNumber) {
                                isValid = false;
                            }
                        }
                    }
                    return isValid;
                });
        }

        /**
         * Ensures that a date is on or after a min date, on or before a max date, or between both dates.
         * 
         * Example usage:
         * ```
         *  Common.validators.addDateRangeValidator("futz_daterangevalue", new Date("10/10/2015"), new Date("10/10/2025"));
         * ```
         * @param {string} controlId Date control being validated
         * @param {Date} minDate min date allowed for the control
         * @param {Date} maxDate max date allowed for the control
         */
        public static addDateRangeValidator(controlId: string, minDate?: Date, maxDate?: Date, messageMaskOverride?: string): void {
            
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
                messageMask = "{label} must be a date between " + minDate.toLocaleDateString() + " and " + maxDate.toLocaleDateString() + ".";
            }

            if (!Common.utilities.isNullUndefinedEmpty(messageMaskOverride)) {
                messageMask = messageMaskOverride;
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
         * Ensure that a date is or or before a given date.
         * 
         * Example usage:
         * ```typescript
         *  Common.validators.addMaxDateValidator("futz_maxdatevalue", new Date("10/10/2020"));
         * ```
         * @param {string} controlId Date control being validated
         * @param {Date} maxDate max date allowed for the control
         */
        public static addMaxDateValidator(controlId: string, maxDate: Date): void {
            Common.validators.addDateRangeValidator(controlId, null, maxDate);
        }

        /**
         * Ensure that a date is on or after a given date
         * 
         * Example usage:
         * ```typescript
         * Common.validators.addMinDateValidator("futz_mindatevalue", new Date("10/10/2017"));
         * ```
         * @param {string} controlId Date control being validated
         * @param {Date} minDate  min date allowed for the control
         */
        public static addMinDateValidator(controlId: string, minDate: Date): void {
            this.addDateRangeValidator(controlId, minDate);
        }

        /** Injects a new control validator that restricts users from entering dates set in the future
         * 
         * Example usage:
         * ```typescript
         * Common.validators.addFutureDateValidator("futz_nofuturedate");
         * ```
        * @param {string} controlId schema name of the control being validated
        * @return {void}
        **/
        public static addFutureDateValidator(controlId: string): void {

            // make sure the control exists~
            if (!Common.utilities.elementExists(controlId)) {
                console.log("Error: unable to find the control with Id: " + controlId);
                return;
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

        /**
         * Injects a new control validator that restricts users from entering a dates in "from"/"to" date fields where "to" is before "from".
         * @param dateFromControlId schema name of the "from" date control being validated
         * @param dateToControlId schema name of the "to" date control being validated
         * @param errorMessage error message to show if "to" is before "from"
         */
        public static addDateFromToValidator(dateFromControlId: string, dateToControlId: string, errorMessage: string) {
            // make sure the controls exists~
            if (!Common.utilities.elementExists(dateFromControlId)) {
                throw ("Error: unable to find the control with Id: " + dateFromControlId);
            }
            if (!Common.utilities.elementExists(dateToControlId)) {
                throw ("Error: unable to find the control with Id: " + dateToControlId);
            }

            // use the common method to add the date after validation
            Common.validators.addValidator(dateToControlId,
                "DateFromToValidator_" + dateFromControlId,
                errorMessage,
                () => {
                    var isValid = true;
                    var fromDateVal = $("#" + dateFromControlId).val();
                    var toDateVal = $("#" + dateToControlId).val();
                    if (fromDateVal != null && toDateVal != null) {
                        // TODO - use UTC conversions?
                        if (new Date(fromDateVal).getTime() > new Date(toDateVal).getTime()) {
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
                failureMessageMask = "{label} is a required field.";
            }

            validators.toggleFieldRequired(controlId, true, false);

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
                    //console.log("isValid: " + isValid + ", minRows: " + minRows + ", maxRows: " + maxRows);

                    if ($("#" + gridId).is(":visible")) {
                    // get the number of rows in the grid
                    // TODO move this into helper function?
                    var rowCount: number = $("#" + gridId + " div.view-grid table tbody tr[data-id]").length;

                    // see if the pager is there with pages
                    var hasPageControl: boolean = !$("#" + gridId + " div.view-pagination").is(":hidden");
                        //console.log("rowCount: " + rowCount + ", hasPageControl: " + hasPageControl);

                    // check min rows
                    if (!isNaN(minRows as any) && (minRows != null)) {
                        isValid = (rowCount >= minRows);
                    }

                    if (isValid && !isNaN(maxRows as any) && (maxRows != null)) {
                        isValid = (rowCount <= maxRows);
                    }
                    }
                    //console.log("isValid: " + isValid + "rowCount: " + rowCount + ",  minRows: " + minRows + ", maxRows: " + maxRows);

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
         * 
         * Example usage:
         * ```typescript
         * Common.validators.addLinkedNullValidator(new Common.triggerControl("futz_linkedcheckbox", "check", true), "futz_linkedtextboxcheckbox", "Please enter a value for the 'Linked Text Box - Checkbox'", true);
         * ```
         * @param {Common.triggerControl} triggerCtl control schema name and control type('check', 'radio', 'optionset', 'text') that will trigger the validation and value determine whether the validation should occur
         * @param {string | string[]} valueControlId schema name of the control value being checked for null
         * @param {string} failureMessageMask optional mask for the message to be displayed. The slug {label} will be replaced with the value field label
         * @param {boolean} addLinkedEnableToggle optional flag indicating whether to toggle the value control enabled when trigger is met
         * @param {string} validationGroup validation group for evaluating this validator
         * @param {boolean} clearField indicates whether or not the field should be cleared if enabled/disabled
         * @param {boolean} hideField indicates whether or not the field should be hidden when disabled
         * @param {boolean} inverse indicates whether to inverse the enabling/disabling (if field1 value is some value, disable/hide another field, otherwise enable/show)
         * @returns {void}
         */
        public static addLinkedNullValidator( triggerCtl: triggerControl, valueControlId: string | string[], failureMessageMask?: string,
            addLinkedEnableToggle?: boolean, validationGroup?: string, clearField?: boolean, hideField?: boolean): void {
            // debugger
            // check our parameters, set default
            if (Common.utilities.isNullUndefinedEmpty(addLinkedEnableToggle)) {
                addLinkedEnableToggle = false;
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "{label} is a required field.";
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
                    Common.validators.addLinkedEnableToggle(triggerCtl, val, clearField, hideField);
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

        /** Adds a validator that will ensure that a max number of check boxes have been checked for a specific section
            @param {string} sectionName     name of the section that contains the group of checkboxes
            @param {string} validationGroup     validation group for the checkboxes
            @param {boolean} maxChecked         max number of items to be checked.  Default: 1
            @param {string} failureMessageMask  failure message when the max number of items is not checked
        **/
        public static addMaxCheckedInGroupValidator(checkIds: Array<string>, validationGroup: string, maxChecked?: number, failureMessageMask?: string) {

            if (Common.utilities.isNullUndefinedEmpty(maxChecked)) {
                maxChecked = 1;
            }
            var labels: Array<string> = new Array<string>();

            // built label
            for (var id of checkIds) {
                labels.push($("#" + id + "_label").text());
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please check at most " + maxChecked + " item(s) out of the following options: "
                    + labels.map(x => "'" + x + "'").join(", ");
            }

            // get ID of the first checkbox so we can attach a validator 
            var controlId: string = checkIds[0];
            var selector: string = checkIds.map(x => "#" + x + ":checked").join(',');

            Common.validators.addValidator(controlId,
                "MaxCheckedGroupRequired",
                failureMessageMask,
                () => {
                    // check to see if any checked 
                    var checkedCount: number = $(selector).length;
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
        private static GetCheckBoxControlId(section: JQuery): string {
            // get the list of checkboxes in the section and grab the ID
            var firstCheck: JQuery = $(" tbody tr td.cell.checkbox-cell input[type='checkbox']", section).first();
            var controlId: string = firstCheck.attr("id");

            return controlId;
        }

        /**
         * Add an email validator to a text control
         * @param controlId one or more IDs to which the validator will be applied.
         * @param failureMessageMask Failure message for the user
         */
        public static addEmailValidator(controlId: string | string[], failureMessageMask?: string): void {

            var regEx: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

            Common.validators.addRegExValidator(controlId, regEx, "Please provide a valid email address for {label}");
        }
        /**
         * General method for applying a regular expression validator to a control
         * @param controlId one or more control Ids for validaton
         * @param regEx regEx for the test
         * @param failureMessageMask Failure message for the validation
         */
        public static addRegExValidator(controlId: string | string[], regEx: RegExp, failureMessageMask?: string): void {
            //check to see if controlId is a string or string array, for the looping
            if (typeof controlId === 'string') {
                controlId = [controlId];
            }

            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "The value provided is not in the correct format.";
            }

            $.each(controlId, (i, ctlId) => {

                Common.validators.addValidator(ctlId, "RegEx", failureMessageMask, () => {
                    var isValid: boolean = true;
                    var val = $("#" + ctlId).val();
                    if (!Common.utilities.isNullUndefinedEmpty(val)) {

                        isValid = regEx.test(val);
                        console.log("regex validator: " + val + ", isValid:" + isValid + ", " + regEx);
                    }
                    return isValid;
                });
            });
        }

        /** Helper method that will enable or disable a target control based on another trigger control
        * @param {Common.triggerControl} triggerCtl control schema name and control type('check', 'radio', 'optionset', 'text') that will trigger the validation and value determine whether the validation should occur
        * @param {string} controlId schema name of the control value being checked enable/disable
        * @param {boolean} clearField indicates whether or not to clear a field when enabled/disabled
        * @param {boolean} hideField indicates whether or not to hide a field that is being disabled
        **/
        public static addLinkedEnableToggle(triggerCtl: triggerControl, controlId: string, clearField?: boolean, hideField?: boolean): void {

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
                if (Common.utilities.isNullUndefinedEmpty(hideField)) {
                    hideField = false;
                }
                Common.ui.toggleElementEnabled(controlId, isTriggered, clearField, hideField);
            });

            // manually perform the "trigger" logic now, with the clear field as null so that we don't inadvertently wipe out the value
            var isTriggeredInit: boolean = Common.validators.isControlTriggered(triggerCtl);

            Common.ui.toggleElementEnabled(controlId, isTriggeredInit, false, hideField);
        }

        /** Helper method that will determine whether our trigger control is ... triggered!
         * @param {Common.triggerControl} triggerCtl control schema name and control type('check', 'radio', 'optionset', 'text') that will trigger the validation and value determine whether the validation should occur
         **/
        public static isControlTriggered(triggerCtl: triggerControl): boolean {
            var isTriggered: boolean = false;
            var inverse: boolean = false;
            if (!Common.utilities.isNullUndefinedEmpty(triggerCtl.inverseValue)) {
                inverse = triggerCtl.inverseValue;
            }

            if (!(triggerCtl.value instanceof Array)) {
                triggerCtl.value = [triggerCtl.value];
            }
            for (let val of triggerCtl.value) {
                if (!isTriggered) {
            switch (triggerCtl.type) {
                case "check":
                case "radio":
                    var isChecked = $("#" + triggerCtl.id).is(":checked");

                    // if true/false passed, compare against checked value. allows to link to UNCHECKED
                            if (typeof (val) === "boolean") {
                                isTriggered = (val == isChecked);
                    }
                    else {
                        isTriggered = isChecked;
                    }
                    break;

                case "optionset":
                    var valueNum: number = $("#" + triggerCtl.id + " option:selected").val();
                            isTriggered = (valueNum == val);
                            if (!isTriggered) {
                                // the optionset could be getting rendered as radio buttons
                                valueNum = $("#" + triggerCtl.id).find("input[type=radio]:checked").val();
                                isTriggered = (valueNum == val);
                                // the optionset (lookup) can just be a text field
                                if (!isTriggered) {
                                    valueNum = $("#" + triggerCtl.id).val();
                                    isTriggered = (valueNum == val);
                                }
                            }
                    break;

                case "text":
                    var valueStr: string = $("#" + triggerCtl.id).val();
                            isTriggered = (valueStr == val);
                    break;
                    }
                }
            }
            if (inverse) {
                isTriggered = !isTriggered;
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
                //var validatorId = element.attr("id") + "_required_indicator";

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
                        element.parents('.info').addClass('required'); // same as normal required fields on the portal
                    }
                }
                else {
                    if (useClassName) {
                        element.removeClass(REQUIRED_CLASSNAME);
                    }
                    else {
                        element.parents('.info').removeClass('required');
                    }
                }
            }
        }

        /**
         * Helper function to hide/show sections based off a triggerControl getting triggered.
         * @param {triggerControl} triggerCtl the trigger control
         * @param {string} sectionName the section name
         */
        public static addTriggedSectionToggle(triggerCtl: triggerControl, sectionName: string): void {
            let ctl = Common.utilities.selectObjectById(triggerCtl.id);

            let toggleSection = function (clearValues: boolean) {
                let isTriggered: boolean = Common.validators.isControlTriggered(triggerCtl);
                if (isTriggered) {
                    Common.ui.showSection(sectionName);
                }
                else {
                    Common.ui.hideSection(sectionName, clearValues);
                }
            }
            ctl.change(() => {
                toggleSection(true);
            });
            toggleSection(false);
        }

        public static addCustomTriggeredSectionToggle(sectionName: string, triggerFunction: () => boolean, triggerCtls: string | string[]): void {
            let toggleSection = function (clearValues: boolean) {
                let isTriggered: boolean = triggerFunction();
                if (isTriggered) {
                    Common.ui.showSection(sectionName);
                }
                else {
                    Common.ui.hideSection(sectionName, clearValues);
                }
            }

            if (typeof triggerCtls === 'string') {
                triggerCtls = [triggerCtls];
            }

            for (let triggerCtl of triggerCtls) {
                let ctl = Common.utilities.selectObjectById(triggerCtl);
                ctl.change(() => {
                    toggleSection(true);
                });
            }
            
            toggleSection(false);
        }
    }
}