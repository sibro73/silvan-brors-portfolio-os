import type { AnchorHTMLAttributes, MouseEvent } from 'react';

import { navigate } from './route';

interface RouteLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

/**
 * Echter Link (`<a href>`), wechselt aber ohne Neuladen. Mit Ctrl/Cmd/Shift oder Mittelklick
 * bleibt das normale Browser-Verhalten (neuer Tab).
 */
export function RouteLink({ to, onClick, children, ...rest }: RouteLinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
