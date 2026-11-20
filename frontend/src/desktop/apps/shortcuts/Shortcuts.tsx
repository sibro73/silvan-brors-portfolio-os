import './Shortcuts.css';

import { SHORTCUT_LIST } from '../../shortcuts';

export function Shortcuts() {
  return (
    <div className="shortcuts">
      <table>
        <caption className="visually-hidden">Tastenkürzel</caption>
        <thead>
          <tr>
            <th scope="col">Tasten</th>
            <th scope="col">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUT_LIST.map((s) => (
            <tr key={s.label}>
              <td>
                <kbd>{s.keys}</kbd>
              </td>
              <td>{s.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="shortcuts__note">
        ⌘/Strg + W und ⌘/Strg + M gehen auch, wenn der Browser sie nicht selbst braucht. Kürzel
        wirken nicht, solange du im Terminal tippst.
      </p>
    </div>
  );
}
