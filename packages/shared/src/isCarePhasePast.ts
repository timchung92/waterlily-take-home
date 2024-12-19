import { carePhaseDefs } from '.';

export function isCarePhasePast(carePhase: CarePhase, client: Client): boolean {
  const {
    intakeSurvey: { clientCurrentCarePhase },
  } = client;

  return clientCurrentCarePhase
    ? carePhaseDefs[clientCurrentCarePhase].index >
        carePhaseDefs[carePhase].index
    : false;
}
