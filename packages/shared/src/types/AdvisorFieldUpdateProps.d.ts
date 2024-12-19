declare type AdvisorFieldUpdateProps = {
  advisorId: string;
  advisorFieldKey: keyof Advisor;
  advisorFieldValue: string;
};
