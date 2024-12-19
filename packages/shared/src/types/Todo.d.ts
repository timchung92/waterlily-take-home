declare interface Todo {
  typeformPath: string;
  todoLabel: string;
  todoStatus: TodoStatus;
  todoPriority: number;
  client: Client;
  supportProvider: SupportProvider | null;
  surveyDefinition: SurveyDefinition;
}

declare enum TodoStatus {
  outstanding = 'outstanding',
  completed = 'completed',
}
