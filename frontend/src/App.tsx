import { MenuBar } from './os/MenuBar';

export default function App() {
  return (
    <div className="wall" style={{ minHeight: '100vh' }}>
      <MenuBar activeName="Finder" />
    </div>
  );
}
