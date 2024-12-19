export function isDurationCustom(phaseCosts: SinglePhaseCosts[]) {
  return phaseCosts
    .map(phase => phase.isDurationCustom)
    .some(value => value === true);
}
