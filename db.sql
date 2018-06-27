create table dtube_invite.code (
  id          int auto_increment
    primary key,
  code        varchar(64) not null,
  used        datetime    null,
  username    varchar(16) null,
  type        varchar(10) null,
  viewkey     varchar(24) null,
  credentials json        null,
  constraint code_code_uindex
  unique (code)
);

