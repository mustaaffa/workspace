// make a property decorator that creates a FormFieldItem from a property
// export * from './lib/decorators/form-field.decorator';
import 'reflect-metadata'
import { Field, FieldItem, Fieldset, FormScheme, Validator } from '../types';
import { toTitleCase } from '@upupa/common';
import { PasswordStrength } from '@upupa/auth';

const _DYNAMIC_FORM_SCHEMES: Record<string, FormScheme> = {};
const _MODEL_FACTORIES_SCHEMES: Record<string, () => any> = {};
export const resolveFormValueFactoryOf = (path: string) => _MODEL_FACTORIES_SCHEMES[path]
export const resolveFormSchemeOf = (path: string) => _DYNAMIC_FORM_SCHEMES[path] ? Object.assign({}, _DYNAMIC_FORM_SCHEMES[path]) : null;

export interface IDynamicFormFieldOptions { }
export class TextFieldOptions { }
export class NumberFieldOptions { }
export class BooleanFieldOptions { }
export class AdapterFieldOptions {
    minAllowed?: number = 1
    maxAllowed?: number = 1
    adapter: {
        dataSource: 'server' | 'client' | 'url';
        keyProperty?: string,
        displayProperty?: string
        valueProperty?: string | string[],
        imageProperty?: string,
        providerOptions?: any
    } & (
            { dataSource: 'client' } & { data: any[] }
            | { dataSource: 'url' } & { url: string }
            | { dataSource: 'server', path?: string, selectedColumns?: string[] }
        )
        = { dataSource: 'server' }
}


type BaseFormFieldOptions = {
    required?: boolean;
    validations?: Validator[];
};
type VisibleFormFieldOptions = BaseFormFieldOptions & {
    label?: string,
    placeholder?: string,
    text?: string,
    hint?: string,
    appearance?: "fill" | "outline";
    disabled?: boolean;
    readonly?: boolean;
    hidden?: boolean;
};
type FileInputOptions = {
    includeAccess?: boolean,
    base?: string,
    path?: string,
    color?: 'primary' | 'accent' | 'warn',
    dateFormat?: string,
    minAllowedFiles?: number,
    maxAllowedFiles?: number,
    minSize?: number,
    maxSize?: number,
    accept?: string,
    view?: 'list' | 'grid',
    fileSelector?: 'browser' | 'system'
}
type ChoicesFieldOptions = VisibleFormFieldOptions & AdapterFieldOptions & {
    direction?: 'horizontal' | 'vertical', template?: 'normal' | 'thumbs', thumbSize?: number, renderer?: 'markdown' | 'html' | 'none'
}
export type FormFieldOptions = ({ from: any } & VisibleFormFieldOptions) |
    (
        { input: 'fieldset' } & VisibleFormFieldOptions & BaseFormFieldOptions
        | { input: 'hidden' } & BaseFormFieldOptions
        | { input: 'text' } & VisibleFormFieldOptions & TextFieldOptions
        | { input: 'phone' } & VisibleFormFieldOptions & TextFieldOptions
        | { input: 'password' } & VisibleFormFieldOptions & TextFieldOptions & {
            showConfirmPasswordInput?: boolean,
            showPassword?: boolean,
            canGenerateRandomPassword?: boolean,
            passwordStrength?: PasswordStrength
            autocomplete?: 'current-password' | 'new-password'
        }
        | { input: 'number' } & VisibleFormFieldOptions & NumberFieldOptions
        | ({ input: 'switch' } & VisibleFormFieldOptions & BooleanFieldOptions & {
            template?: 'checkbox' | 'toggle',
            renderer?: 'markdown' | 'html' | 'none'
        })
        | ({ input: 'checks' } & ChoicesFieldOptions)
        | ({ input: 'radios' } & ChoicesFieldOptions)
        | ({ input: 'select' } & VisibleFormFieldOptions & AdapterFieldOptions)
        | { input: 'date' } & VisibleFormFieldOptions
        | { input: 'file' } & VisibleFormFieldOptions & FileInputOptions
        | { input: 'html' } & VisibleFormFieldOptions
        | { input: 'chips' } & VisibleFormFieldOptions & AdapterFieldOptions &
        {
            parentPath?: string,
            visible?: boolean,
            selectable?: boolean,
            removable?: boolean,
            separatorKeysCodes?: string[]
        }
    );


