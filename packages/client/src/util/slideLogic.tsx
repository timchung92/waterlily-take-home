import { range } from 'lodash';
import { isNullUndefinedOrEmpty, SupportProviderType } from '@shared';

export const SLIDE_WHAT_IS_LTC = 0;
export const SLIDE_GETTING_STARTED = 1;
export const SLIDE_LONG_TERM_CARE_LIKELIHOOD = 2;
export const SLIDE_LONG_TERM_CARE_AGE = 3;
export const SLIDE_LONG_TERM_CARE_SPAN = 4;
export const SLIDE_FAMILY_STRUCTURE = 5;
export const SLIDE_FAMILY_SUPPORT_STRUCTURE = 6;
export const SLIDE_FAMILY_SUPPORT_PERCENT = 7;
export const SLIDE_TRAJECTORY_AMOUNT_NEEDED = 8;
export const SLIDE_OPPORTUNITIES = 9;

export const SLIDE_NAMES_BY_INDEX = {
  [SLIDE_WHAT_IS_LTC as number]: 'SLIDE_WHAT_IS_LTC',
  [SLIDE_GETTING_STARTED as number]: 'SLIDE_GETTING_STARTED',
  [SLIDE_LONG_TERM_CARE_LIKELIHOOD as number]:
    'SLIDE_LONG_TERM_CARE_LIKELIHOOD',
  [SLIDE_LONG_TERM_CARE_AGE as number]: 'SLIDE_LONG_TERM_CARE_AGE',
  [SLIDE_LONG_TERM_CARE_SPAN as number]: 'SLIDE_LONG_TERM_CARE_SPAN',
  [SLIDE_FAMILY_STRUCTURE as number]: 'SLIDE_FAMILY_STRUCTURE',
  [SLIDE_FAMILY_SUPPORT_STRUCTURE as number]: 'SLIDE_FAMILY_SUPPORT_STRUCTURE',
  [SLIDE_FAMILY_SUPPORT_PERCENT as number]: 'SLIDE_FAMILY_SUPPORT_PERCENT',
  [SLIDE_TRAJECTORY_AMOUNT_NEEDED as number]: 'SLIDE_TRAJECTORY_AMOUNT_NEEDED',
  [SLIDE_OPPORTUNITIES as number]: 'SLIDE_OPPORTUNITIES',
};

export const SLIDE_INDEX_FIRST = SLIDE_WHAT_IS_LTC;
export const SLIDE_INDEX_LAST = SLIDE_OPPORTUNITIES;

type SlideChecker = typeof checkHasSpouse;

interface SlideCheckerProps {
  checkSlideIndex: number;
  supportProviderSet: SupportProviderSet;
  //: unknown
}

export const checkHasSpouse = function checkHasSpouseMemoized(
  props: SlideCheckerProps,
): boolean {
  const {
    supportProviderSet: { supportProviders },
  } = props;
  if (!isNullUndefinedOrEmpty(supportProviders)) {
    return Boolean(
      supportProviders.some((supportProvider: SupportProvider) =>
        checkPhysicalCareIsSpouse(supportProvider),
      ),
    );
  }
  return false;
};

export const checkHasChildren = function checkHasChildrenMemoized(
  props: SlideCheckerProps,
): boolean {
  const {
    supportProviderSet: { supportProviders },
  } = props;
  return Boolean(
    supportProviders &&
      supportProviders.some((supportProvider: SupportProvider) =>
        checkPhysicalCareIsChild(supportProvider),
      ),
  );
};

export const checkHasFamily = function checkHasFamilyMemoized(
  props: SlideCheckerProps,
): boolean {
  return checkHasSpouse(props) || checkHasChildren(props);
};

function checkPhysicalCareIsSpouse(supportProvider: SupportProvider): boolean {
  return supportProvider?.supportProviderType === SupportProviderType.spouse;
}

function checkPhysicalCareIsChild(supportProvider: SupportProvider): boolean {
  return supportProvider.supportProviderType === SupportProviderType.child;
}

