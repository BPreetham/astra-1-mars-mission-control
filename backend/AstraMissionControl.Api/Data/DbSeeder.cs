using System;
using System.Collections.Generic;
using System.Linq;
using AstraMissionControl.Api.Models;

namespace AstraMissionControl.Api.Data
{
    public static class DbSeeder
    {
        public static void Seed(MissionDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Colonies.Any())
            {
                return; // Already seeded
            }

            var colony = new Colony
            {
                Name = "Astra-1",
                Population = 10000,
                Latitude = -4.5895,
                Longitude = 137.4417,
                Status = "CRITICAL",
                CreatedAt = DateTime.UtcNow.AddHours(-12),
                UpdatedAt = DateTime.UtcNow
            };
            context.Colonies.Add(colony);
            context.SaveChanges();

            var robots = new List<Robot>
            {
                new Robot { RobotCode = "R-01", Name = "Vanguard Alpha", Status = "ONLINE", Battery = 92, Latitude = -4.570, Longitude = 137.420, SignalStrength = "STRONG", CurrentMission = "PERIMETER PATROL", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-02", Name = "Ares Scout", Status = "ONLINE", Battery = 84, Latitude = -4.610, Longitude = 137.460, SignalStrength = "STRONG", CurrentMission = "HABITAT SCAN", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-03", Name = "Pathfinder", Status = "ONLINE", Battery = 76, Latitude = -4.595, Longitude = 137.480, SignalStrength = "MEDIUM", CurrentMission = "RELAY DIAGNOSTICS", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-04", Name = "Titan Surveyor", Status = "SEARCHING", Battery = 54, Latitude = -4.680, Longitude = 137.560, SignalStrength = "STRONG", CurrentMission = "ASTRA SEARCH", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-05", Name = "Chronos", Status = "SEARCHING", Battery = 48, Latitude = -4.660, Longitude = 137.520, SignalStrength = "MEDIUM", CurrentMission = "ASTRA SEARCH", CommunicationStatus = "DEGRADED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-06", Name = "Rover Sentinel", Status = "ONLINE", Battery = 88, Latitude = -4.550, Longitude = 137.400, SignalStrength = "STRONG", CurrentMission = "SOLAR ARRAY CHECK", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-07", Name = "Hephaestus", Status = "OFFLINE", Battery = 12, Latitude = -4.720, Longitude = 137.640, SignalStrength = "NONE", CurrentMission = "STANDBY", CommunicationStatus = "DISCONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-08", Name = "Hermes Courier", Status = "ONLINE", Battery = 67, Latitude = -4.590, Longitude = 137.430, SignalStrength = "STRONG", CurrentMission = "SUPPLY ESCORT", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-09", Name = "Olympus Guard", Status = "ONLINE", Battery = 81, Latitude = -4.580, Longitude = 137.450, SignalStrength = "STRONG", CurrentMission = "O2 GENERATOR GUARD", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-10", Name = "Atalanta Runner", Status = "ONLINE", Battery = 73, Latitude = -4.620, Longitude = 137.470, SignalStrength = "STRONG", CurrentMission = "GEOTHERMAL SURVEY", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-11", Name = "Hyperion", Status = "ONLINE", Battery = 65, Latitude = -4.640, Longitude = 137.490, SignalStrength = "MEDIUM", CurrentMission = "COMMS BACKUP", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow },
                new Robot { RobotCode = "R-12", Name = "Nyx Observer", Status = "ONLINE", Battery = 70, Latitude = -4.560, Longitude = 137.410, SignalStrength = "STRONG", CurrentMission = "ATMOSPHERIC SAMPLING", CommunicationStatus = "CONNECTED", UpdatedAt = DateTime.UtcNow }
            };
            context.Robots.AddRange(robots);
            context.SaveChanges();

            foreach (var r in robots)
            {
                context.RobotTelemetries.Add(new RobotTelemetry
                {
                    RobotId = r.Id,
                    Battery = r.Battery,
                    Latitude = r.Latitude,
                    Longitude = r.Longitude,
                    Temperature = -45.0 + (r.Battery % 8),
                    SignalStrength = r.SignalStrength,
                    Mission = r.CurrentMission,
                    Timestamp = DateTime.UtcNow
                });
            }
            context.SaveChanges();

