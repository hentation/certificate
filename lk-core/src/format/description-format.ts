//https://github.com/typestack/class-validator
import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsAscii, IsBoolean, IsIn, IsOptional, IsString, Validate, ValidateNested } from "class-validator";
import { IsNumberOrString } from "./helpers/NumberOrString";
import { SupportedAppearance, SupportedAppearanceList, SupportedFieldTypes, SupportedFieldTypesList, SupportedSpecialFields, SupportedSpecialFieldsList } from "./const";

export class App {
    @IsOptional() @IsString()
    appTitle?: string;
    @IsOptional() @IsString()
    appDescription?: string;
}

export class Forms {
    @IsOptional() @IsBoolean()
    enableFormSubmissionByAnyUser?: boolean;
    @IsOptional() @IsBoolean()
    isPublic?: boolean;
    @IsOptional() @IsBoolean()
    enableUserSubmissionHistoryView?: boolean;
    @IsOptional() @IsBoolean()
    enableGlobalSubmissionHistoryView?: boolean;
    @IsOptional() @IsBoolean()
    enableConfirmedSubmissionsView?: boolean;
    @IsOptional() @IsBoolean()
    enableCustomView?: boolean;
}

export class Api {
    @IsOptional() @IsBoolean()
    allowReadOfSpecificForms?: boolean;
    @IsOptional() @IsBoolean()
    allowFormPostingForReview?: boolean;
}

export class FormField {
    @IsAscii()
    name: string;
    @IsOptional() @IsString()
    title?: string;
    @IsIn(SupportedFieldTypesList)
    type: SupportedFieldTypes;
    @IsOptional() @IsBoolean()
    required?: boolean;
    @IsOptional()
    defaultValue?: unknown;
    @IsOptional() @IsBoolean()
    long?: boolean;
    @IsOptional() @IsIn(SupportedAppearanceList)
    appearance?: SupportedAppearance;
    @IsOptional() @IsArray() @Validate(IsNumberOrString, { each: true })
    values?: string[];

    @IsOptional() @IsBoolean()
    visibleInSubmissionsView?: boolean; //true

    @IsOptional() @IsBoolean()
    editable?: boolean; //true

    @IsOptional() @IsBoolean()
    hiddenInEdit?: boolean; //false

    @IsOptional() @IsBoolean()
    visibleInSingleView?: boolean; //false

    @IsOptional() @IsString()
    condition?: string;
}

export class Fields {
    @IsOptional()
    @IsIn(SupportedSpecialFieldsList, { each: true })
    @ArrayUnique((o: SupportedSpecialFields) => o)
    specialFields?: SupportedSpecialFields[];

    @IsOptional() @IsBoolean()
    fieldsRequiredByDefault?: boolean;

    @ValidateNested({ each: true }) @IsArray()
    @ArrayUnique((o: FormField) => o.name)
    @Type(() => FormField)
    formFields?: FormField[];
}

export class DescriptionFormat {
    @ValidateNested() @Type(() => App) app?: App;
    @ValidateNested() @Type(() => Forms) forms?: Forms;
    @ValidateNested() @Type(() => Api) api?: Api;
    @ValidateNested() @Type(() => Fields) fields?: Fields;
}

export class DescriptionFormatDTO {
    @ValidateNested() @Type(() => App) app?: App;
    @ValidateNested() @Type(() => Forms) forms?: Forms;
    @ValidateNested() @Type(() => Api) api?: Api;
    @ValidateNested() @Type(() => Fields) fields?: Fields;
}