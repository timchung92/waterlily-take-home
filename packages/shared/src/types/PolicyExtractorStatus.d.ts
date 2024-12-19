declare type PolicyExtractorStatus =
  | 'initiated'
  | 'polling'
  | 'allRunsComplete'
  | 'error'
  | 'runComplete'
  | 'fileUploadComplete';
