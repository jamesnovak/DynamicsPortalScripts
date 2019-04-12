interface MaskPattern {
    pattern?: RegExp;
    recursive?: boolean;
    optional?: boolean;
    fallback?: string;
}

interface MaskTranslation {
    [key: string]: MaskPattern | Object;
    placeholder?: string;
}

interface MaskOptions {
    maskElements?: string;
    dataMaskAttr?: string;
    dataMask?: boolean;
    watchInterval?: number;
    watchInputs?: boolean;
    watchDataMask?: boolean;
    byPassKeys?: number[];
    translation?: MaskTranslation;
    selectOnFocus?: boolean;
    reverse?: boolean;
    clearIfNotMatch?: boolean;
    onComplete?(value: Object, e: Event, $element: JQuery, options: MaskOptions): void;
    onKeyPress?(value: Object, e: Event, $element: JQuery, options: MaskOptions): void;
    onChange?(value: Object, e: Event, $element: JQuery, options: MaskOptions): void;
    onInvalid?(value: Object, e: Event, $element: JQuery, options: MaskOptions): void;
}

interface JQuery {
    /**
     * Applies the mask to the matching selector elements.
     * @param mask should be a string or a function.
     * @returns The element.
     */
    mask(mask: (value: string) => string | string): JQuery;

    mask(any): any;

    /**
     * Applies the mask to the matching selector elements.
     * @param mask  should be a string or a function.
     * @param options should be an object.
     * @returns The element.
     */
    mask(mask: string, options: MaskOptions): JQuery;

    /**
     * Seek and destroy.
     * @returns The element.
     */
    unmask(): JQuery;

    /**
     * Gets the value of the field without the mask.
     * @returns Value without the mask.
     */
    cleanVal(): string;

    /**
     * Gets masked value programmatically
     * @returns Masked value.
     */
    masked(value: string): string;
}