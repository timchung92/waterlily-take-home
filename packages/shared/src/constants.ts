export const lowercaseLetters = 'abcdefghijklmnopqrstuvxyz';
export const ambiguousCharacters = 'b8g6i1lo0qds5z2';
export const numbers = '0123456789';
export const lowercaseLettersAndNumbers = lowercaseLetters + numbers;
export const unambiguousLetters = 'acefhjkmnprtuvxy';
export const unambiguousNumbers = '3479';
export const unambiguousLettersAndNumbers =
  unambiguousLetters + unambiguousNumbers;
export const allLatinLettersRegex = /[A-Za-zÀ-ÿ]+/g;
export const nonLatinLettersRegex = /[^A-Za-zÀ-ÿ]+/g;
export const allValidFileNameCharacters =
  /[!"#%&'()+,./0-9=@A-Z\[\]_a-z\{\}~-]+/g;

export const dateTimeRegex =
  /^\d{4}-\d\d-\d\d(?:T\d\d:\d\d:\d\d(?:\.\d{1,3})?Z)?$/;
export const emailRegex = /^[^ '"\<\>@]+@[^ '"\<\>@]+\.[^ '"\<\>@.]+$/;
export const millisecondsPerSecond = 1000;
export const secondsPerMinute = 60;
export const minutesPerHours = 60;
export const hoursPerDay = 24;

export const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute;
export const millisecondsPerHour = millisecondsPerMinute * minutesPerHours;
export const millisecondsPerDay = millisecondsPerHour * hoursPerDay;

export const secondsPerHour = secondsPerMinute * minutesPerHours;
export const secondsPerDay = secondsPerHour * hoursPerDay;

export const minutesPerDay = minutesPerHours * hoursPerDay;

export const emptyObject = {};
export const emptyArray = [] as any[];

export const fakeLocalJwtTokenPrefix = 'FAKE+LOCAL+JWT+TOKEN';
export const localBypassAuthStorageKey = 'DevLocalBypassAuthPayload';

export const customHiddenFieldQueryParamPrefix = 'custom_';
