using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Practice_team06.DTOs.Common;
using Practice_team06.DTOs.Ticket;
using Practice_team06.Extensions;
using Practice_team06.Models;

namespace Practice_team06.Services;

public class TicketService : ITicketService
{
    private readonly PostgresContext _context;
    private readonly IMapper _mapper;

    public TicketService(PostgresContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResult<AdminTicketDto>> GetAllTicketsAsync(BaseFilterDto filter)
    {
        var query = _context.Tickets.AsNoTracking();

        var totalCount = await query.CountAsync();

        query = query.OrderByDescending(t => t.Id);

        var items = await query
            .ApplyPagination(filter)
            .ProjectTo<AdminTicketDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return new PagedResult<AdminTicketDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page ?? 1,
            PageSize = filter.PageSize ?? 10
        };
    }

    public async Task<AdminTicketDto> GetTicketByIdAsync(int ticketId)
    {
        var result = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.Id == ticketId)
            .ProjectTo<AdminTicketDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return result ?? throw new KeyNotFoundException($"Ticket with ID {ticketId} not found.");
    }

    public async Task<TicketDto> GetTicketForUserByIdAsync(int userId, int ticketId)
    {
        var result = await _context.Tickets
            .AsNoTracking()
            .Where(t => t.Id == ticketId && t.Booking.UserId == userId)
            .ProjectTo<TicketDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        return result ?? throw new KeyNotFoundException($"Ticket with ID {ticketId} for user {userId} not found.");
    }

    public async Task RefundTicketByUserAsync(int userId, int ticketId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Booking)
            .Include(t => t.Booking.Session)
            .FirstOrDefaultAsync(t => t.Id == ticketId && t.Booking.UserId == userId);

        if (ticket == null)
            throw new KeyNotFoundException("Квиток не знайдено або ви не є його власником.");

        var timeUntilSession = ticket.Booking.Session.StartTime - DateTime.UtcNow;
        if (timeUntilSession.TotalMinutes < 30)
            throw new InvalidOperationException("Повернення можливе не пізніше ніж за 30 хвилин до початку.");

        await ExecuteRefundAsync(ticket);
    }

    public async Task RefundTicketByAdminAsync(int ticketId)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Booking)
            .FirstOrDefaultAsync(t => t.Id == ticketId);

        if (ticket == null)
            throw new KeyNotFoundException("Квиток не знайдено.");

        await ExecuteRefundAsync(ticket);
    }

    private async Task ExecuteRefundAsync(Ticket ticket)
    {
        if (!ticket.IsActive)
            throw new InvalidOperationException("Квиток вже було повернуто.");

        ticket.IsActive = false;
        
        var hasActiveTickets = await _context.Tickets
            .AnyAsync(t => t.BookingId == ticket.BookingId && t.Id != ticket.Id && t.IsActive);
        
        if (!hasActiveTickets)
        {
            ticket.Booking.Status = BookingStatus.Cancelled;
        }

        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteTicketAsync(int ticketId)
    {
        var ticket = await _context.Tickets.FindAsync(ticketId);
        if (ticket == null) throw new KeyNotFoundException($"Ticket with ID {ticketId} not found.");

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();
    }
}