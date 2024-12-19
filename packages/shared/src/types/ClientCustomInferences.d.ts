declare type ClientCustomInferences = {
  ltcAtAge?: number;
};

declare type PutClientCustomInferencesBodyProps = {
  clientId: string;
  clientCustomInferences: Partial<ClientCustomInferences>;
};

declare type ClientCustomInferencesDbRecord = ClientCustomInferences & {
  clientCustomInferenceId: string;
  clientId: string;
  inferenceLabel: string;
  inferenceValue: string;
  createdDateTime: Date;
};
