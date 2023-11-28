using ClientManagerWebAPI.Models;
using Microsoft.AspNetCore.WebUtilities;

namespace ClientManagerWebAPI.Repositories.Interfaces
{
    public interface IClientMediaRepo
    {
        Task<ClientMedia> InsertToDB(ClientMedia media);
        Task<ClientMedia> UpdateClientMedia(ClientMedia media);
        Task<ClientMedia> DeleteClientMedia(ClientMedia media);
        Task<IEnumerable<ClientMedia>> GetAllMedia(int id);
        Task<Stream> GetMediaStream(int id, string path);
        Task<string> InsertMediaFull(ClientMedia receivedData, MultipartSection media, int clientID);
    }
}
