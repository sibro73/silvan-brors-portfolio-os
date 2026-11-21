import '../simple-note.css';

import { projects } from '../../../data';
import { ProjectInfo } from '../ProjectInfo';

export function ShopOutreach() {
  const s = projects.shop;
  return (
    <div>
      <div className="note">
        <b className="mono">{s.title}</b>
        <br />
        {s.description}
      </div>
      <ProjectInfo id="shop" />
    </div>
  );
}
