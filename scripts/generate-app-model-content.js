const { readFileSync } = require('fs');
const { camelCase } = require('lodash');
const { join } = require('path');
const { singular } = require('pluralize');

const { readDataModelFromSchema } = require('./js-utils');

const {
  surveyQuestionTypeByQuestionRefLines,
  ...appModel
} = readDataModelFromSchema();
const appModelCode = JSON.stringify(appModel, undefined, 2);
const enumsCode = Object.values(appModel.tablesByName)
  .filter(table => table.objectType === 'enum')
  .map(table => {
    const fieldLines = Object.entries(table.valuesByLabel)
      .map(([label, value]) => `  ${ camelCase(label) } = ${ value },`)
      .join('\n');
    return `export enum ${ singular(table.tableName) } {\n${ fieldLines }\n}\n`;
  })
  .join('\n');
const template = readFileSync(join(__dirname, 'generate-app-model-template.ts'), 'utf8');

const code = template
  .replace('/* appModel */', appModelCode)
  .replace('/* enums */', enumsCode)
  .replace('/* surveyQuestionTypeByQuestionRefLines */', surveyQuestionTypeByQuestionRefLines.join('\n'));

console.log(code);
