

export const SupportedSpecialFieldsList = [
    "formSubmissionDateTime",
    "formSubmissionUser",
    "dataProcessingAgreement",
    "status",
    "moderatorFeedbackToSubmission",
] as const;
export type SupportedSpecialFields = typeof SupportedSpecialFieldsList[number];

export const specialFieldsTypes: { [key: string]: string; } = {
    "formSubmissionDateTime": "DATETIME",
    "forSubmissionUser": "TEXT",
    "dataProcessingAgreement": "BOOLEAN",
    "status": "TEXT",
    "moderatorFeedbackToSubmission": "TEXT"
};

export const SupportedFieldTypesList = [
    "string",
    "number",
    "list",
    "bool",
    "info",
    "date",
    "separator",
    "file",
] as const;
export type SupportedFieldTypes = typeof SupportedFieldTypesList[number];

export const SupportedAppearanceList = [
    "radiobutton-compact",
    "radiobutton",
    "select",
    "multiselect",
    "checkbox",
    "email",
    "url",
    "phone",
    "long",
    "base64",
] as const;
export type SupportedAppearance = typeof SupportedAppearanceList[number];
