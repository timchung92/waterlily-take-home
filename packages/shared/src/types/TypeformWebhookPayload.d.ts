declare interface TypeformWebhookPayload {
  event_id: string;
  event_type: string;
  form_response: {
    form_id: string;
    token: string;
    landed_at: string;
    submitted_at: string;
    hidden: {
      client_id: string;
      advisor_id: string;
      support_provider_id?: string;
      survey_id: string;
      first_name?: string;
      last_name?: string;
      should_send_client_email?: string;
      client_email?: string;
      consent?: string;
      [key: string]: string | undefined; // Allow for any additional hidden fields
    };
    definition: TypeformFormDefinition;
    answers: TypeformAnswer[];
    ending: {
      id: string;
      ref: string;
    };
  };
}

declare interface TypeformFormDefinition {
  id: string;
  title: string;
  fields: (TypeformInputFieldDef | TypeformChoiceFieldDef)[];
  endings: [
    {
      id: string;
      ref: string;
      title: string;
      type: string;
      properties: {
        button_text: string;
        show_button: false;
        share_icons: false;
        button_mode: string;
      };
    },
  ];
}

declare interface TypeformInputFieldDef {
  id: string;
  ref: string;
  type:
    | 'date'
    | 'dropdown'
    | 'number'
    | 'rating'
    | 'short_text'
    | 'thankyou_screen';
  title: string;
  properties: {};
}

declare interface TypeformChoiceFieldDef {
  id: string;
  ref: string;
  type: 'multiple_choice';
  title: string;
  properties: {};
  allow_multiple_selections?: boolean;
  choices: TypeformChoiceOptionDef[];
}

declare interface TypeformChoiceOptionDef {
  id: string;
  ref: string;
  label: string;
}

declare type TypeformAnswer = (
  | TypeformTextAnswer
  | TypeformEmailAnswer
  | TypeformChoiceAnswer
  | TypeformChoicesAnswer
  | TypeformNumberAnswer
  | TypeformBooleanAnswer
  | TypeformDateAnswer
  | TypeformPhoneNumberAnswer
) & {
  [type: string]:
    | string
    | TypeformChoiceAnswer['choice']
    | TypeformChoiceAnswer['choices']
    | number
    | date;
};

declare interface BaseTypeformAnswer {
  field: TypeformAnswerFieldRef;
}

declare interface TypeformTextAnswer extends BaseTypeformAnswer {
  type: 'text';
  text: string;
}

declare interface TypeformEmailAnswer extends BaseTypeformAnswer {
  type: 'email';
  text: string;
}
declare interface TypeformPhoneNumberAnswer extends BaseTypeformAnswer {
  type: 'phone_number';
  text: string;
}

declare interface TypeformChoiceAnswer extends BaseTypeformAnswer {
  type: 'choice';
  choice: {
    id: string;
    label: string;
    ref?: string;
  };
}

declare interface TypeformChoicesAnswer extends BaseTypeformAnswer {
  type: 'choices';
  choices: {
    ids: string[];
    labels: string[];
    refs: string[];
    other?: string;
  };
}

declare interface TypeformNumberAnswer extends BaseTypeformAnswer {
  type: 'number';
  number: number;
}

declare interface TypeformBooleanAnswer extends BaseTypeformAnswer {
  type: 'boolean';
  boolean: boolean;
}

declare interface TypeformDateAnswer extends BaseTypeformAnswer {
  type: 'date';
  date: string;
}

declare interface TypeformAnswerFieldRef {
  id: string;
  type: string;
  ref: string;
}
