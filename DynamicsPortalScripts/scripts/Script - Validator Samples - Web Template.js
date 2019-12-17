var PortalScriptSamples;
(function (PortalScriptSamples) {
    var AllValidatorSamples = (function () {
        function AllValidatorSamples() {
        }
        AllValidatorSamples.ApplyValidators = function () {
            var name = $("#new_name").val();
            if (Common.utilities.isNullUndefinedEmpty(name)) {
                $("#new_name").val("New Sample Validator Item!");
            }
            Common.validators.addLinkedNullValidator(new Common.triggerControl("new_linkedcheckbox", "check", true), "new_linkedcheckboxtext", "Please enter a value for the 'Linked Text Box - Checkbox'", true);
            Common.validators.addLinkedNullValidator(new Common.triggerControl("new_linkedoptionset", "optionset", 100000004), "new_linkedoptionsettext", null, true, null, true, true);
            Common.validators.addFutureDateValidator("new_futuredate");
            Common.validators.addMinDateValidator("new_mindate", new Date("10/10/2017"));
            Common.validators.addMaxDateValidator("new_maxdate", new Date("10/10/2020"));
            Common.validators.addDateRangeValidator("new_daterange", new Date("10/10/2015"), new Date("10/10/2025"));
            Common.validators.addGridRequiredRowsValidator("new_numbergriditems", "grid_subitems_exact", "The grid must include the same number of items selected in 'Grid - Number Items'.", true);
            Common.validators.addGridNumRowsValidator("grid_subitems_min", 2, null, "You must include at least 2 items in the grid.", false);
            Common.validators.addMinCheckedValidator("section_min_checked", null, 2);
            Common.validators.addMaxCheckedValidator("section_max_checked", null, 3, "You can check at most 3 items from the list in 'Maximum Checked Values'");
        };
        return AllValidatorSamples;
    }());
    PortalScriptSamples.AllValidatorSamples = AllValidatorSamples;
})(PortalScriptSamples || (PortalScriptSamples = {}));
