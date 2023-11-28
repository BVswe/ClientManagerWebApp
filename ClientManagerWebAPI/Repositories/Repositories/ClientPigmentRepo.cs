using ClientManagerWebAPI.Models;
using ClientManagerWebAPI.Repositories.Interfaces;
using Dapper;
using Microsoft.Extensions.Options;
using Npgsql;

namespace ClientManagerWebAPI.Repositories.Repositories
{
    public class ClientPigmentRepo : IClientPigmentRepo
    {
        private readonly string _connectionString;
        public ClientPigmentRepo(IOptions<DBConnectionConfig> config)
        {
            _connectionString = config.Value.Default;
        }
        /// <summary>
        /// Deletes a ClientPigment from the database
        /// </summary>
        /// <param name="pigment"></param>
        /// <returns>The deleted client as a Task of type ClientPigment or null</returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<ClientPigment> DeleteClientPigment(ClientPigment pigment)
        {
            string query = "DELETE FROM client_pigments WHERE client_id=@ClientID AND pigment=@Pigment" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                ClientPigment deletedClient = await connection.QuerySingleOrDefaultAsync<ClientPigment>(query, pigment);
                return deletedClient;
            }
        }
        /// <summary>
        /// Gets all ClientPigments for a single client
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Task of type IEnumerable ClientPigment or null</returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<IEnumerable<ClientPigment>> GetAllPigments(int id)
        {
            string query = "SELECT client_id, pigment FROM client_pigments WHERE client_id=@ClientID";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                return await connection.QueryAsync<ClientPigment>(query, new {ClientID=id} );
            }
        }
        /// <summary>
        /// Inserts a ClientPigment into the database
        /// </summary>
        /// <param name="pigment"></param>
        /// <returns>The inserted ClientPigment as Task of type ClientPigment or null</returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<ClientPigment> InsertClientPigment(ClientPigment pigment)
        {
            string query = "INSERT INTO client_pigments (client_id, pigment)" +
                " VALUES (@ClientID, @Pigment)" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                ClientPigment insertedClient = await connection.QuerySingleOrDefaultAsync<ClientPigment>(query, pigment);
                return insertedClient;
            }
        }
        /// <summary>
        /// Updates a ClientPigment in the databse
        /// </summary>
        /// <param name="pigment"></param>
        /// <returns>The updated ClientPigment as Task of type ClientPigment or null</returns>
        /// <exception cref="NotImplementedException"></exception>
        public async Task<ClientPigment> UpdateClientPigment(string oldPigment, ClientPigment newPigment)
        {
            string query = "UPDATE client_pigments" +
                " SET pigment=@Pigment" +
                " WHERE client_id=@ClientID AND pigment=@OldPigment" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                Dapper.DynamicParameters parameters = new DynamicParameters(new { OldPigment=oldPigment, ClientID=newPigment.ClientID, Pigment=newPigment.Pigment });
                ClientPigment insertedClient = await connection.QuerySingleOrDefaultAsync<ClientPigment>(query, parameters);
                return insertedClient;
            }
        }
    }
}
