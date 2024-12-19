
import { Citation, citations } from '../components/Citations';
import { SLIDE_NAMES_BY_INDEX } from '../util/slideLogic';

export function WizardCitations() {
  return (
    <div className="citations">
      <h2>Citations</h2>
      <ul>
        { Object.entries(citations).map(([key, citation]) => (
          <li key={ key }>
            <h3>Slide { SLIDE_NAMES_BY_INDEX[Number(key)] ?? key }</h3>
            <Citation citation={citation} />
          </li>
        )) }
      </ul>
    </div>
  );
}