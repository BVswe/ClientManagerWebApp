using ClientManagerWebAPI.Converters;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClientManagerWebAPI.Models
{
    public class ClientMedia
    {
        [JsonIgnore]
        public int ClientID { get; set; }
        [Required]
        public bool Before { get; set; }
        [Required, JsonConverter(typeof(DateOnlyJsonConverter))]
        public DateOnly MediaDate { get; set; }
        [Required]
        public string MediaName { get; set; }
        public bool Avatar { get; set; }
    }
}
