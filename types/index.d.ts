// Type definitions for react-jsonschema-form 1.7.0
// Project: https://github.com/mozilla-services/react-jsonschema-form
// Definitions by: Dan Fox <https://github.com/iamdanfox>
//                 Ivan Jiang <https://github.com/iplus26>
//                 Philippe Bourdages <https://github.com/phbou72>
//                 Lucian Buzzo <https://github.com/LucianBuzzo>
//                 Sylvain Thénault <https://github.com/sthenault>
//                 Sebastian Busch <https://github.com/sbusch>
//                 Mehdi Lahlou <https://github.com/medfreeman>
//                 Saad Tazi <https://github.com/saadtazi>
//                 Agustin N. R. Ramirez <https://github.com/agustin107>
//                 Chancellor Clark <https://github.com/chanceaclark>
//                 Benoît Sepe <https://github.com/ogdentrod>
//                 Andre Nguyen <https://github.com/andrenguyener>
//                 Qingqi Shi <https://github.com/qingqishi>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.5

declare module '@qbs-nt/react-jsonschema-form' {
    import * as React from 'react';
    import { JSONSchema6, JSONSchema6Type } from 'json-schema';
    import { ErrorParameters as AjvErrorParameters } from 'ajv';

    interface BaseInputWidgetRegistry {
        BaseInput: BaseInputWidget; // FIXME-filters: make optional
    }
    interface NonBaseInputWidgetRegistry {
      [name: string]: Widget;
    }
    type WidgetRegistry = BaseInputWidgetRegistry | NonBaseInputWidgetRegistry;

    interface FieldRegistry { [name: string]: Field }

    interface ErrorSchemaChildren {
      [k: string]: ErrorSchema;
    }

    interface ErrorSchemaErrors {
      __errors: string[];
    }

    type ErrorSchema = ErrorSchemaChildren | ErrorSchemaErrors;

    export interface FormProps<T> {
        schema: JSONSchema6;
        disabled?: boolean;
        uiSchema?: UiSchema;
        formData?: T;
        formContext?: any;
        widgets?: WidgetRegistry;
        fields?: FieldRegistry;
        noValidate?: boolean;
        noHtml5Validate?: boolean;
        showErrorList?: boolean;
        ErrorList?: React.StatelessComponent<ErrorListProps>;
        validate?: (formData: T, errors: FormValidation) => FormValidation;
        onBlur?: (id: string, value: boolean | number | string | null) => void;
        onChange?: (e: IChangeEvent<T>, es?: ErrorSchema) => any;
        onError?: (e: any) => any;
        onFocus?: (id: string, value: boolean | number | string | null) => void;
        onSubmit?: (e: ISubmitEvent<T>, originalSubmitEvent: React.FormEventHandler) => any;
        liveValidate?: boolean;
        FieldTemplate?: React.StatelessComponent<FieldTemplateProps>;
        ArrayFieldTemplate?: React.StatelessComponent<ArrayFieldTemplateProps>;
        ObjectFieldTemplate?: React.StatelessComponent<ObjectFieldTemplateProps>;
        safeRenderCompletion?: boolean;
        transformErrors?: (errors: ValidationError[]) => ValidationError[];
        idPrefix?: string;
        additionalMetaSchemas?: ReadonlyArray<object>;
        customFormats?: { [k: string]: string | RegExp | ((data: string) => boolean) };
        // HTML Attributes
        id?: string;
        className?: string;
        name?: string;
        method?: string;
        target?: string;
        action?: string;
        autocomplete?: string;
        enctype?: string;
        acceptcharset?: string;
        omitExtraData?: boolean;
        liveOmit?: boolean;
        tagName?: keyof JSX.IntrinsicElements | React.ComponentType;
    }

    export default class Form<T> extends React.Component<FormProps<T>> {
        validate: (
            formData: T,
            schema?: FormProps<T>['schema'],
            additionalMetaSchemas?: FormProps<T>['additionalMetaSchemas'],
            customFormats?: FormProps<T>['customFormats'],
        ) => { errors: ValidationError[]; errorSchema: ErrorSchema };
        onChange: (formData: T, newErrorSchema: ErrorSchema) => void;
        onBlur: (id: string, value: boolean | number | string | null) => void;
        submit: () => void;
    }

