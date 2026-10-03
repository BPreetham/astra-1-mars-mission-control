const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

export interface Colony {
  id: number;
  name: string;
  population: number;
  latitude: number;
  longitude: number;
  status: string;
}

export interface Robot {
  id: number;
  robotCode: string;
  name: string;
  status: string;
  battery: number;
  latitude: number;
  longitude: number;
  signalStrength: string;
  currentMission: string;
  communicationStatus: string;
  temperature: number;
  updatedAt: string;
}

export interface RobotTelemetry {
  id: number;
  robotId: number;
  battery: number;
  latitude: number;
  longitude: number;
  temperature: number;
  signalStrength: string;
  mission: string;
  timestamp: string;
}

export interface AstraStatus {
  status: string;
  lastKnownLocation: string;
  latitude: number;
  longitude: number;
  lastSignalTimestamp: string;
  signalStrength: number;
  confidence: number;
  distanceFromColonyKm: number;
  recoverySecondsRemaining: number;
  recoveryCountdown: string;
  searchStatus: string;
}

export interface AstraSignal {
  id: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  signalStrength: number;
  confidence: number;
  source: string;
  notes: string;
}

export interface UndergroundStructure {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  depth: number;
  energySignature: number;
  frequency: number;
  status: string;
  detectedAt: string;
  astraSignalComparison: number;
  distanceFromAstraKm: number;
}

export interface Emergency {
  id: number;
  type: string;
  severity: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  status: string;
  assignedRobotId?: number | null;
  assignedRobotCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationNode {
  id: number;
  name: string;
  status: string;
  signalStrength: number;
  latency: number;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface CommunicationRoute {
  id: number;
  name: string;
  status: string;
  sourceNodeId: number;
  destinationNodeId: number;
  signalStrength: number;
  latency: number;
  hopsPath: string;
  updatedAt: string;
}

export interface ResourceItem {
  id: number;
  resourceType: string;
  quantity: number;
  consumptionRate: number;
  productionRate: number;
  status: string;
  reserveHours: number;
}

export interface OxygenStatus {
  id: number;
  productionRate: number;
  consumptionRate: number;
  reserve: number;
  status: string;
  timestamp: string;
}

export interface RecommendationFactor {
  factorName: string;
  factorValue: string;
  weight: number;
  contribution: number;
  description: string;
}

export interface Recommendation {
  id: number;
  type: string;
  priority: string;
  confidence: number;
  recommendedAction: string;
  target: string;
  reason: string;
  status: string;
  factors: RecommendationFactor[];
}

export interface MissionEvent {
  id: number;
  eventType: string;
  severity: string;
  message: string;
  timestamp: string;
}

export interface SimulationStatus {
  currentStage: number;
  totalStages: number;
  stageTitle: string;
  isRunning: boolean;
  secondsRemaining: number;
  formattedCountdown: string;
}

export interface DashboardSummary {
  colony: Colony;
  topStatus: {
    oxygen: {
      value: number;
      trend: string;
      status: string;
      productionRate: number;
      consumptionRate: number;
    };
    resources: {
      value: number;
      subtitle: string;
      status: string;
    };
    communication: {
      status: string;
      subtitle: string;
      relaysAffected: number;
      totalRelays: number;
    };
    robotFleet: {
      onlineCount: number;
      totalCount: number;
      searchingCount: number;
      offlineCount: number;
      status: string;
    };
  };
  recoveryWindow: {
    secondsRemaining: number;
    formattedCountdown: string;
    isExpired: boolean;
  };
  energyStorm: {
    level: string;
    intensity: number;
    affectedSector: string;
    warning: string;
  };
  activeRecommendation?: Recommendation | null;
  emergencies: Emergency[];
  robots: Robot[];
  communicationNodes: CommunicationNode[];
  undergroundStructure?: UndergroundStructure | null;
  astra: AstraStatus;
  recentEvents: MissionEvent[];
  simulation: SimulationStatus;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(String(err));
  }
}

export const api = {
  // Dashboard
  getDashboard: () => request<DashboardSummary>('/dashboard'),

  // Robots
  getRobots: () => request<Robot[]>('/robots'),
  getRobot: (id: number) => request<Robot>(`/robots/${id}`),
  deployRobot: (id: number, data: { mission?: string; targetSector?: string }) =>
    request<{ success: boolean; message: string; data: Robot }>(`/robots/${id}/deploy`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  returnRobot: (id: number) =>
    request<{ success: boolean; message: string; data: Robot }>(`/robots/${id}/return`, {
      method: 'POST',
    }),
  changeRobotMission: (id: number, mission: string) =>
    request<{ success: boolean; message: string; data: Robot }>(`/robots/${id}/mission`, {
      method: 'POST',
      body: JSON.stringify({ mission }),
    }),
  getRobotTelemetry: (id: number) => request<RobotTelemetry[]>(`/robots/${id}/telemetry`),

  // Astra
  getAstraStatus: () => request<AstraStatus>('/astra/status'),
  getAstraSignals: () => request<AstraSignal[]>('/astra/signals'),
  getAstraLocation: () => request<any>('/astra/location'),

  // Signals
  getEnergySignals: () => request<any[]>('/signals/energy'),
  getUndergroundStructure: () => request<UndergroundStructure>('/signals/structure'),

  // Emergencies
  getEmergencies: () => request<Emergency[]>('/emergencies'),
  prioritizeEmergency: (id: number, severity: string) =>
    request<{ success: boolean; message: string }>(`/emergencies/${id}/prioritize`, {
      method: 'POST',
      body: JSON.stringify({ severity }),
    }),
  assignEmergency: (id: number, robotId: number) =>
    request<{ success: boolean; message: string }>(`/emergencies/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ robotId }),
    }),
  resolveEmergency: (id: number) =>
    request<{ success: boolean; message: string }>(`/emergencies/${id}/resolve`, {
      method: 'POST',
    }),

  // Communications
  getCommsNodes: () => request<CommunicationNode[]>('/communications'),
  getCommsRoutes: () => request<CommunicationRoute[]>('/communications/routes'),
  activateRoute: (id: number) =>
    request<{ success: boolean; message: string; data: any }>(`/communications/routes/${id}/activate`, {
      method: 'POST',
    }),

  // Resources
  getResources: () => request<ResourceItem[]>('/resources'),
  getOxygenStatus: () => request<OxygenStatus>('/oxygen'),

  // Recommendations
  getActiveRecommendation: () => request<Recommendation>('/recommendations'),
  evaluateRecommendation: () => request<Recommendation>('/recommendations/evaluate', { method: 'POST' }),
  acceptRecommendation: (id: number) =>
    request<{ success: boolean; message: string; data: any }>(`/recommendations/${id}/accept`, {
      method: 'POST',
    }),

  // Simulation
  getSimulationStatus: () => request<SimulationStatus>('/simulation/status'),
  startSimulation: () => request<SimulationStatus>('/simulation/start', { method: 'POST' }),
  stepSimulation: () => request<SimulationStatus>('/simulation/step', { method: 'POST' }),
  resetSimulation: () => request<{ success: boolean; message: string }>('/simulation/reset', { method: 'POST' }),

  // Mission Events
  getMissionEvents: (limit = 30) => request<MissionEvent[]>(`/mission-events?limit=${limit}`),
};
