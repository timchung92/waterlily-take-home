import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: (typeof process === 'object' && process.env.REACT_APP_USER_POOL_ID) || 'us-west-2_bSqaa2B0s',
  ClientId: (typeof process === 'object' && process.env.REACT_APP_CLIENT_ID) || '1vjqjpcu042l1qjbkenfa7b52l',
};

export default new CognitoUserPool(poolData);