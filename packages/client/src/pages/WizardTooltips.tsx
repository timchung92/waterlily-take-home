
import { tooltips } from '../components/Tooltips';

export function WizardTooltips() {
  return (
    <div className="tooltips">
      <h2>Tooltips</h2>
      <ul>
        { Object.entries(tooltips).map(([key, content]) => (
          <li key={ key }>
            <h3>{ key }</h3>
            { content }
          </li>
        )) }
      </ul>
    </div>
  );
}