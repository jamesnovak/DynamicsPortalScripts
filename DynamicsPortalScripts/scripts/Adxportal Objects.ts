/** Module containing Dynamics Portals object references */

/**
 * General namespace for all Portal related scripts.
 * This can be modified for a business or project but all references will need to be updated
 * @preferred
 */
namespace Common {

    /**
     * Helper class used when referencing the Portal [Page_Validator](https://docs.microsoft.com/en-us/dynamics365/customer-engagement/portals/add-custom-javascript) object, allowing shared TypeScript modules to compile.
     * 
     * No need to deploy this script
    */
    export class Page_Validators {
        /**
         * Push a new validator onto the array
         * @param validator Validator object being added to the list
         */
        public static push(validator: HTMLElement): void { };
    }
}