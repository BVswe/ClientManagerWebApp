using ClientManagerWebAPI.Models;
using ClientManagerWebAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ClientManagerWebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientTouchupController : ControllerBase
    {
        private readonly IClientTouchupRepo _clientTouchupRepo;
        public ClientTouchupController(IClientTouchupRepo clientTouchupRepo)
        {
            _clientTouchupRepo = clientTouchupRepo;
        }

        // GET: api/<ClientTouchupController>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get([FromRoute] int id)
        {
            try
            {
                IEnumerable<ClientTouchup> ct1 = await _clientTouchupRepo.GetAllClientTouchups(id);
                return Ok(ct1);
            }
            catch (Npgsql.PostgresException)
            {
                return NotFound();
            }
        }

        // POST api/<ClientTouchupController>
        [HttpPost("{id}")]
        public async Task<IActionResult> Post([FromRoute] int id, [FromBody] ClientTouchup touchup)
        {
            touchup.ClientID = id;
            try
            {
                ClientTouchup ct1 = await _clientTouchupRepo.InsertClientTouchup(touchup);
                if (ct1 == null)
                {
                    return NotFound();
                }
                return Created(Url.RouteUrl(touchup.ClientID)!, ct1);
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }

        // PUT api/<ClientTouchupController>/5
        [HttpPut("{id}/{oldTouchupDate}")]
        public async Task<IActionResult> Put([FromRoute] int id, string oldTouchupDate, [Bind (include:"TouchupDate")] ClientTouchup touchup)
        {
            try
            {
                touchup.ClientID = id;
                ClientTouchup ct1 = await _clientTouchupRepo.UpdateClientTouchup(oldTouchupDate, touchup);
                Response.Headers["Location"] = $"api/ClientPigment/{ct1.ClientID}/" + Uri.EscapeDataString(ct1.TouchupDate.ToString("yyyy-M-d"));
                if (ct1 == null)
                {
                    return NotFound();
                }
                return Ok(ct1);
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(422);
            }
        }

        // DELETE api/<ClientTouchupController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id, [FromBody] ClientTouchup touchup)
        {
            try
            {
                touchup.ClientID = id;
                ClientTouchup ct1 = await _clientTouchupRepo.DeleteClientTouchup(touchup);
                if (ct1 == null)
                {
                    return StatusCode(422);
                }
                return Ok(ct1);
            }
            catch (Npgsql.PostgresException)
            {
                return StatusCode(404);
            }
            
        }
    }
}
