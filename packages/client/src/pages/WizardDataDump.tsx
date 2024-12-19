import { useSelector } from 'react-redux';
import { selectClient } from '../model';
import { yamlStringify } from '@shared/yaml';

export function WizardDataDump() {
  const client = useSelector(selectClient);

  const clientYaml = yamlStringify(client);

  return (
    <pre style={{ padding: '16px' }}>
      {clientYaml}
    </pre>
  );
}