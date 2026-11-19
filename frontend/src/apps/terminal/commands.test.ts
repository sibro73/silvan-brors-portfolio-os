import { describe, expect, it } from 'vitest';

import {
  COMMANDS,
  formatStatus,
  HISTORY_LIMIT,
  OPEN_ALIASES,
  pushHistory,
  runCommand,
  stepHistory,
} from './commands';

const texts = (input: string) => runCommand(input).lines.map((l) => l.text);

describe('runCommand', () => {
  it('has every command from the plan', () => {
    for (const name of [
      'help',
      'whoami',
      'skills',
      'motto',
      'ls',
      'projekte',
      'open',
      'curl',
      'clear',
      'exit',
    ]) {
      expect(COMMANDS).toHaveProperty(name);
    }
  });

  it('help lists the commands', () => {
    const out = texts('help');
    expect(out[0]).toBe('Befehle:');
    expect(out).toContain('  open <name>     App öffnen, z. B. open clipper');
    expect(out).toContain('  curl /api/status  Live-Daten aus meinem Spring-Backend');
    expect(runCommand('help').lines[0].tone).toBe('green');
  });

  it('whoami', () => {
    expect(texts('whoami')).toEqual([
      'silvan brors',
      'applikationsentwickler efz in ausbildung @ ti&m, zürich',
    ]);
  });

  it('skills aligns the columns', () => {
    expect(texts('skills')).toEqual([
      'backend   java, spring boot, rest, sql',
      'devops    docker, linux, git, ci/cd',
      'ai        rag, agents, claude code',
      'sonst     unity, c#, python',
    ]);
  });

  it('motto', () => {
    expect(texts('motto')).toEqual([
      'was ich zweimal von hand mache,',
      'automatisiere ich beim dritten mal.',
    ]);
  });

  it('ls lists the desktop', () => {
    expect(texts('ls')).toEqual(['Projekte/    Lebenslauf.pdf    Über mich.txt    Kontakt']);
  });

  it('projekte and ls projekte list the projects', () => {
    expect(texts('projekte')).toHaveLength(5);
    expect(texts('ls projekte')).toEqual(texts('projekte'));
    expect(texts('ls Projekte/')).toEqual(texts('projekte'));
  });

  it('open resolves aliases and returns an open effect', () => {
    expect(runCommand('open clipper')).toEqual({
      lines: [{ text: 'öffne clipper …', tone: 'muted' }],
      effect: { type: 'open', id: 'clipper' },
    });
    expect(runCommand('open Mail').effect).toEqual({ type: 'open', id: 'kontakt' });
    expect(runCommand('open cv').effect).toEqual({ type: 'open', id: 'cv' });
    expect(runCommand('open rigged-to-riches').effect).toEqual({ type: 'open', id: 'rtr' });
    expect(Object.keys(OPEN_ALIASES)).toHaveLength(11);
  });

  it('open with an unknown or missing name explains what to do', () => {
    const r = runCommand('open steam');
    expect(r.effect).toBeUndefined();
    expect(r.lines).toEqual([
      { text: 'open: steam: nicht gefunden. Versuch «projekte».', tone: 'red' },
    ]);
    expect(texts('open')).toEqual(['open: <name>: nicht gefunden. Versuch «projekte».']);
  });

  it('curl prints the stored status and says it is offline', () => {
    expect(texts('curl /api/status')).toEqual([
      '{ "wishlists": [live], "clipsHeute": [live],',
      '  "ipaFragen": [live], "letzterBericht": "[Datum]" }',
      '# Offline-Modus: gespeicherte Daten',
    ]);
  });

  it('curl prints live numbers without the offline note', () => {
    const r = runCommand('curl', {
      status: { wishlists: 5, clipsHeute: 1, ipaFragen: 2, letzterBericht: '2026-11-16' },
      offline: false,
    });
    expect(r.lines.map((l) => l.text)).toEqual([
      '{ "wishlists": 5, "clipsHeute": 1,',
      '  "ipaFragen": 2, "letzterBericht": "2026-11-16" }',
    ]);
  });

  it('formatStatus prints numbers once the backend delivers them', () => {
    const lines = formatStatus({
      wishlists: 12,
      clipsHeute: 3,
      ipaFragen: 7,
      letzterBericht: '2026-11-16',
    }).map((l) => l.text);
    expect(lines).toEqual([
      '{ "wishlists": 12, "clipsHeute": 3,',
      '  "ipaFragen": 7, "letzterBericht": "2026-11-16" }',
    ]);
  });

  it('clear and exit only return effects', () => {
    expect(runCommand('clear')).toEqual({ lines: [], effect: { type: 'clear' } });
    expect(runCommand('exit')).toEqual({ lines: [], effect: { type: 'exit' } });
  });

  it('sudo', () => {
    expect(texts('sudo rm -rf /')).toEqual(['Netter Versuch.']);
  });

  it('unknown commands', () => {
    expect(runCommand('vim')).toEqual({
      lines: [
        { text: 'zsh: command not found: vim', tone: 'red' },
        { text: 'Tippe «help» für alle Befehle.', tone: 'muted' },
      ],
    });
    // keine Prototyp-Eigenschaften als Befehl
    expect(texts('toString')[0]).toBe('zsh: command not found: toString');
  });

  it('empty input prints nothing', () => {
    expect(runCommand('   ')).toEqual({ lines: [] });
  });

  it('ignores surrounding whitespace', () => {
    expect(texts('  whoami  ')).toEqual(texts('whoami'));
  });
});

describe('history', () => {
  it('pushHistory trims, skips empty input and keeps the last 20', () => {
    expect(pushHistory([], '  ls ')).toEqual(['ls']);
    expect(pushHistory(['ls'], '   ')).toEqual(['ls']);
    const many = Array.from({ length: HISTORY_LIMIT }, (_, i) => `cmd${i}`);
    const next = pushHistory(many, 'new');
    expect(next).toHaveLength(HISTORY_LIMIT);
    expect(next[0]).toBe('cmd1');
    expect(next.at(-1)).toBe('new');
  });

  it('stepHistory walks up and stops at the oldest entry', () => {
    const h = ['help', 'ls', 'motto'];
    expect(stepHistory(h, 3, 'up')).toEqual({ index: 2, value: 'motto' });
    expect(stepHistory(h, 1, 'up')).toEqual({ index: 0, value: 'help' });
    expect(stepHistory(h, 0, 'up')).toEqual({ index: 0, value: 'help' });
  });

  it('stepHistory walks down back to an empty line', () => {
    const h = ['help', 'ls'];
    expect(stepHistory(h, 0, 'down')).toEqual({ index: 1, value: 'ls' });
    expect(stepHistory(h, 1, 'down')).toEqual({ index: 2, value: '' });
    expect(stepHistory(h, 2, 'down')).toEqual({ index: 2, value: '' });
  });

  it('stepHistory does nothing without history', () => {
    expect(stepHistory([], 0, 'up')).toBeNull();
  });
});