    export type UiSchema = {
        'ui:field'?: Field | string;
        'ui:widget'?: Widget | string;
        'ui:options'?: { [key: string]: boolean | number | string | object | any[] | null };
        'ui:order'?: string[];
        'ui:FieldTemplate'?: React.StatelessComponent<FieldTemplateProps>;
        'ui:ArrayFieldTemplate'?: React.StatelessComponent<ArrayFieldTemplateProps>;
        'ui:ObjectFieldTemplate'?: React.StatelessComponent<ObjectFieldTemplateProps>;
        [name: string]: any;
    };

    export type FieldId = {
        $id: string;
    };

    export type IdSchema<T = any> = {
        [key in keyof T]: IdSchema<T[key]>;
    } &
        FieldId;

    export type FieldPath = {
        $name: string;
    };

    export type PathSchema<T = any> = {
        [key in keyof T]: PathSchema<T[key]>;
    } &
        FieldPath;

      export interface GenericWidgetOptions{
        [key: string]: boolean | number | string | object | null | undefined;
      } 

      export interface BaseInputWidgetOptions {
        inputType?: BaseInputWidgetProps['type'];
        emptyValue?: any;
      }

      export interface TextareaWidgetOptions {
        emptyValue?: any;
        rows?: number;
        qbus_autoSize?: boolean | {minRows?: number, maxRows?: number}; // antd Input.TextArea AutoSizeType
      }

      export interface WidgetProps<O = GenericWidgetOptions>
        extends Pick<
            React.HTMLAttributes<HTMLElement>,
            Exclude<keyof React.HTMLAttributes<HTMLElement>, 'onBlur' | 'onFocus'>
        > {
        id: string;
        schema: JSONSchema6;
        value: any;
        required: boolean;
        disabled: boolean;
        readonly: boolean;
        autofocus: boolean;
        onChange: (value: any) => void;
        options: O;
        formContext: any;
        onBlur: (id: string, value: boolean | number | string | null) => void;
        onFocus: (id: string, value: boolean | number | string | null) => void;
        label: string;
        rawErrors: string[];
    }

    export type Widget = React.ComponentType<WidgetProps<any>>;
    type BaseInputWidget = React.ComponentType<BaseInputWidgetProps>;

    // lib.dom.ts provides no strict definition for "type" attribute of <input> element
    // Def taken from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types as of Oct 31 2018:
    type HTMLElementInputType =
        | 'button' // A push button with no default behavior.
        | 'checkbox' // A check box allowing single values to be selected/deselected.
        | 'color' // [HTML5] A control for specifying a color. A color picker's UI has no required features other than accepting simple colors as text (more info).
        | 'date' // [HTML5] A control for entering a date (year, month, and day, with no time).
        | 'datetime-local' // [HTML5] A control for entering a date and time, with no time zone.
        | 'email' // [HTML5] A field for editing an e-mail address.
        | 'file' // A control that lets the user select a file. Use the accept attribute to define the types of files that the control can select.
        | 'hidden' // A control that is not displayed but whose value is submitted to the server.
        | 'image' // A graphical submit button. You must use the src attribute to define the source of the image and the alt attribute to define alternative text. You can use the height and width attributes to define the size of the image in pixels.
        | 'month' // [HTML5] A control for entering a month and year, with no time zone.
        | 'number' // [HTML5] A control for entering a number.
        | 'password' // A single-line text field whose value is obscured. Use the maxlength and minlength attributes to specify the maximum length of the value that can be entered.
        | 'radio' // A radio button, allowing a single value to be selected out of multiple choices.
        | 'range' // [HTML5] A control for entering a number whose exact value is not important.
        | 'reset' // A button that resets the contents of the form to default values.
        | 'search' // [HTML5] A single-line text field for entering search strings. Line-breaks are automatically removed from the input value.
        | 'submit' // A button that submits the form.
        | 'tel' // [HTML5] A control for entering a telephone number.
        | 'text' // A single-line text field. Line-breaks are automatically removed from the input value.
        | 'time' // [HTML5] A control for entering a time value with no time zone.
        | 'url' // [HTML5] A field for entering a URL.
        | 'week' // [HTML5] A control for entering a date consisting of a week-year number and a week number with no time zone.
        | 'datetime'; // [OBSOLETE] A control for entering a date and time (hour, minute, second, and fraction of a second) based on UTC time zone. This feature has been removed from WHATWG HTML.

