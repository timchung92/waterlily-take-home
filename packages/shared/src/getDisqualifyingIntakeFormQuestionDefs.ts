import disqualifyingIntakeFormQuestionDefs from '../data/disqualifyingIntakeFormQuestionDefs.json';
import { appModel } from '.';
import { calculateBMI } from './calculateBMI';

const intakeFormQuestionDefs = getDisqualifyingIntakeFormQuestionDefs();

function getDisqualifyingIntakeFormQuestionDefs() {
  const validatedDefs: DisqualifyingIntakeFormQuestionDefs = {};
  const surveyQuestionRefs =
    appModel.tablesByName.surveyQuestions.valuesByLabel;

  const defs =
    disqualifyingIntakeFormQuestionDefs as unknown as DisqualifyingIntakeFormQuestionDefs;

  Object.keys(defs).forEach(questionRef => {
    if (questionRef in surveyQuestionRefs) {
      validatedDefs[questionRef] = defs[questionRef];
    } else {
      console.warn(`Skipping invalid questionRef: ${questionRef}`);
    }
  });

  return validatedDefs;
}

export type PolicyConditionGroups = {
  [carrierProductName in CarrierProductName]: ConditionsGroup[];
};

type QuestionChoiceKey =
  | 'significantEffort'
  | 'feltSad'
  | 'restlessSleep'
  | 'feltLonely'
  | 'feltDepressed'
  | 'dontKnow'
  | 'noneOfThese'
  | 'yes'
  | 'no'
  | 'bathing'
  | 'eating'
  | 'dressing'
  | 'walking'
  | 'gettingInOutOfBed'
  | 'toileting'
  | 'climbingStairs'
  | 'goingShopping'
  | 'takingMedication'
  | 'preparingMeals'
  | 'selfManagingMoneyFinances'
  | 'makingPhoneCalls'
  | 'highBloodPressure'
  | 'heartDisorder'
  | 'diabetes'
  | 'thyroidDisorder'
  | 'lungDisorder'
  | 'digestiveDisorder'
  | 'brainDisorder'
  | 'neurologicalDisease'
  | 'psychiatricConditions'
  | 'cancer'
  | 'eyeEarNoseThroatDisorder'
  | 'urinaryReproductiveDisorder'
  | 'immuneDisorder'
  | 'kneeInjury'
  | 'ankleInjury'
  | 'hipInjury'
  | 'backInjury'
  | 'shoulderInjury'
  | 'neckInjury'
  | 'wristHandInjury'
  | 'elbowInjury'
  | 'footInjury'
  | 'chronicJointPain'
  | 'any';

type IntakeFormQuestionDef = {
  questionLabel: string;
  questionTitle: string;
  questionChoices:
    | {
        [key in QuestionChoiceKey]: string;
      }
    | null;
};

type DisqualifyingIntakeFormQuestionDefs = {
  [questionRef: string]: IntakeFormQuestionDef;
};

export type ConditionsGroup = {
  conditionLabels: string[];
  conditionDef: ConditionDef;
};

type ConditionDef = {
  conditionChecker: (intakeSurvey: IntakeSurvey) => boolean;
  questionLabel: string;
  questionTitle: string;
  questionResponse?: string;
  questionResponseGenerator?: (intakeSurvey: IntakeSurvey) => string;
};

function stringifyOptionSelections(
  intakeSurvey: IntakeSurvey,
  questionRef: keyof IntakeSurvey,
) {
  if (!questionTypeIsMultipleSelect(intakeSurvey, questionRef)) {
    console.warn(
      `Expected ${questionRef} to correspond to an array (multiple select question)`,
    );
    return '';
  }

  return (intakeSurvey[questionRef] as string[]).join('\n');
}

function stringifyAdlSelections(intakeSurvey: IntakeSurvey) {
  return getAdlsFromClientActivitiesReceivedAssistanceList(intakeSurvey).join(
    '\n',
  );
}

function singleConditionEquality(
  intakeSurvey: IntakeSurvey,
  questionRef: keyof IntakeSurvey,
  questionChoiceKey: QuestionChoiceKey,
) {
  const questionChoices = intakeFormQuestionDefs[questionRef].questionChoices;
  if (!questionChoices) {
    return false;
  }

  if (Array.isArray(intakeSurvey[questionRef])) {
    return (intakeSurvey[questionRef] as string[]).includes(
      questionChoices[questionChoiceKey],
    );
  }

  return intakeSurvey[questionRef] === questionChoices[questionChoiceKey];
}

