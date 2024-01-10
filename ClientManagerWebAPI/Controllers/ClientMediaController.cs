using ClientManagerWebAPI.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;
using Microsoft.Net.Http;
using SampleApp.Utilities;
using System.Reflection.PortableExecutable;
using System.Text;
using ClientManagerWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc.Rendering;
using ClientManagerWebAPI.Models;
using Microsoft.Extensions.ObjectPool;
using static System.Collections.Specialized.BitVector32;
using System;
using static System.Net.Mime.MediaTypeNames;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ClientManagerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientMediaController : ControllerBase
    {
        private IClientMediaRepo _clientMediaRepo;
        public ClientMediaController(IClientMediaRepo clientMediaRepo)
        {
            _clientMediaRepo = clientMediaRepo;
        }

        // GET: api/<ClientMediaController>
        [HttpGet("{id}/{fileName}")]
        public async Task<IActionResult> Get(int id, string fileName)
        {
            fileName = fileName.Replace("/", "");
            fileName = fileName.Replace(@"\", "");
            var filePath = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
            filePath = Path.Combine(filePath, id.ToString());
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            string processedFileName = Path.GetFileNameWithoutExtension(string.Join("", fileName.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_")).Replace(".", "") + ext;
            filePath = Path.Combine(filePath, processedFileName);
            string contentType = "";
            switch (ext)
            {
                case (".jpg"):
                    contentType = "image/jpeg";
                    break;
                case (".jpeg"):
                    contentType = "image/jpeg";
                    break;
                case (".png"):
                    contentType = "image/png";
                    break;
                case (".mp4"):
                    contentType = "video/mp4";
                    break;
                case (".mov"):
                    contentType = "video/quicktime";
                    break;
                case (".bmp"):
                    contentType = "image/bmp";
                    break;
                default:
                    contentType = "application/octet-stream";
                    break;
            }  
            Stream stream = await _clientMediaRepo.GetMediaStream(id, filePath);
            if (stream == null)
            {
                return StatusCode(422, "Media not found on disk");
            }
            var file = File(stream, contentType, fileName);
            if (contentType == "video/mp4" || contentType == "video/quicktime")
            {
                file.EnableRangeProcessing = true;
            }
            //Stream is cleaned up by framework - source code wraps stream in using statement.
            //See https://source.dot.net/#Microsoft.AspNetCore.Mvc.Core/src/Shared/ResultsHelpers/FileResultHelper.cs,da837f27cbb1a1a8
            return file;
        }

        // GET api/<ClientMediaController>/5
        /// <summary>
        /// Get paths for client media
        /// </summary>
        /// <param name="id"></param>
        /// <returns>Returns a list of retrieved media to then get the files from another request</returns>
        [HttpGet("{id}/names")]
        public async Task<IActionResult> Get(int id)
        {
            IEnumerable<ClientMedia> retrievedMedia = await _clientMediaRepo.GetAllMedia(id);
            return Ok(retrievedMedia);
        }


        private const long MaxFileSize = 10L * 1024L * 1024L * 1024L; // 10GB, adjust to your need

        // POST api/<ClientMediaController>
        [HttpPost("{id}")]
        [DisableFormValueModelBinding]
        [RequestSizeLimit(MaxFileSize)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
        public async Task<IActionResult> Post(int id)
        {
            ClientMedia receivedData = new ClientMedia {ClientID = id, Before = false, Avatar = false };

            if (!MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
                return BadRequest("Not a multipart request");

            var boundary = MultipartRequestHelper.GetBoundary(MediaTypeHeaderValue.Parse(Request.ContentType), 70);
            var reader = new MultipartReader(boundary, HttpContext.Request.Body);
            var section = await reader.ReadNextSectionAsync();

            while (section != null)
            {
                if (!ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition))
                    return BadRequest("No content disposition in multipart defined");
                if (!MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
                {
                    if (string.Equals(contentDisposition.Name.ToString(), "MediaDate", StringComparison.OrdinalIgnoreCase))
                    {
                        using var streamReader = new StreamReader(section.Body, Encoding.UTF8);
                        if (DateOnly.TryParseExact(streamReader.ReadToEnd(), "yyyy-M-d", out DateOnly date))
                        {
                            receivedData.MediaDate = date;
                            section = await reader.ReadNextSectionAsync();
                            continue;
                        }
                        else
                        {
                            return BadRequest("Invalid Date");
                        }
                    }
                    if (string.Equals(contentDisposition.Name.ToString(), "Before", StringComparison.OrdinalIgnoreCase))
                    {
                        using var streamReader = new StreamReader(section.Body, Encoding.UTF8);
                        if (bool.TryParse(streamReader.ReadToEnd(), out bool x))
                        {
                            receivedData.Before = x;
                            section = await reader.ReadNextSectionAsync();
                            continue;
                        }
                        else
                        {
                            return BadRequest("Invalid \"Before\" field");
                        }
                    }
                    if (string.Equals(contentDisposition.Name.ToString(), "Avatar", StringComparison.OrdinalIgnoreCase))
                    {
                        using var streamReader = new StreamReader(section.Body, Encoding.UTF8);
                        if (bool.TryParse(streamReader.ReadToEnd(), out bool x))
                        {
                            receivedData.Avatar = x;
                            section = await reader.ReadNextSectionAsync();
                            continue;
                        }
                        else
                        {
                            receivedData.Avatar = false;
                            continue;
                        }
                    }
                    return BadRequest("Incorrect information sent from client");
                }
                else
                {
                    string result = await _clientMediaRepo.InsertMediaFull(receivedData, section, receivedData.ClientID);

                    if ((result != null) && result != "Success")
                    {
                        return BadRequest(result);
                    }
                    else if (result == null)
                    {
                        return BadRequest();
                    }
                }
                section = await reader.ReadNextSectionAsync();
            }
            return Ok();
        }

        // PUT api/<ClientMediaController>/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put([FromRoute] int id, [Bind(include: "before, mediadate, medianame, avatar")] ClientMedia media)
        {
            media.ClientID = id;
            try
            {
                ClientMedia m1 = await _clientMediaRepo.UpdateClientMedia(media);
                if (m1 == null)
                {
                    return StatusCode(422);
                }
                return Ok(m1);
            }
            catch(Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }

        // DELETE api/<ClientMediaController>/5
        [HttpDelete("{id}/{fileName}")]
        public async Task<IActionResult> Delete(int id, string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            string processedFileName = Path.GetFileNameWithoutExtension(string.Join("", fileName.Split(Path.GetInvalidFileNameChars())).Replace(" ", "_")).Replace(".", "") + ext;
            ClientMedia receivedMedia = new ClientMedia() { ClientID = id,  MediaName = processedFileName };
            ClientMedia result = await _clientMediaRepo.DeleteClientMedia(receivedMedia);
            if (result == null)
            {
                return StatusCode(422,"File Not found.");
            }
            else if (result.MediaName == "Media not found on disk.")
            {
                return NotFound("Media not found on disk.");
            }
            return Ok(result);
        }
    }
}
