using ClientManagerWebAPI.Models;
using ClientManagerWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ClientManagerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientController : ControllerBase
    {
        private readonly IClientRepo _clientRepo;
        public ClientController(IClientRepo clientRepo)
        {
            _clientRepo = clientRepo;
        }
        // GET: api/<ClientController>
        [HttpGet]
        public async Task<IEnumerable<Client>> Get50([FromQuery] int currentOffset)
        {
            return await _clientRepo.Get50(currentOffset);
        }

        // GET: api/<ClientController>
        [HttpGet("Search")]
        public async Task<IEnumerable<Client>> SearchClients([FromQuery] string searchInput)
        {
            searchInput = searchInput.Replace(" ", "<->");
            return await _clientRepo.Search(searchInput);
        }



        // GET api/<ClientController>/5
        [HttpGet("{id}/All")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                Client c1 = await _clientRepo.GetAllInfoSingle(id);
                if (c1 == null)
                {
                    return StatusCode(422);
                }
                return Ok(c1);
            }
            catch (Npgsql.PostgresException)
            {
                return NotFound();
            }
        }

        // POST api/<ClientController>
        [HttpPost]
        public async Task<IActionResult> Post([Bind (include: "firstName, lastName, date, phone, address, email, comments")] Client client)
        {
            try
            {
                Client c1 = await _clientRepo.InsertClient(client);
                if (c1 == null)
                {
                    return NotFound();
                }
                return Ok(c1);
            }
            catch(Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }

        // PUT api/<ClientController>/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put([Bind(include: "firstName, lastName, date, phone, address, email, comments")] Client client, [FromRoute] int id)
        {
            try
            {
                client.ClientID = id;
                Client c1 = await _clientRepo.UpdateClient(client);
                if (c1 == null)
                {
                    return StatusCode(422);
                }
                return Ok(c1);
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }

        // DELETE api/<ClientController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                Client c1 = await _clientRepo.DeleteClient(id);
                if (c1 == null)
                {
                    return StatusCode(422);
                }
                return Ok(c1);
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }
    }
}
