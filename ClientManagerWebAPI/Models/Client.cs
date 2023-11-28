using ClientManagerWebAPI.Converters;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClientManagerWebAPI.Models
{
    public class Client
    {
        public int ClientID { get; set; }
        [Required]
        public string FirstName {get; set;}
        [Required]
        public string LastName { get; set; }
        [Required, JsonConverter(typeof(DateOnlyJsonConverter))]
        public DateOnly Date { get; set; }
        public string Phone { get; set; } = "";
        public string Address { get; set; } = "";
        public string Email { get; set; } = "";
        public string Comments { get; set; } = "";
        public List<ClientMedia>? Media { get; internal set; } = new List<ClientMedia>();
        public List<ClientPigment>? Pigments { get; internal set; } = new List<ClientPigment>();
        public List<ClientTouchup>? Touchups { get; internal set; } = new List <ClientTouchup>();
    }
}