function questionTypeIsMultipleSelect(
  intakeSurvey: IntakeSurvey,
  questionRef: keyof IntakeSurvey,
) {
  return Array.isArray(intakeSurvey[questionRef]);
}

function anyConditionSelected(
  intakeSurvey: IntakeSurvey,
  questionRef: keyof IntakeSurvey,
) {
  if (!questionTypeIsMultipleSelect(intakeSurvey, questionRef)) {
    console.warn(
      `Expected ${questionRef} to correspond to an array (multiple select question)`,
    );
    return false;
  }

  const invalidQuestionKeys: QuestionChoiceKey[] = ['noneOfThese', 'dontKnow'];
  const invalidQuestionChoices = invalidQuestionKeys.map(
    key => intakeFormQuestionDefs[questionRef].questionChoices![key],
  );

  return (
    (intakeSurvey[questionRef] as string[]).filter(
      answer => !invalidQuestionChoices.includes(answer),
    ).length > 0
  );
}

function getAdlsFromClientActivitiesReceivedAssistanceList(
  intakeForm: IntakeSurvey,
) {
  const adlQuestionKeys: QuestionChoiceKey[] = [
    'bathing',
    'eating',
    'dressing',
    'walking',
    'gettingInOutOfBed',
    'toileting',
  ];
  const adlQuestionChoices = adlQuestionKeys.map(
    key =>
      intakeFormQuestionDefs.clientActivitiesReceivedAssistanceList
        .questionChoices![key],
  );
  return intakeForm.clientActivitiesReceivedAssistanceList.filter(activity =>
    adlQuestionChoices.includes(activity),
  );
}

function gtClientActivitiesReceivedAssistanceList(
  intakeSurvey: IntakeSurvey,
  count: number,
) {
  const adlSelections =
    getAdlsFromClientActivitiesReceivedAssistanceList(intakeSurvey);
  const adlCount = adlSelections.length;

  return adlCount > count;
}

function outsideBmiRange(
  intakeSurvey: IntakeSurvey,
  minInclusive: number,
  maxInclusive: number,
) {
  const bmi = calculateBMI(
    intakeSurvey.clientWeightPounds,
    intakeSurvey.clientHeightInches,
  );
  return bmi < minInclusive || bmi > maxInclusive;
}

function singleConditionQuestionDef(
  questionRef: keyof IntakeSurvey,
  questionChoiceKey: QuestionChoiceKey,
): ConditionDef {
  return {
    conditionChecker: (intakeSurvey: IntakeSurvey) =>
      singleConditionEquality(intakeSurvey, questionRef, questionChoiceKey),
    questionLabel: intakeFormQuestionDefs[questionRef].questionLabel,
    questionTitle: intakeFormQuestionDefs[questionRef].questionTitle,
    questionResponse:
      intakeFormQuestionDefs[questionRef].questionChoices![questionChoiceKey],
  };
}

function multipleConditionQuestionDef(
  questionRef: keyof IntakeSurvey,
  questionChoiceKeys: QuestionChoiceKey[],
): ConditionDef {
  return {
    conditionChecker: (intakeSurvey: IntakeSurvey) =>
      questionChoiceKeys.every(choiceKey =>
        singleConditionEquality(intakeSurvey, questionRef, choiceKey),
      ),
    questionLabel: intakeFormQuestionDefs[questionRef].questionLabel,
    questionTitle: intakeFormQuestionDefs[questionRef].questionTitle,
    questionResponseGenerator: (intakeSurvey: IntakeSurvey) => {
      const questionChoices =
        intakeFormQuestionDefs[questionRef].questionChoices;
      const intakeFormQuestionSelections = intakeSurvey[questionRef];

      if (questionChoices === null) {
        console.warn(
          `${questionRef} doesn't have a questionChoices field defined`,
        );
        return '';
      }
      if (!questionTypeIsMultipleSelect(intakeSurvey, questionRef)) {
        console.warn(
          `Expected ${questionRef} to correspond to an array (multiple select question)`,
        );
        return '';
      }

      const questionChoiceLabels = questionChoiceKeys.map(
        choiceKey =>
          intakeFormQuestionDefs[questionRef].questionChoices![choiceKey],
      );
      return (intakeFormQuestionSelections as string[])
        .filter((selection: string) => questionChoiceLabels.includes(selection))
        .join('\n');
    },
  };
}

