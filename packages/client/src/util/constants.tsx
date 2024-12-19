export const ALGORITHMS_CURRENTLY_RUNNING: string =
  'Algorithms currently running';
export const ALGORITHMS_FINISHED_RUNNING: string =
  'Algorithms finished running';
export const START_ONBOARDING: string = 'Start onboarding';
export const UPDATE_YOUR_CARE_SUPPORT_STRUCTURE: string =
  'Update your care support structure';
export const COMPLETED_PLAN: string = 'Completed Plan';
export const ALGORITHMS_ERROR: string = 'Algorithms error';
export const CLIENT_STARTED_REVIEW: string = 'Client started review';
export const CLIENT_COMPLETED_REVIEW: string = 'Client completed review';
export const STARTED_REVIEW_TOGETHER: string = 'Review started together';
export const COMPLETED_REVIEW_TOGETHER: string = 'Review completed together';
export const REVIEW_CALL_SCHEDULED: string = 'Review call scheduled';
export const INTAKE_FORM_INCOMPLETE: string = 'Intake form incomplete';
export const STARTED_INTAKE_FORM: string = 'Started intake form';
export const REQUESTED_MEETING: string = 'Requested meeting';
export const REPRESENTATIVE_ASSIGNED: string = 'Representative assigned';
export const INITIAL_CONTACT_MADE: string = 'Initial contact made';

export const CLOSING_THE_CARE_GAP: string = 'Closing the care gap';
export const FILL_OUT_THE_INTAKE_FORM: string = 'Fill out the intake form';

export const OBSOLETE_INTAKE_FORM_IN_PROGRESS: string =
  'Intake form in progress';
export const OBSOLETE_PENDING_ONBOARDING: string = 'Pending onboarding';
export const OBSOLETE_PROGRESS_ON_ONBOARDING: string = 'Progress on onboarding';
export const OBSOLETE_PROGRESS_ON_OPPORTUNITIES: string =
  'Progress on opportunities';
export const OBSOLETE_FINISHED_ONBOARDING: string = 'Finished onboarding';

export const USER_AVAILABLE_STATUS_TAGS = [
  STARTED_REVIEW_TOGETHER,
  COMPLETED_REVIEW_TOGETHER,
  REVIEW_CALL_SCHEDULED,
  REQUESTED_MEETING,
  REPRESENTATIVE_ASSIGNED,
  INITIAL_CONTACT_MADE,
];

export const ERROR_OR_INCOMPLETE_STATUS_TAGS = [
  ALGORITHMS_ERROR,
  INTAKE_FORM_INCOMPLETE,
  STARTED_INTAKE_FORM,
  ALGORITHMS_CURRENTLY_RUNNING,
];

export const defaultChartColors = [
  '#a798e5',
  '#3d1c7c',
  '#120F3A',
  '#101336',
  '#7CCB6F',
  '#EB3447',
  '#F7C845',
];

export const ACTION_TAG_TOOLTIPS: any = {
  [STARTED_INTAKE_FORM]: <>Client has started their intake form.</>,
  [INTAKE_FORM_INCOMPLETE]: <>Client has not completed their intake form.</>,
  [FILL_OUT_THE_INTAKE_FORM]: <>Client has not completed their intake form.</>,

  [ALGORITHMS_CURRENTLY_RUNNING]: (
    <>
      We&apos;re currently running your client&apos;s Long Term Care
      projections, please wait for the action tag to turn into ”Algorithms
      finished running“.
    </>
  ),

  [ALGORITHMS_FINISHED_RUNNING]: (
    <>Results are in! Click on the client name to view results.</>
  ),

  [START_ONBOARDING]: (
    <>
      Client can now start onboarding. Click on the client name to view results.
    </>
  ),

  [CLOSING_THE_CARE_GAP]: (
    <>
      Care gap refers the care hours that are not covered by members on your
      support structure table. You can close this care gap by adding new members
      to your table or clicking the edit icons on any of your current members
      and increasing the care hours or care years.
    </>
  ),

  [UPDATE_YOUR_CARE_SUPPORT_STRUCTURE]: (
    <>
      Updating your care support structure refers to editing the care hours that
      are covered by members on your support structure table. You can delete,
      add, or edit any of your current members&apos; care hours or care years
      provided to you.
    </>
  ),

  [COMPLETED_PLAN]: (
    <>
      Congratulations on completing your plan and being prepared for your Long
      Term Care needs.
    </>
  ),

  [OBSOLETE_INTAKE_FORM_IN_PROGRESS]: (
    <>
      You or the client have yet to fill out the Intake Form. Please complete
      the form in order to access your client&apos;s Long Term Care projection
      needs and planning tools.
    </>
  ),

  [OBSOLETE_PENDING_ONBOARDING]: (
    <>
      We were able to successfully get outputs from all the relevant algorithms,
      and we&apos;ll review the updated projections in the client profile.
    </>
  ),

  [OBSOLETE_PROGRESS_ON_ONBOARDING]: (
    <>
      We were able to successfully get outputs from all the relevant algorithms,
      and we&apos;ll review the updated projections in the client profile.
    </>
  ),

  [OBSOLETE_PROGRESS_ON_OPPORTUNITIES]: (
    <>
      Care gap refers the care hours that are not covered by members on your
      support structure table. You can close this care gap by adding new members
      to your table or clicking the edit icons on any of your current members
      and increasing the care hours or care years.
    </>
  ),

  [OBSOLETE_FINISHED_ONBOARDING]: (
    <>
      Congratulations on completing your plan and being prepared for your Long
      Term Care needs.
    </>
  ),

  [ALGORITHMS_ERROR]: (
    <>
      Please click Refresh. If the issue persists, our support team will be
      notified and will start working on a resolution. Check back shortly.{' '}
    </>
  ),

  [CLIENT_STARTED_REVIEW]: (
    <>Client has started reviewing their onboarding results. </>
  ),

  [CLIENT_COMPLETED_REVIEW]: (
    <>
      Client has reviewed all of their onboarding results and has completed
      onboarding.{' '}
    </>
  ),
  [STARTED_REVIEW_TOGETHER]: (
    <>You and the client have started reviewing onboarding results together. </>
  ),
  [COMPLETED_REVIEW_TOGETHER]: (
    <>
      You and the client have completed reviewing onboarding results together.{' '}
    </>
  ),
  [REVIEW_CALL_SCHEDULED]: (
    <>A review call has been scheduled with the client. </>
  ),
  [REQUESTED_MEETING]: <>Client has requested a meeting. </>,
  [REPRESENTATIVE_ASSIGNED]: (
    <>A representative has been assigned to the client. </>
  ),
  [INITIAL_CONTACT_MADE]: (
    <>An initial contact has been made with the client. </>
  ),
};
