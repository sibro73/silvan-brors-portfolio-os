-- Weekly marketing reports from the agents. The newest row is the one shown.
create table agents_report (
    id          bigserial   primary key,
    report      jsonb       not null,
    received_at timestamptz not null default now()
);

create index agents_report_received_at_idx on agents_report (received_at desc);
