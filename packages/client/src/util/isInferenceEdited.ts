export function isInferenceEdited(
  client: Client,
  inferenceKey: keyof InferenceSet,
) {
  const { inferenceSet, appliedInferenceSet } = client;
  const inferenceSetVal = inferenceSet[inferenceKey];
  const appliedInferenceSetVal = appliedInferenceSet[inferenceKey];
  return inferenceSetVal !== appliedInferenceSetVal;
}
