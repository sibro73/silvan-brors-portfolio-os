import '../simple-note.css';

import { projects } from '../../data';

export function ShopOutreach() {
  const s = projects.shop;
  return (
    <div className="note">
      <b>{s.title}</b>
      <br />
      {s.description}
    </div>
  );
}
