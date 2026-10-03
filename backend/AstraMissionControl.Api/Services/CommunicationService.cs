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
    public interface ICommunicationService
    {
        Task<List<CommunicationNodeDto>> GetNodesAsync();
        Task<List<CommunicationRouteDto>> GetRoutesAsync();
        Task<GenericActionResponse> ActivateRouteAsync(int routeId, string operatorName);
    }

    public class CommunicationService : ICommunicationService
    {
        private readonly MissionDbContext _context;
        private readonly IMissionEventService _eventService;

        public CommunicationService(MissionDbContext context, IMissionEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<List<CommunicationNodeDto>> GetNodesAsync()
        {
            return await _context.CommunicationNodes
                .OrderBy(n => n.Id)
                .Select(n => new CommunicationNodeDto
                {
                    Id = n.Id,
                    Name = n.Name,
                    Status = n.Status,
                    SignalStrength = n.SignalStrength,
                    Latency = n.Latency,
                    Latitude = n.Latitude,
                    Longitude = n.Longitude,
                    UpdatedAt = n.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<List<CommunicationRouteDto>> GetRoutesAsync()
        {
            return await _context.CommunicationRoutes
                .OrderBy(r => r.Id)
                .Select(r => new CommunicationRouteDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Status = r.Status,
                    SourceNodeId = r.SourceNodeId,
                    DestinationNodeId = r.DestinationNodeId,
                    SignalStrength = r.SignalStrength,
                    Latency = r.Latency,
                    HopsPath = r.HopsPath,
                    UpdatedAt = r.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<GenericActionResponse> ActivateRouteAsync(int routeId, string operatorName)
        {
            var route = await _context.CommunicationRoutes.FindAsync(routeId);
            if (route == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Route {routeId} not found." };
            }

            // Deactivate other routes, activate this one
            var allRoutes = await _context.CommunicationRoutes.ToListAsync();
            foreach (var r in allRoutes)
            {
                if (r.Id == routeId)
                {
                    r.Status = "ACTIVE";
                    r.SignalStrength = 79.0;
                    r.Latency = 210;
                }
                else
                {
                    r.Status = "STANDBY";
                }
                r.UpdatedAt = DateTime.UtcNow;
            }

            // Update Relay C status from DEGRADED to NOMINAL/OPTIMIZED
            var relayC = await _context.CommunicationNodes.FirstOrDefaultAsync(n => n.Name.Contains("Relay C"));
            if (relayC != null)
            {
                relayC.Status = "ONLINE";
                relayC.SignalStrength = 79.0;
                relayC.Latency = 210;
                relayC.UpdatedAt = DateTime.UtcNow;
            }

            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = operatorName ?? "COMMANDER",
                ActionType = "ACTIVATE_ROUTE",
                TargetType = "ROUTE",
                TargetId = route.Id.ToString(),
                Description = $"Activated route '{route.Name}' ({route.HopsPath}). Latency improved: 830ms -> 210ms, Signal: 42% -> 79%.",
                Result = "SUCCESS"
            });

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("ROUTE_ACTIVATED", "SUCCESS", $"COMM ROUTE ACTIVATED: {route.HopsPath} (LATENCY: 210ms)");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"Route '{route.Name}' activated. Signal improved to 79%, latency reduced to 210ms.",
                Data = new
                {
                    Route = route,
                    MetricsBefore = new { Signal = "42%", Latency = "830 ms" },
                    MetricsAfter = new { Signal = "79%", Latency = "210 ms" }
                }
            };
        }
    }
}
