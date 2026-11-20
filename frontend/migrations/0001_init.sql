-- D1 (SQLite) für die Live-Daten auf silvanbrors.ch. Gleiche Tabellen wie das Spring-Backend
-- (backend/src/main/resources/db/migration), Zeiten als Unix-Millisekunden.
-- Anwenden: npx wrangler d1 migrations apply silvan-os --remote

-- Ein Eintrag pro Clip, den der Clipper meldet. clip_id macht Wiederholungen harmlos.
create table clip_event (
    clip_id     text    primary key,
    created_at  integer not null,
    received_at integer not null
);
create index clip_event_created_at_idx on clip_event (created_at);

-- Wochenberichte der Marketing-Agents. Angezeigt wird der neuste.
create table agents_report (
    id          integer primary key autoincrement,
    report      text    not null,
    received_at integer not null
);
create index agents_report_received_at_idx on agents_report (received_at desc);

-- Ein Eintrag pro beantwortete IPA-Frage. Nur der Zeitpunkt, nicht der Text der Frage.
create table ipa_question (
    id          integer primary key autoincrement,
    answered_at integer not null
);
