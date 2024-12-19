import { annualHealthcareInflationRate, formatCurrency } from '@shared';

interface clientFirstNameProps {
  clientFirstName: string;
}

export function ResultsAreInSlideOutContent(props: clientFirstNameProps) {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-2xl font-semibold">
            Data and methodology
          </h1>
          <p className="pb-3">
            These 50,000 families have been reporting data over the last 20
            years. We know what they looked like before needing LTC, and how
            their care needs progressed over time.
          </p>
          <p>
            By looking at people whose historical responses are similar to{' '}
            {props.clientFirstName}, the AI uses their eventual LTC outcomes to
            make predictions about {props.clientFirstName}&apos;s future LTC.{' '}
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">More information</h2>
          <p>
            For more information on Waterlily predictive models, how they work
            and what they can and can't do, please visit our{' '}
            <a
              href={
                'https://www.joinwaterlily.com/planning-for-yourself/disclosures-disclaimers'
              }
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              disclaimers and methodology page
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}

export function LtcFundingSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            Projected Cost Coverage
          </h1>
          <p className="pb-3">
            The estimated amount that you will have available to cover long-term
            care (LTC) costs based on your current financing plan. This sum
            encompasses both self-funding contributions and policy coverage
            where applicable.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Self-Funding Coverage</h2>
          <p>
            Self-funding coverage may consist of a one-time contribution and/or
            monthly contributions you've chosen to make, along with the growth
            of these amounts based on your selected annual rate of return. The
            total profit of the investment is then reduced by the provided
            capital gains tax rate to arrive at the net future value of
            self-funding assets. This may not be applicable to those who have
            already begun long-term care.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Policy Coverage</h2>
          <p>
            If applicable, policy coverage estimates how much of your projected
            long-term care costs will be offset by your policy, considering the
            specific conditions outlined in your long-term care policy and your
            current care plan. Please note that policies typically do not
            activate until you require assistance with at least two activities
            of daily living (ADLs), and therefore, they do not cover the first
            half of the Early Care stage.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Annuity Coverage</h2>
          <p>
            Annuity coverage estimates how much of your projected long-term care
            costs will be covered by your annuity payouts. This calculation uses
            the expected annuity payouts starting at your estimated payout age
            and continues until the end of the long-term care period. If there
            is an enhanced LTC amount, it will be used instead of the regular
            payout during the period when the annuitant meets the Activities of
            Daily Living (ADL) requirements and the payment period has not
            elapsed.
          </p>
        </div>
      </div>
    </>
  );
}

function FundingSourceDisclaimer() {
  return (
    <div className="text-sm italic text-gray-500">
      <p>
        This information is for educational purposes and is an
        oversimplification of terms, options, and strategies, and does not cover
        all options in the scenarios described. This is not financial advice.
        For a more detailed and nuanced explanation of the different types of
        funding mechanisms that extends beyond the high level overview provided
        here, please speak with a financial advisor or insurance agent who is
        licensed in this field.
      </p>
    </div>
  );
}

