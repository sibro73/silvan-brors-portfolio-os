import { Classic } from './classic/Classic';
import { DesktopShell } from './os/DesktopShell';
import { NARROW_QUERY, useMediaQuery } from './os/useMediaQuery';
import { useHash } from './useHash';

export const CLASSIC_HASH = '#klassisch';

/** Wechsel zwischen Desktop, Mobile (gestapelte Fenster) und Klassischer Ansicht. */
export default function App() {
  const hash = useHash();
  const narrow = useMediaQuery(NARROW_QUERY);

  if (hash === CLASSIC_HASH) return <Classic />;
  return <DesktopShell narrow={narrow} />;
}
