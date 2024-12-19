
export function fetchEnvironmentVariablesForLocalForWizard() {
  return Object.entries(process.env)
    .sort(( [ x ], [ y ]) => x.localeCompare(y) )
    .map(([ name, value ]) =>
      [
        name,
        /pass|token|key|secret/i.test(name)
          ? '#'.repeat(value?.length ?? 0)
          : value.substring(0, 200)
      ]
    );
}