export function FundingSourcesInsuranceSlideOutContent() {
  return (
    <>
      <div className="-mt-6 flex flex-grow flex-col gap-6 ">
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What is insurance for long-term care?
          </h1>
          <p className="pb-2">
            Long-term care insurance products are designed to cover costs that
            are typically not covered by standard health insurance, such as help
            with daily activities and extended nursing care. Each type of policy
            has distinct features and benefits to consider.
          </p>
        </div>
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What are some pros and cons to buying insurance for long-term care?
          </h1>
          <p className="pb-2">
            <span className="font-semibold">Extended Coverage: </span>
            Insurance can cover extensive costs that standard health insurance
            does not, ensuring financial support for services that are often
            necessary as one ages.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Tax Advantages: </span>
            Premiums paid for qualified long-term care insurance can be
            tax-deductible, depending on the policy and your tax situation. This
            can reduce the overall cost of insurance.
          </p>
          <p className="pb-2">
            <span className="font-semibold">
              Low Initial Capital Requirement:{' '}
            </span>
            Unlike self-funding, which may require significant assets, buying
            insurance allows you to access substantial long-term care coverage
            without needing a large amount of capital upfront. You pay premiums
            over time, spreading out the cost.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Qualification Challenges: </span>
            Not everyone qualifies for long-term care insurance, especially
            traditional policies. Health screenings are required, and
            pre-existing conditions or poor health can disqualify you or
            increase the cost.
          </p>
        </div>
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What kinds of long-term care insurance products are there?
          </h1>
          <p className="pb-2">
            There are several types of long-term care insurance products. Our
            platform focuses mainly on four types:
          </p>
          <p className="pb-2">
            <span className="font-semibold">
              Traditional long-term care insurance:{' '}
            </span>
            Traditional long-term care insurance is designed specifically to
            cover the costs of long-term care services, such as in-home care,
            assisted living, and nursing home expenses. These policies typically
            require health screenings and can have variable premiums that may
            increase over time. Coverage is activated when the insured cannot
            perform a certain number of Activities of Daily Living (ADLs)
            (typically two or more).
          </p>
          <p className="pb-2">
            <span className="font-semibold">Hybrid insurance: </span>
            Hybrid insurance combines long-term care insurance with life
            insurance into a single policy. This type of policy ensures that if
            long-term care is not needed, the premiums paid will not be lost but
            will instead contribute towards a life insurance benefit to the
            beneficiaries. Hybrid policies often require a larger initial
            investment but offer fixed premiums and a death benefit.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Life insurance with riders: </span>A
            life insurance policy with a long-term care rider allows
            policyholders to use part of the death benefit for long-term care
            expenses should they need it during their lifetime. This option
            provides flexibility as it serves both as life insurance and a way
            to fund long-term care, reducing the use-it-or-lose-it risk found in
            traditional policies.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Short-term care insurance: </span>
            Short-term care insurance covers the same types of services as
            traditional long-term care insurance, such as home care or nursing
            care, but for a shorter duration—typically about one year or less.
            This insurance is often easier to qualify for, has lower premiums,
            and may be suitable for those needing temporary care or who cannot
            qualify for traditional long-term care insurance due to health
            issues or age.
          </p>
        </div>
        <FundingSourceDisclaimer />
      </div>
    </>
  );
}

export function FundingSourcesSelfFundingSlideOutContent() {
  return (
    <>
      <div className="-mt-6 flex flex-grow flex-col gap-4 ">
        <div>
          <h2 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What does it mean to self-fund long-term care?
          </h2>
          <p className="pb-1">
            Self-funding long-term care means that you plan to cover part or all
            of the costs out of your own financial resources, which can include
            savings, investments, income and other assets.
          </p>
        </div>
        <div>
          <h2 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What are some pros and cons of self-funding?
          </h2>
          <p className="pb-2">
            <span className="font-semibold">Increased control: </span>
            Self-funding allows you to retain control over your assets and how
            they are used for your long-term care needs, giving you complete
            control over the type of care you receive and where you receive it.
            With self-funding, you pay only for the care you use, which can mean
            cost savings if you end up needing less care than planned for.
          </p>

          <p className="pb-2">
            <span className="font-semibold">Impact on inheritance: </span>A
            significant risk of self-funding is the potential to exhaust your
            financial resources quickly, especially if your care needs extend
            over a long period. This depletion of funds can adversely affect
            your financial stability and the inheritance you intend to leave to
            your family. Therefore, it's important to carefully consider the
            likelihood and potential costs of needing extended care when
            deciding on self-funding as an option.
          </p>
          <p className="pb-3">
            <span className="font-semibold">Less tax-advantage: </span>Unlike
            some insurance premiums which might be tax-deductible, out-of-pocket
            expenses for self-funded care typically do not offer tax benefits,
            which could increase your overall financial burden.
          </p>
        </div>
        <FundingSourceDisclaimer />
      </div>
    </>
  );
}

export function FundingSourcesAnnuitySlideOutContent() {
  return (
    <>
      <div className="-mt-6 flex flex-grow flex-col gap-6 ">
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What are annuities and how can they be used for long-term care?
          </h1>
          <p className="pb-3">
            Annuities are financial products that you purchase from an insurance
            company, which then provide a guaranteed income stream for life or a
            specified period. To address long-term care needs, some annuities
            can be structured with long-term care riders that increase the
            annual payout if the annuitant requires long-term care. These
            products are designed to offer a steady source of income, which can
            be useful in managing long-term care expenses.
          </p>
        </div>
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What are some pros and cons to using annuities for long-term care
            costs?
          </h1>
          <p className="pb-2">
            <span className="font-semibold">Guaranteed Income: </span>
            Annuities can provide a guaranteed income stream, which can be a
            reliable foundation for covering ongoing long-term care costs,
            mitigating financial instability from varying market conditions.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Long-Term Care Riders: </span>
            Some annuities offer the option to add long-term care riders, which
            increase the payout when long-term care services are needed. This
            can help in covering higher care costs without depleting other
            savings or assets.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Tax Advantages: </span>
            The income from annuities can be tax-advantaged depending on the
            type of annuity, which can result in lower tax liabilities compared
            to other forms of income.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Lack of Liquidity: </span>
            Once an annuity is purchased, the funds are typically locked in, and
            accessing them in a lump sum can incur high surrender charges. This
            lack of liquidity can be a disadvantage if your financial situation
            changes unexpectedly.
          </p>
        </div>
        <FundingSourceDisclaimer />
      </div>
    </>
  );
}

