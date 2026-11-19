import type { AppId } from '../../apps.registry';
import { profile, type Status, status } from '../../data';

export const PROMPT = 'silvan@macbook ~ %';
export const HISTORY_LIMIT = 20;
export const OUTPUT_LIMIT = 40;

export type Tone = 'default' | 'green' | 'red' | 'muted';

export interface Line {
  text: string;
  tone: Tone;
}

export type Effect = { type: 'open'; id: AppId } | { type: 'clear' } | { type: 'exit' };

export interface CommandResult {
  lines: Line[];
  effect?: Effect;
}

/** Was ein Befehl ausser den Argumenten wissen darf. */
export interface CommandContext {
  status: Status;
  /** true: Backend nicht erreichbar, Status kommt aus `data/`. */
  offline: boolean;
}

const DEFAULT_CONTEXT: CommandContext = { status, offline: true };

interface Command {
  run: (args: string[], ctx: CommandContext) => CommandResult;
}

const out = (text: string, tone: Tone = 'default'): Line => ({ text, tone });
const print = (...lines: Line[]): CommandResult => ({ lines });

/** Namen für `open <name>` → App. */
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

/** Zahlenfelder ohne Anführungszeichen, damit `[live]` wie ein Wert aussieht. */
export function formatStatus(s: Status): Line[] {
  const num = (v: string | number) => String(v);
  return [
    out(`{ "wishlists": ${num(s.wishlists)}, "clipsHeute": ${num(s.clipsHeute)},`, 'green'),
    out(
      `  "ipaFragen": ${num(s.ipaFragen)}, "letzterBericht": ${JSON.stringify(s.letzterBericht)} }`,
      'green',
    ),
  ];
}

const projekte = (): CommandResult =>
  print(
    out('rigged-to-riches   spiel, unity, steam'),
    out('clipper            echtzeit-bot für livestream-clips'),
    out('ipa                rag-lernassistent'),
    out('agents             multi-agent-marketing (in arbeit)'),
    out('→ open <name> zum öffnen', 'muted'),
  );

/** Befehlstabelle. Neuer Befehl = neuer Eintrag hier. */
export const COMMANDS: Record<string, Command> = {
  help: {
    run: () =>
      print(
        out('Befehle:', 'green'),
        out('  whoami          wer ich bin'),
        out('  skills          womit ich arbeite'),
        out('  motto           warum ich automatisiere'),
        out('  ls              Dateien auf dem Schreibtisch'),
        out('  projekte        alle Projekte'),
        out('  open <name>     App öffnen, z. B. open clipper'),
        out('  curl /api/status  Live-Daten aus meinem Spring-Backend'),
        out('  clear           Terminal leeren'),
      ),
  },
  whoami: {
    run: () =>
      print(
        out('silvan brors'),
        out('applikationsentwickler efz in ausbildung @ ti&m, zürich', 'muted'),
      ),
  },
  skills: {
    run: () => print(...profile.skills.map((s) => out(`${s.area.padEnd(10)}${s.items}`))),
  },
  motto: {
    run: () => print(...profile.motto.map((m) => out(m, 'green'))),
  },
  ls: {
    run: (args) =>
      args[0]?.toLowerCase().replace(/\/$/, '') === 'projekte'
        ? projekte()
        : print(out('Projekte/    Lebenslauf.pdf    Über mich.txt    Kontakt')),
  },
  projekte: { run: projekte },
  open: {
    run: (args) => {
      const name = args.join(' ').toLowerCase();
      const id = OPEN_ALIASES[name];
      if (!id) {
        return print(out(`open: ${name || '<name>'}: nicht gefunden. Versuch «projekte».`, 'red'));
      }
      return { lines: [out(`öffne ${name} …`, 'muted')], effect: { type: 'open', id } };
    },
  },
  curl: {
    run: (_args, ctx) =>
      print(
        ...formatStatus(ctx.status),
        ...(ctx.offline ? [out('# Offline-Modus: gespeicherte Daten', 'muted')] : []),
      ),
  },
  sudo: {
    run: () => print(out('Netter Versuch.', 'red')),
  },
  clear: {
    run: () => ({ lines: [], effect: { type: 'clear' } }),
  },
  exit: {
    run: () => ({ lines: [], effect: { type: 'exit' } }),
  },
};

/** Führt eine Eingabezeile aus. Gibt nur die Ausgabe zurück (ohne Echo der Eingabe). */
export function runCommand(input: string, ctx: CommandContext = DEFAULT_CONTEXT): CommandResult {
  const [name = '', ...args] = input.trim().split(/\s+/).filter(Boolean);
  if (!name) return { lines: [] };
  const command = Object.hasOwn(COMMANDS, name) ? COMMANDS[name] : undefined;
  if (!command) {
    return print(
      out(`zsh: command not found: ${name}`, 'red'),
      out('Tippe «help» für alle Befehle.', 'muted'),
    );
  }
  return command.run(args, ctx);
}

export function pushHistory(history: string[], input: string): string[] {
  const cmd = input.trim();
  return cmd ? [...history, cmd].slice(-HISTORY_LIMIT) : history;
}

/**
 * Pfeil hoch/runter im Verlauf. `index === history.length` heisst «neue Zeile».
 * Gibt den neuen Index und den Text für das Eingabefeld zurück.
 */
export function stepHistory(
  history: string[],
  index: number,
  direction: 'up' | 'down',
): { index: number; value: string } | null {
  if (history.length === 0) return null;
  if (direction === 'up') {
    const next = Math.max(0, index - 1);
    return { index: next, value: history[next] };
  }
  const next = Math.min(history.length, index + 1);
  return { index: next, value: next === history.length ? '' : history[next] };
}
