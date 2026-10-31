import { Direction } from '../../../src/game/maps/dormRoomMap';
import { LocationId } from '../../../src/game/maps/worldMaps';
import { EngineeringMetricKey } from '../../../src/features/tasks/taskCatalog';
import { PersonalzyEvaluationResult } from '../../../src/features/journal/journalEngine';
import { AvatarStyleId, TaskStatus } from '../../../src/state/GameContext';

export const CURRENT_SCHEMA_VERSION = 1;

export interface FirestorePlayerProfileDoc {
  uid: string;
  name: string;
  avatarStyle: AvatarStyleId;
  grade: 1 | 2 | 3 | 4;
  gpa: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreWorldDoc {
  schemaVersion: number;
  worldRevision: number;
  updatedAt: string;
  gameDay: number;
  gameMinutes: number;
  location: LocationId;
  playerPosition: { x: number; y: number };
  playerFacing: Direction;
  journalCompletedForCurrentDay: boolean;
  lastQuestionId?: string;
  recommendedNextDayTaskTitle: string | null;
}

export interface FirestoreStatsDoc {
  schemaVersion: number;
  updatedAt: string;
  energy: number;
  motivation: number;
  socialBonds: number;
  coffeeCups: number;
  metrics: Record<EngineeringMetricKey, number>;
}

export interface FirestoreTaskDoc {
  taskId: string;
  status: TaskStatus;
  attempts: number;
  lastDecisionId?: string;
  updatedAt: string;
}

export interface FirestoreJournalEntryDoc {
  id: string;
  gameDay: number;
  questionId: string;
  selectedQuickAnswerId: string | null;
  freeTextNote: string;
  skippedDetails: boolean;
  completedAt: string;
  reflectionStatus: 'pending' | 'ready' | 'fallback';
  evaluation?: PersonalzyEvaluationResult;
}

export interface FirestorePreferencesDoc {
  verifiedPreferences: string[];
  openQuestions: string[];
  updatedAt: string;
}

export interface FirestoreObservationDoc {
  id: string;
  sourceEventId: string;
  summary: string;
  confidence: number;
  verified: boolean;
  createdAt: string;
}

export interface FirestoreEventDoc {
  eventId: string;
  playerId: string;
  type:
    | 'MOVE'
    | 'LOCATION_CHANGE'
    | 'TASK_DECISION'
    | 'JOURNAL_SUBMIT'
    | 'DAY_ADVANCE'
    | 'PREFERENCE_UPDATE';
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface FirestoreAiProposalDoc {
  id: string;
  kind: 'task_proposal' | 'design_rule_proposal';
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetSkill: EngineeringMetricKey;
  description: string;
  npcSender: string;
  estimatedMinutes: number;
  requiresApproval: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface IsolatedPlayerNamespace {
  profile: FirestorePlayerProfileDoc;
  world: FirestoreWorldDoc;
  stats: FirestoreStatsDoc;
  tasks: Record<string, FirestoreTaskDoc>;
  journal: Record<string, FirestoreJournalEntryDoc>;
  memory: {
    preferences: FirestorePreferencesDoc;
    observations: Record<string, FirestoreObservationDoc>;
    summaries: string[];
  };
  events: Record<string, FirestoreEventDoc>;
  aiProposals: Record<string, FirestoreAiProposalDoc>;
}
