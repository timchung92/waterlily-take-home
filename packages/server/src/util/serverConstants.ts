
export const EXIT_CODE_BAD_INITIALIZATION = 1001;

export const algorithmApiHost = process.env.WALP_ALGO_HOST || 'algo-test.joinwaterlily.com';
                                                    // || 'dbc-a71f17e6-de95.cloud.databricks.com';
                                                    // https://dbc-a71f17e6-de95.cloud.databricks.com/serving-endpoints/care-carePhase-helper-hours-ratios/invocations
export const algorithmApiUrlPattern = process.env.WALP_ALGO_URL_PATTERN || 'http://$host:8000/models/$model/predict';
export const algorithmApiMethod = process.env.WALP_ALGO_METHOD || 'POST';
export const algorithmApiAuthTokenProvided = process.env.WALP_ALGO_AUTH_TOKEN;
export const algorithmApiAuthTokenSsmName = process.env.WALP_ALGO_AUTH_TOKEN_SSM_NAME || 'WalpApp-DataBricks-prod-AuthToken';

export const targetEnvironment = process.env.TARGET_ENVIRONMENT;
export const appVersion = process.env.WALP_APP_VERSION;
export const dbReadOnlyHost = process.env.WALPAPP_DB_READ_ONLY_HOST;
export const dbReadWriteHost = process.env.WALPAPP_DB_READ_WRITE_HOST;
export const dbReadOnlyPort = process.env.WALPAPP_DB_READ_ONLY_PORT;
export const dbReadWritePort = process.env.WALPAPP_DB_READ_WRITE_PORT;
export const dbPort = process.env.WALPAPP_DB_PORT;
export const dbUser = process.env.WALPAPP_DB_USER;
export const dbPasswordProvided = process.env.WALPAPP_DB_PASSWORD;
export const dbPasswordSsmName = process.env.WALPAPP_DB_PASSWORD_SSM_NAME;

export const pauboxUser = process.env.WALPAPP_PAUBOX_USER;
export const pauboxApiKeyProvided = process.env.WALPAPP_PAUBOX_API_KEY;
export const pauboxApiKeySSMName = process.env.WALPAPP_PAUBOX_API_KEY_SSM_NAME;

export const pdfUser = process.env.WALPAPP_PDF_USER;
export const pdfPasswordProvided = process.env.WALPAPP_PDF_PASSWORD;
export const pdfPasswordSSMName = process.env.WALPAPP_PDF_PASSWORD_SSM_NAME;

export const createMagicLinkEnabled = process.env.WALPAPP_CREATE_MAGIC_LINK === 'true';

export const cognitoUserPoolId = process.env.WALP_COGNITO_USER_POOL_ID || 'us-west-2_bSqaa2B0s';
export const cognitoClientId = process.env.WALP_APP_COGNITO_CLIENT_ID || '1vjqjpcu042l1qjbkenfa7b52l';

export const scheduledEventApiKeyProvided = process.env.WALPAPP_SCHEDULED_EVENTS_API_KEY;
export const scheduledEventsApiKeySSMName = process.env.WALPAPP_SCHEDULED_EVENTS_API_KEY_SSM_NAME;

export const intercomIdentityVerificationKeyProvided = process.env.WALPAPP_INTERCOM_IDENTITY_VERIFICATION_KEY;
export const intercomIdentityVerificationKeySSMName = process.env.WALPAPP_INTERCOM_IDENTITY_VERIFICATION_KEY_SSM_NAME;

export const openAIApiKeyProvided = process.env.WALPAPP_OPENAI_API_KEY;
export const openAIApiKeySSMName = process.env.WALPAPP_OPENAI_API_KEY_SSM_NAME;

