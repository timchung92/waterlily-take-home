declare type PostAdvisorHierarchyRelationshipProps = {
  supervisorAdvisorEmail: string;
  subordinateAdvisorEmail: string;
  action: 'create' | 'delete';
};
