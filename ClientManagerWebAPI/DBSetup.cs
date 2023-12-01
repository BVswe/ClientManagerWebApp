﻿using Dapper;
using Microsoft.Extensions.Options;
using Npgsql;

namespace ClientManagerWebAPI
{
    public class DBSetup
    {
        private readonly IOptions<DBConnectionConfig> _connectionConfig;
        public DBSetup(IOptions<DBConnectionConfig> config)
        {
            _connectionConfig = config;
        }

        public async Task Init()
        {
            await _initDatabase();
            await _initTables();
        }
        private async Task _initDatabase()
        {
            // create database if it doesn't exist
            var connectionString = _connectionConfig.Value.DBSetup;
            using (var connection = new NpgsqlConnection(connectionString))
            {
                string sqlDbCount = $"SELECT COUNT(*) FROM pg_database WHERE datname = '{_connectionConfig.Value.DBName}';";
                int dbCount = await connection.ExecuteScalarAsync<int>(sqlDbCount);
                if (dbCount == 0)
                {
                    var sql = $"CREATE DATABASE \"{_connectionConfig.Value.DBName}\"";
                    await connection.ExecuteAsync(sql);
                }
            }
        }

        private async Task _initTables()
        {
            using (var connection = new NpgsqlConnection(_connectionConfig.Value.Default))
            {
                await _initClientTable();
                await _initClientMedia();
                await _initClientPigments();
                await _initClientTouchups();
                await _configureSearchDictionary();

                async Task _initClientTable()
                {
                    string query = @"CREATE TABLE IF NOT EXISTS clients (
                    client_id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    first_name VARCHAR NOT NULL,
                    last_name VARCHAR NOT NULL,
                    date DATE,
                    phone VARCHAR,
                    address VARCHAR,
                    email VARCHAR,
                    comments VARCHAR
                    );
                    ALTER TABLE clients ADD COLUMN IF NOT EXISTS ts TSVECTOR GENERATED ALWAYS AS
                    (
                        setweight(to_tsvector('english_nostop', first_name), 'A') || ' ' || 
                        setweight(to_tsvector('english_nostop', last_name), 'B') || ' ' || 
                        setweight(to_tsvector('english_nostop', coalesce(phone, '')), 'C')
                    ) STORED;
                    CREATE INDEX IF NOT EXISTS ts_idx ON clients USING GIN (ts);";
                    await connection.ExecuteAsync(query);
                }

                async Task _initClientMedia()
                {
                    string query = @"CREATE TABLE IF NOT EXISTS client_media (
                    client_id INT GENERATED BY DEFAULT AS IDENTITY,
                    media_name VARCHAR NOT NULL,
                    media_date DATE,
                    postop BOOLEAN,
                    avatar BOOLEAN DEFAULT false,
                    PRIMARY KEY (client_id, media_name),
                    CONSTRAINT fk_client_id FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE
                    );";

                    await connection.ExecuteAsync(query);
                }

                async Task _initClientPigments()
                {
                    string query = @"CREATE TABLE IF NOT EXISTS client_pigments (
                    client_id INT GENERATED BY DEFAULT AS IDENTITY,
                    pigment VARCHAR,
                    PRIMARY KEY(client_id, pigment),
                    CONSTRAINT fk_client_id FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE
                    );";
                    await connection.ExecuteAsync(query);
                }

                async Task _initClientTouchups()
                {
                    string query = @"CREATE TABLE IF NOT EXISTS client_touchups (
                    client_id INT GENERATED BY DEFAULT AS IDENTITY,
                    touchup_date Date,
                    PRIMARY KEY(client_id, touchup_date),
                    CONSTRAINT fk_client_id FOREIGN KEY(client_id) REFERENCES clients(client_id) ON DELETE CASCADE
                    );";
                    await connection.ExecuteAsync(query);
                }

                async Task _configureSearchDictionary()
                {
                    string query = @"DO
                                     $$BEGIN
                                        CREATE TEXT SEARCH DICTIONARY english_stem_nostop (
                                            Template = snowball
                                            , Language = english
                                        );
                                        CREATE TEXT SEARCH CONFIGURATION public.english_nostop ( COPY = pg_catalog.english );
                                        ALTER TEXT SEARCH CONFIGURATION public.english_nostop
                                           ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, hword, hword_part, word WITH english_stem_nostop;
                                     EXCEPTION
                                        WHEN unique_violation THEN
                                           NULL;
                                     END;$$;";
                    await connection.ExecuteAsync(query);
                }
            }
        }
    }
}