using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace webApp.Models
{
    public class TicketReply
    {
        public int Id { get; set; }
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public DateTime CreatedDate { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string CreatedBy { get; set; } = string.Empty;
        
        //FK
        public int TicketId { get; set; }
        
        public Ticket? Ticket { get; set; }
    }
}