export function FundingSourcesProjectedROISlideOutContent() {
  return (
    <>
      <div className="-mt-5 flex flex-grow flex-col gap-4 text-base">
        <h2 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
          How is projected return on investment (ROI) calculated?
        </h2>
        <p className="pb-1">
          <span className="font-semibold">Total ROI: </span>
          Total ROI compares the total value of a funding source to its cost. It
          is calculated by subtracting the cost from the total payout and then
          dividing that difference by the cost.
        </p>

        <p className="text-base">
          <span className="font-semibold">
            Compound Annual Growth Rate (CAGR):{' '}
          </span>
          The Compound Annual Growth Rate (CAGR) represents the steady rate at
          which an investment would need to grow each year to reach its final
          value. This is calculated by comparing the total returns (LTC payout
          and Non-LTC Payout) to the Net Present Value of investments (e.g.,
          premiums, self-funding contributions), spread across the time period
          to the last return. CAGR provides a measure of investment performance
          that assumes a smooth, consistent growth rate over the entire
          investment period.
        </p>
        <p className="hidden text-base">
          <span className="font-semibold">Internal Rate of Return (IRR): </span>
          The Internal Rate of Return (IRR) represents the annual growth rate an
          investment achieves based on all cash flows - both investments made
          and returns received. The algorithm first tries to calculate this
          precisely with the projected investment timeline. If that's not
          possible (which can happen with complex investment patterns), it will
          use an alternative method where it first calculates the Net Present
          Value (NPV) of the investments using the provided discount rate, and
          then calculates IRR treating this NPV as a single upfront cost. It's
          important to note that in these cases the chosen discount rate will
          influence the final IRR calculation.
          <span className="underline">
            {' '}
            Note: IRR is not always calculable depending on the cashflow
            schedule of the investment.
          </span>
        </p>
        <p className="mb-2 mt-1">
          The period of time being measured depends on the funding type:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            For policies: Years between purchase date and the end of the last
            care phase the policy is projected to provide coverage for.
          </li>
          <li>
            For annuities: Years between current year and estimated end of
            payouts.
          </li>
          <li>
            For self-funding: Years between current year and projected start of
            long-term care. Note: monthly income for self-funding is not
            included in the annual ROI calculations.
          </li>
        </ul>

        <FundingSourceDisclaimer />
      </div>
    </>
  );
}

export function FundingSourceLtcPayoutSlideOutContent() {
  return (
    <>
      <div className="-mt-6 flex flex-grow flex-col gap-6 ">
        <div>
          <h2 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What is LTC Payout and Non-LTC Payout?
          </h2>
          <p className="pb-2">
            The LTC Payout represents the amount of money from a funding source
            that will go towards covering long-term care costs. Conversely, the
            Non-LTC Payout is the amount of money from a funding source that may
            not be used for long-term care costs but is still paid to or belongs
            to the owner and/or their beneficiaries.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Self-funding: </span> the LTC Payout
            is equivalent to the Total Payout of the investment(s). This assumes
            that self-funding investments can be liquidated to cover any portion
            or all of the care costs. Non-LTC Payout is always zero for
            self-funding, because we assume that there are no restrictions on
            how funds can be used to cover care costs.
          </p>
          <p className="pb-2">
            <span className="font-semibold">Insurance: </span> the LTC Payout is
            limited by the maximum benefit amount and daily maximums.
            Additionally, the coverable portion of projected costs is reduced by
            the elimination period and the portion of care costs associated with
            the period when the policyholder does not meet the activities of
            daily living (ADL) requirements to activate the policy.
          </p>
          <p className="pb-1">
            The Non-LTC Payout includes any remaining benefits after LTC
            benefits are paid out. This can include death benefits or any other
            benefits not used for long-term care. For life insurance with a
            rider and hybrid policies, we assume any amount not used for LTC is
            paid out as a death benefit.
          </p>
          <p className="pb-1">
            <span className="font-semibold">Annuity: </span> the LTC Payout is
            the sum of annual payments that occur after the expected payout
            begin age and continue until the projected long-term care end age.
            In annuities with enhanced long-term care payouts, these are applied
            only to the portion of projected costs after the period when the
            annuitant meets the ADL requirements, similar to insurance policies.
          </p>
        </div>

        <FundingSourceDisclaimer />
      </div>
    </>
  );
}