            // Astra Signals
            var baseTime = DateTime.UtcNow;
            var astraSignals = new List<AstraSignal>
            {
                new AstraSignal { Timestamp = baseTime.AddMinutes(-50), Latitude = -4.620, Longitude = 137.510, SignalStrength = 95.0, Confidence = 95.0, Source = "Astra Primary Beacon", Notes = "Routine status ping prior to storm" },
                new AstraSignal { Timestamp = baseTime.AddMinutes(-40), Latitude = -4.640, Longitude = 137.530, SignalStrength = 91.0, Confidence = 90.0, Source = "Astra Primary Beacon", Notes = "Telemetry flutter observed" },
                new AstraSignal { Timestamp = baseTime.AddMinutes(-30), Latitude = -4.660, Longitude = 137.550, SignalStrength = 84.0, Confidence = 86.0, Source = "Sub-surface Beacon", Notes = "Signal attenuation detected" },
                new AstraSignal { Timestamp = baseTime.AddMinutes(-20), Latitude = -4.675, Longitude = 137.565, SignalStrength = 86.0, Confidence = 84.0, Source = "Sub-surface Beacon", Notes = "Secondary beacon activated" },
                new AstraSignal { Timestamp = baseTime.AddMinutes(-10), Latitude = -4.685, Longitude = 137.575, SignalStrength = 88.0, Confidence = 82.0, Source = "Sub-surface Beacon", Notes = "Sector B-17 emergency broadcast intercepted" }
            };
            context.AstraSignals.AddRange(astraSignals);

            // Energy Signals
            var energySignals = new List<EnergySignal>
            {
                new EnergySignal { Timestamp = baseTime.AddMinutes(-45), Latitude = -4.650, Longitude = 137.550, Frequency = 433.92, Strength = 75.0, SourceType = "Ionospheric Anomaly" },
                new EnergySignal { Timestamp = baseTime.AddMinutes(-30), Latitude = -4.680, Longitude = 137.580, Frequency = 433.95, Strength = 88.0, SourceType = "Plasma Discharge" },
                new EnergySignal { Timestamp = baseTime.AddMinutes(-15), Latitude = -4.700, Longitude = 137.600, Frequency = 434.10, Strength = 94.5, SourceType = "Underground Resonant Wave" }
            };
            context.EnergySignals.AddRange(energySignals);

            // Underground Structure
            var structure = new UndergroundStructure
            {
                Name = "Unidentified Anomaly Alpha",
                Latitude = -4.712,
                Longitude = 137.620,
                Depth = 340.0,
                EnergySignature = 91.0,
                Frequency = 432.85,
                Status = "UNDER INVESTIGATION",
                DetectedAt = baseTime.AddMinutes(-35)
            };
            context.UndergroundStructures.Add(structure);

            // Emergencies
            var r4 = robots.First(r => r.RobotCode == "R-04");
            var emergencies = new List<Emergency>
            {
                new Emergency { Type = "ASTRA LOCATION UNKNOWN", Severity = "CRITICAL", Description = "Astra emergency protector signal lost in storm. Recovery window is closing.", Latitude = -4.685, Longitude = 137.575, LocationName = "Sector B-17", Status = "ACTIVE", AssignedRobotId = r4.Id, CreatedAt = baseTime.AddMinutes(-45), UpdatedAt = baseTime },
                new Emergency { Type = "OXYGEN PRODUCTION DROP", Severity = "HIGH", Description = "Main Sabatier reactor O2 output degraded to 71.6% due to power fluctuating.", Latitude = -4.580, Longitude = 137.445, LocationName = "Sector A-03", Status = "ACTIVE", CreatedAt = baseTime.AddMinutes(-40), UpdatedAt = baseTime },
                new Emergency { Type = "COMMUNICATION FAILURE", Severity = "MEDIUM", Description = "Relay C-02 sub-carrier packet loss at 68% from electromagnetic interference.", Latitude = -4.630, Longitude = 137.510, LocationName = "Relay C-02", Status = "ACTIVE", CreatedAt = baseTime.AddMinutes(-35), UpdatedAt = baseTime },
                new Emergency { Type = "ROBOT R-07 POWER BUS FAILURE", Severity = "HIGH", Description = "Hephaestus immobilized after direct plasma arc hit. Battery dropped to 12%.", Latitude = -4.720, Longitude = 137.640, LocationName = "Sector C-08", Status = "ACTIVE", CreatedAt = baseTime.AddMinutes(-25), UpdatedAt = baseTime },
                new Emergency { Type = "SOLAR ARRAY DUST ACCUMULATION", Severity = "LOW", Description = "Array 4 efficiency down by 14% due to atmospheric dust displacement.", Latitude = -4.550, Longitude = 137.400, LocationName = "Sector A-01", Status = "ACTIVE", CreatedAt = baseTime.AddMinutes(-20), UpdatedAt = baseTime }
            };
            context.Emergencies.AddRange(emergencies);
            context.SaveChanges();

