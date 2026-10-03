using System;
using System.Collections.Generic;
using AstraMissionControl.Api.Models;

namespace AstraMissionControl.Api.DTOs
{
    public class DashboardSummaryDto
    {
        public ColonyDto Colony { get; set; } = new();
        public TopStatusDto TopStatus { get; set; } = new();
        public RecoveryWindowDto RecoveryWindow { get; set; } = new();
        public StormStatusDto EnergyStorm { get; set; } = new();
        public RecommendationDto? ActiveRecommendation { get; set; }
        public List<EmergencyDto> Emergencies { get; set; } = new();
        public List<RobotDto> Robots { get; set; } = new();
        public List<CommunicationNodeDto> CommunicationNodes { get; set; } = new();
        public UndergroundStructureDto? UndergroundStructure { get; set; }
        public AstraStatusDto Astra { get; set; } = new();
        public List<MissionEventDto> RecentEvents { get; set; } = new();
        public SimulationStatusDto Simulation { get; set; } = new();
    }

    public class ColonyDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Population { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class TopStatusDto
    {
        public OxygenCardDto Oxygen { get; set; } = new();
        public ResourcesCardDto Resources { get; set; } = new();
        public CommunicationCardDto Communication { get; set; } = new();
        public RobotFleetCardDto RobotFleet { get; set; } = new();
    }

    public class OxygenCardDto
    {
        public double Value { get; set; } = 78.0;
        public string Trend { get; set; } = "-8.4%";
        public string Status { get; set; } = "DEGRADED";
        public double ProductionRate { get; set; } = 71.6;
        public double ConsumptionRate { get; set; } = 80.0;
    }

    public class ResourcesCardDto
    {
        public double Value { get; set; } = 61.0;
        public string Subtitle { get; set; } = "ESSENTIAL SUPPLIES";
        public string Status { get; set; } = "DEGRADED";
    }

    public class CommunicationCardDto
    {
        public string Status { get; set; } = "DEGRADED";
        public string Subtitle { get; set; } = "3 RELAYS AFFECTED";
        public int RelaysAffected { get; set; } = 3;
        public int TotalRelays { get; set; } = 4;
    }

    public class RobotFleetCardDto
    {
        public int OnlineCount { get; set; } = 9;
        public int TotalCount { get; set; } = 12;
        public int SearchingCount { get; set; } = 2;
        public int OfflineCount { get; set; } = 1;
        public string Status { get; set; } = "ONLINE";
    }

    public class RecoveryWindowDto
    {
        public int SecondsRemaining { get; set; }
        public string FormattedCountdown { get; set; } = "05:42:18";
        public bool IsExpired { get; set; }
    }

    public class StormStatusDto
    {
        public string Level { get; set; } = "CRITICAL";
        public double Intensity { get; set; } = 94.5;
        public string AffectedSector { get; set; } = "Sector B & C";
        public string Warning { get; set; } = "Electromagnetic pulse and sub-surface resonant interference active.";
    }

    public class RobotDto
    {
        public int Id { get; set; }
        public string RobotCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Battery { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string SignalStrength { get; set; } = string.Empty;
        public string CurrentMission { get; set; } = string.Empty;
        public string CommunicationStatus { get; set; } = string.Empty;
        public double Temperature { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class DeployRobotRequest
    {
        public string Mission { get; set; } = "ASTRA SEARCH";
        public string TargetSector { get; set; } = "Sector B-17";
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string OperatorName { get; set; } = "COMMANDER";
    }

    public class ChangeMissionRequest
    {
        public string Mission { get; set; } = string.Empty;
        public string OperatorName { get; set; } = "COMMANDER";
    }

    public class EmergencyDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? AssignedRobotId { get; set; }
        public string? AssignedRobotCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PrioritizeEmergencyRequest
    {
        public string Severity { get; set; } = "CRITICAL";
        public string OperatorName { get; set; } = "COMMANDER";
    }

    public class AssignEmergencyRequest
    {
        public int RobotId { get; set; }
        public string OperatorName { get; set; } = "COMMANDER";
    }

    public class CommunicationNodeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double SignalStrength { get; set; }
        public int Latency { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CommunicationRouteDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int SourceNodeId { get; set; }
        public int DestinationNodeId { get; set; }
        public double SignalStrength { get; set; }
        public int Latency { get; set; }
        public string HopsPath { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class UndergroundStructureDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Depth { get; set; }
        public double EnergySignature { get; set; }
        public double Frequency { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime DetectedAt { get; set; }
        public double AstraSignalComparison { get; set; } = 88.0;
        public double DistanceFromAstraKm { get; set; } = 1.4;
    }

    public class AstraStatusDto
    {
        public string Status { get; set; } = "CRITICAL";
        public string LastKnownLocation { get; set; } = "Sector B-17";
        public double Latitude { get; set; } = -4.685;
        public double Longitude { get; set; } = 137.575;
        public DateTime LastSignalTimestamp { get; set; }
        public double SignalStrength { get; set; } = 88.0;
        public double Confidence { get; set; } = 82.0;
        public double DistanceFromColonyKm { get; set; } = 4.8;
        public int RecoverySecondsRemaining { get; set; } = 20538;
        public string RecoveryCountdown { get; set; } = "05:42:18";
        public string SearchStatus { get; set; } = "TARGET LOCK PENDING DEPLOYMENT";
    }

    public class AstraSignalDto
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double SignalStrength { get; set; }
        public double Confidence { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class RecommendationDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public int Confidence { get; set; }
        public string RecommendedAction { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public List<RecommendationFactorDto> Factors { get; set; } = new();
    }

    public class RecommendationFactorDto
    {
        public string FactorName { get; set; } = string.Empty;
        public string FactorValue { get; set; } = string.Empty;
        public int Weight { get; set; }
        public int Contribution { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class ResourceItemDto
    {
        public int Id { get; set; }
        public string ResourceType { get; set; } = string.Empty;
        public double Quantity { get; set; }
        public double ConsumptionRate { get; set; }
        public double ProductionRate { get; set; }
        public string Status { get; set; } = string.Empty;
        public double ReserveHours { get; set; }
    }

    public class MissionEventDto
    {
        public int Id { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class SimulationStatusDto
    {
        public int CurrentStage { get; set; }
        public int TotalStages { get; set; } = 12;
        public string StageTitle { get; set; } = string.Empty;
        public bool IsRunning { get; set; }
        public int SecondsRemaining { get; set; }
        public string FormattedCountdown { get; set; } = "05:42:18";
    }

    public class GenericActionResponse
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
    }
}
