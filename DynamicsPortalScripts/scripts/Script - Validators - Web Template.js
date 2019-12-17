'use strict';
var REQUIRED_CLASSNAME = "MSFT-requred-field";
var DISABLEDFIELD_CLASSNAME = "MSFT-disabled-field";
var Common;
(function (Common) {
    var triggerControl = (function () {
        function triggerControl(id, type, value, inverseValue) {
            this.id = id;
            this.type = type;
            this.value = value;
            this.inverseValue = inverseValue;
        }
        return triggerControl;
    }());
    Common.triggerControl = triggerControl;
    var validators = (function () {
        function validators() {
        }
        validators.addValidator = function (controlId, validatorIdPrefix, failureMessageMask, evalFunction, initialValue, validationGroup) {
            if (typeof (Page_Validators) == 'undefined') {
                console.log("Page_Validators is undefined in this web form step");
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
            if (!Common.validators.hasValidator(validator.id)) {
                Page_Validators.push(validator);
            }
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
            Common.validators.toggleFieldRequired(validatorId, false, false);
        };
        validators.hasValidator = function (validatorId) {
            var validators = window.Page_Validators;
            if (validators == undefined)
                return;
            for (var _i = 0, validators_2 = validators; _i < validators_2.length; _i++) {
                var validator = validators_2[_i];
                var id = validator.id;
                if (id.indexOf(validatorId, id.length - validatorId.length) !== -1) {
                    return true;
                }
            }
            return false;
        };
        validators.addNumberRangeValidator = function (controlId, minNumber, maxNumber, messageMaskOverride) {
            var validatorPrefix = "NumberRangeValidator";
            var messageMask = null;
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
            Common.validators.addValidator(controlId, validatorPrefix, messageMask, function () {
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
        };
        validators.addDateRangeValidator = function (controlId, minDate, maxDate, messageMaskOverride) {
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
                messageMask = "{label} must be a date between " + minDate.toLocaleDateString() + " and " + maxDate.toLocaleDateString() + ".";
            }
            if (!Common.utilities.isNullUndefinedEmpty(messageMaskOverride)) {
                messageMask = messageMaskOverride;
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
                console.log("Error: unable to find the control with Id: " + controlId);
                return;
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
        validators.addDateFromToValidator = function (dateFromControlId, dateToControlId, errorMessage) {
            if (!Common.utilities.elementExists(dateFromControlId)) {
                throw ("Error: unable to find the control with Id: " + dateFromControlId);
            }
            if (!Common.utilities.elementExists(dateToControlId)) {
                throw ("Error: unable to find the control with Id: " + dateToControlId);
            }
            Common.validators.addValidator(dateToControlId, "DateFromToValidator_" + dateFromControlId, errorMessage, function () {
                var isValid = true;
                var fromDateVal = $("#" + dateFromControlId).val();
                var toDateVal = $("#" + dateToControlId).val();
                if (fromDateVal != null && toDateVal != null) {
                    if (new Date(fromDateVal).getTime() > new Date(toDateVal).getTime()) {
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
                failureMessageMask = "{label} is a required field.";
            }
            validators.toggleFieldRequired(controlId, true, false);
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
                if ($("#" + gridId).is(":visible")) {
                    var rowCount = $("#" + gridId + " div.view-grid table tbody tr[data-id]").length;
                    var hasPageControl = !$("#" + gridId + " div.view-pagination").is(":hidden");
                    if (!isNaN(minRows) && (minRows != null)) {
                        isValid = (rowCount >= minRows);
                    }
                    if (isValid && !isNaN(maxRows) && (maxRows != null)) {
                        isValid = (rowCount <= maxRows);
                    }
                }
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
        validators.addLinkedNullValidator = function (triggerCtl, valueControlId, failureMessageMask, addLinkedEnableToggle, validationGroup, clearField, hideField) {
            if (Common.utilities.isNullUndefinedEmpty(addLinkedEnableToggle)) {
                addLinkedEnableToggle = false;
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "{label} is a required field.";
            }
            if (typeof valueControlId === 'string') {
                valueControlId = [valueControlId];
            }
            $.each(valueControlId, function (i, val) {
                Common.validators.addRequiredMarkingHandler(triggerCtl, val, false);
                if (addLinkedEnableToggle) {
                    Common.validators.addLinkedEnableToggle(triggerCtl, val, clearField, hideField);
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
        validators.addMaxCheckedInGroupValidator = function (checkIds, validationGroup, maxChecked, failureMessageMask) {
            if (Common.utilities.isNullUndefinedEmpty(maxChecked)) {
                maxChecked = 1;
            }
            var labels = new Array();
            for (var _i = 0, checkIds_1 = checkIds; _i < checkIds_1.length; _i++) {
                var id = checkIds_1[_i];
                labels.push($("#" + id + "_label").text());
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "Please check at most " + maxChecked + " item(s) out of the following options: "
                    + labels.map(function (x) { return "'" + x + "'"; }).join(", ");
            }
            var controlId = checkIds[0];
            var selector = checkIds.map(function (x) { return "#" + x + ":checked"; }).join(',');
            Common.validators.addValidator(controlId, "MaxCheckedGroupRequired", failureMessageMask, function () {
                var checkedCount = $(selector).length;
                var isValid = (checkedCount <= maxChecked);
                return isValid;
            }, null, validationGroup);
        };
        validators.GetCheckBoxControlId = function (section) {
            var firstCheck = $(" tbody tr td.cell.checkbox-cell input[type='checkbox']", section).first();
            var controlId = firstCheck.attr("id");
            return controlId;
        };
        validators.addEmailValidator = function (controlId, failureMessageMask) {
            var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            Common.validators.addRegExValidator(controlId, regEx, "Please provide a valid email address for {label}");
        };
        validators.addRegExValidator = function (controlId, regEx, failureMessageMask) {
            if (typeof controlId === 'string') {
                controlId = [controlId];
            }
            if (Common.utilities.isNullUndefinedEmpty(failureMessageMask)) {
                failureMessageMask = "The value provided is not in the correct format.";
            }
            $.each(controlId, function (i, ctlId) {
                Common.validators.addValidator(ctlId, "RegEx", failureMessageMask, function () {
                    var isValid = true;
                    var val = $("#" + ctlId).val();
                    if (!Common.utilities.isNullUndefinedEmpty(val)) {
                        isValid = regEx.test(val);
                        console.log("regex validator: " + val + ", isValid:" + isValid + ", " + regEx);
                    }
                    return isValid;
                });
            });
        };
        validators.addLinkedEnableToggle = function (triggerCtl, controlId, clearField, hideField) {
            var trigger = Common.utilities.selectObjectById(triggerCtl.id);
            if (triggerCtl.type == "radio") {
                var name = trigger.attr("name");
                trigger = $("input[name='" + name + "']", trigger.parent());
            }
            trigger.change(function () {
                var isTriggered = Common.validators.isControlTriggered(triggerCtl);
                var ctl = Common.utilities.selectObjectById(controlId);
                if (Common.utilities.isNullUndefinedEmpty(clearField)) {
                    clearField = true;
                }
                if (Common.utilities.isNullUndefinedEmpty(hideField)) {
                    hideField = false;
                }
                Common.ui.toggleElementEnabled(controlId, isTriggered, clearField, hideField);
            });
            var isTriggeredInit = Common.validators.isControlTriggered(triggerCtl);
            Common.ui.toggleElementEnabled(controlId, isTriggeredInit, false, hideField);
        };
        validators.isControlTriggered = function (triggerCtl) {
            var isTriggered = false;
            var inverse = false;
            if (!Common.utilities.isNullUndefinedEmpty(triggerCtl.inverseValue)) {
                inverse = triggerCtl.inverseValue;
            }
            if (!(triggerCtl.value instanceof Array)) {
                triggerCtl.value = [triggerCtl.value];
            }
            for (var _i = 0, _a = triggerCtl.value; _i < _a.length; _i++) {
                var val = _a[_i];
                if (!isTriggered) {
                    switch (triggerCtl.type) {
                        case "check":
                        case "radio":
                            var isChecked = $("#" + triggerCtl.id).is(":checked");
                            if (typeof (val) === "boolean") {
                                isTriggered = (val == isChecked);
                            }
                            else {
                                isTriggered = isChecked;
                            }
                            break;
                        case "optionset":
                            var valueNum = $("#" + triggerCtl.id + " option:selected").val();
                            isTriggered = (valueNum == val);
                            if (!isTriggered) {
                                valueNum = $("#" + triggerCtl.id).find("input[type=radio]:checked").val();
                                isTriggered = (valueNum == val);
                                if (!isTriggered) {
                                    valueNum = $("#" + triggerCtl.id).val();
                                    isTriggered = (valueNum == val);
                                }
                            }
                            break;
                        case "text":
                            var valueStr = $("#" + triggerCtl.id).val();
                            isTriggered = (valueStr == val);
                            break;
                    }
                }
            }
            if (inverse) {
                isTriggered = !isTriggered;
            }
            return isTriggered;
        };
        validators.addRequiredMarkingHandler = function (triggerCtl, valueControlId, useClassName) {
            var trigger = Common.utilities.selectObjectById(triggerCtl.id);
            if (triggerCtl.type == "radio") {
                trigger = trigger.parent().find("input[type='radio']");
            }
            trigger.change(function () {
                var isTriggered = Common.validators.isControlTriggered(triggerCtl);
                Common.validators.toggleFieldRequired(valueControlId, isTriggered, useClassName);
            });
            trigger.trigger("change");
        };
        validators.toggleFieldRequired = function (controlId, required, useClassName) {
            var controlLabelId = controlId + "_label";
            var ctl = Common.utilities.selectObjectById(controlLabelId);
            Common.validators.toggleElementRequired(ctl, required, useClassName);
        };
        validators.toggleSectionRequired = function (sectionName, required, useClassName) {
            var section = Common.ui.getSection(sectionName);
            if (section.length > 0) {
                Common.validators.toggleElementRequired(section.prev(), required, useClassName);
            }
        };
        validators.toggleTabRequired = function (tabName, required, useClassName) {
            var tab = Common.ui.getTab(tabName);
            if (tab.length > 0) {
                Common.validators.toggleElementRequired(tab.prev(), required, useClassName);
            }
        };
        validators.toggleElementRequired = function (element, required, useClassName) {
            if (element.length > 0) {
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
                        element.parents('.info').addClass('required');
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
        };
        validators.addTriggedSectionToggle = function (triggerCtl, sectionName) {
            var ctl = Common.utilities.selectObjectById(triggerCtl.id);
            var toggleSection = function (clearValues) {
                var isTriggered = Common.validators.isControlTriggered(triggerCtl);
                if (isTriggered) {
                    Common.ui.showSection(sectionName);
                }
                else {
                    Common.ui.hideSection(sectionName, clearValues);
                }
            };
            ctl.change(function () {
                toggleSection(true);
            });
            toggleSection(false);
        };
        validators.addCustomTriggeredSectionToggle = function (sectionName, triggerFunction, triggerCtls) {
            var toggleSection = function (clearValues) {
                var isTriggered = triggerFunction();
                if (isTriggered) {
                    Common.ui.showSection(sectionName);
                }
                else {
                    Common.ui.hideSection(sectionName, clearValues);
                }
            };
            if (typeof triggerCtls === 'string') {
                triggerCtls = [triggerCtls];
            }
            for (var _i = 0, triggerCtls_1 = triggerCtls; _i < triggerCtls_1.length; _i++) {
                var triggerCtl = triggerCtls_1[_i];
                var ctl = Common.utilities.selectObjectById(triggerCtl);
                ctl.change(function () {
                    toggleSection(true);
                });
            }
            toggleSection(false);
        };
        return validators;
    }());
    Common.validators = validators;
})(Common || (Common = {}));
