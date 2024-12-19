import { builtEnvironment, isRunningLocal } from ".";


export const getBaseUrl = () =>  {
  const env = isRunningLocal() ? 'local' : builtEnvironment;
  return env === 'prod' ?
  'https://app.joinwaterlily.com' : env === 'dev' ?
    'https://dev-app.joinwaterlily.com' :
    'https://localhost:5173';
}

export default getBaseUrl;