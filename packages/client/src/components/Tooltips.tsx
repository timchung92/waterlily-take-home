import { ReactNode } from 'react';
import styles from '../styles/main.module.css';
import { annualHealthcareInflationRate } from '@shared/healthCareInflationRate';

function TopFactorsFootnote() {
  return (
    <>
      The most important factors to the model on average, not necessarily for
      the individual
    </>
  );
}
function LtcDefinitionFootnote() {
  return (
    <>
      LTC is defined by requiring assistance with at least two Activities of
      Daily Living (ADLs) or an equivalent level of care.
    </>
  );
}
interface BaseMetricTextProps {
  percentIncrease: number;
}

function BaselineMetricText({ percentIncrease }: BaseMetricTextProps) {
  return (
    <>{percentIncrease}% more accurate than the industry-standard approach.</>
  );
}
interface BaselineMetricFootnoteProps {
  industryMetric: string;
  sourceUrl: string;
  displayUrl: string;
}

export function BaselineMetricFootnote1({
  industryMetric,
  sourceUrl,
  displayUrl,
}: BaselineMetricFootnoteProps) {
  return (
    <>
      The model is compared to a baseline model that predicts the
      industry-standard {industryMetric} (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noreferrer"
      >
        {displayUrl}
      </a>
      ), and the accuracy of both models is assessed on unseen data.
    </>
  );
}

interface ChildrenOnlyProps {
  children: ReactNode;
}

function MainTip({ children }: ChildrenOnlyProps) {
  return (
    <>
      <p className={styles.mainTip}>{children}</p>
    </>
  );
}

function SubTip({ children }: ChildrenOnlyProps) {
  return <p className={styles.subTip}>{children}</p>;
}

