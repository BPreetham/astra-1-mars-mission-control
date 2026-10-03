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
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    }

    public class DashboardService : IDashboardService
    {
        private readonly MissionDbContext _context;
        private readonly IAstraService _astraService;
        private readonly IRecommendationService _recService;
        private readonly ISignalAnalysisService _signalService;
        private readonly ISimulationService _simService;

        public DashboardService(
            MissionDbContext context,
            IAstraService astraService,
            IRecommendationService recService,
            ISignalAnalysisService signalService,
            ISimulationService simService)
        {
            _context = context;
            _astraService = astraService;
            _recService = recService;
            _signalService = signalService;
            _simService = simService;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var colony = await _context.Colonies.FirstOrDefaultAsync() ?? new Colony();
            var robots = await _context.Robots.ToListAsync();
            var emergencies = await _context.Emergencies
                .Include(e => e.AssignedRobot)
                .OrderBy(e => e.Status == "RESOLVED" ? 1 : 0)
                .ThenByDescending(e => e.Severity == "CRITICAL" ? 4 : e.Severity == "HIGH" ? 3 : 1)
                .ToListAsync();

            var commNodes = await _context.CommunicationNodes.ToListAsync();
            var oxygen = await _context.OxygenStatuses.OrderByDescending(o => o.Timestamp).FirstOrDefaultAsync() ?? new OxygenStatus();
            var resources = await _context.Resources.ToListAsync();
            var simStatus = await _simService.GetStatusAsync();
            var astraStatus = await _astraService.GetStatusAsync();
            var activeRec = await _recService.GetActiveRecommendationAsync();
            var structure = await _signalService.GetUndergroundStructureAsync();
            var recentEvents = await _context.MissionEvents
                .OrderByDescending(e => e.Timestamp)
                .Take(15)
                .Select(e => new MissionEventDto
                {
                    Id = e.Id,
                    EventType = e.EventType,
                    Severity = e.Severity,
                    Message = e.Message,
                    Timestamp = e.Timestamp
                })
                .ToListAsync();

            int onlineRobots = robots.Count(r => r.Status == "ONLINE");
            int searchingRobots = robots.Count(r => r.Status == "SEARCHING");
            int offlineRobots = robots.Count(r => r.Status == "OFFLINE");
            double avgResource = resources.Any() ? Math.Round(resources.Average(r => r.Quantity), 0) : 61.0;

            var dto = new DashboardSummaryDto
            {
                Colony = new ColonyDto
                {
                    Id = colony.Id,
                    Name = colony.Name,
                    Population = colony.Population,
                    Latitude = colony.Latitude,
                    Longitude = colony.Longitude,
                    Status = colony.Status
                },
                TopStatus = new TopStatusDto
                {
                    Oxygen = new OxygenCardDto
                    {
                        Value = oxygen.Reserve,
                        Trend = "-8.4%",
                        Status = oxygen.Status,
                        ProductionRate = oxygen.ProductionRate,
                        ConsumptionRate = oxygen.ConsumptionRate
                    },
                    Resources = new ResourcesCardDto
                    {
                        Value = avgResource,
                        Subtitle = "ESSENTIAL SUPPLIES",
                        Status = "DEGRADED"
                    },
                    Communication = new CommunicationCardDto
                    {
                        Status = "DEGRADED",
                        Subtitle = "3 RELAYS AFFECTED",
                        RelaysAffected = commNodes.Count(n => n.Status != "ONLINE"),
                        TotalRelays = commNodes.Count
                    },
                    RobotFleet = new RobotFleetCardDto
                    {
                        OnlineCount = onlineRobots,
                        TotalCount = robots.Count,
                        SearchingCount = searchingRobots,
                        OfflineCount = offlineRobots,
                        Status = "ONLINE"
                    }
                },
                RecoveryWindow = new RecoveryWindowDto
                {
                    SecondsRemaining = simStatus.SecondsRemaining,
                    FormattedCountdown = simStatus.FormattedCountdown,
                    IsExpired = simStatus.SecondsRemaining <= 0
                },
                EnergyStorm = new StormStatusDto
                {
                    Level = "CRITICAL",
                    Intensity = 94.5,
                    AffectedSector = "Sector B & C",
                    Warning = "High-energy ionospheric flux disrupting communications and autonomous guidance."
                },
                ActiveRecommendation = activeRec,
                Emergencies = emergencies.Select(e => new EmergencyDto
                {
                    Id = e.Id,
                    Type = e.Type,
                    Severity = e.Severity,
                    Description = e.Description,
                    Latitude = e.Latitude,
                    Longitude = e.Longitude,
                    LocationName = e.LocationName,
                    Status = e.Status,
                    AssignedRobotId = e.AssignedRobotId,
                    AssignedRobotCode = e.AssignedRobot?.RobotCode,
                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                }).ToList(),
                Robots = robots.Select(r => new RobotDto
                {
                    Id = r.Id,
                    RobotCode = r.RobotCode,
                    Name = r.Name,
                    Status = r.Status,
                    Battery = r.Battery,
                    Latitude = r.Latitude,
                    Longitude = r.Longitude,
                    SignalStrength = r.SignalStrength,
                    CurrentMission = r.CurrentMission,
                    CommunicationStatus = r.CommunicationStatus,
                    Temperature = -43.0,
                    UpdatedAt = r.UpdatedAt
                }).ToList(),
                CommunicationNodes = commNodes.Select(n => new CommunicationNodeDto
                {
                    Id = n.Id,
                    Name = n.Name,
                    Status = n.Status,
                    SignalStrength = n.SignalStrength,
                    Latency = n.Latency,
                    Latitude = n.Latitude,
                    Longitude = n.Longitude,
                    UpdatedAt = n.UpdatedAt
                }).ToList(),
                UndergroundStructure = structure,
                Astra = astraStatus,
                RecentEvents = recentEvents,
                Simulation = simStatus
            };

            return dto;
        }
    }
}
