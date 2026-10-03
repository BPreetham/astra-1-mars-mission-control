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
    public interface IRecommendationService
    {
        Task<RecommendationDto?> GetActiveRecommendationAsync();
        Task<RecommendationDto> EvaluateAndGenerateRecommendationAsync();
        Task<GenericActionResponse> AcceptRecommendationAsync(int id, string operatorName);
    }

    public class RecommendationService : IRecommendationService
    {
        private readonly MissionDbContext _context;
        private readonly IMissionEventService _eventService;

        public RecommendationService(MissionDbContext context, IMissionEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<RecommendationDto?> GetActiveRecommendationAsync()
        {
            var rec = await _context.Recommendations
                .Include(r => r.Factors)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync(r => r.Status == "PENDING");

            if (rec == null)
            {
                rec = await _context.Recommendations
                    .Include(r => r.Factors)
                    .OrderByDescending(r => r.CreatedAt)
                    .FirstOrDefaultAsync();
            }

            return rec != null ? MapToDto(rec) : null;
        }

        public async Task<RecommendationDto> EvaluateAndGenerateRecommendationAsync()
        {
            // Data-Driven Decision Support Engine Algorithm:
            // 1. Evaluate Astra Signal (Max 30 pts)
            var latestAstra = await _context.AstraSignals.OrderByDescending(s => s.Timestamp).FirstOrDefaultAsync();
            double astraStrength = latestAstra?.SignalStrength ?? 85.0;
            int signalPts = (int)Math.Clamp((astraStrength / 100.0) * 30.0, 0, 30);

            // 2. Evaluate Candidate Robots for Proximity & Battery
            var operationalRobots = await _context.Robots
                .Where(r => r.Status != "OFFLINE" && r.Battery >= 20)
                .ToListAsync();

            var astraLat = latestAstra?.Latitude ?? -4.685;
            var astraLon = latestAstra?.Longitude ?? 137.575;

            Robot? bestRobot = null;
            double bestScore = -1;
            int bestDistancePts = 0;
            int bestBatteryPts = 0;
            double bestDistanceKm = 999;

            foreach (var r in operationalRobots)
            {
                // Euclidian proxy for Mars surface distance
                double dLat = (r.Latitude - astraLat) * 59.0; // ~59 km per degree on Mars
                double dLon = (r.Longitude - astraLon) * 59.0;
                double distKm = Math.Sqrt(dLat * dLat + dLon * dLon);

                // Distance Score (max 20 pts: 0km = 20pts, 10km = 0pts)
                int distPts = (int)Math.Clamp(20.0 - (distKm * 2.0), 0, 20);

                // Battery Score (max 15 pts: 100% = 15pts)
                int batPts = (int)Math.Clamp((r.Battery / 100.0) * 15.0, 0, 15);

                double combined = distPts * 1.5 + batPts;
                if (combined > bestScore)
                {
                    bestScore = combined;
                    bestRobot = r;
                    bestDistancePts = distPts;
                    bestBatteryPts = batPts;
                    bestDistanceKm = distKm;
                }
            }

            bestRobot ??= await _context.Robots.FirstAsync(r => r.RobotCode == "R-04");

            // 3. Communication Route Score (Max 15 pts)
            var activeRoutes = await _context.CommunicationRoutes.ToListAsync();
            var viableRoute = activeRoutes.FirstOrDefault(r => r.Status == "ACTIVE" || r.Status == "AVAILABLE");
            int commPts = viableRoute != null ? (int)Math.Clamp((viableRoute.SignalStrength / 100.0) * 15.0, 0, 15) : 8;

            // 4. Emergency Priority & Recovery Window Urgency (Max 20 pts)
            var criticalEmergencies = await _context.Emergencies.CountAsync(e => e.Severity == "CRITICAL" && e.Status != "RESOLVED");
            int urgencyPts = criticalEmergencies > 0 ? 18 : 12;

            int totalConfidence = signalPts + bestDistancePts + bestBatteryPts + commPts + urgencyPts;
            totalConfidence = Math.Clamp(totalConfidence, 40, 98);

            var rec = new Recommendation
            {
                Type = "RESCUE_DEPLOY",
                Priority = "CRITICAL",
                Confidence = totalConfidence,
                RecommendedAction = $"DEPLOY {bestRobot.RobotCode} TO SECTOR B-17",
                Target = bestRobot.RobotCode,
                Reason = $"Data-driven analysis identifies {bestRobot.RobotCode} ({bestRobot.Name}) as the optimal responder with {bestRobot.Battery}% battery at {bestDistanceKm:F1} km proximity under active relay coverage.",
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Recommendations.Add(rec);
            await _context.SaveChangesAsync();

            var factors = new List<RecommendationFactor>
            {
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Astra Signal Strength", FactorValue = $"{astraStrength:F0}%", Weight = 30, Contribution = signalPts, Description = "High-amplitude beacon pulse verified at Sector B-17" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Robot Proximity", FactorValue = $"{bestDistanceKm:F1} km", Weight = 20, Contribution = bestDistancePts, Description = $"{bestRobot.RobotCode} is nearest operational unit" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Battery Sufficiency", FactorValue = $"{bestRobot.Battery}%", Weight = 15, Contribution = bestBatteryPts, Description = "Adequate power for sustained localized search grid" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Communication Route", FactorValue = viableRoute?.Name ?? "Multi-Hop", Weight = 15, Contribution = commPts, Description = "Sufficient relay line-of-sight to Colony Base" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Recovery Urgency", FactorValue = "Critical Window", Weight = 20, Contribution = urgencyPts, Description = "Astra life-support recovery clock demands immediate deployment" }
            };

            _context.RecommendationFactors.AddRange(factors);
            await _context.SaveChangesAsync();

            return MapToDto(rec);
        }

        public async Task<GenericActionResponse> AcceptRecommendationAsync(int id, string operatorName)
        {
            var rec = await _context.Recommendations
                .Include(r => r.Factors)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (rec == null)
            {
                return new GenericActionResponse { Success = false, Message = $"Recommendation {id} not found." };
            }

            rec.Status = "ACCEPTED";
            rec.UpdatedAt = DateTime.UtcNow;

            // Deploy target robot
            var targetRobot = await _context.Robots.FirstOrDefaultAsync(r => r.RobotCode == rec.Target);
            if (targetRobot != null)
            {
                targetRobot.Status = "SEARCHING";
                targetRobot.CurrentMission = "ASTRA RESCUE & RECOVERY";
                targetRobot.CommunicationStatus = "CONNECTED";
                targetRobot.Latitude = -4.685;
                targetRobot.Longitude = 137.575;
                targetRobot.UpdatedAt = DateTime.UtcNow;

                _context.RobotTelemetries.Add(new RobotTelemetry
                {
                    RobotId = targetRobot.Id,
                    Battery = targetRobot.Battery - 2,
                    Latitude = targetRobot.Latitude,
                    Longitude = targetRobot.Longitude,
                    Temperature = -41.8,
                    SignalStrength = "STRONG",
                    Mission = targetRobot.CurrentMission,
                    Timestamp = DateTime.UtcNow
                });
            }

            // Update Emergency
            var astraEmergency = await _context.Emergencies.FirstOrDefaultAsync(e => e.Type.Contains("ASTRA"));
            if (astraEmergency != null && targetRobot != null)
            {
                astraEmergency.Status = "ASSIGNED";
                astraEmergency.AssignedRobotId = targetRobot.Id;
                astraEmergency.UpdatedAt = DateTime.UtcNow;
            }

            // Record Operator Action
            _context.OperatorActions.Add(new OperatorAction
            {
                OperatorName = operatorName ?? "COMMANDER",
                ActionType = "ACCEPT_RECOMMENDATION",
                TargetType = "RECOMMENDATION",
                TargetId = rec.Id.ToString(),
                Description = $"Accepted recommendation #{rec.Id}: {rec.RecommendedAction}. Deployed {rec.Target} to Sector B-17.",
                Result = "SUCCESS"
            });

            // Update Simulation State
            var sim = await _context.SimulationStates.FirstOrDefaultAsync();
            if (sim != null)
            {
                sim.CurrentStage = 10;
                sim.StageTitle = "ROBOT DEPLOYED & SEARCHING";
                sim.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("RECOMMENDATION_ACCEPTED", "SUCCESS", $"RECOMMENDATION ACCEPTED: {rec.RecommendedAction} EXECUTED BY {operatorName ?? "COMMANDER"}");

            return new GenericActionResponse
            {
                Success = true,
                Message = $"Recommendation accepted! {rec.Target} deployed to Sector B-17.",
                Data = MapToDto(rec)
            };
        }

        private static RecommendationDto MapToDto(Recommendation r) => new()
        {
            Id = r.Id,
            Type = r.Type,
            Priority = r.Priority,
            Confidence = r.Confidence,
            RecommendedAction = r.RecommendedAction,
            Target = r.Target,
            Reason = r.Reason,
            Status = r.Status,
            Factors = r.Factors.Select(f => new RecommendationFactorDto
            {
                FactorName = f.FactorName,
                FactorValue = f.FactorValue,
                Weight = f.Weight,
                Contribution = f.Contribution,
                Description = f.Description
            }).ToList()
        };
    }
}
