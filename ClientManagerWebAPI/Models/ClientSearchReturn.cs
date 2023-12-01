using ClientManagerWebAPI.Converters;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClientManagerWebAPI.Models
{
    public class ClientSearchReturn
    {
        public int ClientID { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        public string Phone { get; set; } = "";
        public string mediaName { get; set; }
    }
}
