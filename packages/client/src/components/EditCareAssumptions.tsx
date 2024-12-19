import { CareStartAgeForm, FormDivider, Modal } from '..';
import useDisableNumberInputScroll from '../util/useDisableNumberInputScroll';

import { CarePhaseDurationsForm } from './CarePhaseDurationsForm';

type EditCareAssumptionsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function EditCareAssumptionsModal({
  open,
  setOpen,
}: EditCareAssumptionsProps) {
  useDisableNumberInputScroll();
  return (
    <Modal
      title="Edit Care Assumptions"
      subTitle="Edit the assumptions that influence your cost"
      open={open}
      onClose={() => setOpen(false)}
      width="md"
    >
      <div className="my-6">
        <CareStartAgeForm open={open} />
        <FormDivider />
        <CarePhaseDurationsForm open={open} />
      </div>
    </Modal>
  );
}
