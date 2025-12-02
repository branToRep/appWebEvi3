using Microsoft.EntityFrameworkCore;
using webApp.Data;
using webApp.Models;

namespace webApp.Services
{
    public class HelpdeskRepository : IHelpdeskRepository
    {
        private readonly BlogDbContext _context;

        public HelpdeskRepository(BlogDbContext context)
        {
            _context = context;
        }

        //Ticket methods
        public async Task<List<Ticket>> GetAllTicketsAsync()
        {
            return await _context.Tickets
                .Include(t => t.Replies)
                .OrderByDescending(t => t.CreatedDate)
                .ToListAsync();
        }

        public async Task<Ticket?> GetTicketByIdAsync(int id)
        {
            return await _context.Tickets
                .Include(t => t.Replies)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Ticket> CreateTicketAsync(Ticket ticket)
        {
            //Set initial values
            ticket.Status = "Open";
            ticket.CreatedDate = DateTime.Now;
            
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            return ticket;
        }

        public async Task<Ticket> UpdateTicketAsync(Ticket ticket)
        {
            ticket.UpdatedDate = DateTime.Now;
            _context.Tickets.Update(ticket);
            await _context.SaveChangesAsync();
            return ticket;
        }

        public async Task<List<Ticket>> GetTicketsByStatusAsync(string status)
        {
            return await _context.Tickets
                .Include(t => t.Replies)
                .Where(t => t.Status == status)
                .OrderByDescending(t => t.CreatedDate)
                .ToListAsync();
        }

        public async Task<List<Ticket>> GetTicketsByUserAsync(string userEmail)
        {
            return await _context.Tickets
                .Include(t => t.Replies)
                .Where(t => t.SubmittedBy == userEmail)
                .OrderByDescending(t => t.CreatedDate)
                .ToListAsync();
        }

        //Reply methods
        public async Task<TicketReply> AddReplyAsync(TicketReply reply)
        {
            try
            {
                reply.CreatedDate = DateTime.Now;
                _context.TicketReplies.Add(reply);
                
                //Update the ticket's updated date
                var ticket = await _context.Tickets.FindAsync(reply.TicketId);
                if (ticket != null)
                {
                    ticket.UpdatedDate = DateTime.Now;
                    _context.Tickets.Update(ticket);
                }
                
                await _context.SaveChangesAsync();
                return reply;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in AddReplyAsync: {ex.Message}");
                throw;
            }
        }

        public async Task<List<TicketReply>> GetRepliesForTicketAsync(int ticketId)
        {
            return await _context.TicketReplies
                .Where(r => r.TicketId == ticketId)
                .OrderBy(r => r.CreatedDate)
                .ToListAsync();
        }

        //Technician methods
        public async Task<Ticket> AssignTechnicianAsync(int ticketId, string technicianName)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                throw new ArgumentException("Ticket not found");

            ticket.AssignedTechnician = technicianName;
            ticket.Status = "InProgress";
            ticket.UpdatedDate = DateTime.Now;
            
            await _context.SaveChangesAsync();
            return ticket;
        }

        public async Task<Ticket> UpdateTicketStatusAsync(int ticketId, string status)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                throw new ArgumentException("Ticket not found");

            ticket.Status = status;
            ticket.UpdatedDate = DateTime.Now;
            
            if (status == "Resolved" || status == "Closed")
            {
                ticket.ResolvedDate = DateTime.Now;
            }
            
            await _context.SaveChangesAsync();
            return ticket;
        }

        public async Task<List<Ticket>> GetTicketsAssignedToTechnicianAsync(string technicianName)
        {
            return await _context.Tickets
                .Include(t => t.Replies)
                .Where(t => t.AssignedTechnician == technicianName)
                .OrderByDescending(t => t.CreatedDate)
                .ToListAsync();
        }
    }
}