export function FundingSourceTotalPayoutSlideOutContent() {
  return (
    <>
      <div className="-mt-4 flex flex-grow flex-col gap-4 ">
        <div>
          <h2 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What is the total payout?
          </h2>
          <p className="pb-1">
            The Total Payout is the estimated or guaranteed value of a funding
            source, intended to cover long-term care costs or to be paid to its
            owner and/or their beneficiaries. It is calculated as the sum of the
            long-term care (LTC) Payout and the Non-LTC Payout.
          </p>
        </div>

        <FundingSourceDisclaimer />
      </div>
    </>
  );
}

export function FundingSourceCostSlideOutContent() {
  return (
    <>
      <div className="-mt-6 flex flex-grow flex-col gap-6 ">
        <div>
          <h2 className="flex flex-grow flex-col gap-3 pb-2 text-xl font-semibold">
            What is the cost of a funding source?
          </h2>
          <p className="pb-1">
            The cost of a funding source is the total principal amount invested
            in it. For self-funding, this includes the sum of any one-time
            contributions and monthly contributions. For insurance, the cost is
            the sum of any premiums paid. For annuities, it is the purchase
            price.
          </p>
        </div>
        <FundingSourceDisclaimer />
      </div>
    </>
  );
}

export function CareSettingsSlideOutContent() {
  return (
    <>
      <div className="-mt-4 flex flex-grow flex-col gap-4">
        <div>
          <h1 className="flex flex-grow flex-col gap-3 pb-2 text-2xl font-semibold">
            What are care settings?
          </h1>
          <p className="pb-3">
            A care setting refers to the environment where an individual
            receives long-term care. This could be one's home, a community
            setting like assisted living or independent living, or a facility
            such as a nursing home. In Waterlily, you have the flexibility to
            choose different care settings that are appropriate to each stage of
            care.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Cost of care settings</h2>
          <p>
            Different care settings come with varying associated costs. By using
            your zip code, we pinpoint the precise cost of your selected care
            setting in your local area.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Home care</h2>
          <p>
            Home care involves receiving care at home, either from
            family/friends or paid professionals, such as a home health agency.
            Depending on the extent of care provided by unpaid caregivers, costs
            for this setting can range from $0 (when all care is provided by
            unpaid caregivers) to the maximum (if all care is provided by
            professional caregivers).
          </p>
        </div>

        <div>
          <h2 className="pb-2 text-xl font-semibold">Independent Living</h2>
          <p>
            Independent living refers to residential communities designed for
            seniors who are able to live independently but desire the
            convenience of services such as meals, housekeeping, and social
            activities. Residents typically live in private apartments or houses
            within the community.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Assisted Living</h2>
          <p>
            Assisted living facilities offer a combination of housing,
            personalized support services, and healthcare designed to meet the
            needs of individuals who require assistance with activities of daily
            living (ADLs) such as bathing, dressing, and medication management.
            Residents typically live in private or semi-private apartments and
            have access to communal areas and activities.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Full Care Facility</h2>
          <p>
            Full Care facilities provide nursing home level of care (24/7
            medical care and assistance with daily activities for individuals
            with complex medical needs). Residents receive specialized care from
            licensed professionals in a supportive environment tailored to their
            requirements.
          </p>
        </div>
      </div>
    </>
  );
}

export function FactorCareSettingsSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h2 className="pb-2 text-xl font-semibold">
            How did we calculate this?
          </h2>
          <p>
            This figure is determined by estimating your future care
            requirements, such as duration and level of care needed, as well as
            the predicted (or selected) care settings.
          </p>
        </div>

        <div>
          <h2 className="pb-2 text-xl font-semibold">
            Understanding care settings
          </h2>
          <p>
            A care setting refers to the environment where an individual
            receives long-term care. This could include their own home, a
            community setting like assisted living or independent living, or a
            facility such as a nursing home. In Waterlily, you have the
            flexibility to choose different care settings for each stage of
            care.
          </p>
        </div>

        <div>
          <h2 className="pb-2 text-xl font-semibold">Defining care phases</h2>
          <p>
            A care phase represents a specific period within an individual's
            long-term care journey, characterized by their level of care needs.
            In Waterlily, we simplify this journey into three distinct phases,
            each corresponding to a progressive level of care requirement.
          </p>
        </div>

        <div>
          <h2 className="pb-2 text-xl font-semibold">Care setting costs</h2>
          <p>
            Different care settings come with varying associated costs. By using
            your zip code, we pinpoint the precise cost of your selected care
            setting in your local area.
          </p>
        </div>
      </div>
    </>
  );
}

export function FactorFamilyCareGivingSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h2 className="pb-2 text-xl font-semibold">
            How did we calculate this?
          </h2>
          <p>
            This amount is determined by considering the local cost of home care
            services in your area, as indicated by your zip code, and the
            anticipated number of care hours to be provided by your family.
          </p>
        </div>

        <div>
          <h2 className="pb-2 text-xl font-semibold">
            Understanding family caregiving
          </h2>
          <p>
            Family caregiving involves unpaid physical care provided by family
            or friends, applicable when care is received at home. We subtract
            the estimated cost of family caregiving from the total projected
            expenses.
          </p>
        </div>
      </div>
    </>
  );
}

export function FactorHealthCareInflationSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h2 className="pb-2 text-xl font-semibold">
            How did we calculate this?
          </h2>
          <p>
            We use a national health care inflation rate<sup>1</sup> and
            compound from the present until your care is expected to begin.
          </p>
        </div>

        <div>
          <h2 className="pb-2 text-xl font-semibold">
            Understanding health care inflation
          </h2>
          <p>
            Our models predict the cost of your future long-term care in today's
            dollars, but these expenses are expected to rise due to inflation
            until your care begins. The amount shown reflects the projected
            increase in costs due to inflation.
          </p>
        </div>
        <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
          <li className="flex gap-1">
            <p>1. </p>
            <p>
              Annual inflation rate of {annualHealthcareInflationRate * 100}%{' '}
              <a
                href="https://www.cms.gov/newsroom/press-releases/cms-office-actuary-releases-2022-2031-national-health-expenditure-projections"
                target="_blank"
                rel="noreferrer"
              >
                (source: cms.gov)
              </a>
            </p>
          </li>
        </ol>
      </div>
    </>
  );
}

export function CareHoursNeededSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            Care hours needed
          </h1>
          <p>
            The total care hours required over the length of one&apos;s
            long-term care.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Model accuracy<sup className="font-normal">1</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={45} />
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Top factors<sup className="font-normal">2</sup>
          </h2>
          <p>
            Memory, age, gender, ADL/IADL baselines, mental health, arthritis,
            prescription drug use, high blood pressure
          </p>
        </div>
      </div>
      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="87 monthly care hours"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
            footNoteNumber={2}
          />
        </li>
      </ol>
    </>
  );
}

export function FamilyCarePercentageSlideOutContent() {
  return (
    <>
      <div className="-mt-3 flex flex-grow flex-col gap-4 ">
        <div>
          <h2 className="flex-grow pb-2 text-xl font-semibold">
            Home care hours
          </h2>
          <p>
            Care at home can be administered by either family/friends (unpaid)
            or professional care services (paid).
          </p>
        </div>
        <div className="pb-2">
          <h2 className="flex-grow pb-2 text-xl font-semibold">
            Determining care hour distribution
          </h2>
          <p className="pb-2">
            We establish the allocation of care hours between paid and unpaid
            providers by considering your preferences indicated in the intake
            form and leveraging AI technology that predicts how your family
            would step in based on how other similar families contributed to the
            care of their loved ones.
          </p>
          <p>
            Your stated preference influences the proportion of care hours
            assigned to family versus professional caregivers. Subsequently, AI
            algorithms assist in determining the allocation of care hours to
            specific family members (e.g., spouse, children, other family).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Model accuracy<sup className="font-normal">1</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={15} />
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Top factors<sup className="font-normal">2</sup>
          </h2>
          <p>Marital status, children count, household size, siblings count.</p>
        </div>
      </div>
      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="87 monthly care hours"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
            footNoteNumber={2}
          />
        </li>
      </ol>
    </>
  );
}

