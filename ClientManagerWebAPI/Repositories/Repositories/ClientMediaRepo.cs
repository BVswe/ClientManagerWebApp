﻿using ClientManagerWebAPI.Models;
using ClientManagerWebAPI.Repositories.Interfaces;
using Dapper;
using Microsoft.AspNetCore.Routing.Template;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Npgsql;
using System.Linq;
using System.Runtime.CompilerServices;
using static System.Collections.Specialized.BitVector32;

namespace ClientManagerWebAPI.Repositories.Repositories
{
    public class ClientMediaRepo : IClientMediaRepo
    {
        private readonly string _connectionString;
        public ClientMediaRepo(IOptions<DBConnectionConfig> config)
        {
            _connectionString = config.Value.Default;
        }
        public async Task<ClientMedia> DeleteClientMedia(ClientMedia media)
        {
            string query = "DELETE FROM client_media WHERE client_id=@ClientID AND media_name=@MediaName" +
                " RETURNING *;";
            ClientMedia deletedClient;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                deletedClient = await connection.QuerySingleOrDefaultAsync<ClientMedia>(query, media);
            }
            if (deletedClient != null)
            {
                try
                {
                    await Task.Run(() => File.Delete(deletedClient.MediaName));
                    return deletedClient;
                }
                catch (DirectoryNotFoundException)
                {
                    deletedClient.MediaName = "Media not found on disk.";
                    return deletedClient;
                }
            }
            else
            {
                return null;
            }
        }

        public async Task<IEnumerable<ClientMedia>> GetAllMedia(int id)
        {
            string query = "SELECT client_id, media_name, media_date, postop, avatar" +
                " FROM client_media WHERE client_id=@ClientID";
            IEnumerable<ClientMedia> retrievedMedia;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                retrievedMedia = await connection.QueryAsync<ClientMedia>(query, new { ClientID = id });
                foreach (var media in retrievedMedia)
                {
                    media.MediaName = Path.GetFileName(media.MediaName);
                }
            }
            return retrievedMedia;
        }

        public async Task<Stream> GetMediaStream(int id, string path)
        {
            if (!File.Exists(path))
            {
                return null;
            }
            FileStream fs = await Task.Run(() => File.Open(path, FileMode.Open));
            return fs;
        }

        public async Task<ClientMedia> InsertToDB(ClientMedia media)
        {
            string query = "INSERT INTO client_media (client_id, media_name, media_date, postop, avatar)" +
                " VALUES (@ClientID, @MediaName, @MediaDate, @PostOp, @Avatar)" +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                if (media.Avatar)
                {
                    string checkForExistingAvatar = "SELECT Count(*) FROM client_media WHERE client_id=@ClientID AND Avatar=true";
                    int i = 0;
                    using (var checkExisting = new NpgsqlConnection(_connectionString))
                    {
                       i  = Convert.ToInt32(checkExisting.ExecuteScalarAsync<int>(checkForExistingAvatar, media));
                    }
                    if (i > 0)
                    {
                        return null;
                    }
                }
                ClientMedia insertedMedia = await connection.QuerySingleOrDefaultAsync<ClientMedia>(query, media);
                return insertedMedia;
            }
        }

        public async Task<string> InsertMediaFull(ClientMedia receivedData, MultipartSection media, int clientID)
        {
            string id = clientID.ToString();
            var section = media.AsFileSection();
            string[] permittedExtensions = { ".png", ".jpg", ".jpeg", ".mp4", ".bmp", ".mov", ".mp4" };
            var ext = Path.GetExtension(section.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(ext) || !permittedExtensions.Contains(ext))
            {
                return "Invalid file type.";
            }

            //In a production environment, something like
            //file signature validation would also take place here
            var programPath = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            var clientFolder = Path.Combine(programPath, id);
            string processedFileName = Path.GetFileNameWithoutExtension(string.Join("", section.FileName.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_")).Replace(".", "") + ext;
            Directory.CreateDirectory(clientFolder);
            processedFileName = id + "-" + DateTime.Now.ToString("yyyyMMddHHmmss") + "-" + processedFileName;
            var filePath = Path.Combine(clientFolder, processedFileName);

            if (File.Exists(filePath))
            {
                return "File already exists";
            }

            using (var stream = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                await section.FileStream.CopyToAsync(stream);
            }

            receivedData.MediaName = processedFileName;
            if (await InsertToDB(receivedData) == null)
            {
                try
                {
                    await Task.Run(() => File.Delete(filePath));
                    return "An Avatar Already Exists.";
                }
                catch (DirectoryNotFoundException)
                {
                    //this catch shouldn't ever run
                    return "DirectoryNotFoundException.";
                }
                return "Error saving media information.";
            }
            return "Success";
        }

        public async Task<ClientMedia> UpdateClientMedia(ClientMedia media)
        {
            string query = "UPDATE client_media SET media_date = @MediaDate, postop = @PostOp, avatar = @Avatar" +
                " WHERE client_id = @ClientID AND media_name = @MediaName, " +
                " RETURNING *;";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                ClientMedia insertedMedia = await connection.QuerySingleOrDefaultAsync<ClientMedia>(query, media);
                return insertedMedia;
            }
        }
    }
}