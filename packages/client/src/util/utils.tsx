import { useDispatch, useSelector } from 'react-redux';
import {
  previewClientUpdates,
  putFundingSourcesForClientByClientIdRequest,
  selectClient,
} from '..';
import { pick } from 'lodash';
import produce from 'immer';
import { useCallback } from 'react';

export const PieChartColors = ['#120F3A', '#A798E5'];

export function checkIsLocalhost(): boolean {
  return /^https?:\/\/localhost[/:]/.test(document.URL);
}

/**
 * Given one of the  many many variants of gender or containers of gender, return the possessive pronoun. Inputs could
 * be a client, intake survey, a gender identity. Gender identity could be a string or an array.
 * Individual values could be Male, Female, He/Him, She/Her, They/Their.
 */
export function possessivePronoun(intakeSurvey: IntakeSurvey): string {
  const { clientGenderIdentity, clientGenderAtBirth } = intakeSurvey;
  if (clientGenderIdentity) {
    return clientGenderIdentity.includes('They/Them')
      ? 'their'
      : clientGenderIdentity.includes('She/Her') ||
          clientGenderIdentity.includes('Female')
        ? 'her'
        : 'his';
  }
  // if clientGenderIdentity is undefined, use clientGenderAtBirth
  const clientGenderAtBirthLower = clientGenderAtBirth.toLocaleLowerCase();
  switch (clientGenderAtBirthLower) {
    case 'male':
      return 'his';
    case 'female':
      return 'her';
    default:
      return 'their';
  }
}

export function pronoun(intakeSurvey: IntakeSurvey): string {
  const { clientGenderIdentity, clientGenderAtBirth } = intakeSurvey;
  if (clientGenderIdentity) {
    return clientGenderIdentity.includes('They/Them')
      ? 'they'
      : clientGenderIdentity.includes('She/Her') ||
          clientGenderIdentity.includes('Female')
        ? 'she'
        : 'he';
  }
  // if clientGenderIdentity is undefined, use clientGenderAtBirth
  const clientGenderAtBirthLower = clientGenderAtBirth.toLocaleLowerCase();
  switch (clientGenderAtBirthLower) {
    case 'male':
      return 'he';
    case 'female':
      return 'she';
    default:
      return 'they';
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function logAndEcho(name: string, obj: any): Object {
  console.log(
    dedent(
      `
      ---
      --- ${name}
      ---
      `,
    ) +
      JSON.stringify(obj, createJsonReplacerArrayTruncator(4), 2) +
      '\n---\n\n',
  );
  return obj;
}

export function createJsonReplacerArrayTruncator(maxLength: number) {
  return function jsonReplacerArrayTruncator(_key: any, value: string): string {
    return Array.isArray(value) && value.length > maxLength
      ? value.slice(0, maxLength)
      : value;
  };
}

export function dedent(multilineString: string): string {
  const lines: string[] = multilineString.split('\n');
  const indent: number[] = lines
    .map(line => countLeadingChars(line, ' '))
    .filter(n => n > 0);
  const minIndent: number = Math.min(...indent);
  return lines.map(line => line.slice(minIndent)).join('\n');
}

export function countLeadingChars(s: string, c: string): number {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== c) {
      break;
    }
    count++;
  }
  return count;
}

export function useChangeFundingCallback(
  fundingSourceLabel: keyof Pick<FundingSources, 'selfFunding'>,
  fundingDetailField: keyof NumberInputSelfFundingSource,
  isPreview: boolean,
): (value: number | null) => void;
export function useChangeFundingCallback(
  fundingSourceLabel: keyof Pick<FundingSources, 'ltcPolicy'>,
  fundingDetailField: keyof NumberInputPolicyFundingSource,
  isPreview: boolean,
): (value: number | null) => void;
export function useChangeFundingCallback(
  fundingSourceLabel: keyof FundingSources,
  fundingDetailField: keyof NumberInputSource,
  isPreview: boolean,
): (value: number | null) => void {
  const client = useSelector(selectClient);
  const dispatch = useDispatch();

  return useCallback(
    function changeFundingCallbackImpl(value: number | null) {
      const updateClient = produce(client, draftClient => {
        (draftClient.fundingSources[fundingSourceLabel] as any)[
          fundingDetailField
        ] = value;
      });

      // removing preview mode because it's causing weird behavior
      // It zeros out certain fields temporarily
      const action = isPreview
        ? previewClientUpdates(updateClient)
        : putFundingSourcesForClientByClientIdRequest(
            pick(updateClient, 'clientId', 'fundingSources'),
          );

      // const action = putFundingSourcesForClientByClientIdRequest(pick(updateClient, 'clientId', 'fundingSources'));
      dispatch(action);
    },
    [client, dispatch, fundingDetailField, fundingSourceLabel],
  );
}
