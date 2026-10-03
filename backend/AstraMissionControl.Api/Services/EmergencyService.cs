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
    public interface IEmergencyService
    {
        Task<List<EmergencyDto>> GetAllEmergenciesAsync();
        Task<EmergencyDto?> GetEmergencyByIdAsync(int id);
        Task<GenericActionResponse> PrioritizeEmergencyAsync(int id, PrioritizeEmergencyRequest req);
        Task<GenericActionResponse> AssignRobotAsync(int id, AssignEmergencyRequest req);
        Task<GenericActionResponse> ResolveEmergencyAsync(int id, string operatorName);
    }

    public class EmergencyService : IEmergencyService
    {
        private readonly MissionDbContext _context;
        private readonly IMissionEventService _eventService;

        public EmergencyService(MissionDbContext context, IMissionEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<List<EmergencyDto>> GetAllEmergenciesAsync()
        {
            return await _context.Emergencies
                .Include(e => e.AssignedRobot)
                .OrderBy(e => e.Status == "RESOLVED" ? 1 : 0)
                .ThenByDescending(e => e.Severity == "CRITICAL" ? 4 : e.Severity == "HIGH" ? 3 : e.Severity == "MEDIUM" ? 2 : 1)
                .ThenByDescending(e => e.CreatedAt)
                .Select(e => new EmergencyDto
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
                    AssignedRobotCode = e.AssignedRobot != null ? e.AssignedRobot.RobotCode : null,
                    CreatedAt = e.CreatedAt,
                    UpdatedAt = e.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<EmergencyDto?> GetEmergencyByIdAsync(int id)
        {
            var e = await _context.Emergencies
                .Include(x => x.AssignedRobot)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (e == null) return null;

            return new EmergencyDto
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
            };
        }

        public async Task<GenericActionResponse> PrioritizeEmergencyAsync(int id, PrioritizeEmergencyRequest req)
        {
            var emergency = await _context.Emergencies.FindAsync(id);
            if (emergency == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Emergency {id} not found." };
            }

            var oldSeverity = emergency.Severity;
            emergency.Severity = req.Severity.ToUpperInvariant();
            emergency.Status = "PRIORITIZED";
            emergency.UpdatedAt = DateTime.UtcNow;

            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = req.OperatorName ?? "COMMANDER",
                ActionType = "PRIORITIZE",
                TargetType = "EMERGENCY",
                TargetId = emergency.Id.ToString(),
                Description = $"Escalated emergency '{emergency.Type}' at {emergency.LocationName} from {oldSeverity} to {emergency.Severity}.",
                Result = "SUCCESS"
            });

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("EMERGENCY_PRIORITIZED", "WARNING", $"EMERGENCY #{id} ({emergency.Type}) ESCALATED TO {emergency.Severity}");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"Emergency #{id} escalated to {emergency.Severity}.",
                Data = emergency
            };
        }

        public async Task<GenericActionResponse> AssignRobotAsync(int id, AssignEmergencyRequest req)
        {
            var emergency = await _context.Emergencies.FindAsync(id);
            if (emergency == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Emergency {id} not found." };
            }

            var robot = await _context.Robots.FindAsync(req.RobotId);
            if (robot == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Robot {req.RobotId} not found." };
            }

            emergency.AssignedRobotId = robot.Id;
            emergency.Status = "ASSIGNED";
            emergency.UpdatedAt = DateTime.UtcNow;

            robot.CurrentMission = $"DISPATCH: {emergency.Type}";
            robot.Status = "SEARCHING";
            robot.UpdatedAt = DateTime.UtcNow;

            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = req.OperatorName ?? "COMMANDER",
                ActionType = "ASSIGN",
                TargetType = "EMERGENCY",
                TargetId = emergency.Id.ToString(),
                Description = $"Assigned rover {robot.RobotCode} to emergency '{emergency.Type}' in {emergency.LocationName}.",
                Result = "SUCCESS"
            });

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("ROBOT_ASSIGNED", "INFO", $"{robot.RobotCode} ASSIGNED TO EMERGENCY: {emergency.Type}");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"{robot.RobotCode} assigned to {emergency.Type}.",
                Data = emergency
            };
        }

        public async Task<GenericActionResponse> ResolveEmergencyAsync(int id, string operatorName)
        {
            var emergency = await _context.Emergencies.FindAsync(id);
            if (emergency == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Emergency {id} not found." };
            }

            emergency.Status = "RESOLVED";
            emergency.UpdatedAt = DateTime.UtcNow;

            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = operatorName ?? "COMMANDER",
                ActionType = "RESOLVE",
                TargetType = "EMERGENCY",
                TargetId = emergency.Id.ToString(),
                Description = $"Marked emergency #{id} '{emergency.Type}' as RESOLVED.",
                Result = "SUCCESS"
            });

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("EMERGENCY_RESOLVED", "SUCCESS", $"EMERGENCY #{id} RESOLVED: {emergency.Type}");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"Emergency #{id} marked as RESOLVED.",
                Data = emergency
            };
        }
    }
}
