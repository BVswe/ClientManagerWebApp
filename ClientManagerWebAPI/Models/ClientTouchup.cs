using ClientManagerWebAPI.Converters;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClientManagerWebAPI.Models
{
    public class ClientTouchup
    {
        [JsonIgnore]
        public int ClientID { get; set; }
        [Required, JsonConverter(typeof(DateOnlyJsonConverter))]
        public DateOnly TouchupDate { get; set; }
    }
}
