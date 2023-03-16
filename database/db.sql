CREATE DATABASE sweeft WITH OWNER = postgres ENCODING = 'UTF8' LC_COLLATE = 'C' LC_CTYPE = 'C' TABLESPACE = pg_default CONNECTION
LIMIT
    = -1 IS_TEMPLATE = False;

CREATE TABLE users_tbl (
    id serial PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(100)
);

CREATE TABLE categories_tbl (
    id serial PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users_tbl(id) ON DELETE CASCADE
);

CREATE TABLE transactions_tbl (
    id serial PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users_tbl(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transaction_categories_tbl (
    id serial PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users_tbl(id) ON DELETE CASCADE,
    category_id integer REFERENCES categories_tbl(id) ON DELETE CASCADE,
    transaction_id INTEGER NOT NULL REFERENCES transactions_tbl(id) ON DELETE CASCADE
);