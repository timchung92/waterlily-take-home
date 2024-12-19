const fs = require('fs');
const { camelCase } = require('lodash');

const OBJECT_TYPE_TABLE = 'table';
const OBJECT_TYPE_ENUM = 'enum';
const OBJECT_TYPE_FIELD = 'field';
const OBJECT_TYPE_QUESTION_REF = 'questionRef';

module.exports = {
  readDataModelFromSchema() {
    const schemaText = fs.readFileSync(process.env.DATABASE_SCHEMA_PATH, 'utf-8');

    const tablesByName = {};
    const dependencyOrderedTableNames = [];
    const fieldsByName = {};
    const surveyQuestionTypeByQuestionRefLines = [];

    const appModel = {
      tablesByName,
      dependencyOrderedTableNames,
      fieldsByName,
      surveyQuestionTypeByQuestionRefLines,
    };

    let building = undefined;

    schemaText.split('\n').forEach(processLine);

    appModel.tableNames = [...dependencyOrderedTableNames].sort().reduce(
      (names, name) => {
        names[camelCase(name)] = name;
        return names;
      },
      {}
    );

    return appModel;

    /**
     * @param {string} schemaLine
     * @param {number} index
     * */
    function processLine(schemaLine, index) {

      // ignore fully commented or effectively blank lines
      if (/^ *--/.test(schemaLine) || /^ *$/.test(schemaLine)) {
        return;
      }

      switch (building && building.objectType) {
        case OBJECT_TYPE_TABLE:
          processTableLine();
          break;

        case OBJECT_TYPE_ENUM:
          processEnumLine();
          break;

        case OBJECT_TYPE_QUESTION_REF:
          processQuestionRefLine();
          break;

        default:
          processTopLine();
          break;
      }

      function processTopLine() {

        const tableMatch = schemaLine.match(/CREATE TABLE [\w ]*"(\w+)"/);
        if (tableMatch) {
          const [, tableName] = tableMatch;
          building = {
            tableName,
            objectType: OBJECT_TYPE_TABLE,
            fields: {},
            orderedFieldNames: [],
            // references: [],
          };
          tablesByName[camelCase(tableName)] = building;
          dependencyOrderedTableNames.push(tableName);
          return;
        }

        const enumMatch = schemaLine.match(/INSERT INTO "(\w+)"/);
        if (enumMatch) {
          const [, name] = enumMatch;

          building = tablesByName[camelCase(name)];
          if (!building) {
            throw new Error(
              `Parsing error; found INSERT INTO table ${ name } on line ${ index + 1 } but not found in our parsed tables. Existing tablers: ${ dependencyOrderedTableNames.join(', ')
              }`
            );
          }

          if (name === 'SurveyQuestions') {
            building.objectType = OBJECT_TYPE_QUESTION_REF;
            building.valuesByLabel = building.valuesByLabel ?? {};
            building.labelsByValue = building.labelsByValue ?? {};
            return;
          }

          const { orderedFieldNames } = building;

          if (orderedFieldNames.length !== 2 ||
            !orderedFieldNames[0].endsWith('Id') ||
            !orderedFieldNames[1].endsWith('Label')
          ) {
            // not a true enum, so ignore the inserts
            building = null;
            return;
          }
          building.objectType = OBJECT_TYPE_ENUM;
          building.valuesByLabel = building.valuesByLabel ?? {};
          building.labelsByValue = building.labelsByValue ?? {};
          return;
        }

        // nothing else matters
      }

      function processTableLine() {
        assertInside();

        if (schemaLine === ');') {
          building = undefined;
          return;
        }

        const fieldMatch = schemaLine.match(/^  "([a-z]\w+)" (\w+)( PRIMARY KEY)?/);
        if (fieldMatch === null) {
          return; // not something we care about
        }
        const [, fieldName, sqlType, primaryKey ] = fieldMatch;

        const field = {
          fieldName,
          objectType: OBJECT_TYPE_FIELD,
          sqlType,
          isPrimaryKey: Boolean(primaryKey),
          isRequired: Boolean(primaryKey) || schemaLine.includes('NOT NULL'),
          hasDefault: schemaLine.includes(' DEFAULT '),
          ownerTableName: building.tableName,
          referenceTableName: undefined,
          referenceFieldName: undefined
        };
        building.fields[camelCase(fieldName)] = field;
        building.orderedFieldNames.push(fieldName);

        if (field.isPrimaryKey) {
          building.primaryKey = fieldName;
        }

        const referenceMatch = schemaLine.match(/REFERENCES "(\w+)"\("(\w+)"\)/);
        if (referenceMatch) {
          const [, referenceTableName, referenceFieldName ] = referenceMatch;
          field.referenceTableName = referenceTableName;
          field.referenceFieldName = referenceFieldName;
        }
      }

      function processEnumLine() {
        assertInside();

        const missedEnding = /^[^ ]/.test(schemaLine);
        if (missedEnding) {
          throw new Error(`Parsing error reading enum ${ building.tableName }. Found unexpected text on line ${ index + 1 }: ${ schemaLine }`);
        }
        const valueRow = schemaLine.match(/\((\d+), '(.+)'\)(,)?/);
        if (valueRow === null) {
          // not something we care about
          return;
        }

        const [, id, value, lineEnding] = valueRow;

        building.labelsByValue[id] = value;
        building.valuesByLabel[value] = Number.parseInt(id);

        if (lineEnding === undefined) {
          building = null;
        }
      }

      function processQuestionRefLine() {
        assertInside();

        const missedEnding = /^[^ ]/.test(schemaLine);
        if (missedEnding) {
          throw new Error(`Parsing error reading enum ${ building.tableName }. Found unexpected text on line ${ index + 1 }: ${ schemaLine }`);
        }
        const valueRow = schemaLine.match(/\('(\w+)', \d+, (\d+)\)(,)?/);
        if (valueRow === null) {
          // not something we care about
          return;
        }

        const [, questionRef, questionType, lineEnding] = valueRow;

        building.labelsByValue[questionRef] = questionRef;
        building.valuesByLabel[questionRef] = questionRef;

        surveyQuestionTypeByQuestionRefLines.push(
          `  ${ questionRef }: SurveyQuestionType.${ camelCase(tablesByName.surveyQuestionTypes.labelsByValue[questionType]) },`
        );

        if (lineEnding === undefined) {
          building = null;
        }
      }

      function assertInside() {
        [
          'CREATE',
          'INSERT',
          'CALL',
        ].forEach(
          keyword => {
            if (schemaLine.startsWith(keyword)) {
              throw new Error(`Parsing error reading ${ building.tableName }. Found unexpected keyword '${ keyword }' on line ${ index + 1 }.`);
            }
          }
        );
      }
    }
  }
};