            // Communication Nodes
            var nodeColony = new CommunicationNode { Name = "Colony Base Hub", Status = "ONLINE", SignalStrength = 98.0, Latency = 25, Latitude = -4.5895, Longitude = 137.4417, UpdatedAt = DateTime.UtcNow };
            var nodeRelayA = new CommunicationNode { Name = "Relay A (North Sector)", Status = "ONLINE", SignalStrength = 92.0, Latency = 95, Latitude = -4.560, Longitude = 137.420, UpdatedAt = DateTime.UtcNow };
            var nodeRelayB = new CommunicationNode { Name = "Relay B (Central Ridge)", Status = "ONLINE", SignalStrength = 88.0, Latency = 110, Latitude = -4.620, Longitude = 137.480, UpdatedAt = DateTime.UtcNow };
            var nodeRelayC = new CommunicationNode { Name = "Relay C (South Crater)", Status = "DEGRADED", SignalStrength = 42.0, Latency = 830, Latitude = -4.670, Longitude = 137.540, UpdatedAt = DateTime.UtcNow };
            var nodeRelayD = new CommunicationNode { Name = "Relay D (Deep Basin)", Status = "OFFLINE", SignalStrength = 0.0, Latency = 9999, Latitude = -4.730, Longitude = 137.660, UpdatedAt = DateTime.UtcNow };

            context.CommunicationNodes.AddRange(nodeColony, nodeRelayA, nodeRelayB, nodeRelayC, nodeRelayD);
            context.SaveChanges();

            // Routes
            var routeDirect = new CommunicationRoute
            {
                Name = "Direct Trunk (Degraded)",
                Status = "DEGRADED",
                SourceNodeId = nodeColony.Id,
                DestinationNodeId = nodeRelayC.Id,
                SignalStrength = 42.0,
                Latency = 830,
                HopsPath = "Colony -> Relay C -> R-04",
                UpdatedAt = DateTime.UtcNow
            };
            var routeOptimized = new CommunicationRoute
            {
                Name = "Multi-Hop Bypass Route",
                Status = "AVAILABLE",
                SourceNodeId = nodeColony.Id,
                DestinationNodeId = nodeRelayB.Id,
                SignalStrength = 79.0,
                Latency = 210,
                HopsPath = "Colony -> Relay B -> Relay C -> R-04",
                UpdatedAt = DateTime.UtcNow
            };
            context.CommunicationRoutes.AddRange(routeDirect, routeOptimized);

            // Resources
            var resources = new List<ResourceItem>
            {
                new ResourceItem { ResourceType = "Oxygen", Quantity = 78.0, ConsumptionRate = 80.0, ProductionRate = 71.6, Status = "DEGRADED", UpdatedAt = DateTime.UtcNow },
                new ResourceItem { ResourceType = "Water", Quantity = 64.0, ConsumptionRate = 45.0, ProductionRate = 42.0, Status = "NOMINAL", UpdatedAt = DateTime.UtcNow },
                new ResourceItem { ResourceType = "Food", Quantity = 71.0, ConsumptionRate = 30.0, ProductionRate = 28.0, Status = "NOMINAL", UpdatedAt = DateTime.UtcNow },
                new ResourceItem { ResourceType = "Power", Quantity = 59.0, ConsumptionRate = 95.0, ProductionRate = 70.0, Status = "DEGRADED", UpdatedAt = DateTime.UtcNow },
                new ResourceItem { ResourceType = "Fuel", Quantity = 46.0, ConsumptionRate = 20.0, ProductionRate = 15.0, Status = "DEGRADED", UpdatedAt = DateTime.UtcNow },
                new ResourceItem { ResourceType = "Medical Supplies", Quantity = 83.0, ConsumptionRate = 10.0, ProductionRate = 0.0, Status = "NOMINAL", UpdatedAt = DateTime.UtcNow }
            };
            context.Resources.AddRange(resources);

