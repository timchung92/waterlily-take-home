import { ALGORITHMS_ERROR } from '..';
import { ActionTag } from './ActionTag';
import StatusTagMenu from './StatusTagMenu';

interface ActionTagsProps {
  clientTags: string[];
  client: Client;
}

export function ActionTags({ clientTags, client }: ActionTagsProps) {
  return (
    <>
      {clientTags.map(clientTag => {
        if (!clientTag) {
          return null;
        } else {
          return (
            <ActionTag
              key={clientTag}
              clientTag={clientTag}
              className={undefined}
              client={client}
            />
          );
        }
      })}

      {clientTags[0] === ALGORITHMS_ERROR ? null : (
        <StatusTagMenu
          clientTags={clientTags}
          client={client}
        />
      )}
    </>
  );
}
