SET client_min_messages = warning;
\set ON_ERROR_STOP on

DO $$
BEGIN
ASSERT
  (SELECT current_database() = 'walpdbadmin'),
  'For safety this script can only be run under the database "walpdbadmin".\n\n' ||
  'The database is specified when connecting. For example: psql -U walpdbadmin -d walpdbadmin.\n\n';
END
$$ LANGUAGE plpgsql;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION delete_rows_if_table_exists(table_to_empty text)
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_to_empty) THEN
    EXECUTE 'DELETE FROM "' || table_to_empty || '"';
  END IF;
END;
$$ LANGUAGE plpgsql;

--
--
--   DELETING OLD 2.0.0 DATA !!!!!!!!!!!
--
--   In order to save time for release and since there is no real client data and what data
--   there is may have no real value, we're going to delete all data upon migration.
--
--   We'll separately save a backup so we can restore/migrate it later if there is a need.
--
--
--   We still need to deal with structure changes but can delete all old data (except Advisors)
--
DO $$
BEGIN
IF EXISTS (
  SELECT  1
  FROM    information_schema.tables
  WHERE   table_name = 'YesNoIdk' -- one of the tables removed in 2.0.0 -> 2.1.0
) THEN

  PERFORM delete_rows_if_table_exists('SupportProviders');
  PERFORM delete_rows_if_table_exists('SupportProviderSets');
  PERFORM delete_rows_if_table_exists('SurveyFinancialAssetTypes');
  PERFORM delete_rows_if_table_exists('SurveyLegalDocuments');
  PERFORM delete_rows_if_table_exists('Surveys');
  PERFORM delete_rows_if_table_exists('InferenceSets');
  PERFORM delete_rows_if_table_exists('ClientTags');
  PERFORM delete_rows_if_table_exists('Clients');

END IF;
END
$$ LANGUAGE plpgsql;

SELECT 3;

--
-- Version tracking table
--
-- Populated in scripts/run-db-impl.sh with the SHA of the schema file, just so
-- we can tell the schema changed, but not specifically between what to what.
--
-- As long as the schema file can update the schema from any older version
-- to the latest, then knowing the prior version is not necessary. This is much
-- safer than tracking specific version changes.
--
CREATE TABLE IF NOT EXISTS "WalpSchemaVersion" (
  "schemaVersion" TEXT PRIMARY KEY
);


--
-- Lookup tables
--

CREATE TABLE IF NOT EXISTS "CareEnvironments" (
  "careEnvironmentId" INT PRIMARY KEY,
  "careEnvironmentLabel" TEXT NOT NULL
);

  INSERT INTO "CareEnvironments" VALUES
    (2701, 'Home'),
    (2703, 'Independent Living'),
    (2704, 'Assisted Living'),
    (2705, 'Full Care Facility')
    ON CONFLICT ("careEnvironmentId") DO NOTHING;

  UPDATE "CareEnvironments"
  SET "careEnvironmentLabel" = 'Full Care Facility'
  WHERE "careEnvironmentLabel" = 'Nursing Home';

    -- 2702  Removed below if still exists

CREATE TABLE IF NOT EXISTS "CarePhases" (
  "carePhaseId" INT PRIMARY KEY,
  "carePhaseLabel" TEXT NOT NULL
);

  INSERT INTO "CarePhases" VALUES
    (2801, 'Early Care'),
    (2802, 'Moderate Care'),
    (2803, 'Full Care')
    ON CONFLICT ("carePhaseId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "ClientStatuses" (
  "clientStatusId" INT PRIMARY KEY,
  "clientStatusLabel" TEXT NOT NULL
);

  INSERT INTO "ClientStatuses" VALUES
    (1101, 'Active'),
    (1102, 'Inactive'),
    (1103, 'Archived')
    ON CONFLICT ("clientStatusId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "ClientTagDefs" (
  "clientTagDefId" INT PRIMARY KEY,
  "clientTagDefLabel" TEXT NOT NULL
);

  INSERT INTO "ClientTagDefs" VALUES
    (1201, 'Fill out the intake form'),
    (1202, 'Algorithms currently running'),
    (1203, 'Algorithms finished running'),
    (1204, 'Start onboarding'),
    (1205, 'Closing the care gap'),
    (1206, 'Update your care support structure'),
    (1207, 'Completed Plan'),
    (1208, 'Algorithms error'),
    (1209, 'Client started review'),
    (1210, 'Client completed review'),
    (1211, 'Review call scheduled'),
    (1212, 'Review started together'),
    (1213, 'Review completed together'),
    (1214, 'Intake form incomplete'),
    (1215, 'Started intake form'),
    (1216, 'Requested meeting'),
    (1217, 'Representative assigned'),
    (1218, 'Initial contact made')
    ON CONFLICT ("clientTagDefId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "FundingPolicyTypes" (
  "fundingPolicyTypeId" INT PRIMARY KEY,
  "fundingPolicyTypeLabel" TEXT NOT NULL
);

  INSERT INTO "FundingPolicyTypes" VALUES
    (2901, 'Long-term Care Insurance'),
    (2902, 'Life Insurance with Rider'),
    (2903, 'Hybrid Life Insurance'),
    (2904, 'Short-term Care Insurance'),
    (2905, 'Annuity Hybrid'),
    (2906, 'Joint Hybrid Asset Based'),
    (2907, 'Joint Hybrid Annuity Based'),
    (2908, 'Life with Index Account'),
    (2909, 'Allstate Hybrid Policy'),
    (2910, 'Hybrid Life IRA'),
    (2911, 'Joint Hybrid Life IRA'),
    (2912, 'Fortified Life'),
    (2913, 'NYL Secure Care'),
    (2914, 'NYL Asset Flex'),
    (2915, 'NYL Joint Secure Care'),
    (2916, 'Secure Care Three'),
    (2917, 'Money Guard Fixed Advantage'),
    (2918, 'Asset Care'),
    (2919, 'Care Matters Two'),
    (2920, 'Joint Asset Care'),
    (2921, 'Joint Care Matters'),
    (2922, 'Forecare Fixed Annuity'),
    (2923, 'Annuity Care Two'),
    (2924, 'Joint Forecare Fixed Annuity'),
    (2925, 'Assetcare Three'),
    (2926, 'Joint Assetcare Three'),
    (2927, 'No Lapse Guarantee Life'),
    (2928, 'Joint Long-term Care Insurance'),
    (2929, 'Thrivent Long-term Care Insurance'),
    (2930, 'Joint Thrivent Long-term Care Insurance'),
    (2931, 'NGL Essential LTC'),
    (2932, 'Joint NGL Essential LTC'),
    (2933, 'Mutual of Omaha Mutualcare'),
    (2934, 'Joint Mutual of Omaha Mutualcare')
    ON CONFLICT ("fundingPolicyTypeId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "AnnuityTypes" (
  "annuityTypeId" INT PRIMARY KEY,
  "annuityTypeLabel" TEXT NOT NULL
);

  INSERT INTO "AnnuityTypes" VALUES
    (3001, 'Basic Annuity')
  ON CONFLICT ("annuityTypeId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "SupportProviderContributions" (
  "supportProviderContributionId" INT PRIMARY KEY,
  "supportProviderContributionLabel" TEXT NOT NULL
);

  INSERT INTO "SupportProviderContributions" VALUES
    (2601, 'Physical Caregiver'), -- id hard-coded in some SQL statements
    (2602, 'Care Coordinator'),
    (2603, 'Financial Caregiver')
    ON CONFLICT ("supportProviderContributionId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "SupportProviderDetailSetSources" (
  "supportProviderDetailSetSourceId" INT PRIMARY KEY,
  "supportProviderDetailSetSourceLabel" TEXT NOT NULL
);

  INSERT INTO "SupportProviderDetailSetSources" VALUES
    (2101, 'Inferences'),
    (2102, 'Client')
    ON CONFLICT ("supportProviderDetailSetSourceId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "SupportProviderTypes" (
  "supportProviderTypeId" INT PRIMARY KEY,
  "supportProviderTypeLabel" TEXT NOT NULL
);

  INSERT INTO "SupportProviderTypes" VALUES
    (2200, 'Self'), -- Never actually used in db data; used in UI; needed in the enum
    (2201, 'Professional'), -- id hard-coded in some SQL statements
    (2202, 'Spouse'),
    (2203, 'Other'),
    (2204, 'Child')
    ON CONFLICT ("supportProviderTypeId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "SurveyQuestionTypes" (
  "surveyQuestionTypeId" INT PRIMARY KEY,
  "surveyQuestionTypeLabel" TEXT NOT NULL
);

  INSERT INTO "SurveyQuestionTypes" VALUES
    (2501, 'Text'),
    (2502, 'Date'),
    (2503, 'Integer'),
    (2505, 'Multiple Choice'),
    (2506, 'Many Multiple Choice'),
    (2507, 'Ranking'),
    (2508, 'Boolean'),
    (2509, 'Phone Number'),
    (2510, 'Email')
    ON CONFLICT ("surveyQuestionTypeId") DO NOTHING;



