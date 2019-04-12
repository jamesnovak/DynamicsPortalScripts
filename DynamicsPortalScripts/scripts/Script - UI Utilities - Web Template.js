'use strict';
var Common;
(function (Common) {
    var ui = (function () {
        function ui() {
        }
        ui.renderLabelContents = function (controlId) {
            Common.utilities.selectObjectById(controlId).each(function () {
                var b = $(this).text();
                $(this).empty();
                $(this).append($("<span>" + b + "</span>"));
            });
        };
        ui.clearExtraEmdash = function () {
            window.setTimeout(function () { $("div.text-muted:contains('—')").remove(); }, 500);
        };
        ui.addToOptionsetText = function (option, format) {
            var label = $("label[for='" + option + "']");
            var labelTextEl = label.contents()
                .filter(function () {
                return this.nodeType == 3;
            });
            var text = format.replace("{0}", labelTextEl.text());
            label.text(text);
        };
        ui.makeFormReadOnly = function (datePickIds) {
            $('input[type=text], select, textarea').each(function () {
                $(this).attr('readonly', 'readonly');
            });
            $('input[type=checkbox]:not(:checked), input[type=radio]:not(:checked)').each(function () {
                $(this).attr('disabled', 'disabled');
            });
            $('input[type=checkbox]').click(function (evt) {
                evt.preventDefault();
            });
            $('option:not(:selected)').prop('disabled', 'disabled');
            if (!Common.utilities.isNullUndefinedEmpty(datePickIds)) {
                for (var i = 0; i < datePickIds.length; i++) {
                    var dpId = datePickIds[i];
                    Common.ui.disableDatePick(dpId);
                }
            }
        };
        ui.hideTab = function (tabSelector, clearValues) {
            var tab = Common.ui.getTab(tabSelector);
            tab.hide();
            var header = tab.prev("h2");
            if (header.length > 0) {
                header.hide();
            }
            if (clearValues === true) {
                Common.ui.clearTabValues(tabSelector);
            }
        };
        ui.showTab = function (tabSelector) {
            var tab = Common.ui.getTab(tabSelector);
            tab.show();
            var header = tab.prev("h2");
            if (header.length > 0) {
                header.show();
            }
        };
        ui.getTab = function (tabSelector) {
            var tab = $(Common.ui.valdiateTabSelector(tabSelector));
            return tab;
        };
        ui.getSection = function (sectionName) {
            var selector = "table.section[data-name='" + sectionName + "']";
            var section = $(selector);
            return section;
        };
        ui.getSectionLabel = function (sectionName) {
            var section = Common.ui.getSection(sectionName);
            var label = "";
            if (section.length > 0) {
                var head = section.parent().find('.section-title').first();
                if (head.length > 0) {
                    var headEl = head[0];
                    if (headEl.childNodes.length > 1) {
                        label = $(headEl.firstChild).text();
                    }
                    else {
                        label = headEl.text();
                    }
                    label = $(headEl.firstChild).text();
                }
            }
            return label;
        };
        ui.getTabLabel = function (tabName) {
            var tab = Common.ui.getTab(tabName);
            var label = "";
            if (tab.length > 0) {
                label = tab.prev("h2.tab-title").text();
            }
            return label;
        };
        ui.clearTabValues = function (tabSelector, datePickIds) {
            var tab = Common.ui.getTab(tabSelector);
            Common.ui.clearChildElements(tab);
        };
        ui.clearChildElements = function (ctl) {
            $('input[type=text], select, textarea', ctl).each(function () {
                $(this).val(null);
            });
            $('input[type=checkbox]:checked, input[type=radio]:checked', ctl).each(function () {
                $(this).attr("checked", null);
                $(this).trigger("change");
            });
        };
        ui.hideSection = function (sectionDataName, clearValues) {
            Common.ui.toggleSection(sectionDataName, true, clearValues);
        };
        ui.showSection = function (sectionDataName) {
            Common.ui.toggleSection(sectionDataName, false);
        };
        ui.toggleSection = function (sectionDataName, hide, clearValues) {
            var section = Common.ui.getSection(sectionDataName);
            if (hide === true) {
                section.hide();
                section.prev().hide();
                if (clearValues === true) {
                    Common.ui.clearChildElements(section);
                }
            }
            else {
                section.show();
                section.prev().show();
            }
        };
        ui.valdiateTabSelector = function (tabSelector) {
            if (!(tabSelector.lastIndexOf(".tab[data-name", 0) === 0)) {
                tabSelector = ".tab[data-name='" + tabSelector + "']";
            }
            return tabSelector;
        };
        ui.addPrintButton = function () {
            var ctl = $("#NextButton");
            var button = $('<input type="button" onclick="window.print()" class="btn btn-primary button next submit-btn" value="Print" />');
            ctl.parent().after(button);
        };
        ui.toggleTabDisplay = function (tabIdList, hide, clearValues) {
            if (Common.utilities.isNullOrUndefined(hide)) {
                hide = true;
            }
            for (var _i = 0, tabIdList_1 = tabIdList; _i < tabIdList_1.length; _i++) {
                var tabId = tabIdList_1[_i];
                if (hide) {
                    Common.ui.hideTab(tabId, clearValues);
                }
                else {
                    Common.ui.showTab(tabId);
                }
            }
        };
        ui.maskSSN = function (controlId) {
            $.getScript("https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.3/jquery.mask.js", function () {
                var ctl = $("#" + controlId);
                ctl.mask("000-00-0000");
            });
        };
        ui.maskDate = function () {
            $("[data-date-format='M/D/YYYY']").attr("placeholder", "MM/DD/YYYY");
        };
        ui.maskDateTime = function () {
            $("[data-date-format='M/D/YYYY h:mm A']").attr("placeholder", "MM/DD/YYYY h:mm A");
        };
        ui.disableCheck = function (controlId) {
            var ctl = Common.utilities.selectObjectById(controlId);
            ctl.removeAttr('checked');
            ctl.attr('disabled', 'disabled');
        };
        ui.enableCheck = function (controlId) {
            var ctl = Common.utilities.selectObjectById(controlId);
            ctl.removeAttr('disabled');
        };
        ui.toggleCheckEnabled = function (controlIdList, enable) {
            if (Common.utilities.isNullOrUndefined(enable)) {
                enable = true;
            }
            for (var _i = 0, controlIdList_1 = controlIdList; _i < controlIdList_1.length; _i++) {
                var controlId = controlIdList_1[_i];
                if (enable) {
                    Common.ui.enableCheck(controlId);
                }
                else {
                    Common.ui.disableCheck(controlId);
                }
            }
        };
        ui.toggleElementEnabled = function (elementId, enable, clearValue) {
            if (Common.utilities.isNullUndefinedEmpty(clearValue)) {
                clearValue = false;
            }
            if (Common.utilities.isNullUndefinedEmpty(enable)) {
                enable = false;
            }
            var ctl = Common.utilities.selectObjectById(elementId);
            if (clearValue == true) {
                ctl.val(null);
                if (ctl.prop("tagName").toLowerCase() == "textarea") {
                    ctl.empty();
                }
            }
            if (enable) {
                ctl.removeAttr('readonly');
            }
            else {
                ctl.attr('readonly', true);
            }
        };
        ui.toggleElementsEnabled = function (elementIdList, enable, clearValue) {
            for (var _i = 0, elementIdList_1 = elementIdList; _i < elementIdList_1.length; _i++) {
                var elementId = elementIdList_1[_i];
                Common.ui.toggleElementEnabled(elementId, enable, clearValue);
            }
        };
        ui.disableDatePick = function (controlId) {
            var cal = Common.utilities.selectObjectById(controlId);
            cal.next().data("DateTimePicker").destroy();
        };
        ui.MakeFieldReadOnly = function (readField, param) {
            $(readField).prop("readonly", param);
            if (!param)
                $(readField).removeClass("readonly");
            else
                $(readField).addClass("readonly");
        };
        return ui;
    }());
    Common.ui = ui;
})(Common || (Common = {}));
Common.ui.clearExtraEmdash();
