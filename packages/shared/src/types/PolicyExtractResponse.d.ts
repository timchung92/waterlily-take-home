declare type PolicyDataExtractResponse = {
  [key in PolicyFieldId]?: PolicyExtractedField;
};

declare interface PolicyExtractedField {
  fieldTitle: string;
  fieldValue: any; // Assuming field values are returned as strings based on your example
  pageNumber: any;
  locationDescription: any;
}

declare type PolicyFieldId =
  | Extract<keyof PolicyFundingSource, string>
  | 'policyHasCobRider';

declare type ParsedPolicyField = PolicyExtractedField & {
  parsedFieldValue: any;
  modePrevalenceRatio?: number;
};

declare type ParsedPolicyDataExtractResponse = {
  [key in PolicyFieldId]?: ParsedPolicyField;
};