    // BaseInput is a Widget, not a Field; but a Widget with
    // additional props
    export interface BaseInputWidgetProps extends WidgetProps<BaseInputWidgetOptions>, Pick<HTMLInputElement, 'step'> {
        // Restrict to the <input> types used in react-jsonschema-form as type prop for
        // BaseInput component as of Oct 31 2018:
        type?: HTMLElementInputType &
            (
                | 'hidden'
                | 'color'
                | 'date'
                | 'datetime-local'
                | 'email'
                | 'number'
                | 'password'
                | 'range'
                | 'text'
                | 'url');
    }

    export interface FieldProps<T = any>
        extends Pick<React.HTMLAttributes<HTMLElement>, Exclude<keyof React.HTMLAttributes<HTMLElement>, 'onBlur' | 'onFocus'>> {
        schema: JSONSchema6;
        uiSchema: UiSchema;
        idSchema: IdSchema;
        formData: T | undefined;
        errorSchema: ErrorSchema;
        onChange: (e: IChangeEvent<T> | any, es?: ErrorSchema) => any;
        onBlur: (id: string, value: boolean | number | string | null) => void;
        onFocus: (id: string, value: boolean | number | string | null) => void;
        registry: {
            fields: { [name: string]: Field };
            widgets: { [name: string]: Widget };
            definitions: { [name: string]: any };
            formContext: any;
        };
        formContext: any;
        autofocus: boolean;
        disabled: boolean;
        readonly: boolean;
        required: boolean;
        name: string;
        [prop: string]: any;
        description?: React.ReactChild;
    }

    export type Field = React.StatelessComponent<FieldProps> | React.ComponentClass<FieldProps>;

    export type FieldTemplateProps = {
        id: string;
        classNames: string;
        label: string;
        description: React.ReactElement;
        rawDescription: string;
        children: React.ReactElement;
        errors: React.ReactElement;
        rawErrors: string[];
        help: React.ReactElement;
        rawHelp: string;
        hidden: boolean;
        required: boolean;
        readonly: boolean;
        disabled: boolean;
        displayLabel: boolean;
        fields: Field[];
        schema: JSONSchema6;
        uiSchema: UiSchema;
        formContext: any;
    };

    export type ArrayFieldTemplateProps<T = any> = {
        DescriptionField: React.StatelessComponent<{ id: string; description: string | React.ReactElement }>;
        TitleField: React.StatelessComponent<{ id: string; title: string; required: boolean }>;
        canAdd: boolean;
        className: string;
        disabled: boolean;
        idSchema: IdSchema;
        items: {
            children: React.ReactElement;
            className: string;
            disabled: boolean;
            hasMoveDown: boolean;
            hasMoveUp: boolean;
            hasRemove: boolean;
            hasToolbar: boolean;
            index: number;
            onDropIndexClick: (index: number) => (event: any) => void;
            onReorderClick: (index: number, newIndex: number) => (event: any) => void;
            readonly: boolean;
            key: string;
        }[];
        onAddClick: (event: any) => (event: any) => void;
        readonly: boolean;
        required: boolean;
        schema: JSONSchema6;
        uiSchema: UiSchema;
        title: string;
        formContext: any;
        formData: T;
        registry: FieldProps['registry'];
    };

