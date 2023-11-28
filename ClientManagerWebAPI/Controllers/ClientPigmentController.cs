using ClientManagerWebAPI.Models;
using ClientManagerWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ClientManagerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientPigmentController : ControllerBase
    {
        private readonly IClientPigmentRepo _clientPigmentRepo;
        public ClientPigmentController (IClientPigmentRepo clientPigmentRepo)
        {
            _clientPigmentRepo = clientPigmentRepo;
        }

        // GET: api/<ClientPigmentController>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            try
            {
                IEnumerable<ClientPigment> p1 = await _clientPigmentRepo.GetAllPigments(id);
                return Ok(p1);
            }
            catch (Exception)
            {
                return NotFound();
            }

        }

        // POST api/<ClientPigmentController>
        [HttpPost("{id}")]
        public async Task<IActionResult> Post([FromRoute] int id, [FromBody] ClientPigment pigment)
        {
            pigment.ClientID= id;
            try {
                ClientPigment p1 = await _clientPigmentRepo.InsertClientPigment(pigment);
                if (p1 != null)
                {
                    return Created(Url.RouteUrl(p1.ClientID)!, p1);
                }
                else
                {
                    return NotFound();
                }
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }

        // PUT api/<ClientPigmentController>/5
        [HttpPut("{id}/{origPigment}")]
        public async Task<IActionResult> Put([FromRoute] int id, [FromRoute] string origPigment, [FromBody] ClientPigment newPigment)
        {
            newPigment.ClientID = id;
            try
            {
                ClientPigment p1 = await _clientPigmentRepo.UpdateClientPigment(origPigment, newPigment);
                if (p1 != null)
                {
                    string scheme = Url.ActionContext.HttpContext.Request.Scheme;
                    Response.Headers["Location"] = $"api/ClientPigment/{newPigment.ClientID}/" + Uri.EscapeDataString(newPigment.Pigment);
                    return Ok(p1);
                }
                else
                {
                    return StatusCode(404);
                }
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }

        // DELETE api/<ClientPigmentController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id, [FromBody] ClientPigment pigment)
        {
            pigment.ClientID = id;
            try
            {
                ClientPigment p1 = await _clientPigmentRepo.DeleteClientPigment(pigment);
                if (p1 != null)
                {
                    return StatusCode(200);
                }
                else
                {
                    return StatusCode(422);
                }
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(404);
            }
        }
    }
}
