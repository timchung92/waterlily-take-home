import {
  fetchAdvisorByAdvisorId,
  selectClientsHasNotStartedOnboardingSlidesNoMagicLinkAccess,
  selectClientsHasNotStartedOnboardingSlidesWithMagicLinkAccess,
  selectClientsHasStartedOnboardingSlidesWithMagicLinkAccess,
  selectClientsMissingIntakeForm,
  selectMany,
  sendSingleClientReviewInProgressEngagementEmail,
  sendSingleClientReviewOnboardingSlidesEngagementEmail,
  sendSingleFillOutIntakeFormEngagementEmail,
} from 'src';
import { getMagicLink } from 'src/util/createMagicLink';
import { logError } from '@shared';

export async function postWeeklyEmailCampaignsForScheduledEvents() {
  const [
    clientsNoReviewWithMagicLinkEmails,
    clientsNoReviewNoMagicLinkEmails,
    clientsInProgressReviewWithMagicLinkEmails,
    clientsFillOutIntakeFormEmails,
  ] = await Promise.all([
    sendAllClientsReviewOnboardingSlidesEngagementEmails(),
    sendAllClientsReviewOnboardingSlidesEngagementEmailsNoMagicLink(),
    sendAllClientsReviewOnboardingSlidesEngagementEmailsStartedSlidesWithMagicLink(),

    sendAllClientsFillOutIntakeFormEngagementEmail(),
  ]);
  return {
    clientsNoReviewWithMagicLinkEmails,
    clientsNoReviewNoMagicLinkEmails,
    clientsInProgressReviewWithMagicLinkEmails,
    clientsFillOutIntakeFormEmails,
  };
}

/**
 * Send re-engagement email to clients that have not started onboarding slides and have magic link access
 */
async function sendAllClientsReviewOnboardingSlidesEngagementEmails() {
  // find all clients that have not started onboarding slides
  let clientEmails: string[] = [];
  try {
    const clients = await selectMany<
      Pick<Client, 'clientEmail' | 'clientFirstName' | 'clientId'>
    >(selectClientsHasNotStartedOnboardingSlidesWithMagicLinkAccess());
    clientEmails = clients.map(client => client.clientEmail);

    const clientEmailPromises = clients.map(async client => {
      // send email to each client
      const newMagicLink = await getMagicLink({ clientId: client.clientId });
      return sendSingleClientReviewOnboardingSlidesEngagementEmail({
        clientEmail: client.clientEmail,
        clientFirstName: client.clientFirstName,
        magicLink: newMagicLink,
      });
    });

    await Promise.all(clientEmailPromises);
  } catch (error) {
    logError(
      sendAllClientsReviewOnboardingSlidesEngagementEmails,
      'Error sending review onboarding slides re-engagement emails to clients with magic link access',
      {
        error,
        clientEmails,
      },
    );
  }
  return clientEmails;
}

/**
 * Send re-engagement email to clients that have not started onboarding slides and do not have magic link access
 */
async function sendAllClientsReviewOnboardingSlidesEngagementEmailsNoMagicLink() {
  // find all clients that have not started onboarding slides and do not have a magic link
  let clientEmails: string[] = [];
  try {
    const clients = await selectMany<
      Pick<Client, 'clientEmail' | 'clientFirstName' | 'clientId' | 'advisorId'>
    >(selectClientsHasNotStartedOnboardingSlidesNoMagicLinkAccess());
    clientEmails = clients.map(client => client.clientEmail);

    const clientEmailPromises = clients.map(async client => {
      // send email to each client
      const advisor = await fetchAdvisorByAdvisorId({
        advisorId: client.advisorId,
      });
      return sendSingleClientReviewOnboardingSlidesEngagementEmail({
        clientEmail: client.clientEmail,
        clientFirstName: client.clientFirstName,
        advisor,
      });
    });

    await Promise.all(clientEmailPromises);
  } catch (error) {
    logError(
      sendAllClientsReviewOnboardingSlidesEngagementEmailsNoMagicLink,
      'Error sending review onboarding slides re-engagement emails to clients with no magic link access',
      {
        error,
        clientEmails,
      },
    );
  }
  return clientEmails;
}

/**
 * Send re-engagement email to clients that have started onboarding slides and have magic link access
 */
async function sendAllClientsReviewOnboardingSlidesEngagementEmailsStartedSlidesWithMagicLink() {
  // find all clients that have started onboarding slides with access to magic link
  let clientEmails: string[] = [];
  try {
    const clients = await selectMany<
      Pick<Client, 'clientEmail' | 'clientFirstName' | 'clientId' | 'advisorId'>
    >(selectClientsHasStartedOnboardingSlidesWithMagicLinkAccess());
    clientEmails = clients.map(client => client.clientEmail);

    const clientEmailPromises = clients.map(async client => {
      // send email to each client
      const newMagicLink = await getMagicLink({ clientId: client.clientId });
      const advisor = await fetchAdvisorByAdvisorId({
        advisorId: client.advisorId,
      });
      return sendSingleClientReviewInProgressEngagementEmail({
        clientEmail: client.clientEmail,
        clientFirstName: client.clientFirstName,
        magicLink: newMagicLink,
        advisor,
      });
    });

    await Promise.all(clientEmailPromises);
  } catch (error) {
    logError(
      sendAllClientsReviewOnboardingSlidesEngagementEmailsStartedSlidesWithMagicLink,
      'Error sending review in progress onboarding slides re-engagement emails to clients with magic link access',
      {
        error,
        clientEmails,
      },
    );
  }
  return clientEmails;
}

/**
 * Send re-engagement email to clients that have not filled out intake form
 */
async function sendAllClientsFillOutIntakeFormEngagementEmail() {
  // find all clients that have started onboarding slides with access to magic link
  let clientEmails: string[] = [];
  try {
    const clients = await selectMany<
      Pick<
        Client,
        | 'clientEmail'
        | 'clientFirstName'
        | 'clientId'
        | 'advisorId'
        | 'intakeFormUrl'
      >
    >(selectClientsMissingIntakeForm());
    clientEmails = clients.map(client => client.clientEmail);

    const clientEmailPromises = clients.map(async client => {
      // send email to each client
      const advisor = await fetchAdvisorByAdvisorId({
        advisorId: client.advisorId,
      });
      return sendSingleFillOutIntakeFormEngagementEmail({
        clientEmail: client.clientEmail,
        clientFirstName: client.clientFirstName,
        intakeFormUrl: client.intakeFormUrl,
        advisor,
      });
    });

    await Promise.all(clientEmailPromises);
  } catch (error) {
    logError(
      sendAllClientsReviewOnboardingSlidesEngagementEmailsStartedSlidesWithMagicLink,
      'Error sending fill out intake form re-engagement emails to clients',
      {
        error,
        clientEmails,
      },
    );
  }
  return clientEmails;
}
