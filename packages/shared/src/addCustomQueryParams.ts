export function addCustomQueryParams(
  url: string,
  queryStringParameters: QueryStringParametersProps['queryStringParameters'],
  custom_prefix: string,
) {
  const convertBooleanString = (value: string) =>
    value === 'true' ? 'true' : value === 'false' ? 'false' : value;

  const customParams = Object.keys(queryStringParameters)
    .filter(key => key.startsWith(custom_prefix))
    .map(
      key =>
        `${encodeURIComponent(key)}=${encodeURIComponent(convertBooleanString(queryStringParameters[key]))}`,
    )
    .join('&');

  return customParams ? `${url}&${customParams}` : url;
}
