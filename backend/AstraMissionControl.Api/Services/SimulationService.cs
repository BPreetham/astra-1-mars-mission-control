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
    public interface ISimulationService
    {
        Task<SimulationStatusDto> GetStatusAsync();
        Task<SimulationStatusDto> StartSimulationAsync();
        Task<SimulationStatusDto> StepSimulationAsync();
        Task<GenericActionResponse> ResetSimulationAsync();
    }

    public class SimulationService : ISimulationService
    {
        private readonly MissionDbContext _context;
        private readonly IMissionEventService _eventService;

        public SimulationService(MissionDbContext context, IMissionEventService eventService)
        {
            _context = context;
            _eventService = eventService;
        }

        public async Task<SimulationStatusDto> GetStatusAsync()
        {
            var sim = await _context.SimulationStates.FirstOrDefaultAsync();
            if (sim == null)
            {
                sim = new SimulationState();
                _context.SimulationStates.Add(sim);
                await _context.SaveChangesAsync();
            }

            int sec = sim.RecoverySecondsRemaining;
            var ts = TimeSpan.FromSeconds(Math.Max(0, sec));

            return new SimulationStatusDto
            {
                CurrentStage = sim.CurrentStage,
                TotalStages = 12,
                StageTitle = sim.StageTitle,
                IsRunning = sim.IsRunning,
                SecondsRemaining = sec,
                FormattedCountdown = $"{ts.Hours:D2}:{ts.Minutes:D2}:{ts.Seconds:D2}"
            };
        }

        public async Task<SimulationStatusDto> StartSimulationAsync()
        {
            var sim = await _context.SimulationStates.FirstOrDefaultAsync();
            if (sim == null)
            {
                sim = new SimulationState();
                _context.SimulationStates.Add(sim);
            }

            sim.IsRunning = true;
            sim.CurrentStage = 1;
            sim.StageTitle = "STAGE 1: ENERGY STORM DETECTED";
            sim.RecoverySecondsRemaining = 20538;
            sim.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _eventService.LogEventAsync("SIMULATION_STARTED", "CRITICAL", "CRISIS SIMULATION ACTIVATED: SENSE -> ANALYZE -> PRIORITIZE -> ACT -> ADAPT");

            return await GetStatusAsync();
        }

        public async Task<SimulationStatusDto> StepSimulationAsync()
        {
            var sim = await _context.SimulationStates.FirstOrDefaultAsync();
            if (sim == null)
            {
                sim = new SimulationState();
                _context.SimulationStates.Add(sim);
                await _context.SaveChangesAsync();
            }

            int nextStage = sim.CurrentStage >= 12 ? 12 : sim.CurrentStage + 1;
            sim.CurrentStage = nextStage;
            sim.RecoverySecondsRemaining = Math.Max(0, sim.RecoverySecondsRemaining - 360); // 6 mins forward per step
            sim.UpdatedAt = DateTime.UtcNow;

            switch (nextStage)
            {
                case 1:
                    sim.StageTitle = "STAGE 1: ENERGY STORM DETECTED";
                    await _eventService.LogEventAsync("STORM_INTENSIFIED", "CRITICAL", "STAGE 1: Energy storm peak ionization detected in Sector B");
                    break;
                case 2:
                    sim.StageTitle = "STAGE 2: COMMUNICATION DEGRADED";
                    var relayC = await _context.CommunicationNodes.FirstOrDefaultAsync(n => n.Name.Contains("Relay C"));
                    if (relayC != null) { relayC.Status = "DEGRADED"; relayC.SignalStrength = 38.0; relayC.Latency = 890; }
                    await _eventService.LogEventAsync("COMMS_DEGRADED", "WARNING", "STAGE 2: Relay C latency climbed to 890ms, sub-carrier desynced");
                    break;
                case 3:
                    sim.StageTitle = "STAGE 3: OXYGEN PRODUCTION DROPPING";
                    var oxy = await _context.OxygenStatuses.OrderByDescending(o => o.Timestamp).FirstOrDefaultAsync();
                    if (oxy != null) { oxy.ProductionRate = 68.2; oxy.Reserve = 74.5; }
                    var o2Res = await _context.Resources.FirstOrDefaultAsync(r => r.ResourceType == "Oxygen");
                    if (o2Res != null) { o2Res.Quantity = 74.5; o2Res.ProductionRate = 68.2; }
                    await _eventService.LogEventAsync("OXYGEN_DROP", "CRITICAL", "STAGE 3: Oxygen production drop detected: Sabatier output at 68.2%");
                    break;
                case 4:
                    sim.StageTitle = "STAGE 4: ROBOTS FAILING";
                    var r7 = await _context.Robots.FirstOrDefaultAsync(r => r.RobotCode == "R-07");
                    if (r7 != null) { r7.Status = "OFFLINE"; r7.Battery = 8; r7.CommunicationStatus = "DISCONNECTED"; }
                    await _eventService.LogEventAsync("ROBOT_FAILURE", "CRITICAL", "STAGE 4: Autonomous rover R-07 offline: bus voltage collapsed");
                    break;
                case 5:
                    sim.StageTitle = "STAGE 5: ASTRA-LIKE SIGNAL DETECTED";
                    _context.AstraSignals.Add(new AstraSignal
                    {
                        Timestamp = DateTime.UtcNow,
                        Latitude = -4.685,
                        Longitude = 137.575,
                        SignalStrength = 89.4,
                        Confidence = 84.0,
                        Source = "Sub-surface Beacon",
                        Notes = "Sharp emergency transponder pulse recorded in Sector B-17"
                    });
                    await _eventService.LogEventAsync("ASTRA_PING", "CRITICAL", "STAGE 5: Astra transponder pulse localized to Sector B-17");
                    break;
                case 6:
                    sim.StageTitle = "STAGE 6: UNKNOWN STRUCTURE DETECTED";
                    var st = await _context.UndergroundStructures.FirstOrDefaultAsync();
                    if (st != null) { st.EnergySignature = 93.5; }
                    await _eventService.LogEventAsync("ANOMALY_SPIKE", "WARNING", "STAGE 6: Sub-surface structure emitting 93.5% harmonic resonance");
                    break;
                case 7:
                    sim.StageTitle = "STAGE 7: SYSTEM ANALYZES DATA";
                    await _eventService.LogEventAsync("ANALYZE_CYCLE", "INFO", "STAGE 7: Decision-support engine evaluating multi-hop routes and rover batteries");
                    break;
                case 8:
                    sim.StageTitle = "STAGE 8: RECOMMENDATION GENERATED";
                    var rec = await _context.Recommendations.FirstOrDefaultAsync(r => r.Target == "R-04");
                    if (rec != null) { rec.Status = "PENDING"; rec.Confidence = 85; }
                    await _eventService.LogEventAsync("RECOMMENDATION_READY", "INFO", "STAGE 8: Recommendation formulated: DEPLOY R-04 TO SECTOR B-17 (85% CONFIDENCE)");
                    break;
                case 9:
                    sim.StageTitle = "STAGE 9: OPERATOR ACCEPTS RECOMMENDATION";
                    await _eventService.LogEventAsync("OPERATOR_DECISION", "INFO", "STAGE 9: Operator command verified: Executing rescue vector");
                    break;
                case 10:
                    sim.StageTitle = "STAGE 10: ROBOT DEPLOYED";
                    var r4 = await _context.Robots.FirstOrDefaultAsync(r => r.RobotCode == "R-04");
                    if (r4 != null) { r4.Status = "SEARCHING"; r4.CurrentMission = "ASTRA RECOVERY OPERATION"; }
                    await _eventService.LogEventAsync("ROBOT_EN_ROUTE", "SUCCESS", "STAGE 10: R-04 underway to Sector B-17 coordinates");
                    break;
                case 11:
                    sim.StageTitle = "STAGE 11: NEW TELEMETRY RECEIVED";
                    var r4b = await _context.Robots.FirstOrDefaultAsync(r => r.RobotCode == "R-04");
                    if (r4b != null)
                    {
                        _context.RobotTelemetries.Add(new RobotTelemetry
                        {
                            RobotId = r4b.Id,
                            Battery = 51,
                            Latitude = -4.683,
                            Longitude = 137.572,
                            Temperature = -39.5,
                            SignalStrength = "STRONG",
                            Mission = "ASTRA RECOVERY OPERATION",
                            Timestamp = DateTime.UtcNow
                        });
                    }
                    await _eventService.LogEventAsync("TELEMETRY_UPDATE", "INFO", "STAGE 11: R-04 telemetry received: within 300m of beacon epicenter");
                    break;
                case 12:
                    sim.StageTitle = "STAGE 12: ASTRA SIGNAL CONFIDENCE UPDATES";
                    _context.AstraSignals.Add(new AstraSignal
                    {
                        Timestamp = DateTime.UtcNow,
                        Latitude = -4.685,
                        Longitude = 137.575,
                        SignalStrength = 94.2,
                        Confidence = 96.0,
                        Source = "Direct Local Rover Link",
                        Notes = "Proximity link established by R-04. Astra transponder confirmed!"
                    });
                    sim.IsRunning = false;
                    await _eventService.LogEventAsync("MISSION_SUCCESS", "SUCCESS", "STAGE 12: ADAPT COMPLETE: Astra transponder locked at 96% confidence!");
                    break;
            }

            await _context.SaveChangesAsync();
            return await GetStatusAsync();
        }

        public async Task<GenericActionResponse> ResetSimulationAsync()
        {
            // Clear and re-seed
            _context.SimulationStates.RemoveRange(_context.SimulationStates);
            _context.MissionEvents.RemoveRange(_context.MissionEvents);
            _context.OperatorActions.RemoveRange(_context.OperatorActions);
            _context.RecommendationFactors.RemoveRange(_context.RecommendationFactors);
            _context.Recommendations.RemoveRange(_context.Recommendations);
            _context.RobotTelemetries.RemoveRange(_context.RobotTelemetries);
            _context.Robots.RemoveRange(_context.Robots);
            _context.Emergencies.RemoveRange(_context.Emergencies);
            _context.CommunicationRoutes.RemoveRange(_context.CommunicationRoutes);
            _context.CommunicationNodes.RemoveRange(_context.CommunicationNodes);
            _context.Resources.RemoveRange(_context.Resources);
            _context.OxygenStatuses.RemoveRange(_context.OxygenStatuses);
            _context.UndergroundStructures.RemoveRange(_context.UndergroundStructures);
            _context.EnergySignals.RemoveRange(_context.EnergySignals);
            _context.AstraSignals.RemoveRange(_context.AstraSignals);
            _context.Colonies.RemoveRange(_context.Colonies);

            await _context.SaveChangesAsync();

            DbSeeder.Seed(_context);

            return new GenericActionResponse
            {
                Success = true,
                Message = "Simulation state and PostgreSQL database reset to baseline crisis parameters."
            };
        }
    }
}