export function FamilyCareGivingSlideOutContent() {
  return (
    <>
      <div className="-mt-10 flex flex-grow flex-col gap-4 pb-6">
        <div>
          <h2 className="pb-2 text-xl font-semibold">
            Care hours and length of care
          </h2>
          <p>
            These figures refer to the care hours and length of care (in months)
            specific to the care stage.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Estimating care stages</h2>
          <p>
            Waterlily utilizes advanced statistical growth modeling to estimate
            the progression of your care needs over the course of your long-term
            care. By analyzing the care trajectories of similar individuals, we
            predict how quickly or slowly your needs may evolve. This analysis
            enables us to estimate the duration of each care stage and the level
            of care needed. Below are additional insights about related models.
          </p>
        </div>

        <div>
          <h2 className="flex-grow pb-2 text-xl font-semibold">
            Total care hours needed
          </h2>
          <p>
            The total care hours required over the length of one&apos;s
            long-term care.
          </p>
        </div>
        <div className="ml-2">
          <h2 className="text-lg font-semibold">
            Model accuracy<sup className="font-normal">1</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={45} />
          </p>
        </div>
        <div className="ml-2 pb-4">
          <h2 className="text-lg font-semibold">
            Top factors<sup className="font-normal">2</sup>
          </h2>
          <p>
            Memory, age, gender, ADL/IADL baselines, mental health, arthritis,
            prescription drug use, high blood pressure
          </p>
        </div>
        <div>
          <h2 className="flex-grow pb-2 text-xl font-semibold">
            Long-term care duration
          </h2>
          <p>The length in years of one&apos;s long-term care.</p>
        </div>
        <div className="ml-2">
          <h2 className="text-lg font-semibold">
            Model accuracy<sup className="font-normal">3</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={10} />
          </p>
        </div>
        <div className="ml-2">
          <h2 className="text-lg font-semibold">
            Top factors<sup className="font-normal">1</sup>
          </h2>
          <p>Memory, ADL/IADL baselines, smoking, BMI, assets, gender</p>
        </div>
      </div>

      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="87 monthly care hours"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
            footNoteNumber={2}
          />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="3 years"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
            footNoteNumber={3}
          />
        </li>
      </ol>
    </>
  );
}

export function EarlyCareSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            What is Early Care stage?
          </h1>
          <p>
            This initial stage marks the beginning of long-term care,
            approximately characterized by needing assistance with 1-2 self-care
            activities (e.g., bathing and dressing).
          </p>
        </div>
        <CarePhasesSlideOutContent />
      </div>
    </>
  );
}

export function ModerateCareSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            What is Moderate Care stage?
          </h1>
          <p>
            Moderate care represents the second phase of long-term care,
            approximately characterized by needing assistance with 3-4 self-care
            activities such as bathing, dressing, toileting, and transferring.
          </p>
        </div>
        <CarePhasesSlideOutContent />
      </div>
    </>
  );
}

export function FullCareSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            What is Full Care stage?
          </h1>
          <p>
            Full care represents the highest level of care need in long-term
            care, approximately characterized by needing assistance with 5-6
            self-care activities. Individuals in this stage often rely on
            significant support to maintain their daily routines and overall
            well-being.
          </p>
        </div>
        <CarePhasesSlideOutContent />
      </div>
    </>
  );
}

export function CarePhasesSlideOutContent() {
  return (
    <>
      <div>
        <h2 className="flex-grow pb-2 text-xl font-semibold">
          Self-care activities
        </h2>
        <p>
          These are essential daily tasks individuals perform to care for
          themselves, including bathing, dressing, eating, transferrring (e.g.,
          from bed to chair), toileting, and continence. These are also called
          Activities of Daily Living, or ADLs.
        </p>
      </div>
      <div>
        <h2 className="text-xl font-semibold">
          Understanding stages of care need
        </h2>
        <p>
          The stages of care need in long-term care are categorized based on the
          number of self-care tasks an individual requires assistance with.
          Progressing from early to moderate to full stages indicates an
          increasing level of care required throughout the long-term care
          journey.
        </p>
      </div>
      <div>
        <h2 className="text-xl font-semibold">Estimating care stages</h2>
        <p>
          Waterlily utilizes advanced statistical growth modeling to estimate
          the progression of your care needs over the course of your long-term
          care. By analyzing the care trajectories of similar individuals, we
          predict how quickly or slowly your needs may evolve.
        </p>
      </div>
    </>
  );
}

export function LikelihoodSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            Likelihood of long-term care
          </h1>
          <p>
            The likelihood of needing long-term care (LTC)<sup>1</sup> during
            one&apos;s lifetime.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Model accuracy: 78%</h2>
          <p>
            Accuracy based on an average of the true positive rate and precision
            (positive predictive value) achieved on data the model has not been
            trained on.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Top factors<sup className="font-normal">2</sup>
          </h2>
          <p>
            Age, memory, ADL/IADL baselines, sex, BMI, prescription drug use,
            arthritis, diabetes.
          </p>
        </div>
      </div>

      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <LtcDefinitionFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={2} />
        </li>
      </ol>
    </>
  );
}

