using ClientManagerWebAPI.Models;
using ClientManagerWebAPI.Repositories.Interfaces;
using Dapper;
using Microsoft.Extensions.Options;
using Npgsql;

namespace ClientManagerWebAPI.Repositories.Repositories
{
    public class ClientTouchupRepo : IClientTouchupRepo
    {
        private readonly string _connectionString;
        public ClientTouchupRepo(IOptions<DBConnectionConfig> config)
        {
            _connectionString = config.Value.Default;
        }
        /// <summary>
        /// Deletes a ClientTouchup from the database
        /// </summary>
        /// <param name="touchup"></param>
        /// <returns>The deleted ClientTouchup as Task of type ClientTouchup or null</returns>
        /// <exception cref="Exception"></exception>
        public async Task<ClientTouchup> DeleteClientTouchup(ClientTouchup touchup)
        {
            string query = "DELETE FROM client_touchups WHERE client_id=@ClientID AND touchup_date=@TouchupDate" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                ClientTouchup deletedClient = await connection.QuerySingleOrDefaultAsync<ClientTouchup>(query, touchup);
                return deletedClient;
            }
        }
        /// <summary>
        /// Gets all ClientTouchups for a specific client
        /// </summary>
        /// <param name="id">ID of the client in the database</param>
        /// <returns>Task of type IEnumerable ClientTouchup</returns>
        public async Task<IEnumerable<ClientTouchup>> GetAllClientTouchups(int id)
        {
            string query = "SELECT client_id, touchup_date FROM client_touchups WHERE client_id=@id ORDER BY touchup_date;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                return await connection.QueryAsync<ClientTouchup>(query, new { id=id });
            }
        }
        /// <summary>
        /// Inserts a ClientTouchup into the database
        /// </summary>
        /// <param name="touchup"></param>
        /// <returns>The inserted ClientTouchup as Task of type ClientTouchup or null</returns>
        /// <exception cref="Exception"></exception>
        public async Task<ClientTouchup> InsertClientTouchup(ClientTouchup touchup)
        {
            string query = "INSERT INTO client_touchups(client_id, touchup_date)" +
                " VALUES (@ClientID, @TouchupDate)" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                ClientTouchup insertedClient = await connection.QuerySingleOrDefaultAsync<ClientTouchup>(query, touchup);
                return insertedClient;
            }
        }
        /// <summary>
        /// Updates an existing ClientTouchup in the database
        /// </summary>
        /// <param name="touchup"></param>
        /// <returns>The updated ClientTouchup as Task of type ClientTouchup or null</returns>
        /// <exception cref="Exception"></exception>
        public async Task<ClientTouchup> UpdateClientTouchup(string oldTouchupDate, ClientTouchup touchup)
        {
            string query = "UPDATE client_touchups" +
                " SET touchup_date=@TouchupDate" +
                " WHERE client_id=@ClientID AND touchup_date=@OldTouchupDate" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                Dapper.DynamicParameters parameters = new DynamicParameters(new {OldTouchupDate=DateOnly.ParseExact(oldTouchupDate, "yyyy-M-d"), ClientID = touchup.ClientID, TouchupDate = touchup.TouchupDate});
                ClientTouchup updatedClient = await connection.QuerySingleOrDefaultAsync<ClientTouchup>(query, parameters);
                return updatedClient;
            }
        }
    }
}
