import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AuthContainer } from '../components/AuthComponents';
import {
  FormHeader,
  FormInput,
  PrimarySecondaryButtonContainer,
  SubmitButton,
} from '../components/FormComponents';
import { FormErrorAlert } from '@/components/FormErrorAlert';
import { BackToDashboardButton, Toast } from '@/components';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { selectAdvisorAdminPortalState } from '@/model/selectors';
import {
  postAdvisorFieldUpdateByAdvisorIdRequest,
  resetAdvisorAdminPortal,
} from '@/model/advisorAdminPortalModel';
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const advisorFields = [
  {
    value: 'organizationName',
    label: 'Organization Legal Name',
  },
  {
    value: 'organizationDisplayName',
    label: 'Organization Whitelabel Name',
  },
] as const;

const schema = z.object({
  advisorId: z.string().min(1, 'Advisor ID is required'),
  advisorFieldKey: z.enum(['organizationName', 'organizationDisplayName']),
  advisorFieldValue: z.string().min(1, 'Field value is required'),
});

export function WizardAdvisorAdminPortal() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const { status, errorMessage, successMessage } = useSelector(
    selectAdvisorAdminPortalState,
  );

  const onSubmit = (data: z.infer<typeof schema>) => {
    dispatch(postAdvisorFieldUpdateByAdvisorIdRequest(data));
  };

  return (
    <AuthContainer
      title="Advisor Admin Portal"
      successState={false}
      isLoading={false}
      warningState={false}
      outsideBoxChildren={<BackToDashboardButton className="justify-center" />}
    >
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <FormHeader
          title="Manage Advisor"
          className="mt-0"
        />
        <p className="mb-6 text-gray-600">
          Use this form to update advisor organization details.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-gray-700"
        >
          <FormInput
            label="Advisor ID"
            id="advisorId"
            type="text"
            placeholder="Enter advisor ID"
            error={errors.advisorId}
            register={register('advisorId')}
            required={true}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Field to Update</label>
            <Popover
              open={open}
              onOpenChange={setOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-full justify-between text-sm text-gray-600',
                    errors.advisorFieldKey && 'border-red-500',
                  )}
                >
                  {getValues('advisorFieldKey')
                    ? advisorFields.find(
                        field => field.value === getValues('advisorFieldKey'),
                      )?.label
                    : 'Select field...'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {advisorFields.map(field => (
                        <CommandItem
                          key={field.value}
                          value={field.value}
                          onSelect={currentValue => {
                            setValue('advisorFieldKey', currentValue as any);
                            clearErrors('advisorFieldKey');
                            setOpen(false);
                          }}
                        >
                          {field.label}
                          <Check
                            className={cn(
                              'ml-auto',
                              getValues('advisorFieldKey') === field.value
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.advisorFieldKey && (
              <p className="text-sm text-red-500">
                Please select a field to update
              </p>
            )}
          </div>

          <FormInput
            label="New Value"
            id="advisorFieldValue"
            type="text"
            placeholder="Enter new value"
            error={errors.advisorFieldValue}
            register={register('advisorFieldValue')}
            required={true}
          />

          <PrimarySecondaryButtonContainer>
            <SubmitButton
              label="Update Field"
              className="translate-y-4"
              isLoading={status === 'loading'}
            />
          </PrimarySecondaryButtonContainer>

          <FormErrorAlert
            mainErrorMessage={errorMessage ?? ''}
            className="translate-y-4"
          />
        </form>
      </div>
      <Toast
        show={status === 'success'}
        onClose={() => dispatch(resetAdvisorAdminPortal())}
        title={successMessage ?? ''}
        autoCloseDuration={7000}
      />
    </AuthContainer>
  );
}
