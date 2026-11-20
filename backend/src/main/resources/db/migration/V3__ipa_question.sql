-- One row per answered IPA question. Only the time: the question text is not stored.
create table ipa_question (
    id          bigserial   primary key,
    answered_at timestamptz not null default now()
);
