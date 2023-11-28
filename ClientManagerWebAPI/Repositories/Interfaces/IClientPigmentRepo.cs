using ClientManagerWebAPI.Models;

namespace ClientManagerWebAPI.Repositories.Interfaces
{
    public interface IClientPigmentRepo
    {
        Task<ClientPigment> InsertClientPigment(ClientPigment pigment);
        Task<ClientPigment> UpdateClientPigment(string oldPigment, ClientPigment newPigment);
        Task<ClientPigment> DeleteClientPigment(ClientPigment pigment);
        Task<IEnumerable<ClientPigment>> GetAllPigments(int id);
    }
}
