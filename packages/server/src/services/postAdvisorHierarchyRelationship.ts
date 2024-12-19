import { selectSimpleSql } from '@server/datastore/sql';
import { httpStatusCodes } from '@shared';
import { ApiExError } from '@shared';
import { appModel } from '@shared';
import {
  insertAdvisorHierarchySql,
  runQuery,
  selectAdvisorHierarchySql,
  selectMany,
  deactivateAdvisorHierarchySql,
} from 'src';

export async function postAdvisorHierarchyRelationship({
  body,
}: BodyProps<PostAdvisorHierarchyRelationshipProps>) {
  const { supervisorAdvisorEmail, subordinateAdvisorEmail, action } = body;

  // Check for supervisor advisor
  const supervisorRows = await selectMany<Advisor>(
    selectSimpleSql(appModel.tableNames.advisors, {
      advisorEmail: supervisorAdvisorEmail,
    }),
  );

  if (supervisorRows.length === 0) {
    throw new ApiExError(
      httpStatusCodes.notFound,
      `Not found - email ${supervisorAdvisorEmail} not found.`,
      {
        supervisorAdvisorEmail,
      },
    );
  }

  // Check for subordinate advisor
  const subordinateRows = await selectMany<Advisor>(
    selectSimpleSql(appModel.tableNames.advisors, {
      advisorEmail: subordinateAdvisorEmail,
    }),
  );

  if (subordinateRows.length === 0) {
    throw new ApiExError(
      httpStatusCodes.notFound,
      `Not found - email ${subordinateAdvisorEmail} not found.`,
      {
        subordinateAdvisorEmail,
      },
    );
  }

  const supervisorAdvisor = supervisorRows[0];
  const subordinateAdvisor = subordinateRows[0];

  // Check if the relationship exists
  const existingRelationship = await selectMany(
    selectAdvisorHierarchySql(
      supervisorAdvisor.advisorId,
      subordinateAdvisor.advisorId,
    ),
  );

  if (action === 'create') {
    if (existingRelationship.length > 0) {
      const exactRelationshipExists =
        existingRelationship[0].supervisorAdvisorId ===
        supervisorAdvisor.advisorId;

      throw new ApiExError(
        httpStatusCodes.badRequest,
        `${exactRelationshipExists ? 'Exact' : 'Reverse'} relationship already exists.`,
        {
          supervisorAdvisorEmail,
          subordinateAdvisorEmail,
        },
      );
    }

    await runQuery(
      insertAdvisorHierarchySql(
        supervisorAdvisor.advisorId,
        subordinateAdvisor.advisorId,
      ),
    );
  } else {
    // Delete action
    if (existingRelationship.length === 0) {
      throw new ApiExError(
        httpStatusCodes.notFound,
        'No relationship exists between these advisors.',
        {
          supervisorAdvisorEmail,
          subordinateAdvisorEmail,
        },
      );
    }

    await runQuery(
      deactivateAdvisorHierarchySql(
        supervisorAdvisor.advisorId,
        subordinateAdvisor.advisorId,
      ),
    );
  }

  return {
    advisorId: supervisorAdvisor.advisorId,
    action,
  };
}
