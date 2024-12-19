declare interface AdvisorExistsResult
  extends Pick<Advisor, 'advisorEmail'>,
    Partial<
      Pick<
        Advisor,
        | 'advisorFirstName'
        | 'advisorLastName'
        | 'organizationName'
        | 'organizationDisplayName'
      >
    > {
  advisorExists: boolean;
}