const showSlideChecks = {
  //
  // We never actually hide slides right now; this functionality was added due to misunderstanding
  // but we are going to need it soon to hide LTC age slides in some circumstances,
  // so only commenting out for now.
  //
  // [SLIDE_FAMILY_STRUCTURE]: checkHasFamily,
  // [SLIDE_FAMILY_SUPPORT_STRUCTURE]: checkHasFamily,
  // [SLIDE_FAMILY_SUPPORT_PERCENT]: checkHasFamily,
} as ObjectMap<SlideChecker>;

export function showSlidePrevButton(currentSlideIndex: number) {
  return currentSlideIndex > 0;
}

export function showSlideNextButton(currentSlideIndex: number) {
  return currentSlideIndex < SLIDE_INDEX_LAST;
}

export function showSlideDoneButton(currentSlideIndex: number) {
  return currentSlideIndex === SLIDE_INDEX_LAST;
}

export function showSlideAt(
  checkSlideIndex: number,
  supportProviderSet: SupportProviderSet,
) {
  const checker =
    showSlideChecks[checkSlideIndex] || ((_props: SlideCheckerProps) => true);
  return checker({ checkSlideIndex, supportProviderSet });
}

export function calcSlideIndexPrev(
  currentSlideIndex: number,
  supportProviderSet: SupportProviderSet,
) {
  return calcSlideIndexImpl(-1, currentSlideIndex, supportProviderSet);
}

export function calcSlideIndexNext(
  currentSlideIndex: number,
  supportProviderSet: SupportProviderSet,
) {
  return calcSlideIndexImpl(1, currentSlideIndex, supportProviderSet);
}

function calcSlideIndexImpl(
  direction: number,
  currentSlideIndex: number,
  supportProviderSet: SupportProviderSet,
) {
  if (direction !== -1 && direction !== 1) {
    throw new Error(
      'Internal usage error: Slide direction must be -1 or 1. ' +
        `Increment ${direction} is not valid from slide ${currentSlideIndex}.`,
    );
  }
  let nextSlideIndex = currentSlideIndex + direction;

  if (nextSlideIndex < 0 || nextSlideIndex > SLIDE_INDEX_LAST) {
    throw new Error(
      `Internal usage error: Attempted to move to invalid slide ${nextSlideIndex} from slide ${currentSlideIndex}.`,
    );
  }

  do {
    if (showSlideAt(nextSlideIndex, supportProviderSet)) {
      return nextSlideIndex;
    }
    nextSlideIndex += direction;
  } while (nextSlideIndex > 0 && nextSlideIndex < SLIDE_INDEX_LAST);

  throw new Error(
    'Internal implementation error: Looped through all slides without finding any valid ' +
      `'${direction === -1 ? 'previous' : 'next'}' slide from slide ${currentSlideIndex}.`,
  );
}

export function calcSlidesEffectiveIndex(
  currentSlideIndex: number,
  supportProviderSet: SupportProviderSet,
) {
  // -1 to convert number to index

  return (
    -1 +
    range(currentSlideIndex + 1).reduce(
      (prev, curr) => prev + (showSlideAt(curr, supportProviderSet) ? 1 : 0),
      0,
    )
  );
}

export function calcSlidesProgress(
  currentSlideIndex: number,
  supportProviderSet: SupportProviderSet,
) {
  if (isNullUndefinedOrEmpty(supportProviderSet)) {
    return 0;
  }

  const effectiveIndex = calcSlidesEffectiveIndex(
    currentSlideIndex,
    supportProviderSet,
  );
  const slideCount = calcSlidesCount(supportProviderSet);

  return ((effectiveIndex + 1) / slideCount) * 100;
}

export function calcSlidesCount(supportProviderSet: SupportProviderSet) {
  // +1 to convert index to count

  return supportProviderSet === undefined
    ? 0
    : 1 + calcSlidesEffectiveIndex(SLIDE_INDEX_LAST, supportProviderSet);
}