function anyConditionSelectedQuestionDef(
  questionRef: keyof IntakeSurvey,
): ConditionDef {
  return {
    conditionChecker: (intakeSurvey: IntakeSurvey) =>
      anyConditionSelected(intakeSurvey, questionRef),
    questionLabel: intakeFormQuestionDefs[questionRef].questionLabel,
    questionTitle: intakeFormQuestionDefs[questionRef].questionTitle,
    questionResponseGenerator: (intakeSurvey: IntakeSurvey) =>
      stringifyOptionSelections(intakeSurvey, questionRef),
  };
}

function helpWithAdlQuestionDef(gtCount: number): ConditionDef {
  return {
    conditionChecker: (intakeSurvey: IntakeSurvey) =>
      gtClientActivitiesReceivedAssistanceList(intakeSurvey, gtCount),
    questionLabel:
      intakeFormQuestionDefs.clientActivitiesReceivedAssistanceList
        .questionLabel,
    questionTitle:
      intakeFormQuestionDefs.clientActivitiesReceivedAssistanceList
        .questionTitle,
    questionResponseGenerator: (intakeSurvey: IntakeSurvey) =>
      stringifyAdlSelections(intakeSurvey),
  };
}

function bmiRangeQuestionDef(
  minInclusive: number,
  maxInclusive: number,
): ConditionDef {
  return {
    conditionChecker: (intakeSurvey: IntakeSurvey) =>
      outsideBmiRange(intakeSurvey, minInclusive, maxInclusive),
    questionLabel: `${intakeFormQuestionDefs.clientWeightPounds.questionLabel}, ${intakeFormQuestionDefs.clientHeightInches.questionLabel}`,
    questionTitle: `${intakeFormQuestionDefs.clientWeightPounds.questionTitle} ${intakeFormQuestionDefs.clientHeightInches.questionTitle}`,
    questionResponseGenerator: (intakeSurvey: IntakeSurvey) =>
      `BMI: ${calculateBMI(intakeSurvey.clientWeightPounds, intakeSurvey.clientHeightInches)} (${intakeSurvey.clientWeightPounds} lbs, ${intakeSurvey.clientHeightInches} inches)`,
  };
}

const clientSmokerEverQuestionDef = {
  conditionChecker: (intakeSurvey: IntakeSurvey) =>
    singleConditionEquality(intakeSurvey, 'clientSmokerEver', 'yes'),
  questionLabel: intakeFormQuestionDefs.clientSmokerEver.questionLabel,
  questionTitle: intakeFormQuestionDefs.clientSmokerEver.questionTitle,
  questionResponse:
    intakeFormQuestionDefs.clientSmokerEver.questionChoices!.yes,
};

function singleConditionWithSmokerQuestionDef(
  questionRef: keyof IntakeSurvey,
  questionChoiceKey: QuestionChoiceKey,
): ConditionDef {
  return {
    conditionChecker: (intakeSurvey: IntakeSurvey) =>
      singleConditionEquality(intakeSurvey, questionRef, questionChoiceKey) &&
      singleConditionEquality(intakeSurvey, 'clientSmokerEver', 'yes'),
    questionLabel: `${intakeFormQuestionDefs[questionRef].questionLabel}, ${intakeFormQuestionDefs.clientSmokerEver.questionLabel}`,
    questionTitle: `${intakeFormQuestionDefs[questionRef].questionTitle} ${intakeFormQuestionDefs.clientSmokerEver.questionTitle}`,
    questionResponse: `${intakeFormQuestionDefs[questionRef].questionChoices![questionChoiceKey]}\nSmoking History: Yes`,
  };
}

export enum CarrierProductName {
  NationwideCareMatters = 'Nationwide, Care Matters',
  SecurianSecureCare = 'Securian, SecureCare',
  LincolnMoneyGuard = 'Lincoln, MoneyGuard',
  OneAmericaAssetCare = 'OneAmerica, Asset Care',
  OneAmericaAnnuityCare = 'OneAmerica, Annuity Care',
  GlobalAtlanticForeCare = 'Global Atlantic, ForeCare',
}

