using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClientManagerWebAPI.Models
{
    public class ClientPigment
    {
        [JsonIgnore]
        public int ClientID { get; set; }
        [Required]
        public string Pigment { get; set; }
    }
}
