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
    public interface IRobotService
    {
        Task<List<RobotDto>> GetAllRobotsAsync();
        Task<RobotDto?> GetRobotByIdAsync(int id);
        Task<GenericActionResponse> DeployRobotAsync(int id, DeployRobotRequest req);
        Task<GenericActionResponse> ReturnRobotAsync(int id, string operatorName);
        Task<GenericActionResponse> ChangeMissionAsync(int id, ChangeMissionRequest req);
        Task<List<RobotTelemetry>> GetRobotTelemetryAsync(int id);
    }

    public class RobotService : IRobotService
    {
        private readonly MissionDbContext _context;
        private readonly IMissionEventService _eventService;

        public RobotService(MissionDbContext context, IMissionEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<List<RobotDto>> GetAllRobotsAsync()
        {
            var robots = await _context.Robots
                .OrderBy(r => r.RobotCode)
                .ToListAsync();

            return robots.Select(MapToDto).ToList();
        }

        public async Task<RobotDto?> GetRobotByIdAsync(int id)
        {
            var r = await _context.Robots.FindAsync(id);
            return r != null ? MapToDto(r) : null;
        }

        public async Task<GenericActionResponse> DeployRobotAsync(int id, DeployRobotRequest req)
        {
            var robot = await _context.Robots.FindAsync(id);
            if (robot == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Robot with ID {id} not found." };
            }

            if (robot.Status == "OFFLINE" || robot.Battery < 15)
            {
                return new GenericActionResponse { Success = false, Message = $"Cannot deploy {robot.RobotCode}: Critical battery or offline status ({robot.Battery}%)." };
            }

            robot.Status = "SEARCHING";
            robot.CurrentMission = string.IsNullOrWhiteSpace(req.Mission) ? "ASTRA SEARCH" : req.Mission;
            robot.CommunicationStatus = "CONNECTED";
            if (req.Latitude.HasValue) robot.Latitude = req.Latitude.Value;
            if (req.Longitude.HasValue) robot.Longitude = req.Longitude.Value;
            robot.UpdatedAt = DateTime.UtcNow;

            // Log Telemetry
            _context.RobotTelemetries.Add(new RobotTelemetry
            {
                RobotId = robot.Id,
                Battery = robot.Battery,
                Latitude = robot.Latitude,
                Longitude = robot.Longitude,
                Temperature = -42.0,
                SignalStrength = robot.SignalStrength,
                Mission = robot.CurrentMission,
                Timestamp = DateTime.UtcNow
            });

            // Log Operator Action
            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = req.OperatorName ?? "COMMANDER",
                ActionType = "DEPLOY",
                TargetType = "ROBOT",
                TargetId = robot.RobotCode,
                Description = $"Deployed {robot.RobotCode} ({robot.Name}) to {req.TargetSector} for {robot.CurrentMission}.",
                Result = "SUCCESS"
            });

            await _context.SaveChangesAsync();

            await _eventService.LogEventAsync("ROBOT_DEPLOYED", "INFO", $"{robot.RobotCode} DEPLOYED TO {req.TargetSector} FOR {robot.CurrentMission}");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"{robot.RobotCode} successfully deployed to {req.TargetSector}.",
                Data = MapToDto(robot)
            };
        }

        public async Task<GenericActionResponse> ReturnRobotAsync(int id, string operatorName)
        {
            var robot = await _context.Robots.FindAsync(id);
            if (robot == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Robot {id} not found." };
            }

            robot.Status = "RETURNING";
            robot.CurrentMission = "RETURN TO BASE";
            robot.UpdatedAt = DateTime.UtcNow;

            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = operatorName ?? "COMMANDER",
                ActionType = "RETURN",
                TargetType = "ROBOT",
                TargetId = robot.RobotCode,
                Description = $"Ordered {robot.RobotCode} to return to base habitat.",
                Result = "SUCCESS"
            });

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("ROBOT_RETURN", "INFO", $"{robot.RobotCode} ORDERED RETURN TO HABITAT BASE");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"{robot.RobotCode} returning to base.",
                Data = MapToDto(robot)
            };
        }

        public async Task<GenericActionResponse> ChangeMissionAsync(int id, ChangeMissionRequest req)
        {
            var robot = await _context.Robots.FindAsync(id);
            if (robot == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Robot {id} not found." };
            }

            robot.CurrentMission = req.Mission;
            robot.UpdatedAt = DateTime.UtcNow;

            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = req.OperatorName ?? "COMMANDER",
                ActionType = "CHANGE_MISSION",
                TargetType = "ROBOT",
                TargetId = robot.RobotCode,
                Description = $"Updated {robot.RobotCode} mission profile to '{req.Mission}'.",
                Result = "SUCCESS"
            });

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("MISSION_UPDATE", "INFO", $"{robot.RobotCode} MISSION UPDATED TO: {req.Mission}");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"Updated mission for {robot.RobotCode}.",
                Data = MapToDto(robot)
            };
        }

        public async Task<List<RobotTelemetry>> GetRobotTelemetryAsync(int id)
        {
            return await _context.RobotTelemetries
                .Where(t => t.RobotId == id)
                .OrderByDescending(t => t.Timestamp)
                .Take(50)
                .ToListAsync();
        }

        private static RobotDto MapToDto(Robot r) => new()
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
            Temperature = -43.2 + (r.Battery % 7),
            UpdatedAt = r.UpdatedAt
        };
    }
}