CREATE TABLE IF NOT EXISTS "SurveyStatuses" (
  "surveyStatusId" INT PRIMARY KEY,
  "surveyStatusLabel" TEXT NOT NULL
);

  INSERT INTO "SurveyStatuses" VALUES
    (2301, 'Incomplete'),
    (2302, 'Complete'),
    (2303, 'Abandoned')
    ON CONFLICT ("surveyStatusId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "SurveySubmitters" (
  "surveySubmitterId" INT PRIMARY KEY,
  "surveySubmitterLabel" TEXT NOT NULL
);

  INSERT INTO "SurveySubmitters" VALUES
    (2401, 'Advisor'),
    (2402, 'Client'),
    (2403, 'SupportProvider')
    ON CONFLICT ("surveySubmitterId") DO NOTHING;


--
-- Util tables
--

-- Removing `UserFriendlyIdTracker` if it exists.
--
-- We ended up not using it; since we have one writer and rarely create advisors/clients,
-- and only use for those tables, we do insert and   ON CONFLICT re-create id and retry.
DROP TABLE IF EXISTS "UserFriendlyIdTracker";


--
-- Core Tables
--


CREATE TABLE IF NOT EXISTS "Advisors" (
  "advisorId" TEXT PRIMARY KEY,          -- User Friendly ID
  "organizationName" TEXT,
  "organizationDisplayName" TEXT,
  "advisorFirstName" TEXT NOT NULL,
  "advisorLastName" TEXT NOT NULL,
  "advisorEmail" TEXT NOT NULL UNIQUE,
  "schedulingLinkUrl" TEXT,
  "schedulingLinkDisplayText" TEXT,
  "sendClientResultsLinkSetting" BOOLEAN DEFAULT FALSE,
  "advisorCognitoRef" UUID NOT NULL UNIQUE,
  "advisorCreatedDateTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "Advisors"
  ADD COLUMN IF NOT EXISTS "organizationName" TEXT,
  ADD COLUMN IF NOT EXISTS "advisorCreatedDateTime" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "organizationDisplayName" TEXT,
  ADD COLUMN IF NOT EXISTS "schedulingLinkUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "schedulingLinkDisplayText" TEXT,
  ADD COLUMN IF NOT EXISTS "sendClientResultsLinkSetting" BOOLEAN DEFAULT FALSE;

  INSERT INTO "Advisors" (
    "advisorId",
    "organizationName",
    "organizationDisplayName",
    "advisorFirstName",
    "advisorLastName",
    "advisorEmail",
    "advisorCognitoRef"
  )
  VALUES (
    'ace3-43f',
    'Waterlily',
    'Waterlily',
    'Test',
    'Advisor',
    'test@joinwaterlily.com',
    '2266acd0-ed35-453f-97ed-562d3097f61c'
  )
  ON CONFLICT ("advisorId") DO NOTHING;

-- insert pdf generator advisor
    INSERT INTO "Advisors" (
    "advisorId",
    "organizationName",
    "advisorFirstName",
    "advisorLastName",
    "advisorEmail",
    "advisorCognitoRef"
  )
  VALUES (
    'thr7-94h',
    'Waterlily Caregiving, Inc.',
    'PDF',
    'Generator',
    'pdf@joinwaterlily.com',
    '89e015ed-499d-4ebc-b6ac-230829d9c9d0'
  )
  ON CONFLICT ("advisorId") DO NOTHING;

CREATE TABLE IF NOT EXISTS "Clients" (
  "clientId" TEXT PRIMARY KEY,           -- User Friendly ID
  "advisorId" TEXT NOT NULL REFERENCES "Advisors"("advisorId"), -- User Frienly ID
  "clientFirstName" TEXT,
  "clientLastName" TEXT NOT NULL,
  "clientEmail" TEXT,
  "clientStatus" INT NOT NULL REFERENCES "ClientStatuses"("clientStatusId"),
  "lastSlideSeen" INT NOT NULL DEFAULT 0,
  "planProgressPercent" NUMERIC(3,2) NOT NULL DEFAULT 0
    CHECK("planProgressPercent" >= 0 AND "planProgressPercent" <= 1),
  "clientAddedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "partnerClientId" TEXT REFERENCES "Clients"("clientId"),
  "surveyId" UUID,
  "intakeFormUrl" TEXT
);

ALTER TABLE "Clients"
  ADD COLUMN IF NOT EXISTS "partnerClientId" TEXT REFERENCES "Clients"("clientId"),
  ADD COLUMN IF NOT EXISTS "surveyId" UUID,
  ADD COLUMN IF NOT EXISTS "intakeFormUrl" TEXT;


CREATE INDEX IF NOT EXISTS "idx_surveyId" ON "Clients"("surveyId");


CREATE TABLE IF NOT EXISTS "ClientTags" (
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "clientTagDefId" INT NOT NULL REFERENCES "ClientTagDefs"("clientTagDefId"),
  PRIMARY KEY ("clientId", "clientTagDefId")
);


CREATE TABLE IF NOT EXISTS "CareEnvironmentSelections" (
  "careEnvironmentSelectionId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "carePhase" INT NOT NULL REFERENCES "CarePhases"("carePhaseId"),
  "careEnvironment" INT NOT NULL REFERENCES "CareEnvironments"("careEnvironmentId"),

  UNIQUE ("clientId", "carePhase")
);

  UPDATE    "CareEnvironmentSelections"
  SET       "careEnvironment" = 2701
  WHERE     "careEnvironment" = 2702;

  DELETE FROM   "CareEnvironments"
  WHERE         "careEnvironmentId" = 2702;


CREATE TABLE IF NOT EXISTS "SupportProviders" (
  "supportProviderId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "supportProviderName" TEXT NOT NULL,
  "supportProviderCareLevel" INT,
  "supportProviderType" INT NOT NULL REFERENCES "SupportProviderTypes"("supportProviderTypeId"),
  "supportProviderContribution" INT NOT NULL REFERENCES "SupportProviderContributions"("supportProviderContributionId")
);

ALTER TABLE "SupportProviders"
  DROP COLUMN IF EXISTS "supportProviderSetVersionId",
  DROP COLUMN IF EXISTS "supportProviderTotalHours",
  ADD COLUMN IF NOT EXISTS "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  ADD COLUMN IF NOT EXISTS "supportProviderContribution" INT NOT NULL REFERENCES "SupportProviderContributions"("supportProviderContributionId");


CREATE TABLE IF NOT EXISTS "SupportProviderDetailSets" (
  "supportProviderDetailSetId" UUID PRIMARY KEY,
  "supportProviderDetailSetDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "supportProviderDetailSetSource" INT NOT NULL REFERENCES "SupportProviderDetailSetSources"("supportProviderDetailSetSourceId"),
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "removeFamilyBurden" BOOLEAN DEFAULT FALSE
);

ALTER TABLE "SupportProviderDetailSets"
  ADD COLUMN IF NOT EXISTS "removeFamilyBurden" BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS "SupportProviderDetails" (
  "supportProviderDetailId" UUID PRIMARY KEY,
  "supportProviderDetailSetId" UUID NOT NULL REFERENCES "SupportProviderDetailSets"("supportProviderDetailSetId"),
  "supportProviderId" UUID NOT NULL REFERENCES "SupportProviders"("supportProviderId"),
  "supportProviderPhaseOneHours" INT,
  "supportProviderPhaseTwoHours" INT,
  "supportProviderPhaseThreeHours" INT,
  "supportProviderRateHourly" NUMERIC(3, 2),
  "supportProviderRateMonthly" NUMERIC(3, 2)
);

ALTER TABLE "SupportProviderDetails"
  -- there's no 'IF NOT EXISTS' for adding constraints, so drop if exists and recreate, weird`
  DROP CONSTRAINT IF EXISTS supportProviderDetailsOneDetailPerSet,
  ADD CONSTRAINT supportProviderDetailsOneDetailPerSet UNIQUE ("supportProviderDetailSetId", "supportProviderId");


--
-- Related to 2.0.0 -> 2.1.0 data migration
-- delete when no longer needed or restore if we decide to do that migration
--
-- IF EXISTS (
--   SELECT  1
--   FROM    information_schema.tables
--   WHERE   table_name = 'SupportProvidersOLD'
-- ) THEN
--
--   INSERT INTO   "SupportProviders"
--
--   SELECT        SPOLD."supportProviderId",
--                 SPS."clientId",
--                 "supportProviderName",
--                 "supportProviderCareLevel",
--                 "supportProviderType",
--                 "supportProviderContribution"
--
--   FROM          (
--                   SELECT  "clientId",
--                           "supportProviderSetVersionId"
--                   WHERE   RANK() OVER (
--                             PARTITION BY  "clientId"
--                             ORDER BY      "supportProviderSetVersionDateTime" DESC
--                           ) = 1 as "isLatestSupportProviderSetVersion"
--
--                   FROM    "SupportProviderSets"
--                 ) SPS
--                     INNER JOIN
--                 "SupportProvidersOLD" SPOLD
--                     ON
--                   SPS."supportProviderSetVersionId" = SPOLD."supportProviderSetVersionId"
--
--   WHERE SPS."isLatestSupportProviderSetVersion"
--
-- END IF;


DROP TABLE IF EXISTS "SupportProviderSets";

CREATE TABLE IF NOT EXISTS "SurveyDefinitions" (
  "surveyDefinitionId" INT PRIMARY KEY,
  "surveyDefinitionLabel" TEXT NOT NULL UNIQUE,
  "surveySubmittedBy" INT REFERENCES "SurveySubmitters"("surveySubmitterId")
);

  INSERT INTO "SurveyDefinitions" VALUES
    (991001, 'Intake Form', 2401),
    (991002, 'Client Core Values', 2402),
    (991003, 'Role Fit by Client', 2402),
    (991004, 'Role Fit by Caregiver', 2403),
    (991005, 'Intro Intake Form', 2401)
    ON CONFLICT ("surveyDefinitionId") DO NOTHING;


CREATE TABLE IF NOT EXISTS "SurveyQuestions" (
  "surveyQuestionRef" TEXT PRIMARY KEY, -- field added to question in Typeform and used to represent the answer in universal data model
  "surveyDefinitionId" INT REFERENCES "SurveyDefinitions"("surveyDefinitionId"),
  "surveyQuestionType" INT NOT NULL REFERENCES "SurveyQuestionTypes"("surveyQuestionTypeId")
);

INSERT INTO "SurveyQuestions" VALUES
    -- Intake form fields
    ('clientMaritalStatus', 991001, 2505),
    ('partnerFirstName', 991001, 2501),
    ('partnerLastName', 991001, 2501),
    ('householdPartnered', 991001, 2505),
    ('householdHouseholdSize', 991001, 2503),
    ('clientBirthDate', 991001, 2502),
    ('clientGenderIdentity', 991001, 2506),
    ('clientGenderAtBirth', 991001, 2505),
    ('clientRace', 991001, 2505),
    ('clientZipCode', 991001, 2501),
    ('clientCensusRegion', 991001, 2505),
    ('clientHighestDegree', 991001, 2505),
    ('clientLivingSiblingsCount', 991001, 2503),
    ('householdLivingChildrenCount', 991001, 2503),
    ('householdPriorYearIncome', 991001, 2503),
    ('householdTotalAssetsValue', 991001, 2503),
    ('financialAssetTypes', 991001, 2506),
    ('legalDocuments', 991001, 2506),
    ('clientHealthPlanList', 991001, 2506),
    ('clientIndependencePreference', 991001, 2505),
    ('clientFinancialSecurityPreference', 991001, 2505),
    ('clientFamilyInvolvementPreference', 991001, 2505),
    ('clientMentalHealthIssuesList', 991001, 2506),
    ('clientSmokerEver', 991001, 2505),
    ('clientSmokedRecently', 991001, 2505),
    ('clientUsesRegularPrescriptionDrugs', 991001, 2505),
    ('clientWeightPounds', 991001, 2503),
    ('clientHeightInches', 991001, 2503),
    ('clientPriorTwoYearHospitalizationCount', 991001, 2503),
    ('clientActivitiesWithDifficultyList', 991001, 2506),
    ('clientActivitiesReceivedAssistanceList', 991001, 2506),
    ('clientAgeReceivedHelpBathing', 991001, 2503),
    ('clientAgeReceivedHelpEating', 991001, 2503),
    ('clientAgeReceivedHelpDressing', 991001, 2503),
    ('clientAgeReceivedHelpWalking', 991001, 2503),
    ('clientAgeReceivedHelpAccessingBed', 991001, 2503),
    ('clientAgeReceivedHelpToileting', 991001, 2503),
    ('clientDiagnosesList', 991001, 2506),
    ('clientInjuriesList', 991001, 2506),
    ('clientCanAnswerForFather', 991001, 2508),
    ('clientFatherIsAlive', 991001, 2505),
    ('clientFatherAgeAtSurveyDate', 991001, 2503),
    ('clientFatherAgeOfDeathAtSurveyDate', 991001, 2503),
    ('clientFatherRequiredAssistance', 991001, 2505),
    ('clientFatherAssistanceDurationMonthCount', 991001, 2503),
    ('clientFatherNursingHomeEver', 991001, 2505),
    ('clientFatherNursingHomeMonthCount', 991001, 2503),
    ('clientFatherCardiovascularEver', 991001, 2505),
    ('clientFatherMemoryProblemsEver', 991001, 2505),
    ('clientFatherMemoryDiagnosesList', 991001, 2506),
    ('clientCanAnswerForMother', 991001, 2508),
    ('clientMotherIsAlive', 991001, 2505),
    ('clientMotherAgeAtSurveyDate', 991001, 2503),
    ('clientMotherAgeOfDeathAtSurveyDate', 991001, 2503),
    ('clientMotherRequiredAssistance', 991001, 2505),
    ('clientMotherAssistanceDurationMonthCount', 991001, 2503),
    ('clientMotherNursingHomeEver', 991001, 2505),
    ('clientMotherNursingHomeMonthCount', 991001, 2503),
    ('clientMotherCardiovascularEver', 991001, 2505),
    ('clientMotherMemoryProblemsEver', 991001, 2505),
    ('clientMotherMemoryDiagnosesList', 991001, 2506),


    -- OBSOLETE Intake form fields kept to preserve historical data only
    -- The extra comment is there to prevent generate-app-model-content.js
    -- from including them in the object model. We shouldn't be referencing
    -- them in code even if they exist in the database and will exist on
    -- some objects.
    ( /* obsolete */ 'clientHispanic', 991001, 2505),
    ( /* obsolete */ 'clientMotherHighestDegree', 991001, 2505),
    ( /* obsolete */ 'clientFatherHighestDegree', 991001, 2505),
    ( /* obsolete */ 'clientReligion', 991001, 2505),
    ( /* obsolete */ 'clientVeteran', 991001, 2505),
    ( /* obsolete */ 'clientBirthState', 991001, 2505),
    ( /* obsolete */ 'partnerBirthDate', 991001, 2502),
    ( /* obsolete */ 'partnerGender', 991001, 2505),
    ( /* obsolete */ 'partnerRace', 991001, 2505),
    ( /* obsolete */ 'partnerHispanic', 991001, 2505),
    ( /* obsolete */ 'partnerCensusRegion', 991001, 2501),
    ( /* obsolete */ 'partnerHighestDegree', 991001, 2505),
    ( /* obsolete */ 'partnerMotherHighestDegree', 991001, 2505),
    ( /* obsolete */ 'partnerFatherHighestDegree', 991001, 2505),
    ( /* obsolete */ 'partnerReligion', 991001, 2505),
    ( /* obsolete */ 'partnerVeteran', 991001, 2505),
    ( /* obsolete */ 'partnerBirthState', 991001, 2505),
    ( /* obsolete */ 'partnerDiabetes', 991001, 2505),
    ( /* obsolete */ 'hasChildren', 991001, 2505),
    ( /* obsolete */ 'householdPrimaryResidenceNetValue', 991001, 2503),
    ( /* obsolete */ 'clientCoveredByMedicaid', 991001, 2505),
    ( /* obsolete */ 'clientDiabetesEver', 991001, 2505),
    ( /* obsolete */ 'clientSmokerEver', 991001, 2505),
    ( /* obsolete */ 'clientRegularPrescriptionDrugs', 991001, 2505),
    ( /* obsolete */ 'clientBackProblems', 991001, 2505),
    ( /* obsolete */ 'clientLungDiseaseEver', 991001, 2505),
    ( /* obsolete */ 'clientHeartProblems', 991001, 2505),
    ( /* obsolete */ 'clientHighBloodPressureEver', 991001, 2505),
    ( /* obsolete */ 'clientSadLastWeek', 991001, 2505),
    ( /* obsolete */ 'clientRestlessSleepLastWeek', 991001, 2505),
    ( /* obsolete */ 'clientLonelyLastWeek', 991001, 2505),
    ( /* obsolete */ 'clientDepressedLastWeek', 991001, 2505),
    ( /* obsolete */ 'clientEverythingEffortLastWeek', 991001, 2505),
    ( /* obsolete */ 'clientMentalHealthIssuesEver', 991001, 2505),
    ( /* obsolete */ 'surveyRating', 991001, 2503),

    -- ClientCoreValues fields:
    ('financialSecurityPreference', 991002, 2505),
    ('independenceandQualityofLifePreference', 991002, 2505),
    ('careEnvironmentPreference', 991002, 2505),
    ('familyInvolvementPreference', 991002, 2505),
    ('riskAssessmentPreference', 991002, 2505),
    ('flexibilityPreference', 991002, 2505),
    ('costEffectivenessPreference', 991002, 2505),

    -- RoleFitByClient fields:
    ('clientOwnPersonalityPerceptions', 991003, 2506),
    ('stressManagementPreference', 991003, 2505),
    ('disagreementResolutionPreference', 991003, 2505),
    ('supportProviderInvolvement', 991003, 2505),
    ('rankedFactors', 991003, 2507),
    ('incentiveToAcceptCare', 991003, 2505),
    ('willingnessToAcceptCare', 991003, 2505),
    ('trustLevel', 991003, 2505),
    ('currentCommunnicationFrequency', 991003, 2505),
    ('emotionalCloseness', 991003, 2505),
    ('rolePreference', 991003, 2505),
    ('willingnessToReceiveCare', 991003, 2505),
    ('clientFinancialStability', 991003, 2505),
    ('previousExperience', 991003, 2505),
    ('potentialSupportProvider', 991003, 2506),
    ('relationshipCloseness', 991003, 2505),
    ('relationshipChangeComfortLevel', 991003, 2505),
    ('financialNeedConcernLevel', 991003, 2505),
    ('receivingCareInterferenceLikelihood', 991003, 2505),
    ('physicalStressLevel', 991003, 2505),
    ('emotionalStressLevel', 991003, 2505),
    ('preferredSupportServices', 991003, 2506),
    ('endOfLifeComfortLevel', 991003, 2505),
    ('clientDecisionMakingInvolvement', 991003, 2505),
    ('setbackImpactLevel', 991003, 2505),
    ('clientPreparednessForDurationLevel', 991003, 2505),
    ('financialResponsibilityHandoverPreparedness', 991003, 2505),
    ('stressCopingEffectivness', 991003, 2505),
    ('consideredImpactOnOtherRelationships', 991003, 2505),
    ('personalCareTaskComfortLevel', 991003, 2505),

    -- RoleFitByProvider fields:
    ('supportProviderPersonality', 991004, 2505),
    ('supportProviderStressCopingPreference', 991004, 2505),
    ('supportProviderRelationshipWithClient', 991004, 2505),
    ('supportProviderConflictResolutionWithCareRecipientPreferences', 991004, 2505),
    ('supportProviderToClientTrustLevel', 991004, 2505),
    ('supportProviderCommunicationFrequency', 991004, 2505),
    ('supportProviderEmotionalClosenessLevel', 991004, 2505),
    ('supportProviderRolePreference', 991004, 2505),
    ('supportProviderFactorPrioritization', 991004, 2507),
    ('supportProviderValidCircumstancePreferences', 991004, 2505),
    ('supportProviderCareWillingnessCapabilitiyComfortLevel', 991004, 2505),
    ('supportProviderFinancialStabilityLevel', 991004, 2505),
    ('supportProviderExperienceLevel', 991004, 2505),
    ('supportProviderSupportNetwork', 991004, 2506),
    ('supportProviderRelationshipToCareRecipient', 991004, 2505),
    ('supportProviderHoursPerWeek', 991004, 2505),
    ('supportProviderRelationshipForecast', 991004, 2505),
    ('supportProviderEmotionalStrainForecast', 991004, 2505),
    ('supportProviderFinancialWorryLevel', 991004, 2505),
    ('supportProviderCareInterferenceLevel', 991004, 2505),
    ('supportProviderPhysicalStressLevel', 991004, 2505),
    ('supportProviderEmotionalStressLevel', 991004, 2505),
    ('supportProviderDependentFamilyLevel', 991004, 2505),
    ('supportProviderChronicHealthIssueLevel', 991004, 2505),
    ('supportProviderMedicalFamiliarityLevel', 991004, 2505),
    ('supportProviderTrainingComfortLevel', 991004, 2505),
    ('supportProviderSupportServiceComfortLevel', 991004, 2505),
    ('supportProviderEndOfLiveComfortLevel', 991004, 2505),
    ('supportProviderDecisionMakingVoiceLevel', 991004, 2505),
    ('supportProviderSetbackComfortLevel', 991004, 2505),
    ('supportProviderDurationComfortLevel', 991004, 2505),
    ('supportProviderFinancialResponsibilityComfortLevel', 991004, 2505),
    ('supportProviderAppreciationComfortLevel', 991004, 2505),
    ('supportProviderOverwhelmPreferences', 991004, 2505),
    ('supportProviderImpactToOtherRelationshipsComfortLevel', 991004, 2505),
    ('supportProviderPersonalCareTasksComfortLevel', 991004, 2505),
    ('supportProviderHealthcareNavigationComfortLevel', 991004, 2505),


    -- Intro Intake form fields
    -- suffix "proxy" means a proxy answered for the client
    ('consentToTermsOfService', 991005, 2505),
    ('respondentRelationToClient', 991005, 2505),
    ('respondentRelationToClientSelfOrSpouse', 991005, 2505),
    ('hasLongTermCareInsurance', 991005, 2505),
    ('hasLongTermCareInsuranceProxy', 991005, 2505),
    -- These fields don't correspond to typeform block references. They are created in the API code
    ('clientFirstName', 991005, 2505),
    ('clientLastName', 991005, 2505),
    ('clientEmail', 991005, 2505),
    ('clientPhoneNumber', 991005, 2505),
    ('proxyFirstName', 991005, 2505),
    ('proxyLastName', 991005, 2505),
    ('proxyEmail', 991005, 2505),
    ('proxyPhoneNumber', 991005, 2505)

    -- contact info fields are not allowed to have block reference in Typeform, so they are handled in the api code

    ON CONFLICT ("surveyQuestionRef") DO NOTHING;


INSERT INTO "SurveyQuestions" VALUES
    ('householdLiquidAssetsValue', 991001, 2503),
    ('householdLiquidAssetsAnnualGrowthRate', 991001, 2503),
    ('clientLtcZipCode', 991001, 2501),
    ('clientOtherHealthPlanList', 991001, 2506),
    ('clientProfessionalSupportNetworkList', 991001, 2506)
    ON CONFLICT ("surveyQuestionRef") DO NOTHING;

ALTER TABLE "SurveyQuestions"
  DROP COLUMN IF EXISTS "householdLiquidAssetsValue",
  DROP COLUMN IF EXISTS "householdLiquidAssetsAnnualGrowthRate";

    -- Questions previously mistyped or changed
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2506 WHERE "surveyQuestionRef" = 'clientOwnPersonalityPerceptions';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2507 WHERE "surveyQuestionRef" = 'rankedFactors';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2506 WHERE "surveyQuestionRef" = 'potentialSupportProvider';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2506 WHERE "surveyQuestionRef" = 'preferredSupportServices';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2507 WHERE "surveyQuestionRef" = 'supportProviderFactorPrioritization';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2506 WHERE "surveyQuestionRef" = 'supportProviderSupportNetwork';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2506 WHERE "surveyQuestionRef" = 'clientGenderIdentity';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2503 WHERE "surveyQuestionRef" = 'householdLiquidAssetsValue';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2503 WHERE "surveyQuestionRef" = 'householdLiquidAssetsAnnualGrowthRate';
    UPDATE "SurveyQuestions" SET "surveyQuestionType" = 2506 WHERE "surveyQuestionRef" = 'clientProfessionalSupportNetworkList';

CREATE TABLE IF NOT EXISTS "Surveys" (
  "surveyVersionId" UUID PRIMARY KEY,
  "surveyVersionDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "surveyId" UUID NOT NULL,
  "surveyDefinitionId" INT NOT NULL REFERENCES "SurveyDefinitions"("surveyDefinitionId"),
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "supportProviderId" UUID REFERENCES "SupportProviders"("supportProviderId"),
  "surveyStatus" INT NOT NULL REFERENCES "SurveyStatuses"("surveyStatusId"),
  "lastPageSeen" INT NOT NULL DEFAULT 0,
  "surveySubmittedDateTime" TIMESTAMP WITH TIME ZONE,

  UNIQUE ("surveyId", "surveyVersionDateTime"),
  UNIQUE ("clientId", "surveyDefinitionId", "supportProviderId")

  -- NOTE: Surveys table altered significantly after SurveyAnswers are populated. In end looks like above.
);

CREATE TABLE IF NOT EXISTS "SurveyAnswers" (
  "surveyAnswerId" UUID PRIMARY KEY,
  "surveyVersionId" UUID REFERENCES "Surveys"("surveyVersionId"),
  "surveyQuestionRef" TEXT NOT NULL REFERENCES "SurveyQuestions"("surveyQuestionRef"), -- the field name associated in Typeform and used in the universal data model
  "surveyAnswerValue" TEXT NOT NULL -- actual text of value returned from Typeform. Newline delimited array if multiple.
);

    -- Fixes for questions that were mislabeled earlier..
    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'supportProviderInvolvement'
    WHERE   "surveyQuestionRef" = 'generalInvolvementPreference';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'rolePreference'
    WHERE   "surveyQuestionRef" = 'clientSpecificInvolvementPreference';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'supportProviderToClientTrustLevel'
    WHERE   "surveyQuestionRef" = 'supportProviderToCareRecipientTrustLevel';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'supportProviderRolePreference'
    WHERE   "surveyQuestionRef" = 'supportProviderSpecificInvolvementPreference';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientMaritalStatus'
    WHERE   "surveyQuestionRef" = 'maritalStatus';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'householdPartnered'
    WHERE   "surveyQuestionRef" = 'clientLivesWithPartner';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientRace'
    WHERE   "surveyQuestionRef" = 'clientEthnicity';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientHispanic'
    WHERE   "surveyQuestionRef" = 'clientLatino';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'householdLivingChildrenCount'
    WHERE   "surveyQuestionRef" = 'childrenCount';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientLivingSiblingsCount'
    WHERE   "surveyQuestionRef" = 'clientSiblingCount';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'partnerRace'
    WHERE   "surveyQuestionRef" = 'partnerEthnicity';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'partnerHispanic'
    WHERE   "surveyQuestionRef" = 'partnerLatino';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'householdPriorYearIncome'
    WHERE   "surveyQuestionRef" = 'priorYearHouseholdIncome';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'householdTotalAssetsValue'
    WHERE   "surveyQuestionRef" = 'totalAssetsNetValue';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'householdPrimaryResidenceNetValue'
    WHERE   "surveyQuestionRef" = 'primaryResidenceNetValue';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientPrivateHealthPlanCount'
    WHERE   "surveyQuestionRef" = 'privateHealthInsurancePlanCount';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientCoveredByMedicaid'
    WHERE   "surveyQuestionRef" = 'coveredByMedicaid';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientDiabetesEver'
    WHERE   "surveyQuestionRef" = 'clientDiabetes';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientSmokerEver'
    WHERE   "surveyQuestionRef" = 'clientCigarettes';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientLungDiseaseEver'
    WHERE   "surveyQuestionRef" = 'cliengLungDisease';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientRegularPrescriptionDrugs'
    WHERE   "surveyQuestionRef" = 'clientPrescriptionDrugs';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientHighBloodPressureEver'
    WHERE   "surveyQuestionRef" = 'clientBloodPressureProblems';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientEverythingEffortLastWeek'
    WHERE   "surveyQuestionRef" = 'clientEffortLastWeek';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientMentalHealthIssuesEver'
    WHERE   "surveyQuestionRef" = 'clientMentalHealthHistory';

    INSERT INTO  "SurveyAnswers" (
                    "surveyAnswerId",
                    "surveyVersionId",
                    "surveyQuestionRef",
                    "surveyAnswerValue"
                  )
    SELECT        uuid_generate_v4(),
                  "surveyVersionId",
                  'clientGenderIdentity',
                  "surveyAnswerValue"

    FROM          "SurveyAnswers"

    WHERE         "surveyQuestionRef" = 'clientGender';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientGenderAtBirth'
    WHERE   "surveyQuestionRef" = 'clientGender';

    UPDATE  "SurveyAnswers"
    SET     "surveyQuestionRef" = 'clientGenderAtBirth'
    WHERE   "surveyQuestionRef" = 'clientGender';

/*     ('', 991001, 2505), */

    DELETE FROM   "SurveyQuestions"
    WHERE         "surveyQuestionRef" IN (
                    'generalInvolvementPreference',
                    'clientSpecificInvolvementPreference',
                    'supportProviderToCareRecipientTrustLevel',
                    'supportProviderSpecificInvolvementPreference',
                    'maritalStatus',
                    'clientLivesWithPartner',
                    'clientEthnicity',
                    'clientLatino',
                    'childrenCount',
                    'partnerEthnicity',
                    'partnerLatino',
                    'priorYearHouseholdIncome',
                    'totalAssetsNetValue',
                    'primaryResidenceNetValue',
                    'privateHealthInsurancePlanCount',
                    'coveredByMedicaid',
                    'clientDiabetes',
                    'clientCigarettes',
                    'cliengLungDisease',
                    'clientPrescriptionDrugs',
                    'clientBloodPressureProblems',
                    'clientEffortLastWeek',
                    'clientMentalHealthHistory',
                    'clientGender'
                  );


ALTER TABLE "Surveys"
  ADD COLUMN IF NOT EXISTS "surveyDefinitionId" INT NOT NULL REFERENCES "SurveyDefinitions"("surveyDefinitionId"),
  ADD COLUMN IF NOT EXISTS "supportProviderId" UUID REFERENCES "SupportProviders"("supportProviderId"),
  DROP COLUMN IF EXISTS "surveySubmittedBy",
  DROP COLUMN IF EXISTS "maritalStatus",
  DROP COLUMN IF EXISTS "partnerFirstName",
  DROP COLUMN IF EXISTS "partnerLastName",
  DROP COLUMN IF EXISTS "clientBirthDate",
  DROP COLUMN IF EXISTS "clientGender",
  DROP COLUMN IF EXISTS "clientEthnicity",
  DROP COLUMN IF EXISTS "clientLatino",
  DROP COLUMN IF EXISTS "clientCensusRegion",
  DROP COLUMN IF EXISTS "clientHighestDegree",
  DROP COLUMN IF EXISTS "clientMotherHighestDegree",
  DROP COLUMN IF EXISTS "clientFatherHighestDegree",
  DROP COLUMN IF EXISTS "clientSiblingCount",
  DROP COLUMN IF EXISTS "clientReligion",
  DROP COLUMN IF EXISTS "clientVeteran",
  DROP COLUMN IF EXISTS "clientBirthState",
  DROP COLUMN IF EXISTS "clientLivesWithPartner",
  DROP COLUMN IF EXISTS "partnerBirthDate",
  DROP COLUMN IF EXISTS "partnerGender",
  DROP COLUMN IF EXISTS "partnerEthnicity",
  DROP COLUMN IF EXISTS "partnerLatino",
  DROP COLUMN IF EXISTS "partnerCensusRegion",
  DROP COLUMN IF EXISTS "partnerHighestDegree",
  DROP COLUMN IF EXISTS "partnerMotherHighestDegree",
  DROP COLUMN IF EXISTS "partnerFatherHighestDegree",
  DROP COLUMN IF EXISTS "partnerReligion",
  DROP COLUMN IF EXISTS "partnerVeteran",
  DROP COLUMN IF EXISTS "partnerBirthState",
  DROP COLUMN IF EXISTS "partnerDiabetes",
  DROP COLUMN IF EXISTS "hasChildren",
  DROP COLUMN IF EXISTS "childrenCount",
  DROP COLUMN IF EXISTS "priorYearHouseholdIncome",
  DROP COLUMN IF EXISTS "totalAssetsNetValue",
  DROP COLUMN IF EXISTS "primaryResidenceNetValue",
  DROP COLUMN IF EXISTS "privateHealthInsurancePlanCount",
  DROP COLUMN IF EXISTS "coveredByMedicaid",
  DROP COLUMN IF EXISTS "clientDiabetes",
  DROP COLUMN IF EXISTS "clientCigarettes",
  DROP COLUMN IF EXISTS "clientPrescriptionDrugs",
  DROP COLUMN IF EXISTS "clientBackProblems",
  DROP COLUMN IF EXISTS "cliengLungDisease",
  DROP COLUMN IF EXISTS "clientHeartProblems",
  DROP COLUMN IF EXISTS "clientBloodPressureProblems",
  DROP COLUMN IF EXISTS "clientSadLastWeek",
  DROP COLUMN IF EXISTS "clientRestlessSleepLastWeek",
  DROP COLUMN IF EXISTS "clientLonelyLastWeek",
  DROP COLUMN IF EXISTS "clientDepressedLastWeek",
  DROP COLUMN IF EXISTS "clientEffortLastWeek",
  DROP COLUMN IF EXISTS "clientMentalHealthHistory",
  DROP COLUMN IF EXISTS "clientWeightPounds",
  DROP COLUMN IF EXISTS "clientHeightInches",
  DROP COLUMN IF EXISTS "surveyRating";

  DROP TABLE IF EXISTS "SurveyFinancialAssetTypes";
  DROP TABLE IF EXISTS "SurveyLegalDocuments";


CREATE TABLE IF NOT EXISTS "InferenceSets" (
  "inferenceSetVersionId" UUID PRIMARY KEY,
  "inferenceSetId" UUID NOT NULL,
  "inferenceSetVersionDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "inferenceSetRunDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "ltcLikelihoodEver" NUMERIC(3,2) CHECK("ltcLikelihoodEver" >= 0 AND "ltcLikelihoodEver" <= 1),
  "ltcLikelihood10Years" NUMERIC(3,2) CHECK("ltcLikelihood10Years" >= 0 AND "ltcLikelihood10Years" <= 1),
  "ltcAtAge" INT,
  "ltcDurationYears" NUMERIC(5,3),
  "partnerHelperPercent" NUMERIC(3,2) CHECK("partnerHelperPercent" >= 0 AND "partnerHelperPercent" <= 1),
  "professionalHelperPercent" NUMERIC(3,2) CHECK("professionalHelperPercent" >= 0 AND "professionalHelperPercent" <= 1),
  "childHelperPercent" NUMERIC(3,2) CHECK("childHelperPercent" >= 0 AND "childHelperPercent" <= 1),
  "otherFamilyHelperPercent" NUMERIC(3,2) CHECK("otherFamilyHelperPercent" >= 0 AND "otherFamilyHelperPercent" <= 1),
  "monthlyHelpHours" INT,
  "ltcTotalCost" INT,
  "ltcFamilyCareCost" INT,
  "ltcProfessionalShareCost" INT,
  "totalCareHoursProvided" INT,
  "careProvidedPercent" NUMERIC(3,2) CHECK("careProvidedPercent" >= 0 AND "careProvidedPercent" <= 1),
  "totalCareHoursNeeded" INT,
  "childrenCareHoursProvided" INT,
  "otherFamilyCareHoursProvided" INT,
  "partnerCareHoursProvided" INT,
  "professionalCareHoursProvided" INT,
  "phaseOneCareHoursRatio" NUMERIC(3, 2) CHECK("phaseOneCareHoursRatio" >= 0 AND "phaseOneCareHoursRatio" <= 1),
  "phaseTwoCareHoursRatio" NUMERIC(3, 2) CHECK("phaseTwoCareHoursRatio" >= 0 AND "phaseTwoCareHoursRatio" <= 1),
  "phaseThreeCareHoursRatio" NUMERIC(3, 2) CHECK("phaseThreeCareHoursRatio" >= 0 AND "phaseThreeCareHoursRatio" <= 1),
  "phaseOneDurationYearsRatio" NUMERIC(3, 2) CHECK("phaseOneDurationYearsRatio" >= 0 AND "phaseOneDurationYearsRatio" <= 1),
  "phaseTwoDurationYearsRatio" NUMERIC(3, 2) CHECK("phaseTwoDurationYearsRatio" >= 0 AND "phaseTwoDurationYearsRatio" <= 1),
  "phaseThreeDurationYearsRatio" NUMERIC(3, 2) CHECK("phaseThreeDurationYearsRatio" >= 0 AND "phaseThreeDurationYearsRatio" <= 1),

  UNIQUE ("inferenceSetId", "inferenceSetVersionDateTime")
);

ALTER TABLE "InferenceSets"
  ALTER COLUMN "ltcDurationYears" TYPE NUMERIC(5,3),
  ADD COLUMN IF NOT EXISTS "phaseOneCareHoursRatio" NUMERIC(3, 2) CHECK("phaseOneCareHoursRatio" >= 0 AND "phaseOneCareHoursRatio" <= 1),
  ADD COLUMN IF NOT EXISTS "phaseTwoCareHoursRatio" NUMERIC(3, 2) CHECK("phaseTwoCareHoursRatio" >= 0 AND "phaseTwoCareHoursRatio" <= 1),
  ADD COLUMN IF NOT EXISTS "phaseThreeCareHoursRatio" NUMERIC(3, 2) CHECK("phaseThreeCareHoursRatio" >= 0 AND "phaseThreeCareHoursRatio" <= 1),
  ADD COLUMN IF NOT EXISTS "phaseOneDurationYearsRatio" NUMERIC(3, 2) CHECK("phaseOneDurationYearsRatio" >= 0 AND "phaseOneDurationYearsRatio" <= 1),
  ADD COLUMN IF NOT EXISTS "phaseTwoDurationYearsRatio" NUMERIC(3, 2) CHECK("phaseTwoDurationYearsRatio" >= 0 AND "phaseTwoDurationYearsRatio" <= 1),
  ADD COLUMN IF NOT EXISTS "phaseThreeDurationYearsRatio" NUMERIC(3, 2) CHECK("phaseThreeDurationYearsRatio" >= 0 AND "phaseThreeDurationYearsRatio" <= 1),
  ADD COLUMN IF NOT EXISTS "childrenCareHoursPreferred" INT,
  ADD COLUMN IF NOT EXISTS "otherFamilyCareHoursPreferred" INT,
  ADD COLUMN IF NOT EXISTS "partnerCareHoursPreferred" INT,
  ADD COLUMN IF NOT EXISTS "professionalCareHoursPreferred" INT,
  DROP COLUMN IF EXISTS "totalCareGapHours",
  DROP COLUMN IF EXISTS "careGapPercent",
  DROP COLUMN IF EXISTS "familyProfessionalHelpPercent",
  DROP COLUMN IF EXISTS "ltcAnnualCost",
  DROP COLUMN IF EXISTS "ltcLikelihood5Years",
  DROP COLUMN IF EXISTS "medicalAndHelperAnnualCost",
  DROP COLUMN IF EXISTS "medicalAndHelperAnnualCostWoFamily",
  ALTER COLUMN "phaseOneCareHoursRatio" TYPE NUMERIC (8, 7),
  ALTER COLUMN "phaseTwoCareHoursRatio" TYPE NUMERIC (8, 7),
  ALTER COLUMN "phaseThreeCareHoursRatio" TYPE NUMERIC (8, 7),
  ALTER COLUMN "phaseOneDurationYearsRatio" TYPE NUMERIC (8, 7),
  ALTER COLUMN "phaseTwoDurationYearsRatio" TYPE NUMERIC (8, 7),
  ALTER COLUMN "phaseThreeDurationYearsRatio" TYPE NUMERIC (8, 7);



CREATE TABLE IF NOT EXISTS "FundingSources" (
  "fundingSourceId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "fundingSourceLabel" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "FundingSourceDetails" (
  "fundingSourceDetailId" UUID PRIMARY KEY,
  "fundingSourceId" UUID NOT NULL REFERENCES "FundingSources"("fundingSourceId"),
  "fundingSourceDetailLabel" TEXT NOT NULL,
  "fundingSourceDetailValue" TEXT NOT NULL,

  UNIQUE ("fundingSourceId", "fundingSourceDetailLabel")
);

CREATE TABLE IF NOT EXISTS "MagicLinks" (
  "magicLinkId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "token" UUID NOT NULL,
  "usedDateTime" TIMESTAMP WITH TIME ZONE,
  "expirationDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes',
  "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "MagicLinks"
  ADD COLUMN IF NOT EXISTS "usedCount" INT DEFAULT 0;

ALTER TABLE "Clients"
  ADD COLUMN IF NOT EXISTS "unsuccessfulMagicLinkAttempts" INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS "ClientOnboardingSlideProgress" (
  "clientOnboardingSlideProgressId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId") UNIQUE,
  "hasClientStartedOnboarding" BOOLEAN NOT NULL DEFAULT FALSE,
  "hasClientCompletedOnboarding" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "ClientCareEnvironmentCosts" (
  "clientCareEnvironmentCostId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "careEnvironment" INT NOT NULL REFERENCES "CareEnvironments"("careEnvironmentId"),
  "rateAmount" INT NOT NULL
);


CREATE TABLE IF NOT EXISTS "EmailPreferences" (
  "email" TEXT PRIMARY KEY,
  "optOutReminders" BOOLEAN NOT NULL DEFAULT FALSE,
  "optOutTransactions" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "ClientCarePhaseDurationSelections" (
  "clientCarePhaseDurationSelectionId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "carePhase" INT NOT NULL REFERENCES "CarePhases"("carePhaseId"),
  "durationMonths" INT NOT NULL
);

CREATE TABLE IF NOT EXISTS "ClientPolicyDataExtractRequests" (
  "requestId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "policyType" TEXT NOT NULL,
  "prompt" TEXT,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "results" TEXT,
  "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "responseDateTime" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "ClientPartnerLinks" (
  "clientId" TEXT PRIMARY KEY REFERENCES "Clients"("clientId"),
  "partnerClientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "coupleId" UUID NOT NULL,
  "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_coupleId" ON "ClientPartnerLinks"("coupleId");

CREATE TABLE IF NOT EXISTS "IntakeFormPayloads" (
  "typeformPayloadSubmissionId" UUID PRIMARY KEY,
  "typeformPayload" TEXT NOT NULL,
  "advisorId" TEXT,
  "clientId" TEXT,
  "surveyId" TEXT,
  "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AdvisorConsents" (
  "advisorConsentId" UUID PRIMARY KEY,
  "advisorId" TEXT REFERENCES "Advisors"("advisorId"),
  "consentText" TEXT NOT NULL,
  "consentVersionDescription" TEXT NOT NULL,
  "consentDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE ("advisorId", "consentVersionDescription")
);

CREATE INDEX IF NOT EXISTS "idx_advisorConsentAdvisorId" ON "AdvisorConsents"("advisorId");


CREATE TABLE IF NOT EXISTS "ClientCustomInferences" (
  "clientCustomInferenceId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "inferenceLabel" TEXT NOT NULL, -- e.g., "ltcAtAge"
  "inferenceValue" TEXT NOT NULL,
  "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_clientCustomInferences" ON "ClientCustomInferences"("clientId");


CREATE TABLE IF NOT EXISTS "PartnerLinkRequests" (
  "partnerLinkRequestId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "partnerClientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "advisorId" TEXT NOT NULL REFERENCES "Advisors"("advisorId"),
  "token" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "statusDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsuccessfulVerificationAttempts" INT DEFAULT 0,
  "expirationDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
  "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AdvisorHierarchy" (
  "advisorHierarchyId" UUID PRIMARY KEY,
  "supervisorAdvisorId" TEXT NOT NULL REFERENCES "Advisors"("advisorId"),
  "subordinateAdvisorId" TEXT NOT NULL REFERENCES "Advisors"("advisorId"),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedDateTime" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "advisor_hierarchy_no_self_reference" CHECK ("supervisorAdvisorId" != "subordinateAdvisorId"),
  CONSTRAINT "advisor_hierarchy_unique_relationship"
    UNIQUE ("supervisorAdvisorId", "subordinateAdvisorId")
);

CREATE INDEX IF NOT EXISTS "idx_advisor_hierarchy_supervisor"
  ON "AdvisorHierarchy"("supervisorAdvisorId")
  WHERE "isActive" = true;

CREATE INDEX IF NOT EXISTS "idx_advisor_hierarchy_subordinate"
  ON "AdvisorHierarchy"("subordinateAdvisorId")
  WHERE "isActive" = true;


CREATE TABLE IF NOT EXISTS "ClientCalculationSettings" (
  "clientCalculationSettingsId" UUID PRIMARY KEY,
  "clientId" TEXT NOT NULL REFERENCES "Clients"("clientId"),
  "settingLabel" TEXT NOT NULL,
  "settingValue" TEXT NOT NULL,
  "settingType" TEXT NOT NULL,
  CONSTRAINT "client_calculation_settings_unique_relationship"
    UNIQUE ("clientId", "settingLabel")
);

CREATE INDEX IF NOT EXISTS "idx_clientCalculationSettings" ON "ClientCalculationSettings"("clientId");

-- Lookup tables for surveys from 2.0
-- Dropped fields in a table for survey data in 2.1 in favor of a field per row in a detail table,
-- so no more lookup relationships possible, no value in them
DROP TABLE IF EXISTS "CensusRegions";
DROP TABLE IF EXISTS "EducationDegrees";
DROP TABLE IF EXISTS "Ethnicities";
DROP TABLE IF EXISTS "Genders";
DROP TABLE IF EXISTS "FinancialAssetTypes";
DROP TABLE IF EXISTS "LegalDocuments";
DROP TABLE IF EXISTS "MaritalStatuses";
DROP TABLE IF EXISTS "Religions";
DROP TABLE IF EXISTS "States";
DROP TABLE IF EXISTS "SupportProviderSetSources"; -- Renamed to SupportProviderDetailSetSources but migration easier with re-create and drop
DROP TABLE IF EXISTS "YesNoIdk";
