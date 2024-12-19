import { mkdir } from 'fs/promises';
import { join } from 'path';
import {

  appModel,
  newUuid,
  isRunningLocal,
  logError,
  stripAfter,
} from '@shared';
import { SafeSql, insertSql } from '@server/datastore';


let algoHttpLogDir = '/../';  // bad path guarantee we won't write outside local..

if (isRunningLocal()) {
  algoHttpLogDir = join(
    stripAfter(__dirname, 'waterlily-ltc-planning-app'),
    'build/server/algo-http-call-bodies'
  );
  mkdir(algoHttpLogDir, { recursive: true })
    .catch(
      reason => logError(
        'createInferenceSetFile', 'Error creating local algorithm http log dir',
        {
          algoHttpLogDir
        },
        reason
      )
    );
}

export async function createInferenceSet(client: Client, _survey: IntakeSurvey, queries: SafeSql[]) {
  const { clientId } = client;

  // Return a mock inference set for testing
  const inferenceSet = {
    inferenceSetVersionId: newUuid(),
    inferenceSetId: newUuid(),
    inferenceSetVersionDateTime: new Date(),
    clientId,
    inferenceSetRunDateTime: new Date(),
    ltcAtAge: 90,
    ltcLikelihood10Years: 0.995769338789143,
    ltcLikelihood20Years: 0.9032674415790587,
    ltcDurationYears: 4.067262621038162,
    ltcLikelihoodEver: 0.6248906842402945,
    ltcTotalCost: 202008.9916592106,
    ltcFamilyCareCost: 98720.57186856114,
    ltcProfessionalShareCost: 103288.41979064945,
    monthlyHelpHours: 149.15034142333693,
    partnerHelperPercent: 0,
    professionalHelperPercent: 0.5113060509944881,
    childHelperPercent: 0.3319883208900043,
    otherFamilyHelperPercent: 0.12073716409783765,
    phaseOneCareHoursRatio: 0.14599406898300307,
    phaseTwoCareHoursRatio: 0.26472683001344105,
    phaseThreeCareHoursRatio: 0.589279101003556,
    phaseOneDurationYearsRatio: 0.25339431963619735,
    phaseTwoDurationYearsRatio: 0.2958504240730797,
    phaseThreeDurationYearsRatio: 0.45075525629072294,
    totalCareHoursNeeded: 7280,
    childrenCareHoursProvided: 2507,
    otherFamilyCareHoursProvided: 912,
    partnerCareHoursProvided: 0,
    professionalCareHoursProvided: 3861,
    professionalCareHoursPreferred: 5459.702477275962,
    partnerCareHoursPreferred: 0,
    childrenCareHoursPreferred: 1335,
    otherFamilyCareHoursPreferred: 485
  };

  queries.push(insertSql(appModel.tableNames.inferenceSets, inferenceSet));
  return inferenceSet;
}








