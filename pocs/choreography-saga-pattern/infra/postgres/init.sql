-- Creates the additional per-service databases on first boot.
-- The "orders" database is created by the POSTGRES_DB env var.
CREATE DATABASE inventory;
CREATE DATABASE payment;
