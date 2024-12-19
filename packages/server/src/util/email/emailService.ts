import pbMail from 'paubox-node';
import {
  getBaseUrl,
  isRunningLocal,
  logInfo,
  logLocal,
  randomUnambiguousString,
} from '@shared';
import { selectMany, selectUnsubscribedEmailsSql } from 'src';
import {
  getAccessProfileTemplate,
  getClientIntakeFormEmailTemplate,
  getPolicyOptionsRequestEmailTemplate,
  getAdvisorClientIntakeCompletedNotificationEmailTemplate,
  reviewOnboardingSlidesReminderWithLinkTemplate,
  reviewOnboardingSlidesReminderNoLinkTemplate,
  reviewInProgressOnboardingSlidesReminderWithLinkTemplate,
  fillOutIntakeFormReminderTemplate,
  advisorMeetingRequestTemplate,
  partnerLinkRequestTemplate,
  partnerLinkConfirmationTemplate,
} from '@shared/email/templates';

let service: any;
let fromEmail = 'Waterlily Planning <no-reply@joinwaterlily.com>';

async function initializeService() {
  // add random string to each from email to avoid threading issues
  const randomString = randomUnambiguousString(8);
  fromEmail = `Waterlily Planning <no-reply+${randomString}@joinwaterlily.com>`;

  if (service) {
    return;
  }

  service = {
    sendMessage: async (message: any) => {
      console.log('Mock sending email', message);
      return { success: true };
    },
  };
}

export async function checkIsEmailUnsubscribed(
  email: string,
  type: 'reminders' | 'transactions' | 'all',
) {
  const unsubscribedEmails = (
    await selectMany<{ email: string }>(selectUnsubscribedEmailsSql(type))
  ).map(row => row.email);
  return unsubscribedEmails && unsubscribedEmails.includes(email);
}

function createEmailPreferencesLink(email: string) {
  const baseUrl = getBaseUrl();
  const base64EncodedEmail = encodeURIComponent(btoa(email));
  return `${baseUrl}/email/preferences?t=${base64EncodedEmail}`;
}

async function handleUnsubscribedEmail(
  email: string,
  callingFunction: Function,
  type: 'reminders' | 'transactions' | 'all',
) {
  const emailIsUnsubscribed = await checkIsEmailUnsubscribed(email, type);
  if (emailIsUnsubscribed) {
    logInfo(
      callingFunction,
      `${email} has unsubscribed from ${type} emails, skipping email`,
      { email },
    );
    return true;
  }
  return false;
}

