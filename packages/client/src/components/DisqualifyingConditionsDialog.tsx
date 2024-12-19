import { Modal } from '..';
import { Fragment } from 'react';

import { Tooltip } from '@mui/material';
import { getDisqualifyingConditions } from '@shared';
import { RiSurveyLine } from 'react-icons/ri';
import { MdOutlineCancel } from 'react-icons/md';
import { IoIosCheckboxOutline } from 'react-icons/io';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type DisqualifyingConditionsDialogProps = {
  client: Client;
  open: boolean;
  onClose: () => void;
};

export function DisqualifyingConditionsDialog({
  client,
  open,
  onClose,
}: DisqualifyingConditionsDialogProps) {
  const { clientFirstName } = client;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Disqualifying Conditions"
      subTitle={`${clientFirstName} may not qualify for the following policies:`}
    >
      <DisqualifyingConditionsTable client={client} />
    </Modal>
  );
}

type DisqualifyingConditionsTableProps = {
  client: Client;
};

function DisqualifyingConditionsTable({
  client,
}: DisqualifyingConditionsTableProps) {
  const { intakeSurvey, clientFirstName } = client;
  const disqualifiedConditionGroups = getDisqualifyingConditions(intakeSurvey);

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="whitespace-nowrap py-3.5 pr-2 text-left text-xs font-semibold text-gray-900 md:text-sm"
                >
                  <span className="flex items-center gap-1 md:gap-2">
                    <RiSurveyLine className=" h-5 w-5 text-darkPurple" />
                    {clientFirstName}'s Intake Form Answers
                  </span>
                </th>
                <th
                  scope="col"
                  className=" whitespace-nowrap py-3.5 pr-2 text-left text-xs font-semibold text-gray-900 md:text-sm"
                >
                  <span className="flex items-center gap-1 md:gap-2">
                    <MdOutlineCancel className=" h-5 w-5 " />
                    Disqualifying Condition(s)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {Object.entries(disqualifiedConditionGroups).map(
                ([policy, conditionGroup]) => {
                  if (conditionGroup.length === 0) {
                    return null;
                  }
                  return (
                    <Fragment key={policy}>
                      <tr className="w-full border-t border-gray-200">
                        <th
                          scope="colgroup"
                          colSpan={5}
                          className="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-darkPurple sm:pl-3 md:text-base"
                        >
                          {policy}
                        </th>
                      </tr>

                      {conditionGroup.map((data, index) => {
                        const {
                          conditionLabels,
                          conditionDef: {
                            questionLabel,
                            questionTitle,
                            questionResponse,
                            questionResponseGenerator,
                          },
                        } = data;
                        return (
                          <tr
                            key={`${policy}-${index}`}
                            className={classNames(
                              index === 0
                                ? 'border-gray-300'
                                : 'border-gray-200',
                              'border-t',
                            )}
                          >
                            {/* intake question answer */}
                            <td className="flex flex-col gap-1 px-3 py-4 text-xs text-gray-500 md:text-sm">
                              <section
                                key={questionLabel}
                                className="mt-1 space-y-1"
                              >
                                <Tooltip
                                  title={
                                    <span className="text-xs md:text-sm">
                                      {questionTitle}
                                    </span>
                                  }
                                  placement="top-start"
                                >
                                  <p className="text-xs font-medium hover:underline md:text-sm">
                                    {questionLabel}
                                  </p>
                                </Tooltip>
                                <ul className="pr-1 text-xs text-gray-800 md:text-sm">
                                  {questionResponseGenerator ? (
                                    <ListItemsFromString
                                      text={questionResponseGenerator(
                                        intakeSurvey,
                                      )}
                                      startIcon={
                                        <IoIosCheckboxOutline className="inline-block h-3 w-3 text-gray-700" />
                                      }
                                    />
                                  ) : (
                                    <ListItemsFromString
                                      text={questionResponse ?? ''}
                                      startIcon={
                                        <IoIosCheckboxOutline className="inline-block h-3 w-3 text-gray-700" />
                                      }
                                    />
                                  )}
                                </ul>
                              </section>
                            </td>
                            {/* Policy conditions */}
                            <td className="w-[40%] py-4 pl-4 pr-3 text-xs font-medium text-gray-900 sm:pl-3 md:text-sm">
                              <ul>
                                {conditionLabels.map((condition, index) => {
                                  return (
                                    <li
                                      key={condition}
                                      className={`py-0.5`}
                                    >
                                      {condition}
                                    </li>
                                  );
                                })}
                              </ul>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

type ListItemsProps = {
  text: string;
  startIcon: JSX.Element;
  delimiter?: string;
};

function ListItemsFromString({
  text,
  delimiter,
  startIcon,
}: ListItemsProps): JSX.Element {
  const lines = text.split(delimiter ?? '\n').map((line, index) => (
    <li
      className="flex items-baseline gap-1"
      key={index}
    >
      <span className="flex-shrink-0 -translate-y-[1px]">{startIcon}</span>
      {line}
      <br />
    </li>
  ));

  return <Fragment>{lines}</Fragment>;
}
