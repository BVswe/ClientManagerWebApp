using ClientManagerWebAPI.Models;
using ClientManagerWebAPI.Repositories.Interfaces;
using Dapper;
using Microsoft.Extensions.Options;
using Npgsql;
using System.Diagnostics;

namespace ClientManagerWebAPI.Repositories.Repositories
{
    public class ClientRepo : IClientRepo
    {
        private readonly string _connectionString;
        public ClientRepo(IOptions<DBConnectionConfig> config)
        {
            _connectionString = config.Value.Default;
        }
        /// <summary>
        /// Inserts a client into the database
        /// </summary>
        /// <param name="client"></param>
        /// <returns>The inserted client as Task of type Client or null</returns>
        /// <exception cref="Exception"></exception>
        public async Task<Client> InsertClient(Client client)
        {
            string query = "INSERT INTO clients (first_name, last_name, date, phone, address, email, comments)" +
                " VALUES(@FirstName, @LastName, @Date, @Phone, @Address, @Email, @Comments)" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                Client returnedClient = await connection.QuerySingleOrDefaultAsync<Client>(query, client);
                if (returnedClient != null)
                {
                    return returnedClient;
                }
                else
                {
                    throw new Exception("Failed to save client");
                }
            }
        }
        /// <summary>
        /// Updates a client in the database
        /// </summary>
        /// <param name="client"></param>
        /// <returns>The updated client info as Task of type Client or null</returns>
        /// <exception cref="Exception"></exception>
        public async Task<Client> UpdateClient(Client client)
        {
            string query = "UPDATE clients" +
                " SET first_name=@FirstName, last_name=@LastName," +
                " date=@Date, phone=@Phone, address=@Address, email=@Email, comments=@Comments" +
                " WHERE client_id=@ClientID" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                Client updatedClient = await connection.QuerySingleOrDefaultAsync<Client>(query, client);
                return updatedClient;
            }
        }
        /// <summary>
        /// Deletes a client from the database
        /// </summary>
        /// <param name="ClientID"></param>
        /// <returns>The deleted client as Task of type Client or null</returns>
        /// <exception cref="Exception"></exception>
        public async Task<Client> DeleteClient(int id)
        {
            string query = "DELETE FROM clients WHERE client_id=@ClientID" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                Client deletedClient = await connection.QuerySingleOrDefaultAsync<Client>(query, new {ClientID=id});
                return deletedClient;
            }
        }
        /// <summary>
        /// WIP, will get 50 clients offset from an inputted integer later
        /// </summary>
        /// <returns></returns>
        public async Task<IEnumerable<Client>> Get50(int currentOffset)
        {
            string query = $"SELECT clients.client_id, first_name, last_name, phone, client_media.client_id, client_media.media_name FROM clients" +
                $" LEFT JOIN client_media ON clients.client_id = client_media.client_id AND client_media.avatar = 'true'" +
                $" LIMIT 50 OFFSET {currentOffset};";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                IEnumerable<Client> retrievedClients =  await connection.QueryAsync<Client, ClientMedia, Client>(query, (client, media) =>
                {
                    if (media != null) client.Media!.Add(media);
                    return client;
                }
                , splitOn: "client_id");
                if (retrievedClients.Count() == 0)
                {
                    return null;
                }
                return retrievedClients;
            }
        }

        /// <summary>
        /// Searches the database for a client using fulltext search from PostgreSQL, or by checking the first letter of the first name
        /// </summary>
        /// <param name="searchInput"></param>
        /// <returns></returns>
        public async Task<IEnumerable<Client>> Search(string searchInput)
        {
            string query;
            if (searchInput.Length == 1)
            {
                query = $"SELECT clients.client_id, first_name, last_name, phone, client_media.client_id, client_media.media_name" +
                    $" FROM clients LEFT JOIN client_media ON clients.client_id = client_media.client_id AND client_media.avatar = 'true'" +
                    $" WHERE LOWER(first_name) LIKE LOWER('{searchInput}%') ORDER BY first_name LIMIT 50";
            }
            else {
                query = $"SELECT clients.client_id, first_name, last_name, phone, client_media.client_id, client_media.media_name, ts_rank_cd(clients.ts, query) as \"score\"" +
                    $" FROM clients LEFT JOIN client_media ON clients.client_id = client_media.client_id AND client_media.avatar = 'true'," +
                    $" to_tsquery('english_nostop', '{searchInput}:*') as query WHERE ts @@ query ORDER BY score DESC LIMIT 50;";
            }
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                IEnumerable<Client> retrievedClients = await connection.QueryAsync<Client, ClientMedia, Client>(query, (client, media) =>
                {
                    if (media != null) client.Media!.Add(media);
                    return client;
                }
                , splitOn: "client_id");
                if (retrievedClients.Count() == 0)
                {
                    return null;
                }
                return retrievedClients;
            }
        }

        /// <summary>
        /// Gets all information for a single client
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Task of type Client</returns>
        /// <exception cref="Exception"></exception>
        public async Task<Client> GetAllInfoSingle(int id)
        {
            string query = "SELECT clients.client_id, first_name, last_name, date, phone, address, email, comments," +
                " client_media.client_id, client_media.media_name, client_media.media_date, client_media.postop, client_media.avatar," +
                " client_pigments.client_id, client_pigments.pigment," +
                " client_touchups.client_id, client_touchups.touchup_date" +
                " FROM clients" +
                " LEFT JOIN client_media ON clients.client_id = client_media.client_id" +
                " LEFT JOIN client_pigments ON clients.client_id = client_pigments.client_id" +
                " LEFT JOIN client_touchups ON clients.client_id = client_touchups.client_id" +
                " WHERE clients.client_id=@ClientID;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                IEnumerable<Client> retrievedClients = await connection.QueryAsync<Client, ClientMedia, ClientPigment, ClientTouchup, Client>(query, (client, media, pigment, touchup) =>
                {
                    client.ClientID = id;
                    if (media != null) client.Media!.Add(media);
                    if (pigment != null) client.Pigments!.Add(pigment);
                    if (touchup != null) client.Touchups!.Add(touchup);
                    return client;
                }
                , new { ClientID = id }
                , splitOn: "client_id");
                if (retrievedClients.Count() == 0)
                {
                    return null;
                }
                retrievedClients.First().Media = retrievedClients.SelectMany(c => c.Media).GroupBy(m => m.MediaName).Select(m =>m.First()).ToList();
                retrievedClients.First().Pigments = retrievedClients.SelectMany(c => c.Pigments).GroupBy(p => p.Pigment).Select(p =>p.First()).ToList();
                retrievedClients.First().Touchups = retrievedClients.SelectMany(c => c.Touchups).GroupBy(t => t.TouchupDate).Select(t => t.First()).ToList();
                return retrievedClients.First();
            }
        }
    }
}
