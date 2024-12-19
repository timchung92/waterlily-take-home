//
// To run (for now)
//
// ts-node -r tsconfig-paths/register packages/build-tools/convert-typeform-to-yaml.ts <path to json>
//

import { readFile } from 'fs/promises';
import { fileExists } from './utils/fileExists';
import { maybeRunMain } from './utils/maybeRunMain';
import { yamlStringify } from '../shared/src/yaml';

import '../shared/src/types';

export interface SimpleFormDefinition {
  title: string;
  questions: SimpleFormQuestion[];
}

export interface SimpleFormQuestion {
  question: string;
  fieldName: string;
  type: string;
  options?: string[];
}

export async function convertTypeformToYaml(
  typeformPayloadPath: string,
): Promise<SimpleFormDefinition> {
  if (!(await fileExists(typeformPayloadPath))) {
    throw new Error(`Input file not found: ${typeformPayloadPath}`);
  }

  const typeformPayloadJson = await readFile(typeformPayloadPath, 'utf8');
  const typeformPayload = JSON.parse(
    typeformPayloadJson,
  ) as TypeformWebhookPayload;
  const { title, fields } = typeformPayload.form_response.definition;
  return {
    title,
    questions: (fields as TypeformChoiceFieldDef[]).map(
      ({
        title: question,
        ref: fieldName,
        type,
        allow_multiple_selections,
        choices,
      }) => ({
        question,
        fieldName,
        type:
          type !== 'multiple_choice'
            ? type
            : allow_multiple_selections
            ? 'chooseMany'
            : 'chooseOne',
        options:
          type !== 'multiple_choice'
            ? undefined
            : choices.map(choice => choice.label),
      }),
    ),
  };
}

async function convertTypeformToYamlAndPrintAsYaml(
  typeformPayloadPath: string,
) {
  const simplified = await convertTypeformToYaml(typeformPayloadPath);
  console.log(`\n\n${yamlStringify(simplified)}\n\n`);
  return 0;
}

if (require.main === module) {
  maybeRunMain(module, __filename, convertTypeformToYamlAndPrintAsYaml);
}
