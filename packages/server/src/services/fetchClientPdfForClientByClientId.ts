import { ContentType, builtEnvironment, isRunningLocal, logWarn } from '@shared';
import p from 'puppeteer';
import core, { TimeoutError } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { pdfUser } from '@server/util';
import { pdfUserPassword } from '@server/util/pdfUserPassword';



async function printPDF(clientId: string) {
  let browser;
  let puppeteer;

  const s3Client = new S3Client({ region: process.env.AWS_REGION ?? 'us-west-1' });

  const env = isRunningLocal() ? 'local' : builtEnvironment;

   if (env === 'local') {
    puppeteer = p;
    browser = await puppeteer.launch({ headless: true });
   } else {
    puppeteer = core;
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
   }

  const page = await browser.newPage();
  const baseUrl = env === 'prod' ?
  'https://app.joinwaterlily.com' : env === 'dev' ?
    'https://dev-app.joinwaterlily.com' :
    'https://localhost:5173';

  await page.goto(`${baseUrl}/clients/${clientId}/onboarding/report`, {waitUntil: 'networkidle0'});
  await page.type('#email', pdfUser)
  await page.type('#password', await pdfUserPassword())
  await page.click('[type="submit"]')
  await page.waitForSelector('#client-pdf-report')
  await page.waitForSelector('#white-label-container')
  try {
    await page.waitForSelector('#whitelabel-logo', { timeout: 1000 })
  } catch (err) {
    if (err instanceof TimeoutError) {
      logWarn(fetchClientPdfForClientByClientId, 'No whitelabel logo found, continuing without it.', { clientId }, err)
    } else {
      throw err;
    }
  }

  const pdf = await page.pdf({ format: 'letter', printBackground: true, scale: 0.77});

  await browser.close();

  const fileName = `${clientId}-LTC-report-${new Date().toISOString()}.pdf`;
  const s3Env = env === 'prod' ? 'prod' : 'dev';
  const bucket = `waterlily-pdf-reports-${s3Env}`;
  // upload pdf to s3 using aws sdk
  const uploadParams = {
    Bucket: bucket,
    Key: fileName,
    Body: pdf,
    ContentType: ContentType.PDF,
  }
  await s3Client.send(new PutObjectCommand(uploadParams));


async function getSignedFileUrl(fileName, bucket, expiresIn) {

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });

  // await the signed URL and return it
  return await getSignedUrl(s3Client, command, { expiresIn });
}

const url = await getSignedFileUrl(fileName, bucket, 60 * 60 * 24 * 7);

return url;
}

export async function fetchClientPdfForClientByClientId({ clientId }: ClientIdProps) {
return printPDF(clientId);
}
