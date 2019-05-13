DROP TABLE IF EXISTS signaturesTable;
DROP TABLE IF EXISTS userprofilesTable;
DROP TABLE IF EXISTS usersTable;

CREATE TABLE signaturesTable (
    id SERIAL primary key,
    signature VARCHAR(100000) not null,
    user_id INTEGER not null
);

CREATE TABLE usersTable (
    id SERIAL primary key,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) not null unique,
    password VARCHAR(255) not null
);

CREATE TABLE userprofilesTable (
    id SERIAL primary key,
    age INTEGER,
    city VARCHAR(255),
    url VARCHAR(255),
    user_id INTEGER REFERENCES usersTable(id) not null unique
);
