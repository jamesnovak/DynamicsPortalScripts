// Type definitions for Adxstudio jQuery Development
// Project: TBD
// Definitions by: Brendon Colburn <https://github.com/brendon-colburn/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/* *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

interface JQueryStatic {
    /**
     * Enable popovers via JavaScript
     * @param options 
     * @returns {} 
     */
    popover(options: PopoverOptions);
}

interface JQuery {
    /**
     * Enable popovers via JavaScript
     * @param options 
     * @returns {} 
     */
    popover(options: PopoverOptions): void;
}

interface PopoverOptions {
    /**
     * Insert html into the popover. If false, jquery's text method will be used to insert content into the dom. Use text if you're worried about XSS attacks.
     */
    html?: boolean;

    /**
     * how popover is triggered - click | hover | focus | manual
     */
    trigger?: string;

    /**
     * how to position the popover - top | bottom | left | right
     */
    placement?: string;

    /**
     * delay showing and hiding the popover (ms) - does not apply to manual trigger type
        If a number is supplied, delay is applied to both hide/show
        Object structure is: delay: { show: 500, hide: 100 }
     */
    delay?: PopoverDelay;

    /**
     * apply a css fade transition to the tooltip
     */
    animation?: boolean;

    /**
     * default title value if `title` attribute isn't present
     */
    title?: string | Function;
}

interface PopoverDelay {
    show: number;
    hide: number;
}