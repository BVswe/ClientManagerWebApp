using ClientManagerWebAPI.Models;

namespace ClientManagerWebAPI.Repositories.Interfaces
{
    public interface IClientTouchupRepo
    {
        Task<ClientTouchup> InsertClientTouchup(ClientTouchup touchup);
        Task<ClientTouchup> UpdateClientTouchup(string oldTouchupDate, ClientTouchup touchup);
        Task<ClientTouchup> DeleteClientTouchup(ClientTouchup touchup);
        Task<IEnumerable<ClientTouchup>> GetAllClientTouchups(int id);
    }
}