    export type ObjectFieldTemplateProps<T = any> = {
        DescriptionField: React.StatelessComponent<{ id: string; description: string | React.ReactElement }>;
        TitleField: React.StatelessComponent<{ id: string; title: string; required: boolean }>;
        title: string;
        description: string;
        properties: {
            content: React.ReactElement;
            name: string;
            readonly: boolean;
            disabled: boolean;
            required: boolean;
        }[];
        readonly: boolean;
        disabled: boolean;
        required: boolean;
        idSchema: IdSchema;
        uiSchema: UiSchema;
        schema: JSONSchema6;
        formData: T;
        formContext: any;
        onAddClick: (schema: JSONSchema6) => void;
    };

    export type ValidationError = {
        name: string;
        message: string;
        params: AjvErrorParameters;
        property: string;
        stack: string;
        schemaPath: string;
    };

    export type ErrorListProps = {
        errorSchema: FormValidation;
        errors: ValidationError[];
        formContext: any;
        schema: JSONSchema6;
        uiSchema: UiSchema;
    };

    export interface IChangeEvent<T = any> {
        edit: boolean;
        formData: T;
        errors: ValidationError[];
        errorSchema: FormValidation;
        idSchema: IdSchema;
        schema: JSONSchema6;
        uiSchema: UiSchema;
        status?: string;
    }

    export type ISubmitEvent<T> = IChangeEvent<T>;

    export type FieldError = string;

    type FieldValidation = {
        __errors: FieldError[];
        addError: (message: string) => void;
    };

    type FormValidation = FieldValidation & {
        [fieldName: string]: FieldValidation;
    };

    type FormSubmit<T = any> = {
        formData: T;
    };

    export type ThemeProps<T = any> = Omit<FormProps<T>, 'schema'>;

    export function withTheme<T = any>(
        themeProps: ThemeProps<T>,
    ): React.ComponentClass<FormProps<T>> | React.StatelessComponent<FormProps<T>>;

    export type AddButtonProps = {
        className: string;
        onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
        disabled: boolean;
    };
}

declare module '@qbs-nt/react-jsonschema-form/lib/components/fields/SchemaField' {
    import { JSONSchema6 } from 'json-schema';
    import { FieldProps, UiSchema, IdSchema, FormValidation } from 'react-jsonschema-form';

    export type SchemaFieldProps<T = any> = Pick<
        FieldProps<T>,
        'schema' | 'uiSchema' | 'idSchema' | 'formData' | 'errorSchema' | 'registry' | 'formContext'
    >;

    export default class SchemaField extends React.Component<SchemaFieldProps> {}
}

declare module '@qbs-nt/react-jsonschema-form/lib/utils' {
    import { JSONSchema6, JSONSchema6Definition, JSONSchema6Type, JSONSchema6TypeName } from 'json-schema';
    import { FieldProps, UiSchema, IdSchema, PathSchema, Widget } from 'react-jsonschema-form';

    export const ADDITIONAL_PROPERTY_FLAG: string;

    export function getDefaultRegistry(): FieldProps['registry'];

    export function getSchemaType(schema: JSONSchema6): string;

    export function getWidget(
        schema: JSONSchema6,
        widget: Widget | string,
        registeredWidgets?: { [name: string]: Widget },
    ): Widget;

    export function hasWidget(
        schema: JSONSchema6,
        widget: Widget | string,
        registeredWidgets?: { [name: string]: Widget },
    ): boolean;

    export function computeDefaults<T = any>(
        schema: JSONSchema6,
        parentDefaults: JSONSchema6['default'][],
        definitions: FieldProps['registry']['definitions'],
        rawFormData?: T,
        includeUndefinedValues?: boolean,
    ): JSONSchema6['default'][];

    export function getDefaultFormState<T = any>(
        schema: JSONSchema6,
        formData: T,
        definitions?: FieldProps['registry']['definitions'],
        includeUndefinedValues?: boolean,
    ): T | JSONSchema6['default'][];

    export function getUiOptions(uiSchema: UiSchema): UiSchema['ui:options'];

    export function isObject(thing: any): boolean;

    export function mergeObjects(obj1: object, obj2: object, concatArrays?: boolean): object;