export function DurationSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            Length of Care
          </h1>
          <p>
            This is an estimate predicting the duration of long-term care (LTC)
            <sup className="font-normal">1</sup> from the onset of care needs to
            the conclusion of those needs.
          </p>
          <p className="pt-1">
            This prediction is based on a comparative analysis of one's data
            with that of similar individuals who have previously undergone
            long-term care. It is important to note that this estimate does not
            imply mortality, but rather provides a forecast to help one
            understand and plan for potential long-term care.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Model accuracy<sup>2</sup>
          </h2>
          <BaselineMetricText percentIncrease={10} />
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Top factors<sup className="font-normal">3</sup>
          </h2>
          <p>Memory, ADL/IADL baselines, smoking, BMI, assets, sex.</p>
        </div>
      </div>

      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <LtcDefinitionFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="3 years"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
            footNoteNumber={2}
          />
        </li>
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={3} />
        </li>
      </ol>
    </>
  );
}

export function CareHoursStartSlideOutContent() {
  return (
    <>
      <div className="-mt-10 flex flex-grow flex-col gap-4 pb-6">
        <div>
          <h2 className="pb-2 text-2xl font-semibold">Initial care needs</h2>
          <p>
            This estimate represents the average number of caregiving hours you
            will require at the beginning of your long-term care. It covers the
            support needed to perform basic self-care activities such as
            bathing, dressing, and other daily tasks.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Estimating care stages</h2>
          <p>
            Waterlily utilizes advanced statistical growth modeling to estimate
            the progression of your care needs over the course of your long-term
            care. By analyzing the care trajectories of similar individuals, we
            predict how quickly or slowly your needs may evolve. This analysis
            enables us to estimate the duration of each care stage and the level
            of care needed. Below are additional insights about related models.
          </p>
        </div>

        <div>
          <h2 className="flex-grow pb-2 text-xl font-semibold">
            Total care hours needed
          </h2>
          <p>
            The total care hours required over the length of one&apos;s
            long-term care.
          </p>
        </div>
        <div className="ml-2">
          <h2 className="text-lg font-semibold">
            Model accuracy<sup className="font-normal">1</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={45} />
          </p>
        </div>
        <div className="ml-2 pb-4">
          <h2 className="text-lg font-semibold">
            Top factors<sup className="font-normal">2</sup>
          </h2>
          <p>
            Memory, age, gender, ADL/IADL baselines, mental health, arthritis,
            prescription drug use, high blood pressure
          </p>
        </div>
      </div>

      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="87 monthly care hours"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
            footNoteNumber={2}
          />
        </li>
      </ol>
    </>
  );
}

export function CareHoursEndSlideOutContent() {
  return (
    <>
      <div className="-mt-10 flex flex-grow flex-col gap-4 pb-6">
        <div>
          <h2 className="pb-2 text-2xl font-semibold">Later care needs</h2>
          <p>
            This estimate represents the average number of caregiving hours you
            will need during the later stages of your long-term care. It
            includes support for basic self-care needs and more intensive care
            activities as your needs increase over time.
          </p>
        </div>
        <div>
          <h2 className="pb-2 text-xl font-semibold">Estimating care stages</h2>
          <p>
            Waterlily utilizes advanced statistical growth modeling to estimate
            the progression of your care needs over the course of your long-term
            care. By analyzing the care trajectories of similar individuals, we
            predict how quickly or slowly your needs may evolve. This analysis
            enables us to estimate the duration of each care stage and the level
            of care needed. Below are additional insights about related models.
          </p>
        </div>

        <div>
          <h2 className="flex-grow pb-2 text-xl font-semibold">
            Total care hours needed
          </h2>
          <p>
            The total care hours required over the length of one&apos;s
            long-term care.
          </p>
        </div>
        <div className="ml-2">
          <h2 className="text-lg font-semibold">
            Model accuracy<sup className="font-normal">1</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={45} />
          </p>
        </div>
        <div className="ml-2 pb-4">
          <h2 className="text-lg font-semibold">
            Top factors<sup className="font-normal">2</sup>
          </h2>
          <p>
            Memory, age, gender, ADL/IADL baselines, mental health, arthritis,
            prescription drug use, high blood pressure
          </p>
        </div>
      </div>

      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="87 monthly care hours"
            sourceUrl="https://acl.gov/ltc/basic-needs/who-will-provide-your-care"
            displayUrl="acl.gov"
            footNoteNumber={2}
          />
        </li>
      </ol>
    </>
  );
}

