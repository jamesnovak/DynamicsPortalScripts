/** 
 * Uncomment the following and include when deploying to Web Template 'Script - Validator Samples'
 *  {% include 'Script - Common Utilities' %}
 *  {% include 'Script - UI Utilities' %}
 *  {% include 'Script - Validators' %}
*/

/** Namespace for tracking our Samples  */
namespace PortalScriptSamples
{
    /** Class that will demonstrate several of the validators on a single page */
    export class AllValidatorSamples {

        /** Method to attach to the document load complete event and wire up our samples */
        public static load(): void
        {
            $(document).ready(() =>
            {
                // default the name on create
                var name: JQuery = $("#futz_name").val();
                if (Common.utilities.isNullUndefinedEmpty(name)) {
                    $("#futz_name").val("New Sample Validator Item!");
                }

                // linked null validators - checkbox and option set 
                Common.validators.addLinkedNullValidator(new Common.triggerControl("futz_linkedcheckbox", "check", true), "futz_linkedtextboxcheckbox", "Please enter a value for the 'Linked Text Box - Checkbox'", true);
                Common.validators.addLinkedNullValidator(new Common.triggerControl("futz_linkedoptionset", "optionset", 100000001), "futz_linkedtextboxoptionset");

                // add date range validators 
                Common.validators.addFutureDateValidator("futz_nofuturedate");
                Common.validators.addMinDateValidator("futz_mindatevalue", new Date("10/10/2017"));
                Common.validators.addMaxDateValidator("futz_maxdatevalue", new Date("10/10/2020"));
                Common.validators.addDateRangeValidator("futz_daterangevalue", new Date("10/10/2015"), new Date("10/10/2025"));

                // add checked list validators 
                Common.validators.addMinCheckedValidator("section_min_checked", null, 2);
                Common.validators.addMaxCheckedValidator("section_max_checked", null, 3, "You can check at most 3 items from the list in 'Maximum Checked Values'");
            });
        }
    }
}

PortalScriptSamples.AllValidatorSamples.load();