    export function asNumber(value: string | null): number | string | undefined | null;

    export function orderProperties(properties: [], order: []): [];

    export function isConstant(schema: JSONSchema6): boolean;

    export function toConstant(schema: JSONSchema6): JSONSchema6Type | JSONSchema6['const'] | Error;

    export function isSelect(_schema: JSONSchema6, definitions?: FieldProps['registry']['definitions']): boolean;

    export function isMultiSelect(schema: JSONSchema6, definitions?: FieldProps['registry']['definitions']): boolean;

    export function isFilesArray(
        schema: JSONSchema6,
        uiSchema: UiSchema,
        definitions?: FieldProps['registry']['definitions'],
    ): boolean;

    export function isFixedItems(schema: JSONSchema6): boolean;

    export function allowAdditionalItems(schema: JSONSchema6): boolean;

    export function optionsList(schema: JSONSchema6): { label: string; value: string }[];

    export function guessType(value: any): JSONSchema6TypeName;

    export function stubExistingAdditionalProperties<T = any>(
        schema: JSONSchema6,
        definitions?: FieldProps['registry']['definitions'],
        formData?: T,
    ): JSONSchema6;

    export function resolveSchema<T = any>(
        schema: JSONSchema6Definition,
        definitions?: FieldProps['registry']['definitions'],
        formData?: T,
    ): JSONSchema6;

    export function retrieveSchema<T = any>(
        schema: JSONSchema6Definition,
        definitions?: FieldProps['registry']['definitions'],
        formData?: T,
    ): JSONSchema6;

    export function deepEquals<T>(a: T, b: T): boolean;

    export function shouldRender(comp: React.Component, nextProps: any, nextState: any): boolean;

    export function toIdSchema<T = any>(
        schema: JSONSchema6Definition,
        id: string,
        definitions: FieldProps['registry']['definitions'],
        formData?: T,
        idPredix?: string,
    ): IdSchema | IdSchema[];

    export function toPathSchema<T = any>(
        schema: JSONSchema6Definition,
        name: string | undefined,
        definitions: FieldProps['registry']['definitions'],
        formData?: T,
    ): PathSchema | PathSchema[];

    export interface DateObject {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
    }

    export function parseDateString(dateString: string, includeTime?: boolean): DateObject;

    export function toDateString(dateObject: DateObject, time?: boolean): string;

    export function pad(num: number, size: number): string;

    export function setState(instance: React.Component, state: any, callback: Function): void;

    export function dataURItoBlob(dataURI: string): { name: string; blob: Blob };

    export interface IRangeSpec {
        min?: number;
        max?: number;
        step?: number;
    }

    export function rangeSpec(schema: JSONSchema6): IRangeSpec;

    export function getMatchingOption(
        formData: any,
        options: JSONSchema6[],
        definitions: FieldProps['registry']['definitions'],
    ): number;
}

declare module '@qbs-nt/react-jsonschema-form/lib/validate' {
    import { JSONSchema6Definition } from 'json-schema';
    // import { ValidationError } from 'react-jsonschema-form';
    import { ValidationError, ErrorSchema, FormProps } from 'react-jsonschema-form';

    export default function validateFormData<T = any>(
        formData: T,
        schema: JSONSchema6Definition,
        customValidate?: FormProps<T>['validate'],
        transformErrors?: FormProps<T>['transformErrors'],
        additionalMetaSchemas?: FormProps<T>['additionalMetaSchemas'],
        customFormats?: FormProps<T>['customFormats'],
    // ): ValidationError[];
    ): { errors: ValidationError[]; errorSchema: ErrorSchema };
}

declare module '@qbs-nt/react-jsonschema-form/lib/components/AddButton' {
    import * as React from 'react';
    import { JSONSchema6 } from 'json-schema';

    interface AddButtonProps {
        className: string;
        onClick: (schema: JSONSchema6) => void;
        disabled: boolean;
    }

    const AddButton: React.SFC<AddButtonProps>;
    export default AddButton;
}
