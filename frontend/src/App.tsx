import './os/Desktop.css';

import { Desktop } from './os/Desktop';
import { MenuBar } from './os/MenuBar';

export default function App() {
  return (
    <div className="wall os">
      <MenuBar activeName="Finder" />
      <Desktop narrow={false} onOpen={() => {}} />
    </div>
  );
}
