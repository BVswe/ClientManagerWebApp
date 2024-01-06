using ClientManagerWebAPI.Models;

namespace ClientManagerWebAPI.Repositories.Interfaces
{
    public interface IClientRepo
    {
        Task<Client> InsertClient(Client client);
        Task<Client> UpdateClient(Client client);
        Task<Client> DeleteClient(int id);
        Task<IEnumerable<Client>> Get10(int currentOffset);
        Task<IEnumerable<Client>> Search(string searchInput);
        Task<Client> GetAllInfoSingle(int id);
    }
}
