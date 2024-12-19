import { pick } from 'lodash';
import { mapGetOrAdd } from '@shared';

export interface ParentGatherer<T> {
  key: (row: T) => unknown;
  fields: string[];
}

export interface ChildGatherer<T> extends ParentGatherer<T> {
  associate: (parent: T, child: unknown) => void;
}

export function gatherObjects<TParent>(
  rows: TParent[],
  parentGatherer: ParentGatherer<TParent>,
  ...childGatherers: ChildGatherer<TParent>[]) {

  const parentsFound = new Map<unknown, TParent>();
  const childrenFound = childGatherers.map(_ => new Map<unknown, unknown>());

  rows.forEach(gatherRow);

  return [...parentsFound.values()];

  function gatherRow(row: TParent) {

    const parentKey = parentGatherer.key(row);
    const parent = getOrAddParent(parentKey, row);

    childGatherers.forEach((childGatherer, index) => {
      const childKey = childGatherer.key(row);
      const child = mapGetOrAdd(
        childrenFound[ index ],
        childKey,
        () => pick(row, childGatherer.fields)
      );
      childGatherer.associate(parent, child);
    });
  }

  function getOrAddParent(parentKey: unknown, row: TParent) {
    if (parentsFound.has(parentKey)) {
      return parentsFound.get(parentKey);
    }

    const parent = pick(row, parentGatherer.fields) as TParent;
    parentsFound.set(parentKey, parent);
    return parent;
  }
}