export const tooltips = {
  slideOurPredictionsLikelihoodNeedingLtc: (
    <>
      <MainTip>
        <p>
          The likelihood of needing long-term care<sup>1</sup> (LTC) during
          one&apos;s lifetime.
        </p>
        <p>
          <b>Model Accuracy</b>
          <sup>2</sup>: 78%
        </p>
        <p>
          <b>Top Factors</b>
          <sup>3</sup>: Age, memory, ADL/IADL baselines, sex, BMI, prescription
          drug use, arthritis, diabetes.
        </p>
      </MainTip>
      <SubTip>
        <p>
          <sup>1</sup> <LtcDefinitionFootnote />
        </p>
        <p>
          <sup>2</sup> Accuracy based on an average of the true positive rate
          and precision (positive predictive value) achieved on data the model
          has not been trained on.
        </p>
        <p>
          <sup>3</sup> <TopFactorsFootnote />
        </p>
      </SubTip>
    </>
  ),
  slideOurPredictionsBeginCareAtAge: (
    <>
      <MainTip>
        <p>The estimated age when long-term care begins.</p>
        <p>
          <b>Model Accuracy</b>
          <sup>1</sup>: <BaselineMetricText percentIncrease={65} />
        </p>
        <p>
          <b>Top Factors</b>
          <sup>2</sup>: BMI, sex, marital status, lung, memory, diabetes, mental
          health
        </p>
      </MainTip>
      <SubTip>
        {/* <p><sup>1</sup> <LtcDefinitionFootnote /></p> */}
        <p>
          <sup>1</sup>{' '}
          <BaselineMetricFootnote1
            industryMetric="80 years"
            sourceUrl="https://www.aaltci.org/news/long-term-care-insurance-news/newest-long-term-care-insurance-claims-paid-data-shared"
            displayUrl="aaltci.org"
          />
        </p>
        <p>
          <sup>2</sup> <TopFactorsFootnote />
        </p>
      </SubTip>
    </>
  ),
  slidePredictedCareNeedsTotalCareHours: (
    <>
      <MainTip>
        <p>
          The total care hours required over the length of one&apos;s long-term
          care.
        </p>
        <p>
          <b>Model Accuracy</b>
          <sup>1</sup>: <BaselineMetricText percentIncrease={45} />
        </p>
        <p>
          <b>Top Factors</b>
          <sup>2</sup>: Memory, age, gender, ADL/IADL baselines, mental health,
          arthritis, prescription drug use, high blood pressure
        </p>
      </MainTip>
      <SubTip>
        {/* <p><sup>1</sup> <LtcDefinitionFootnote /></p> */}
        <p>
          <sup>1</sup>{' '}
          <BaselineMetricFootnote1
            industryMetric="87 monthly care hours"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
          />
        </p>
        <p>
          <sup>2</sup> <TopFactorsFootnote />
        </p>
      </SubTip>
    </>
  ),
  slidePredictedCareNeedsDurationYears: (
    <>
      <MainTip>
        <p>The length in years of one&apos;s long-term care.</p>
        <p>
          <b>Model Accuracy</b>
          <sup>1</sup>: <BaselineMetricText percentIncrease={10} />
        </p>
        <p>
          <b>Top Factors</b>
          <sup>2</sup>: Memory, ADL/IADL baselines, smoking, BMI, assets, gender
        </p>
      </MainTip>
      <SubTip>
        {/* <p><sup>1</sup> <LtcDefinitionFootnote /></p> */}
        <p>
          <sup>1</sup>
          <BaselineMetricFootnote1
            industryMetric="3 years"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
          />
        </p>
        <p>
          <sup>2</sup> <TopFactorsFootnote />
        </p>
      </SubTip>
    </>
  ),
  slidePredictedCareNeedsFamilyCarePercentage: (
    <>
      <MainTip>
        <p>
          The percentage of care hours in one&apos;s long-term care to be
          provided by family members.
        </p>
        <p>
          <b>Model Accuracy</b>
          <sup>1</sup>: <BaselineMetricText percentIncrease={15} />
        </p>
        <p>
          <b>Top Factors</b>
          <sup>2</sup>: Marital status, children count, household size, siblings
          count
        </p>
      </MainTip>
      <SubTip>
        {/* <p><sup>1</sup> <LtcDefinitionFootnote /></p> */}
        <p>
          <sup>1</sup>{' '}
          <BaselineMetricFootnote1
            industryMetric="80%"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
          />
        </p>
        <p>
          <sup>2</sup> <TopFactorsFootnote />
        </p>
      </SubTip>
    </>
  ),
  slideProjectedCostsProfessionalShareCosts: (
    <>
      <MainTip>
        <p>
          Long-term care costs associated with professional services and
          facility costs. Costs are adjusted for health care inflation
          <sup>1</sup> until the estimated care begin year.{' '}
        </p>
        <p>
          <b>Model Accuracy</b>
          <sup>2</sup>: <BaselineMetricText percentIncrease={65} />
        </p>
        <p>
          <b>Top Factors</b>
          <sup>3</sup>: Memory, ADL/IADL baselines, care environment, city, age,
          mental health, arthritis, prescription drug use, BMI
        </p>
      </MainTip>
      <SubTip>
        {/* <p><sup>1</sup> <LtcDefinitionFootnote /></p> */}
        <p>
          <sup>1</sup> Annual inflation rate of{' '}
          {annualHealthcareInflationRate * 100}%{' '}
          <a
            href="https://www.cms.gov/newsroom/press-releases/cms-office-actuary-releases-2022-2031-national-health-expenditure-projections"
            target="_blank"
            rel="noreferrer"
          >
            (source: cms.gov)
          </a>
        </p>
        <p>
          <sup>2</sup> This is an approximate comparison between
          Waterlily&apos;s model and a baseline model, based on 1 million
          simulated estimates using industry-standard cost distributions for
          various care settings. For more detail visit our{' '}
          <a
            href={
              'https://www.joinwaterlily.com/planning-for-yourself/disclosures-disclaimers'
            }
            target="_blank"
            rel="noreferrer"
          >
            disclaimers page
          </a>
          .
        </p>
        <p>
          <sup>3</sup> <TopFactorsFootnote />
        </p>
      </SubTip>
    </>
  ),
};