export async function sendMagicLinkEmail(
  email: string,
  clientFirstName: string,
  magicLink: string,
) {
  await initializeService();
  if (
    await handleUnsubscribedEmail(email, sendMagicLinkEmail, 'transactions')
  ) {
    return;
  }

  var options = {
    from: fromEmail,
    to: [email],
    subject:
      'Thanks for completing your LTC intake form! You can view your long-term care predictions now',
    text_content: 'Your long-term care profile is ready.',
    html_content: getAccessProfileTemplate(clientFirstName, magicLink),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(sendMagicLinkEmail, 'Mock sending magic link email', message);
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

export async function sendAdvisorMeetingRequestEmail({
  advisorEmail,
  clientEmail,
  advisorFirstName,
  clientFullName,
  clientProvidedBody,
}: AdvisorMeetingRequestEmailProps) {
  await initializeService();
  if (
    await handleUnsubscribedEmail(
      advisorEmail,
      sendAdvisorMeetingRequestEmail,
      'transactions',
    )
  ) {
    return;
  }
  var options = {
    from: fromEmail,
    to: [advisorEmail],
    subject: `${clientFullName} has requested a meeting with you via Waterlily Planning`,
    text_content: 'A client has requested a meeting with you',
    html_content: advisorMeetingRequestTemplate({
      clientEmail,
      advisorFirstName,
      clientFullName,
      clientProvidedBody,
    }),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendAdvisorMeetingRequestEmail,
      'Mock sending magic link email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

interface SendClientIntakeFormEmailParams {
  email: string;
  clientFirstName?: string;
  advisorFirstName: string;
  intakeFormLink: string;
  advisorOrganization?: string;
  advisorProvidedBody?: string;
}

export async function sendClientIntakeFormEmail({
  email,
  clientFirstName,
  advisorFirstName,
  intakeFormLink,
  advisorOrganization,
  advisorProvidedBody,
}: SendClientIntakeFormEmailParams) {
  await initializeService();
  if (
    await handleUnsubscribedEmail(
      email,
      sendClientIntakeFormEmail,
      'transactions',
    )
  ) {
    return;
  }

  var options = {
    from: fromEmail,
    to: [email],
    subject: `You have a message from ${advisorFirstName} ${advisorOrganization ? `at ${advisorOrganization}` : 'via Waterlily Planning'}`,
    text_content: `Let's get started on your long-term care plan.`,
    html_content: getClientIntakeFormEmailTemplate({
      clientFirstName,
      advisorFirstName,
      intakeFormLink,
      advisorOrganization,
      advisorProvidedBody,
    }),
  };
  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendClientIntakeFormEmail,
      'Mock sending intake form url email',
      message,
    );
    return;
  }

  const result = await service.sendMessage(message);
  // Check for errors in the response
  if (result.errors && result.errors.length > 0) {
    result.errors.forEach(
      (error: { title: string; details: string; code: number }) => {
        console.error(
          `Error sending email: ${error.title} - ${error.details} (Code: ${error.code})`,
        );
      },
    );
    throw new Error(
      'Errors occurred while sending the email. Errors: ' +
        JSON.stringify(result.errors),
    );
  }
  return result;
}

export async function sendPolicyOptionsRequestEmail({
  clientEmail,
  clientFirstName,
  clientLastName,
  clientOnboardingSlidesLink,
  advisorEmail,
  advisorFirstName,
}: PolicyOptionsRequestEmailProps) {
  await initializeService();
  if (
    await handleUnsubscribedEmail(
      advisorEmail,
      sendPolicyOptionsRequestEmail,
      'transactions',
    )
  ) {
    return;
  }

  const emailPreferencesLink = createEmailPreferencesLink(advisorEmail);

  var options = {
    from: fromEmail,
    to: [advisorEmail],
    subject: `${clientFirstName} ${clientLastName} Has Requested Your Help With Policy Options`,
    text_content: `${clientFirstName} ${clientLastName} has requested policy options`,
    html_content: getPolicyOptionsRequestEmailTemplate({
      clientFirstName,
      clientLastName,
      clientEmail,
      clientOnboardingSlidesLink,
      advisorFirstName,
      emailPreferencesLink,
    }),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendPolicyOptionsRequestEmail,
      'Mock sending policy options url email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

interface AdvisorClientIntakeCompletedNotificationEmailProps {
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientOnboardingSlidesLink: string;
  advisorFirstName: string;
  advisorEmail: string;
}

export async function sendAdvisorClientIntakeCompletedNotificationEmail({
  clientEmail,
  clientFirstName,
  clientLastName,
  clientOnboardingSlidesLink,
  advisorEmail,
  advisorFirstName,
}: AdvisorClientIntakeCompletedNotificationEmailProps) {
  await initializeService();
  if (
    await handleUnsubscribedEmail(
      advisorEmail,
      sendAdvisorClientIntakeCompletedNotificationEmail,
      'transactions',
    )
  ) {
    return;
  }

  const emailPreferencesLink = createEmailPreferencesLink(advisorEmail);

  var options = {
    from: fromEmail,
    to: [advisorEmail],
    subject: `${clientFirstName} ${clientLastName} Has Submitted Their Intake Form`,
    text_content: `${clientFirstName} ${clientLastName} has submitted their intake form`,
    html_content: getAdvisorClientIntakeCompletedNotificationEmailTemplate({
      clientFirstName,
      clientLastName,
      clientEmail,
      clientOnboardingSlidesLink,
      advisorFirstName,
      emailPreferencesLink,
    }),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendAdvisorClientIntakeCompletedNotificationEmail,
      'Mock sending advisor intake notification email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

interface SingleClientReviewOnboardingSlidesEngagementEmailProps {
  clientEmail: string;
  clientFirstName: string;
  magicLink?: string;
  advisor?: Advisor;
}

export async function sendSingleClientReviewOnboardingSlidesEngagementEmail({
  clientEmail,
  clientFirstName,
  magicLink,
  advisor,
}: SingleClientReviewOnboardingSlidesEngagementEmailProps) {
  await initializeService();
  const emailPreferencesLink = createEmailPreferencesLink(clientEmail);

  let htmlContent;
  if (magicLink) {
    htmlContent = reviewOnboardingSlidesReminderWithLinkTemplate({
      clientName: clientFirstName,
      magicLink,
      emailPreferencesLink,
    });
  } else if (advisor) {
    htmlContent = reviewOnboardingSlidesReminderNoLinkTemplate({
      clientName: clientFirstName,
      advisorFirstName: advisor.advisorFirstName,
      advisorLastName: advisor.advisorLastName,
      advisorEmail: advisor.advisorEmail,
      emailPreferencesLink,
    });
  } else {
    throw new Error(
      'Either advisor or magic link must be provided to sendSingleClientReviewOnboardingSlidesEngagementEmail',
    );
  }
  var options = {
    from: fromEmail,
    to: [clientEmail],
    subject: 'Reminder: You can view your long-term care predictions now!',
    text_content: 'Reminder: You can view your long-term care predictions now!',
    html_content: htmlContent,
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendSingleClientReviewOnboardingSlidesEngagementEmail,
      'Mock sending single client review onboarding slides engagement email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

interface SendSingleClientReviewInProgressEngagementEmailProps {
  clientEmail: string;
  clientFirstName: string;
  magicLink: string;
  advisor: Advisor;
}

export async function sendSingleClientReviewInProgressEngagementEmail({
  clientEmail,
  clientFirstName,
  magicLink,
  advisor,
}: SendSingleClientReviewInProgressEngagementEmailProps) {
  await initializeService();

  const emailPreferencesLink = createEmailPreferencesLink(clientEmail);

  var options = {
    from: fromEmail,
    to: [clientEmail],
    subject: 'Reminder: Finish preparing for your long-term care',
    text_content: 'Finish preparing for your long-term care',
    html_content: reviewInProgressOnboardingSlidesReminderWithLinkTemplate({
      clientName: clientFirstName,
      magicLink,
      emailPreferencesLink,
      advisorFirstName: advisor.advisorFirstName,
      advisorLastName: advisor.advisorLastName,
      advisorEmail: advisor.advisorEmail,
      advisorOrganization: advisor.organizationName,
    }),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendSingleClientReviewInProgressEngagementEmail,
      'Mock sending single client review in progress engagement email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

type SendSingleFillOutIntakeFormEngagementEmailProps = {
  clientEmail: string;
  clientFirstName: string;
  intakeFormUrl: string;
  advisor: Advisor;
};

export async function sendSingleFillOutIntakeFormEngagementEmail({
  clientEmail,
  clientFirstName,
  intakeFormUrl,
  advisor,
}: SendSingleFillOutIntakeFormEngagementEmailProps) {
  await initializeService();

  const emailPreferencesLink = createEmailPreferencesLink(clientEmail);

  var options = {
    from: fromEmail,
    to: [clientEmail],
    subject: `${clientFirstName}, ${advisor.advisorFirstName} ${advisor.organizationName ? `from ${advisor.organizationName}` : ''} is ready to help you plan for the future`,
    text_content: `${clientFirstName}, ${advisor.advisorFirstName} ${advisor.organizationName ? `from ${advisor.organizationName}` : ''} is ready to help you plan for the future`,
    html_content: fillOutIntakeFormReminderTemplate({
      clientName: clientFirstName,
      intakeFormUrl,
      emailPreferencesLink,
      advisorFirstName: advisor.advisorFirstName,
      advisorOrganization: advisor.organizationName,
    }),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendSingleClientReviewInProgressEngagementEmail,
      'Mock sending single client review in progress engagement email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

export async function sendPartnerLinkRequestEmail({
  partnerEmail,
  clientEmail,
  clientFirstName,
  clientLastName,
  partnerLinkRequestUrl,
}: Omit<PutPartnerLinkRequestEmailProps, 'advisorId' | 'clientId'> & {
  partnerLinkRequestUrl: string;
}) {
  await initializeService();

  let emailIsUnsubscribed = await checkIsEmailUnsubscribed(
    partnerEmail,
    'transactions',
  );
  if (emailIsUnsubscribed) {
    logInfo(
      sendPartnerLinkRequestEmail,
      'Partner has unsubscribed from transaction emails, skipping email',
      { partnerEmail },
    );
    return;
  }

  var options = {
    from: fromEmail,
    to: [partnerEmail],
    subject: `${clientFirstName} ${clientLastName} would like to link accounts`,
    text_content: `${clientFirstName} ${clientLastName} has requested to link accounts with you on Waterlily Planning`,
    html_content: partnerLinkRequestTemplate({
      clientFirstName,
      clientLastName,
      clientEmail,
      partnerLinkRequestUrl,
    }),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendPartnerLinkRequestEmail,
      'Mock sending partner link request email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}

type PartnerLinkConfirmationEmailProps = {
  clientEmail: string;
  clientFirstName: string;
  magicLink: string;
  partnerFirstName: string;
  partnerLastName: string;
};

export async function sendPartnerLinkConfirmationEmail({
  clientEmail,
  clientFirstName,
  magicLink,
  partnerFirstName,
  partnerLastName,
}: PartnerLinkConfirmationEmailProps) {
  await initializeService();

  // Check if client has unsubscribed from transaction emails
  if (
    await handleUnsubscribedEmail(
      clientEmail,
      sendPartnerLinkConfirmationEmail,
      'transactions',
    )
  ) {
    return;
  }

  var options = {
    from: fromEmail,
    to: [clientEmail],
    subject: `${partnerFirstName} ${partnerLastName} has accepted your link request`,
    text_content: 'Your partner has accepted your link request',
    html_content: partnerLinkConfirmationTemplate({
      clientFirstName,
      magicLink,
      partnerFirstName,
      partnerLastName,
    }),
  };

  var message = pbMail.message(options);
  if (isRunningLocal()) {
    logLocal(
      sendPartnerLinkConfirmationEmail,
      'Mock sending partner link confirmation email',
      message,
    );
    return;
  }
  const result = await service.sendMessage(message);
  return result;
}
