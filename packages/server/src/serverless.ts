import type { AWS } from '@serverless/typescript';
import { existsSync } from 'fs';
import * as inspector from 'inspector';
import { platform } from 'os';
import { join } from 'path';

let serverlessOffline: unknown = undefined;

if (platform() === 'darwin') {
  const projectRoot = __dirname.replace(/\/packages\/.+/, '');
  const certDir = join(projectRoot, 'packages/server/dev-certs/');
  const keyPath = join(certDir, 'key.pem');
  const certPath = join(certDir, 'cert.pem');

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    const keyRelativePath = `.${keyPath.substring(projectRoot.length)}`;
    const certRelativePath = `.${certPath.substring(projectRoot.length)}`;

    throw new Error(
      `\n
      \nUnable to find development SSL keys where expected.\n
      \n${keyRelativePath}\n${certRelativePath}
      \nRun './scripts/trust-dev-cert.sh' to create them.\n`,
    );
  }

  serverlessOffline = {
    httpsProtocol: '../dev-certs',
    httpPort: 8081,
    printOutput: true,
    reloadHandler: false,
  };
}

module.exports = {
  service: 'server',
  frameworkVersion: '3',
  useDotenv: true,
  plugins: [
    'serverless-esbuild',
    'serverless-offline',
    'serverless-dotenv-plugin',
  ],
  provider: {
    region: 'us-west-1',
    name: 'aws',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    timeout: inspector.url() ? 60 * 60 : 15 * 60, // one hour if debugging, 15 minutes otherwise
  },
  functions: {
    api: {
      handler: 'index.handler',
      events: [
        {
          http: {
            method: '*',
            path: 'api/{proxy+}',
            // request: {
            //   schemas: {
            //     'application/json': schema,
            //   },
            // },
          },
        },
      ],
      layers: [
        'arn:aws:lambda:us-west-1:064935776731:layer:chromium:1',
        'arn:aws:lambda:us-west-1:064935776731:layer:pdf-parse:4',
      ],
    },
  },
  package: {
    individually: true,
    path: join(__dirname, '../../../build/server'),
  },
  custom: {
    'dotenv': {
      logging: true,
      variableExpansion: true,
      path: `${__dirname}/.env`,
    },
    'esbuild': {
      bundle: true,
      minify: false,
      sourcemap: true,
      keepOutputDirectory: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      external: ['aws-sdk', '@sparticuz/chromium', 'pdf-parse'],
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-offline': serverlessOffline,
  },
} as AWS;
