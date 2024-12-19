import { useDispatch, useSelector } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AuthContainer,
  AuthSuccessMessage,
} from '../components/AuthComponents';
import {
  FormHeader,
  FormInput,
  PrimarySecondaryButtonContainer,
  SubmitButton,
} from '../components/FormComponents';
import { postAdvisorHierarchyRelationshipRequest } from '../model/advisorHierarchyModel';
import { selectAdvisorHierarchyState } from '@/model/selectors';
import { FormErrorAlert } from '@/components/FormErrorAlert';
import { Button } from '@/components/ui/button';
import { BackToDashboardButton } from '@/components';

const schema = z.object({
  supervisorAdvisorEmail: z.string().email(),
  subordinateAdvisorEmail: z.string().email(),
});

export function WizardAdvisorHierarchy() {
  const dispatch = useDispatch();
  const { status, errorMessage } = useSelector(selectAdvisorHierarchyState);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = data => {
    dispatch(
      postAdvisorHierarchyRelationshipRequest({
        supervisorAdvisorEmail: data.supervisorAdvisorEmail,
        subordinateAdvisorEmail: data.subordinateAdvisorEmail,
        action: 'create',
      }),
    );
  };

  function handleDeleteRelationship() {
    const formData = getValues();
    if (formData.supervisorAdvisorEmail && formData.subordinateAdvisorEmail) {
      dispatch(
        postAdvisorHierarchyRelationshipRequest({
          supervisorAdvisorEmail: formData.supervisorAdvisorEmail,
          subordinateAdvisorEmail: formData.subordinateAdvisorEmail,
          action: 'delete',
        }),
      );
    }
  }

  return (
    <AuthContainer
      title="Advisor Hierarchy"
      successState={
        status === 'successfullyAddedRelationship' ||
        status === 'successfullyDeletedRelationship'
      }
      isLoading={status === 'loading'}
      warningState={status === 'error'}
      outsideBoxChildren={<BackToDashboardButton className="justify-center" />}
    >
      {status === 'successfullyAddedRelationship' ||
      status === 'successfullyDeletedRelationship' ? (
        <AuthSuccessMessage
          title={
            status === 'successfullyAddedRelationship'
              ? 'Advisor Relationship Created'
              : 'Advisor Relationship Deleted'
          }
          message={
            status === 'successfullyAddedRelationship'
              ? 'Your advisor relationship has been created. Please refresh the page to add another relationship.'
              : 'Your advisor relationship has been deleted. Please refresh the page to add/delete another relationship.'
          }
        />
      ) : (
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <FormHeader
            title="Create Advisor Relationship"
            className="mt-0"
          />
          <p className="mb-6 text-gray-600">
            By establishing this relationship, the supervisor advisor will have
            full access to view and edit all clients belonging to the
            subordinate advisor.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormInput
              label="Supervisor Advisor Email"
              id="supervisorAdvisorEmail"
              type="email"
              placeholder="Enter supervisor's email"
              error={errors.supervisorAdvisorEmail}
              register={register('supervisorAdvisorEmail')}
              required={true}
            />

            <FormInput
              label="Subordinate Advisor Email"
              id="subordinateAdvisorEmail"
              type="email"
              placeholder="Enter subordinate's email"
              error={errors.subordinateAdvisorEmail}
              register={register('subordinateAdvisorEmail')}
              required={true}
            />

            <PrimarySecondaryButtonContainer>
              <SubmitButton
                label="Create Relationship"
                className="translate-y-4"
              />
              <Button
                variant="destructive"
                className="translate-y-4"
                onClick={handleDeleteRelationship}
                type="button"
              >
                Delete
              </Button>
            </PrimarySecondaryButtonContainer>

            <FormErrorAlert
              mainErrorMessage={errorMessage ?? ''}
              className="translate-y-4"
              isWarning={true}
            />
          </form>
        </div>
      )}
    </AuthContainer>
  );
}
