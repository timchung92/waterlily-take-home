import { identity } from 'lodash';
import {
  ExError,
  isNullOrUndefined,
  isNullUndefinedOrEmpty,
  SurveyQuestionType,
} from '@shared';

const dbQuestionTypeFormatters = {
  [SurveyQuestionType.text]: identity as (value: string) => string,
  [SurveyQuestionType.date]: dbFormatDate,
  [SurveyQuestionType.integer]: dbFormatInt,
  [SurveyQuestionType.multipleChoice]: identity as (value: string) => string,
  [SurveyQuestionType.manyMultipleChoice]: dbFormatStringArray,
  [SurveyQuestionType.ranking]: dbFormatStringArray,
  [SurveyQuestionType.boolean]: dbFormatBoolean,
};

export function dbFormatByQuestionType(
  questionType: SurveyQuestionType,
  value: string | number | Date | boolean | string[]
): string {
  const formatter = dbQuestionTypeFormatters[ questionType ] as (value: any) => string;
  return formatter(value);
}

export function dbFormatDate(value: Date) {
  return value.toISOString();
}

export function dbFormatInt(value: number) {
  return Math.trunc(value).toString();
}

export function dbFormatBoolean(value: boolean): string {
  return isNullUndefinedOrEmpty(value)
    ? null
    : value
      ? 't'
      : 'f';
}

export function dbFormatStringArray(value: string[]) {
  return value.join("|");
}

const dbQuestionTypeParsers = {
  [ SurveyQuestionType.text ]: identity,
  [ SurveyQuestionType.date ]: dbParseDate,
  [ SurveyQuestionType.integer ]: dbParseInt,
  [ SurveyQuestionType.multipleChoice ]: identity,
  [ SurveyQuestionType.manyMultipleChoice ]: dbParseStringArray,
  [ SurveyQuestionType.ranking ]: dbParseStringArray,
  [ SurveyQuestionType.boolean ]: dbParseBoolean,
};

export function dbParseByQuestionType(
  questionType: SurveyQuestionType,
  value: string | null
): string | Date | number | string[] | boolean | null {
  if (isNullUndefinedOrEmpty(value)) {
    return null;
  }
  const parser = dbQuestionTypeParsers[ questionType ];
  if (isNullOrUndefined(parser)) {
    throw new ExError(
      'No parser defined for question type.',
      {
        questionType,
        value
      }
    );
  }
  return parser(value);
}

export function dbParseDate(value: string) {
  return new Date(value);
}

export function dbParseInt(value: string) {
  return Number.parseInt(value);
}

export function dbParseBoolean(value: string) {
  return (value === 't' || value === '1');
}

export function dbParseStringArray(value: string) {
  return value.split('|');
}