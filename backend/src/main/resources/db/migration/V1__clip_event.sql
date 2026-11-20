-- One row per clip the Clipper reports. clip_id makes retries idempotent.
create table clip_event (
    clip_id     varchar(100) primary key,
    created_at  timestamptz  not null,
    received_at timestamptz  not null default now()
);

create index clip_event_created_at_idx on clip_event (created_at);