function makeFieldItem(path: string, targe: any, propertyKey: string, options: FormFieldOptions): Field {

    const fieldBase = {
        name: propertyKey,
        validations: options.validations || [],
        path: path ? `${path}/${propertyKey}` : `/${propertyKey}`,
    }

    if (!('input' in options) || options.input === 'fieldset') {
        const f = {...fieldBase} as Fieldset;
        f.type = 'fieldset'
        const schemeTarget = options['from'];
        // get path from metadata of schemeTarget
        const schemePath = Reflect.getMetadata('path', schemeTarget) || schemeTarget.name;
        f.items = resolveFormSchemeOf(schemePath) || {};
        return f
    }

    const field = {
        ...fieldBase,
        input: options.input,
        ui: { inputs: { required: options.required } },
        type: 'field'
    } as FieldItem;

    if (field.input.length === 0) field.input = 'hidden';

    if (options['adapter']) {
        field.ui.inputs['_adapter'] = options['adapter']
        delete field.ui.inputs['adapter']
    }

    if (options.input === 'hidden') return field;

    const opts = options as VisibleFormFieldOptions & FormFieldOptions;
    const label = opts.label ?? opts.text ?? toTitleCase(propertyKey);
    field.ui.inputs = {
        ...field.ui.inputs,
        text: opts.text,
        hidden: opts.hidden,
        label,
        placeholder: opts.placeholder,
        appearance: opts.appearance
    }

    if (options.input === 'switch') {
        const switchOptions = opts as any;
        field.ui.inputs['template'] = switchOptions.template ?? 'toggle';
        field.ui.inputs['renderer'] = switchOptions.renderer ?? 'none';
    }
    if (options.input === 'password') {
        const pwdOptions = opts as any;
        field.ui.inputs['showConfirmPasswordInput'] = pwdOptions.showConfirmPasswordInput ?? false;
        field.ui.inputs['showPassword'] = pwdOptions.showPassword ?? false;
        field.ui.inputs['canGenerateRandomPassword'] = pwdOptions.canGenerateRandomPassword ?? false;
        field.ui.inputs['passwordStrength'] = pwdOptions.passwordStrength ?? new PasswordStrength();
        field.ui.inputs['autocomplete'] = pwdOptions.autocomplete ?? 'new-password';
        return field;

    }

    if (options.input === 'file') {
        const fileOptions = opts as any;
        field.ui.inputs['minAllowedFiles'] = fileOptions.minAllowedFiles;
        field.ui.inputs['maxAllowedFiles'] = fileOptions.maxAllowedFiles;
        field.ui.inputs['path'] = fileOptions.path || `${field.path}`;
        field.ui.inputs['accept'] = fileOptions.accept || '*.*';
        field.ui.inputs['view'] = fileOptions.view || 'list';
        field.ui.inputs['fileSelector'] = fileOptions.fileSelector || 'system';
        field.ui.inputs['color'] = fileOptions.color || 'accent';
        field.ui.inputs['dateFormat'] = fileOptions.dateFormat || 'dd MMM yyyy';
        field.ui.inputs['includeAccess'] = fileOptions.includeAccess || false;
        field.ui.inputs['minSize'] = fileOptions.minSize || 0;
        field.ui.inputs['maxSize'] = fileOptions.maxSize || 1024 * 1024 * 10;
        return field;
    }
    if (options.input === 'html') {
        const htmlOptions = opts as any;
        field.ui.inputs['uploadPath'] = htmlOptions.path || '';
        return field;
    }
    return field;
}
function addInputToFormScheme(target: any, field: Field, options: FormFieldOptions) {
    const path = (Reflect.getMetadata('path', target) || null) as string;
    const key = path ?? target.constructor.name

    const formScheme = (_DYNAMIC_FORM_SCHEMES[key] ?? {}) as FormScheme;
    const segments = field.path.split('/').filter(s => s);
    while (segments.length > 1) {
        const segment = segments.shift()!;
        if (!formScheme[segment]) {
            formScheme[segment] = {
                type: 'fieldset',
                name: segment,
                items: {}
            } as Fieldset;
        }
    }
    if (segments.length === 1) {
        formScheme[field.name] = field;
    }

    Reflect.defineMetadata('DYNAMIC_FORM_SCHEME', formScheme, target);
    _DYNAMIC_FORM_SCHEMES[key] = formScheme;
}
function toField(path: string, target: any, propertyKey: string, options: FormFieldOptions) {
    const field = makeFieldItem(path, target, propertyKey, options);
    return field;
}

export function formScheme(path?: string) {
    return function (target: any) {
        const key = path ?? target.name;
        Reflect.defineMetadata('path', key, target);
        const formScheme = (Reflect.getMetadata('DYNAMIC_FORM_SCHEME', target) ?? _DYNAMIC_FORM_SCHEMES[key] ?? _DYNAMIC_FORM_SCHEMES[target.name] ?? {}) as FormScheme;
        _DYNAMIC_FORM_SCHEMES[key] = formScheme
        const args = Reflect.getMetadata('design:paramtypes', target) || [];
        _MODEL_FACTORIES_SCHEMES[key] = () => Promise.resolve(new target(...args));
    }
}



export function formInput(options: FormFieldOptions = { input: 'text' }) {
    return function (target: any, propertyKey: string) {
        if('from' in options) options['input'] = 'fieldset'

        if (!options['input']) {
            // get the type of the property
            const type = Reflect.getMetadata("design:type", target, propertyKey);
            if (type === String) options['input'] = 'text'
            else if (type === Number) options['input'] = 'number'
            else if (type === Boolean) options['input'] = 'switch'
            else if (type === Array) options['input'] = 'select'
            else options['input'] = 'text'
        }
        const path = Reflect.getMetadata('path', target) || '';
        const field = toField(path, target, propertyKey, options);
        addInputToFormScheme(target, field, options);
    }
}

export function formField(options: FormFieldOptions & { name: string, type: 'field' }) {
    return toField('', undefined, options.name, options);
}