            // Oxygen
            context.OxygenStatuses.Add(new OxygenStatus
            {
                ProductionRate = 71.6,
                ConsumptionRate = 80.0,
                Reserve = 78.0,
                Status = "DEGRADED",
                Timestamp = DateTime.UtcNow
            });

            // Recommendation
            var rec = new Recommendation
            {
                Type = "RESCUE_DEPLOY",
                Priority = "CRITICAL",
                Confidence = 82,
                RecommendedAction = "DEPLOY R-04 TO SECTOR B-17",
                Target = "R-04",
                Reason = "Strong Astra-like signal detected; R-04 is within 1.2km of sector B-17 with 54% battery and verified relay path.",
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Recommendations.Add(rec);
            context.SaveChanges();

            var factors = new List<RecommendationFactor>
            {
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Astra Signal Strength", FactorValue = "88%", Weight = 30, Contribution = 28, Description = "High-amplitude beacon pulse verified at Sector B-17" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Robot Proximity", FactorValue = "1.2 km", Weight = 20, Contribution = 18, Description = "R-04 is closest operational rover to target coordinate" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Battery Sufficiency", FactorValue = "54%", Weight = 15, Contribution = 12, Description = "Sufficient for 4.5 hours of localized search operations" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Communication Route", FactorValue = "Relay B-C Viable", Weight = 15, Contribution = 12, Description = "Multi-hop relay route Colony -> Relay B -> C gives low packet loss" },
                new RecommendationFactor { RecommendationId = rec.Id, FactorName = "Recovery Window Urgency", FactorValue = "05:42:18 remaining", Weight = 20, Contribution = 12, Description = "Critical 6-hour window rapidly depleting" }
            };
            context.RecommendationFactors.AddRange(factors);

            // Mission Events
            var events = new List<MissionEvent>
            {
                new MissionEvent { EventType = "MISSION_START", Severity = "INFO", Message = "ASTRA-1 MISSION CONTROL SYSTEM ONLINE", Timestamp = baseTime.AddMinutes(-55) },
                new MissionEvent { EventType = "ROBOT_STATUS", Severity = "WARNING", Message = "R-07 OFFLINE: POWER BUS OVERLOAD DETECTED", Timestamp = baseTime.AddMinutes(-40) },
                new MissionEvent { EventType = "STORM_ALERT", Severity = "CRITICAL", Message = "ENERGY STORM INTENSIFIED IN SECTOR B", Timestamp = baseTime.AddMinutes(-32) },
                new MissionEvent { EventType = "OXYGEN_ALERT", Severity = "WARNING", Message = "OXYGEN DROP DETECTED: SABATIER REACTOR DEGRADED", Timestamp = baseTime.AddMinutes(-25) },
                new MissionEvent { EventType = "COMMS_ALERT", Severity = "INFO", Message = "RELAY B ACTIVATED: REROUTING COMMUNICATIONS", Timestamp = baseTime.AddMinutes(-18) },
                new MissionEvent { EventType = "ASTRA_SIGNAL", Severity = "CRITICAL", Message = "ASTRA SIGNAL DETECTED IN SECTOR B-17 (88% STRENGTH)", Timestamp = baseTime.AddMinutes(-10) }
            };
            context.MissionEvents.AddRange(events);

            // Simulation State
            var simState = new SimulationState
            {
                Scenario = "CRISIS_ASTRA_ENERGY_STORM",
                CurrentStage = 1,
                StageTitle = "ENERGY STORM DETECTED",
                IsRunning = false,
                RecoverySecondsRemaining = 20538, // 05:42:18
                StartedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.SimulationStates.Add(simState);

            context.SaveChanges();
        }
    }
}
