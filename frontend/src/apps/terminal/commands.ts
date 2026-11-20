import type { AppId } from '../../apps.registry';
import { status } from '../../data';
import {
  type CommandContext,
  type CommandResult,
  runCommand as runShared,
} from '../../shared/terminal';

export {
  COMMANDS,
  formatStatus,
  HISTORY_LIMIT,
  type Line,
  OUTPUT_LIMIT,
  pushHistory,
  stepHistory,
  type Tone,
} from '../../shared/terminal';

/** Prompt im Desktop-Terminal. */
export const PROMPT = 'silvan@macbook ~ %';

/** Namen für `open <name>` → App auf dem Desktop. */
export const OPEN_ALIASES: Record<string, AppId> = {
  rtr: 'rtr',
  'rigged-to-riches': 'rtr',
  clipper: 'clipper',
  ipa: 'ipa',
  agents: 'agents',
  kontakt: 'kontakt',
  mail: 'kontakt',
  lebenslauf: 'cv',
  cv: 'cv',
  finder: 'finder',
  projekte: 'finder',
  willkommen: 'welcome',
};

/** Desktop-Terminal: gemeinsame Befehle mit den Desktop-Apps für `open`. */
export function runCommand(
  input: string,
  ctx: Omit<CommandContext<AppId>, 'aliases'> = { status, offline: true },
): CommandResult<AppId> {
  return runShared(input, { ...ctx, aliases: OPEN_ALIASES });
}