const allPolicyConditionGroups: PolicyConditionGroups = {
  [CarrierProductName.NationwideCareMatters]: [
    {
      conditionLabels: ['Surgery planned/completed'],
      conditionDef: anyConditionSelectedQuestionDef('clientInjuriesList'),
    },
    {
      conditionLabels: [
        'Stroke/cerebrovascular accident (CVA)',
        "ALS (Lou Gehrig's disease)",
        'Cerebral palsy',
        'Down syndrome',
        'Aneurysm (not surgically repaired)',
        'Mental retardation',
        'Paralysis',
        'Transient ischemic attack (TIA) in the past three years; multiple TIAs within five years of the most recent one',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'brainDisorder',
      ),
    },
    {
      conditionLabels: ['Cancer of the blood', 'Neurofibromatosis'],
      conditionDef: singleConditionQuestionDef('clientDiagnosesList', 'cancer'),
    },
    {
      conditionLabels: [
        'Diabetes Type 1',
        'Diabetes in combination with tobacco usage in the past 36 months',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'diabetes',
      ),
    },
    {
      conditionLabels: ['Cirrhosis of the liver'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'digestiveDisorder',
      ),
    },
    {
      conditionLabels: ['Hydrocephalus with or without shunt placement'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'neurologicalDisease',
      ),
    },
    {
      conditionLabels: [
        'Cardiac disease (including angina)',
        'Peripheral vascular disease in combination with tobacco usage in the past 36 months',
        'Cardiomyopathy',
        'Deep venous thrombosis (DVT) or pulmonary emboli (PE) history in combination with tobacco usage in the past 36 months',
        'Carotid artery disease',
        'Thrombotic disorder or clotting disorder in combination with tobacco usage in the past 36 months',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },
    {
      conditionLabels: [
        'Peripheral vascular disease in combination with tobacco usage in the past 36 months',
        'Deep venous thrombosis (DVT) or pulmonary emboli (PE) history in combination with tobacco usage in the past 36 months',
        'Thrombotic disorder or clotting disorder in combination with tobacco usage in the past 36 months',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },

    {
      conditionLabels: ['Bone marrow disorder', 'HIV positive'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'immuneDisorder',
      ),
    },
    {
      conditionLabels: [
        'Emphysema or other lung disorder requiring regular or intermittent use of oxygen',
        'Respiratory conditions (including asthma)',
        'Cystic fibrosis',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'lungDisorder',
      ),
    },
    {
      conditionLabels: [
        "Alzheimer's",
        "Huntington's disease or has/had immediate family member with Huntington's disease",
        "Parkinson's disease",
        'Hydrocephalus with or without shunt placement',
        'Multiple sclerosis',
        'Muscular dystrophy',
        'Post-polio syndrome',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'neurologicalDisease',
      ),
    },
    {
      conditionLabels: [
        'Bipolar disease',
        'Alcohol abuse or dependency',
        'Drug abuse or dependency; controlled substance',
        'Suicide attempt or ideation',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'psychiatricConditions',
      ),
    },
    {
      conditionLabels: ['Renal failure'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'urinaryReproductiveDisorder',
      ),
    },
    {
      conditionLabels: [
        'Use of a handicap permit due to physical limitations or medical conditions',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientActivitiesReceivedAssistanceList',
        'walking',
      ),
    },
  ],
  [CarrierProductName.SecurianSecureCare]: [
    {
      conditionLabels: ['BMI < 15.9 or > 40'],
      conditionDef: bmiRangeQuestionDef(15.89, 40.01),
    },
    {
      conditionLabels: [
        'Chronically ill individual (unable to perform two ADLs without substantial assistance for at least 90 days)',
      ],
      conditionDef: helpWithAdlQuestionDef(1),
    },
    {
      conditionLabels: [
        'Chronically ill individual (requiring substantial supervision due to severe cognitive impairment)',
        'Imbalance or unsteady gait',
        'Paralysis',
        "ALS (Lou Gehrig's disease)",
        'Cerebral palsy',
        'Cerebrovascular disease (stroke or TIA in the past 5 years)',
        'Down syndrome',
        'Mental retardation',
        'Seizure disorders with active seizures in the last 4 years',
        'Stroke in the past 5 years',
        'Ataxia (any form)',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'brainDisorder',
      ),
    },
    {
      conditionLabels: [
        'Cancer history within 5 years (except early-stage basal cell or squamous cell cancers)',
      ],
      conditionDef: singleConditionQuestionDef('clientDiagnosesList', 'cancer'),
    },
    {
      conditionLabels: ['Diabetes treated with insulin'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'diabetes',
      ),
    },
    {
      conditionLabels: ['Cirrhosis of the liver', 'Cystic fibrosis'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'digestiveDisorder',
      ),
    },
    {
      conditionLabels: [
        'Cardiomyopathy (active or treated in the last 5 years)',
        'Congestive heart failure (active or treated in the last 3 years)',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },
    {
      conditionLabels: [
        'Bone marrow disorder',
        'HIV/AIDS',
        'Current or recent Lyme disease (within 6 months of recovery)',
        'Rheumatoid arthritis with use of oral steroids or biologic drugs',
        'Systemic Lupus Erythematosus (SLE) with active treatment/symptoms in the last 3 years',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'immuneDisorder',
      ),
    },
    {
      conditionLabels: [
        'Cystic fibrosis',
        'Asthma with history of hospitalizations in the last 2 years or oral steroid use',
        'COPD',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'lungDisorder',
      ),
    },
    {
      conditionLabels: [
        'Chronically ill individual (requiring substantial supervision due to severe cognitive impairment)',
        'Imbalance or unsteady gait',
        'Paralysis',
        'Ataxia (any form)',
        'Alzheimer’s disease or dementia',
        'Huntington’s disease or immediate family member with Huntington’s disease',
        'Hydrocephalus',
        'Memory loss',
        'Multiple sclerosis (MS)',
        'Muscular dystrophy (all forms)',
        'Parkinson’s disease',
        'Post-polio syndrome (symptomatic or treated)',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'neurologicalDisease',
      ),
    },
    {
      conditionLabels: [
        'Alcoholism',
        'Moderate to severe depression',
        'Drug use (any illegal drugs or abuse of prescription drugs recovered less than 5 years)',
        'Eating disorders recovered less than 5 years',
        'Mental disorders (Bipolar disorder)',
        'Suicide attempt or suicidal ideation',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'psychiatricConditions',
      ),
    },
    {
      conditionLabels: ['Kidney failure or transplant history'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'urinaryReproductiveDisorder',
      ),
    },
    {
      conditionLabels: [
        'Tobacco use in combination with specific comorbid health conditions',
      ],
      conditionDef: clientSmokerEverQuestionDef,
    },
  ],
  [CarrierProductName.LincolnMoneyGuard]: [
    {
      conditionLabels: [
        'Stroke or transient ischemic attack (TIA) (with cigarette use in the past 12 months)',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'brainDisorder',
      ),
    },
    {
      conditionLabels: [
        'Diabetes (Type II) (with cigarette use in the past 12 months)',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'diabetes',
      ),
    },
    {
      conditionLabels: [
        'Carotid artery disease (with cigarette use in the past 12 months)',
        'Coronary artery disease (with cigarette use in the past 12 months)',
        'Heart attack (with cigarette use in the past 12 months)',
        'Peripheral vascular disease (with cigarette use in the past 12 months)',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },
    {
      conditionLabels: [
        'Sarcoidosis (with cigarette use in the past 12 months)',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'immuneDisorder',
      ),
    },
    {
      conditionLabels: [
        'Asthma (with cigarette use in the past 12 months)',
        'Emphysema (with cigarette use in the past 12 months)',
        'Sleep apnea (with cigarette use in the past 12 months)',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'lungDisorder',
      ),
    },
    {
      conditionLabels: ['Activity of daily living deficit(s)'],
      conditionDef: helpWithAdlQuestionDef(0),
    },
    {
      conditionLabels: [
        'Ataxia',
        'Aneurysm (not surgically repaired)',
        'Autism',
        'Hydrocephalus',
        'Mental impairment or retardation',
        'Multiple sclerosis',
        'Paralysis of one or more limbs',
        'Paraplegia',
        'Stroke (within 12 months)',
        'Transient ischemic attack (TIA) (within 6 months)',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'brainDisorder',
      ),
    },

    {
      conditionLabels: ['Multiple myeloma', 'Metastatic cancer'],
      conditionDef: singleConditionQuestionDef('clientDiagnosesList', 'cancer'),
    },
    {
      conditionLabels: ['Diabetes mellitus (Type I)'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'diabetes',
      ),
    },
    {
      conditionLabels: [
        'Cirrhosis',
        'Cystic fibrosis',
        'Esophageal varices',
        'Hepatitis (chronic or active)',
        'Pancreatitis (chronic or multiple episodes)',
        'Primary billiary sclerosis',
        'Sclerosing cholangitis',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'digestiveDisorder',
      ),
    },
    {
      conditionLabels: ['Macular degeneration (progressive)'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'eyeEarNoseThroatDisorder',
      ),
    },
    {
      conditionLabels: [
        'Aneurysm (not surgically repaired)',
        'Congestive heart failure',
        'Coronary artery disease (within 6 months)',
        'Cardioversion (within 6 months)',
        'Carotid artery surgery (within 6 months)',
        'Heart attack (within 6 months)',
        'Heart valve replacement surgery (within 6 months)',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },
    {
      conditionLabels: [
        'AIDS/HIV positive',
        'Hemophilia',
        'Lupus (systemic)',
        'Myasthenia gravis',
        'Scleroderma',
        'Wegener’s granulomatosis',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'immuneDisorder',
      ),
    },
    {
      conditionLabels: ['Cystic fibrosis'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'lungDisorder',
      ),
    },
    {
      conditionLabels: [
        'Amyotrophic lateral sclerosis (ALS)',
        'Alzheimer’s disease/dementia',
        'Ataxia',
        'Hydrocephalus',
        'Memory loss',
        'Multiple sclerosis',
        'Muscular dystrophy',
        'Myasthenia gravis',
        'Paralysis of one or more limbs',
        'Paraplegia',
        'Parkinson’s disease',
        'Post polio syndrome (PPS)',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'neurologicalDisease',
      ),
    },
    {
      conditionLabels: [
        'Alcoholism active',
        'Bipolar',
        'Mania',
        'Major depression',
        'Schizophrenia',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'psychiatricConditions',
      ),
    },
    {
      conditionLabels: [
        'Dialysis/kidney failure',
        'Kidney disease (chronic)',
        'Polycystic kidney disease',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'urinaryReproductiveDisorder',
      ),
    },
    {
      conditionLabels: ['Cane'],
      conditionDef: singleConditionQuestionDef(
        'clientActivitiesReceivedAssistanceList',
        'walking',
      ),
    },
  ],
  [CarrierProductName.OneAmericaAssetCare]: [
    {
      conditionLabels: ['Activities of daily living deficits'],
      conditionDef: helpWithAdlQuestionDef(0),
    },
    {
      conditionLabels: [
        'Aneurysm',
        'Balance disorder/gait impairment',
        'Cerebral palsy',
        'Down syndrome',
        'Intellectual disability',
        'Multiple sclerosis',
        'Organic brain syndrome',
        'Paralysis paraplegia/quadriplegia',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'brainDisorder',
      ),
    },
    {
      conditionLabels: [
        'Stroke — multiple, with residuals and/or coexisting CAD, diabetes',
      ],
      conditionDef: multipleConditionQuestionDef('clientDiagnosesList', [
        'brainDisorder',
        'diabetes',
      ]),
    },
    {
      conditionLabels: ['Leukemia', 'Lymphoma', 'Multiple myeloma'],
      conditionDef: singleConditionQuestionDef('clientDiagnosesList', 'cancer'),
    },

    {
      conditionLabels: ['Cirrhosis', 'Hepatitis'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'digestiveDisorder',
      ),
    },
    {
      conditionLabels: ['Macular degeneration — progressive/“wet”'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'eyeEarNoseThroatDisorder',
      ),
    },
    {
      conditionLabels: [
        'Aneurysm',
        'Congestive heart failure (CHF)',
        'Ventricular tachycardia',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },
    {
      conditionLabels: ['Clotting disorders'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'immuneDisorder',
      ),
    },
    {
      conditionLabels: ['Oxygen use', 'Emphysema'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'lungDisorder',
      ),
    },
    {
      conditionLabels: [
        'ALS',
        'Alzheimer’s/dementia',
        'Balance disorder/gait impairment',
        'Cerebral palsy',
        'Huntington’s disease',
        'Memory loss',
        'Multiple sclerosis',
        'Muscular dystrophy',
        'Paralysis paraplegia/quadriplegia',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'neurologicalDisease',
      ),
    },
    {
      conditionLabels: [
        'Drug addiction/illicit drug usage — within 10 years',
        'Schizophrenia',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'psychiatricConditions',
      ),
    },
    {
      conditionLabels: ['Dialysis'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'urinaryReproductiveDisorder',
      ),
    },
    {
      conditionLabels: [
        'Cane — quad or 3-prong',
        'Using wheelchair, walker, chairlift or stairlift',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientActivitiesReceivedAssistanceList',
        'walking',
      ),
    },
  ],
  [CarrierProductName.OneAmericaAnnuityCare]: [
    {
      conditionLabels: ['Activities of daily living deficits'],
      conditionDef: helpWithAdlQuestionDef(0),
    },
    {
      conditionLabels: [
        'Balance disorder/gait impairment',
        'Cerebral palsy',
        'Down syndrome',
        'Intellectual disability',
        'Multiple sclerosis',
        'Organic brain syndrome',
        'Paralysis',
        'Stroke — multiple or with residuals',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'brainDisorder',
      ),
    },
    {
      conditionLabels: [
        'Internal cancers — not cured or not in remission or Stage 4',
        'Multiple myeloma',
      ],
      conditionDef: singleConditionQuestionDef('clientDiagnosesList', 'cancer'),
    },
    {
      conditionLabels: ['Cirrhosis'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'digestiveDisorder',
      ),
    },
    {
      conditionLabels: ['Macular degeneration — progressive/“wet”'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'eyeEarNoseThroatDisorder',
      ),
    },
    {
      conditionLabels: ['Ventricular tachycardia'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },
    {
      conditionLabels: ['Muscular dystrophy'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'immuneDisorder',
      ),
    },
    {
      conditionLabels: [
        'Alzheimer’s',
        'ALS',
        'Balance disorder/gait impairment',
        'Huntington’s disease',
        'Memory loss',
        'Multiple sclerosis',
        'Muscular dystrophy',
        'Non-occular myasthenia gravis',
        'Paralysis',
        'Parkinson’s disease',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'neurologicalDisease',
      ),
    },
    {
      conditionLabels: [
        'Alcoholism — active',
        'Drug addiction/illicit drug usage — within 10 years',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'psychiatricConditions',
      ),
    },
    {
      conditionLabels: [
        'Using a mechanical device: wheelchair, walker, three-prong or quad cane, stair lift, chair lift',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientActivitiesReceivedAssistanceList',
        'walking',
      ),
    },
    {
      conditionLabels: ['Using dialysis machine'],
      conditionDef: singleConditionQuestionDef(
        'clientActivitiesReceivedAssistanceList',
        'urinaryReproductiveDisorder',
      ),
    },
    {
      conditionLabels: ['Using oxygen equipment'],
      conditionDef: singleConditionQuestionDef(
        'clientActivitiesReceivedAssistanceList',
        'lungDisorder',
      ),
    },
  ],
  [CarrierProductName.GlobalAtlanticForeCare]: [
    {
      conditionLabels: [
        'Requiring assistance or supervision for taking medication, eating, bathing, toileting, dressing, managing bowel or bladder, getting in or out of a chair or bed, or walking',
      ],
      conditionDef: helpWithAdlQuestionDef(0),
    },
    {
      conditionLabels: [
        'Smoking with peripheral vascular disease, diabetes, or renal disease',
      ],
      conditionDef: singleConditionWithSmokerQuestionDef(
        'clientDiagnosesList',
        'diabetes',
      ),
    },
    {
      conditionLabels: [
        'Transient ischemic attack (TIA) with a history of heart disease',
      ],
      conditionDef: multipleConditionQuestionDef('clientDiagnosesList', [
        'heartDisorder',
        'brainDisorder',
      ]),
    },
    {
      conditionLabels: [
        'Diabetes with a history of TIA, stroke, neuropathy, kidney disease, peripheral vascular disease, or congestive heart failure',
      ],
      conditionDef: multipleConditionQuestionDef('clientDiagnosesList', [
        'diabetes',
        'brainDisorder',
      ]),
    },
    {
      conditionLabels: [
        'Mild cognitive impairment (MCI)',
        'Organic brain syndrome',
        'Mental incapacity or retardation',
        'Multiple sclerosis',
        'Paralysis',
        'Aneurysm',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'brainDisorder',
      ),
    },
    {
      conditionLabels: [
        'Leukemia',
        'Hodgkin’s disease or other lymphoma',
        'Any cancer other than non-melanoma skin cancer',
      ],
      conditionDef: singleConditionQuestionDef('clientDiagnosesList', 'cancer'),
    },
    {
      conditionLabels: ['Diabetes currently treated with insulin'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'diabetes',
      ),
    },
    {
      conditionLabels: [
        'Aneurysm',
        'Heart bypass surgery',
        'Heart valve replacement',
        'Vascular surgery',
        'Congestive heart failure',
        'Cardiomyopathy',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'heartDisorder',
      ),
    },
    {
      conditionLabels: [
        'Autoimmune disorders such as systemic lupus, systemic scleroderma, CREST syndrome, or mixed connective tissue disease',
        'Blood clotting deficiency or related conditions',
        'Rheumatoid arthritis requiring narcotic medication',
        'Rheumatoid arthritis with joint deformity or joint replacement',
        'Myasthenia gravis',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'immuneDisorder',
      ),
    },
    {
      conditionLabels: [
        'Alzheimer’s disease or dementia',
        'Recurrent memory loss',
        'Mild cognitive impairment (MCI)',
        'Multiple sclerosis',
        'Parkinson’s disease',
        'Paralysis',
        'Myasthenia gravis',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'neurologicalDisease',
      ),
    },
    {
      conditionLabels: [
        'Alcohol or drug abuse or dependency',
        'Hospitalization for depression, bipolar disorder, or any other psychiatric disorder',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'psychiatricConditions',
      ),
    },
    {
      conditionLabels: ['Chronic kidney failure'],
      conditionDef: singleConditionQuestionDef(
        'clientDiagnosesList',
        'urinaryReproductiveDisorder',
      ),
    },
    {
      conditionLabels: [
        'Using or medically advised to use a motorized scooter',
        'Using or medically advised to use a stair lift',
        'Using or medically advised to use a walker',
        'Using or medically advised to use a wheelchair',
        'Using or medically advised to use a multi-prong cane',
      ],
      conditionDef: singleConditionQuestionDef(
        'clientActivitiesReceivedAssistanceList',
        'walking',
      ),
    },
  ],
};

function getDisqualifyingConditionsForPolicy(
  intakeSurvey: IntakeSurvey,
  carrierProductName: CarrierProductName,
): ConditionsGroup[] {
  let disqualifyingConditionGroups: ConditionsGroup[] = [];

  const policyConditionGroups: {
    conditionLabels: string[];
    conditionDef: ConditionDef;
  }[] = allPolicyConditionGroups[carrierProductName];

  if (!policyConditionGroups) {
    return disqualifyingConditionGroups;
  }
  policyConditionGroups.map(conditionGroup => {
    const { conditionDef } = conditionGroup;
    if (conditionDef.conditionChecker(intakeSurvey)) {
      disqualifyingConditionGroups.push(conditionGroup);
    }
  });
  return disqualifyingConditionGroups;
}

export function getDisqualifyingConditions(
  intakeSurvey: IntakeSurvey,
): PolicyConditionGroups {
  return Object.values(CarrierProductName).reduce((conditions, carrier) => {
    return {
      ...conditions,
      [carrier]: getDisqualifyingConditionsForPolicy(intakeSurvey, carrier),
    };
  }, {} as PolicyConditionGroups);
}

export function hasPotentiallyDisqualifyingConditions(
  intakeSurvey: IntakeSurvey,
): boolean {
  return Object.values(CarrierProductName).some(
    carrier =>
      getDisqualifyingConditionsForPolicy(intakeSurvey, carrier).length > 0,
  );
}