export function LtcAtAgeSlideOutContent() {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            Starting age of long-term care
          </h1>
          <p>
            The estimated age when long-term care (LTC)<sup>1</sup> begins.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Model accuracy<sup>2</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={65} />
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Top factors<sup className="font-normal">2</sup>
          </h2>
          <p>BMI, sex, marital status, lung, memory, diabetes, mental health</p>
        </div>
      </div>
      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <LtcDefinitionFootnote footnoteNumber={1} />
        </li>
        <li className="flex gap-1">
          <BaselineMetricFootnote
            industryMetric="80 years"
            sourceUrl="https://www.aaltci.org/news/long-term-care-insurance-news/newest-long-term-care-insurance-claims-paid-data-shared"
            displayUrl="aaltci.org"
            footNoteNumber={2}
          />
        </li>
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={3} />
        </li>
      </ol>
    </>
  );
}

interface LtcCostsSlideOutContentProps {
  allPhaseInflatedProfessionalShareCost: number;
  clientHasStartedLtc: boolean;
  allPhaseProfessionalShareCost: number;
}

export function LtcCostsSlideOutContent(props: LtcCostsSlideOutContentProps) {
  return (
    <>
      <div className="flex flex-grow flex-col gap-4 ">
        <div>
          <h1 className="flex-grow pb-2 text-2xl font-semibold">
            Cost of long-term care
          </h1>
          <p>
            {formatCurrency(props.allPhaseInflatedProfessionalShareCost)} is the
            estimated cost of long-term care (LTC) adjusted for health care
            inflation
            <sup>1</sup> up to the anticipated{' '}
            {`${props.clientHasStartedLtc ? 'end' : 'start'}`} year of care.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            Model accuracy<sup className="font-normal">2</sup>
          </h2>
          <p>
            <BaselineMetricText percentIncrease={65} />
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            Top factors<sup className="font-normal">3</sup>
          </h2>
          <p>
            Memory, ADL/IADL baselines, care environment, city, age, mental
            health, arthritis, prescription drug use, BMI
          </p>
        </div>
      </div>
      {/* footer */}
      <ol className="flex flex-col border-t border-gray-200 py-6 italic text-gray-600">
        <li className="flex gap-1">
          <p>1. </p>
          <p>
            Annual inflation rate of {annualHealthcareInflationRate * 100}%{' '}
            <a
              href="https://www.cms.gov/newsroom/press-releases/cms-office-actuary-releases-2022-2031-national-health-expenditure-projections"
              target="_blank"
              rel="noreferrer"
            >
              (source: cms.gov)
            </a>
          </p>
        </li>
        <li className="flex gap-1">
          <p>
            <sup>2</sup>{' '}
          </p>
          <p>
            This is an approximate comparison between Waterlily&apos;s model and
            a baseline model, based on 1 million simulations using
            industry-standard cost distributions for various care settings. For
            more detail visit our{' '}
            <a
              href={
                'https://www.joinwaterlily.com/planning-for-yourself/disclosures-disclaimers'
              }
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              disclaimers and methodology page
            </a>
            .
          </p>
        </li>
        <li className="flex gap-1">
          <TopFactorsFootnote footnoteNumber={3} />
        </li>
      </ol>
    </>
  );
}

interface FootNoteProps {
  footnoteNumber: number;
}

export function LtcDefinitionFootnote({ footnoteNumber }: FootNoteProps) {
  return (
    <>
      <p>{footnoteNumber}.</p>
      LTC is defined by requiring assistance with at least two self-care
      activities (i.e. activites of daily living ADL) or an equivalent level of
      care. These activites include bathing, dressing, eating, transferrring
      (e.g., from bed to chair), toileting, and continence.
    </>
  );
}

export function TopFactorsFootnote({ footnoteNumber }: FootNoteProps) {
  return (
    <>
      <p>{footnoteNumber}.</p>
      The most important factors to the model on average, not necessarily for
      the individual
    </>
  );
}

interface BaseMetricTextProps {
  percentIncrease: number;
}

export function BaselineMetricText({ percentIncrease }: BaseMetricTextProps) {
  return (
    <>{percentIncrease}% more accurate than the industry-standard approach.</>
  );
}

interface BaselineMetricFootnoteProps {
  industryMetric: string;
  sourceUrl: string;
  displayUrl: string;
  footNoteNumber: number;
}

export function BaselineMetricFootnote({
  industryMetric,
  sourceUrl,
  displayUrl,
  footNoteNumber,
}: BaselineMetricFootnoteProps) {
  return (
    <>
      <p>{footNoteNumber}. </p>
      <p>
        The model is compared to a baseline model that predicts the
        industry-standard {industryMetric}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {' '}
          ({displayUrl})
        </a>
        , and the accuracy of both models is assessed on unseen data.
      </p>
    </>
  );
}
