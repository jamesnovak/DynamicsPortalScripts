'use strict';
var Common;
(function (Common) {
    var triggerControl = (function () {
        function triggerControl(id, type, value) {
            this.id = id;
            this.type = type;
            this.value = value;
        }
        return triggerControl;
    }());
    Common.triggerControl = triggerControl;
    var validators = (function () {
        function validators() {
        }
        validators.addValidator = function (controlId, validatorIdPrefix, failureMessageMask, evalFunction, initialValue, validationGroup) {
            if (typeof (Common.Page_Validators) == 'undefined') {
                throw ("Page_Validators is undefined in this web form step");
            }
            if (Common.utilities.isNullUndefinedEmpty(validationGroup))
                validationGroup = "";
            if (Common.utilities.isNullUndefinedEmpty(initialValue))
                initialValue = "";
            var controlLabelId = controlId + "_label";
            var controlLabel = "";
            if ($("#" + controlLabelId).length == 0) {
                controlLabelId = controlId;
            }
            else {
                controlLabel = $("#" + controlLabelId).text();
            }
            var failureMessage = failureMessageMask.replace("{label}", controlLabel);
            var validator = document.createElement("span");
            validator.style.display = "none";
            validator.id = validatorIdPrefix + "_" + controlId;
            validator.controltovalidate = controlId;
            validator.errormessage = "<a href='#" + controlLabelId + "'>" + failureMessage + "</a>";
            validator.validationGroup = validationGroup;
            validator.setAttribute("initialvalue", initialValue);
            validator.evaluationfunction = evalFunction;
            Common.Page_Validators.push(validator);
        };
        validators.removeValidator = function (validatorId) {
            var validators = window.Page_Validators;
            if (validators == undefined)
                return;
            for (var _i = 0, validators_1 = validators; _i < validators_1.length; _i++) {
                var validator = validators_1[_i];
                var id = validator.id;
                if (id.indexOf(validatorId) > -1) {
                    Array.remove(validators, validator);
                }
            }
            Common.ui.toggleFieldRequired(validatorId, false);
        };
        validators.hasValidator = function (validatorId) {
            var validators = window.Page_Validators;
            if (validators == undefined)
                return;
            for (var _i = 0, validators_2 = validators; _i < validators_2.length; _i++) {
                var validator = validators_2[_i];
                var id = validator.id;
                if (id.indexOf(validatorId) > -1) {
                    return true;
                }
            }
            return false;
        };
        validators.addDateRangeValidator = function (controlId, minDate, maxDate) {
            var validatorPrefix = "DateRangeValidator";
            var messageMask = null;
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
            Common.validators.addValidator(controlId, validatorPrefix, messageMask, function () {
                var isValid = true;
                var dateVal = $("#" + controlId).val();
                if (dateVal != null) {
                    var newDate = new Date(dateVal);
                    var newDateTime = newDate.getTime();
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
        };
        validators.addMaxDateValidator = function (controlId, maxDate) {
            Common.validators.addDateRangeValidator(controlId, null, maxDate);
        };
        validators.addMinDateValidator = function (controlId, minDate) {
            this.addDateRangeValidator(controlId, minDate);
        };
        validators.addFutureDateValidator = function (controlId) {
            if (!Common.utilities.elementExists(controlId)) {
                throw ("Error: unable to find the control with Id: " + controlId);
            }
            Common.validators.addValidator(controlId, "FutureDateValidator", "{label} cannot be set to a future date.", function () {
                var isValid = true;
                var dateVal = $("#" + controlId).val();
                if (dateVal != null) {
                    var newDate = new Date(dateVal), now = new Date();
                    if (newDate.getTime() > now.getTime()) {
                        isValid = false;
                    }
                }
                return isValid;
            });
        };
        validators.addMultipleNullValidators = function (controlIdList) {
            for (var i = 0; i < controlIdList.length; i++) {
                Common.validators.addNullValidator(controlIdList[i]);
            }
        };
        validators.addNullValidator = function (controlId, failureMessageMask) {
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please provide a value for {label}.";
            }
            Common.ui.toggleFieldRequired(controlId, true);
            Common.validators.addValidator(controlId, "GeneralNullValidator", failureMessageMask, function () {
                var isValid = true;
                if ($("#" + controlId + " input[type='radio']").length > 0) {
                    if ($("#" + controlId + " input[type='radio']:checked").length == 0) {
                        isValid = false;
                    }
                }
                else {
                    var value = $("#" + controlId).val();
                    isValid = !Common.utilities.isNullUndefinedEmpty(value);
                }
                return isValid;
            });
        };
        validators.addGridNumRowsValidator = function (gridId, minRows, maxRows, failureMessageMask, exactMatch) {
            if (Common.utilities.isNullUndefinedEmpty(exactMatch)) {
                exactMatch = false;
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "The selected value in {label} does not match the number of items in the grid.";
            }
            var validatorId = "GridNumRowsValidator_" + gridId;
            Common.validators.addValidator(gridId, validatorId, failureMessageMask, function () {
                var isValid = true;
                console.log("isValid: " + isValid + ", minRows: " + minRows + ", maxRows: " + maxRows);
                var rowCount = $("#" + gridId + " div.view-grid table tbody tr[data-id]").length;
                var hasPageControl = !$("#" + gridId + " div.view-pagination").is(":hidden");
                console.log("rowCount: " + rowCount + ", hasPageControl: " + hasPageControl);
                if (!isNaN(minRows) && (minRows != null)) {
                    isValid = (rowCount >= minRows);
                }
                if (isValid && !isNaN(maxRows) && (maxRows != null)) {
                    isValid = (rowCount <= maxRows);
                }
                console.log("isValid: " + isValid + "rowCount: " + rowCount + ",  minRows: " + minRows + ", maxRows: " + maxRows);
                return isValid;
            });
        };
        validators.addGridRequiredRowsValidator = function (controlId, gridId, failureMessageMask, exactMatch) {
            var id = "#" + controlId;
            if ($(id).length == 0) {
                console.log("invalid id: " + controlId);
                return;
            }
            if (Common.utilities.isNullUndefinedEmpty(exactMatch)) {
                exactMatch = false;
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "The selected value in {label} does not match the number of items in the grid.";
            }
            var validatorId = "GridRequiredRowsValidator_" + controlId;
            Common.validators.addValidator(controlId, validatorId, failureMessageMask, function () {
                var isValid = true;
                var controlValue = $("#" + controlId + " option:selected").text().trim();
                console.log("id:" + controlId + ", controlValue: '" + controlValue + "', controlValue.length: " + controlValue.length);
                if (controlValue.length > 0) {
                    var selectedNumber = parseInt(controlValue);
                    var rowCount = $("#" + gridId + " div.view-grid table tbody tr[data-id]").length;
                    var hasPageControl = !$("#" + gridId + " div.view-pagination").is(":hidden");
                    console.log("rowCount: " + rowCount + ", controlValue: " + controlValue + ", isNaN(controlValue): " + isNaN(controlValue) + ", selectedNumber: " + selectedNumber);
                    console.log("hasPageControl: " + hasPageControl);
                    if (isNaN(controlValue)) {
                        isValid = (rowCount >= selectedNumber) || (hasPageControl);
                    }
                    else {
                        isValid = (rowCount == selectedNumber) && (!hasPageControl);
                    }
                }
                return isValid;
            });
        };
        validators.addLinkedNullValidator = function (triggerCtl, valueControlId, failureMessageMask, addLinkedEnableToggle, validationGroup, clearField) {
            if (Common.utilities.isNullUndefinedEmpty(addLinkedEnableToggle)) {
                addLinkedEnableToggle = false;
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please provide a value for {label}.";
            }
            if (typeof valueControlId === 'string') {
                valueControlId = [valueControlId];
            }
            $.each(valueControlId, function (i, val) {
                Common.ui.addRequiredMarkingHandler(triggerCtl, val, false);
                if (addLinkedEnableToggle) {
                    Common.validators.addLinkedEnableToggle(triggerCtl, val, clearField);
                }
                Common.validators.addValidator(val, "DependentNullValidator", failureMessageMask, function () {
                    var isValid = true;
                    var isTriggered = Common.validators.isControlTriggered(triggerCtl);
                    if (isTriggered == true) {
                        var value = null;
                        if ($("#" + val + " input[type='radio']").length > 0) {
                            if ($("#" + val + " input[type='radio']:checked").length > 0) {
                                value = true;
                            }
                        }
                        else {
                            value = $("#" + val).val();
                        }
                        if (Common.utilities.isNullUndefinedEmpty(value)) {
                            isValid = false;
                        }
                    }
                    return isValid;
                }, null, validationGroup);
            });
        };
        validators.addMinCheckedValidator = function (sectionName, validationGroup, minChecked, failureMessageMask) {
            var selector = "table.section[data-name='" + sectionName + "']";
            var section = Common.ui.getSection(sectionName);
            var sectionLabel = Common.ui.getSectionLabel(sectionName);
            if (Common.utilities.isNullUndefinedEmpty(minChecked)) {
                minChecked = 1;
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please check at least " + minChecked + " item(s) in the section '" + sectionLabel + "'";
            }
            var controlId = Common.validators.GetCheckBoxControlId(section);
            Common.validators.addValidator(controlId, "MinCheckedRequired", failureMessageMask, function () {
                var checkedCount = $(selector + " tbody tr td.cell.checkbox-cell input[type='checkbox']:checked").length;
                var isValid = (checkedCount >= minChecked);
                return isValid;
            }, null, validationGroup);
        };
        validators.addMaxCheckedValidator = function (sectionName, validationGroup, maxChecked, failureMessageMask) {
            var selector = "table.section[data-name='" + sectionName + "']";
            var sectionLabel = Common.ui.getSectionLabel(sectionName);
            var section = Common.ui.getSection(sectionName);
            if (Common.utilities.isNullUndefinedEmpty(maxChecked)) {
                maxChecked = 1;
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please check at most " + maxChecked + " item(s) in the section '" + sectionLabel + "'";
            }
            var controlId = Common.validators.GetCheckBoxControlId(section);
            Common.validators.addValidator(controlId, "MaxCheckedRequired", failureMessageMask, function () {
                var checkedCount = $(selector + " tbody tr td.cell.checkbox-cell input[type='checkbox']:checked").length;
                var isValid = (checkedCount <= maxChecked);
                return isValid;
            }, null, validationGroup);
        };
        validators.GetCheckBoxControlId = function (section) {
            var firstCheck = $(" tbody tr td.cell.checkbox-cell input[type='checkbox']", section).first();
            var controlId = firstCheck.attr("id");
            return controlId;
        };
        validators.addLinkedEnableToggle = function (triggerCtl, controlId, clearField) {
            var trigger = Common.ui.selectObjectById(triggerCtl.id);
            if (triggerCtl.type == "radio") {
                var name = trigger.attr("name");
                trigger = $("input[name='" + name + "']", trigger.parent());
            }
            trigger.change(function () {
                var isTriggered = Common.validators.isControlTriggered(triggerCtl);
                var ctl = Common.ui.selectObjectById(controlId);
                if (Common.utilities.isNullUndefinedEmpty(clearField)) {
                    clearField = true;
                }
                Common.ui.toggleElementEnabled(controlId, isTriggered, clearField);
            });
            var isTriggeredInit = Common.validators.isControlTriggered(triggerCtl);
            Common.ui.toggleElementEnabled(controlId, isTriggeredInit, false);
        };
        validators.isControlTriggered = function (triggerCtl) {
            var isTriggered = false;
            switch (triggerCtl.type) {
                case "check":
                case "radio":
                    var isChecked = $("#" + triggerCtl.id).is(":checked");
                    if (typeof (triggerCtl.value) === "boolean") {
                        isTriggered = (triggerCtl.value == isChecked);
                    }
                    else {
                        isTriggered = isChecked;
                    }
                    break;
                case "optionset":
                    var valueNum = $("#" + triggerCtl.id + " option:selected").val();
                    isTriggered = (valueNum == triggerCtl.value);
                    break;
                case "text":
                    var valueStr = $("#" + triggerCtl.id).val();
                    isTriggered = (valueStr == triggerCtl.value);
                    break;
            }
            return isTriggered;
        };
        return validators;
    }());
    Common.validators = validators;
})(Common || (Common = {}));
