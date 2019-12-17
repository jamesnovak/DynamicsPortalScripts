/**
 * This is a sample Liquid statement that will insert the content of the Web Template 
 *  into the header of your Page Template.
 * 
 * */
// Include the following in Entity Form Custom Javascrit fields for:
// * Script Validator Samples - Create
// * Script Validator Samples - Edit
// {% include 'Script - Validator Samples' %}

// {% include 'Script - Common Utilities' %}
// {% include 'Script - UI Utilities' %}
// {% include 'Script - Validators' %}

// {% include 'Script - Validator Samples' %}

$(document).ready(function () {
    PortalScriptSamples.AllValidatorSamples.ApplyValidators();
});
