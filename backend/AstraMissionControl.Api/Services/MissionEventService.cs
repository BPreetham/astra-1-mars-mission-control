using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AstraMissionControl.Api.Data;
using AstraMissionControl.Api.DTOs;
using AstraMissionControl.Api.Models;

namespace AstraMissionControl.Api.Services
{
    public interface IMissionEventService
    {
        Task<MissionEvent> LogEventAsync(string eventType, string severity, string message);
        Task<List<MissionEventDto>> GetRecentEventsAsync(int limit = 20);
    }

    public class MissionEventService : IMissionEventService
    {
        private readonly MissionDbContext _context;

        public MissionEventService(MissionDbContext context)
        {
            _context = context;
        }

        public async Task<MissionEvent> LogEventAsync(string eventType, string severity, string message)
        {
            var ev = new MissionEvent
            {
                EventType = eventType,
                Severity = severity,
                Message = message,
                Timestamp = DateTime.UtcNow
            };
            _context.MissionEvents.Add(ev);
            await _context.SaveChangesAsync();
            return ev;
        }

        public async Task<List<MissionEventDto>> GetRecentEventsAsync(int limit = 20)
        {
            return await _context.MissionEvents
                .OrderByDescending(e => e.Timestamp)
                .Take(limit)
                .Select(e => new MissionEventDto
                {
                    Id = e.Id,
                    EventType = e.EventType,
                    Severity = e.Severity,
                    Message = e.Message,
                    Timestamp = e.Timestamp
                })
                .ToListAsync();
        }
    }
}
