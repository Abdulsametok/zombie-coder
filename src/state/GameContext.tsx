import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Direction } from '../game/maps/dormRoomMap';
import { LocationId, WORLD_MAPS } from '../game/maps/worldMaps';
import {
  GridPosition,
  attemptPlayerStep,
  findWalkablePath,
  getActiveInteraction,
} from '../game/collision/collision';
import {
  EngineeringMetricKey,
  EngineeringTask,
  INITIAL_ENGINEERING_TASKS,
} from '../features/tasks/taskCatalog';
import {
  PersonalzyEvaluationResult,
  evaluateJournalWithPersonalzy,
  selectJournalQuestionForDay,
} from '../features/journal/journalEngine';
import {
  SeedPlayerAccount,
  TEST_PLAYER_ACCOUNTS,
  requestBackendPersonalzyReflect,
} from '../services/playerWorldService';
import {
  DialogueBubbleTurn,
  NpcDialogueVariant,
  NpcId,
  NpcRelationship,
  PlayerCommunicationStyle,
  buildDialogueBubbleSequence,
  createInitialNpcRelationships,
  interactWithNpc,
} from '../features/social/npcRelationshipEngine';
import {
  FLOOR_THEMES,
  FloorThemeId,
  analyzeConversationForFloorTheme,
  syncThemeRuleInPreferences,
} from '../features/theme/adaptiveFloorTheme';

export type ActiveScreenId =
  | 'auth_login'
  | 'career_setup'
  | 'world_hud'
  | 'zombie_os'
  | 'code_audit'
  | 'end_of_day_journal';

export type AvatarStyleId =
  | 'hacker_hoodie'
  | 'cyber_casual'
  | 'insomniac'
  | 'glitch_mod';

export type TaskStatus =
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'needs_retry';

export interface PlayerProfile {
  uid: string;
  email: string;
  username: string;
  name: string;
  avatarStyle: AvatarStyleId;
  grade: 1 | 2 | 3 | 4;
  gpa: string;
}

export interface ActivityLogItem {
  id: string;
  label: string;
  badge: string;
}

export interface RegisteredAccountSummary {
  uid: string;
  email: string;
  username: string;
  name: string;
  grade: 1 | 2 | 3 | 4;
  tokenLimit: number;
  tokensUsed: number;
}

interface PerPlayerIsolatedState {
  profile: PlayerProfile;
  password: string;
  tokenLimit: number;
  tokensUsed: number;
  floorTheme: FloorThemeId;
  lastThemeAnalysisReason: string;
  worldRevision: number;
  gameDay: number;
  gameMinutes: number;
  location: LocationId;
  playerPosition: GridPosition;
  playerFacing: Direction;
  energy: number;
  motivation: number;
  socialBonds: number;
  coffeeCups: number;
  metrics: Record<EngineeringMetricKey, number>;
  taskStatuses: Record<string, TaskStatus>;
  selectedTaskId: string;
  verifiedPreferences: string[];
  openQuestions: string[];
  activitiesToday: ActivityLogItem[];
  completedTaskIdsToday: string[];
  triggeredTrapToday: boolean;
  visitedGymToday: boolean;
  journalCompletedForCurrentDay: boolean;
  lastQuestionId?: string;
  latestEvaluation: PersonalzyEvaluationResult | null;
  latestEvaluationSource: 'gemini_live' | 'validated_fallback' | null;
  recommendedNextDayTaskTitle: string | null;
  npcRelationships: Record<NpcId, NpcRelationship>;
  communicationStyle: PlayerCommunicationStyle;
  lastNpcDialogue: NpcDialogueVariant | null;
}

function createInitialPlayerState(params: {
  uid: string;
  email?: string;
  password?: string;
  defaultName: string;
  username?: string;
  grade?: 1 | 2 | 3 | 4;
  initialTheme?: FloorThemeId;
  dailyTokenLimit?: number;
  initialTokensUsed?: number;
}): PerPlayerIsolatedState {
  const themeId: FloorThemeId = params.initialTheme || 'terminal_matrix';
  const themeCfg = FLOOR_THEMES[themeId];
  const cleanUsername =
    params.username ||
    params.defaultName
      .toLocaleLowerCase('tr-TR')
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 14) ||
    'coder_01';

  return {
    profile: {
      uid: params.uid,
      email: params.email || `${cleanUsername}@zombiecoder.edu.tr`,
      username: cleanUsername,
      name: params.defaultName,
      avatarStyle: 'hacker_hoodie',
      grade: params.grade || 1,
      gpa: params.grade === 3 ? '3.91' : params.grade === 2 ? '3.64' : '3.82',
    },
    password: params.password || 'Zombie123!',
    tokenLimit: params.dailyTokenLimit ?? 1000,
    tokensUsed: params.initialTokensUsed ?? 0,
    floorTheme: themeId,
    lastThemeAnalysisReason: themeCfg.description,
    worldRevision: 1,
    gameDay: 1,
    gameMinutes: 9 * 60,
    location: 'dorm',
    playerPosition: {
      x: WORLD_MAPS.dorm.spawn.x,
      y: WORLD_MAPS.dorm.spawn.y,
    },
    playerFacing: WORLD_MAPS.dorm.spawn.facing,
    energy: 85,
    motivation: 90,
    socialBonds: 60,
    coffeeCups: 3,
    metrics: {
      sistem_dusuncesi: 12,
      kod_okuryazarligi: 15,
      ai_denetimi: 14,
      hata_ayiklama_sabri: 12,
    },
    taskStatuses: {
      task_legacy_login_audit: 'available',
      task_g1_1_loop_syntax: 'available',
      task_g1_2_edge_case_rogue: 'available',
      task_g2_1_encapsulation: 'available',
      task_g3_2_complexity_timeout: 'available',
      task_g5_1_zombie_rewrite_trap: 'available',
      task_g7_1_agent_loop_guard: 'available',
    },
    selectedTaskId: 'task_legacy_login_audit',
    verifiedPreferences: [
      themeCfg.designMdRule,
      'Dark Mode Zorunlu',
      'JWT Auth',
      'Katı Tip Güvenliği',
    ],
    openQuestions: [
      'Şifre hash algoritmasında geriye dönük uyumluluk riski var mı?',
    ],
    activitiesToday: [
      {
        id: 'act_init_1',
        label: '1 Üniversite Dersi Planlandı (BMB201)',
        badge: 'AKTİF',
      },
    ],
    completedTaskIdsToday: [],
    triggeredTrapToday: false,
    visitedGymToday: false,
    journalCompletedForCurrentDay: false,
    lastQuestionId: undefined,
    latestEvaluation: null,
    latestEvaluationSource: null,
    recommendedNextDayTaskTitle: null,
    npcRelationships: createInitialNpcRelationships(),
    communicationStyle:
      themeId === 'blueprint_cyber'
        ? 'formal'
        : themeId === 'necrosis_purple'
        ? 'balanced'
        : 'casual',
    lastNpcDialogue: null,
  };
}

function createInitialStoreFromSeeds(
  seeds: SeedPlayerAccount[],
): Record<string, PerPlayerIsolatedState> {
  const map: Record<string, PerPlayerIsolatedState> = {};
  seeds.forEach(seed => {
    map[seed.uid] = createInitialPlayerState({
      uid: seed.uid,
      email: seed.email,
      password: seed.password,
      defaultName: seed.defaultName,
      username: seed.username,
      grade: seed.grade,
      initialTheme: seed.initialTheme,
      dailyTokenLimit: seed.dailyTokenLimit,
      initialTokensUsed: seed.initialTokensUsed,
    });
  });
  return map;
}

export interface GameStateContextValue {
  activeScreen: ActiveScreenId;
  setActiveScreen: (screen: ActiveScreenId) => void;
  isAuthenticated: boolean;
  activePlayerUid: string;
  registeredAccounts: RegisteredAccountSummary[];
  switchPlayerAccount: (uid: string) => void;
  loginWithCredentials: (
    emailOrUsername: string,
    password: string,
  ) => { ok: boolean; error?: string };
  registerAccount: (params: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    grade: 1 | 2 | 3 | 4;
  }) => { ok: boolean; error?: string };
  logoutAccount: () => void;
  worldRevision: number;
  profile: PlayerProfile;
  tokenLimit: number;
  tokensUsed: number;
  floorTheme: FloorThemeId;
  lastThemeAnalysisReason: string;
  analyzeChatAndAdaptTheme: (userMessage: string) => {
    themeId: FloorThemeId;
    reason: string;
  };
  gameDay: number;
  gameMinutes: number;
  formattedClock: string;
  location: LocationId;
  playerPosition: GridPosition;
  playerFacing: Direction;
  energy: number;
  motivation: number;
  socialBonds: number;
  coffeeCups: number;
  metrics: Record<EngineeringMetricKey, number>;
  tasks: EngineeringTask[];
  taskStatuses: Record<string, TaskStatus>;
  selectedTaskId: string;
  verifiedPreferences: string[];
  openQuestions: string[];
  activitiesToday: ActivityLogItem[];
  completedTaskIdsToday: string[];
  triggeredTrapToday: boolean;
  visitedGymToday: boolean;
  journalCompletedForCurrentDay: boolean;
  lastQuestionId?: string;
  latestEvaluation: PersonalzyEvaluationResult | null;
  latestEvaluationSource: 'gemini_live' | 'validated_fallback' | null;
  recommendedNextDayTaskTitle: string | null;
  npcRelationships: Record<NpcId, NpcRelationship>;
  communicationStyle: PlayerCommunicationStyle;
  lastNpcDialogue: NpcDialogueVariant | null;
  targetWalkTile: GridPosition | null;
  isWalking: boolean;
  activeDialogueBubble: DialogueBubbleTurn | null;
  statusBanner: string;
  setStatusBanner: (msg: string) => void;

  // Actions
  startCareer: (nextProfile: Partial<PlayerProfile>) => void;
  movePlayer: (dir: Direction) => void;
  walkToTile: (clickedTile: GridPosition, onArrive?: () => void) => void;
  changeLocation: (target: LocationId) => void;
  interactWithCurrentSpot: () => void;
  talkToNpc: (npcId: NpcId) => NpcDialogueVariant;
  advanceDialogueBubble: () => void;
  dismissDialogueBubble: () => void;
  setCommunicationStyle: (style: PlayerCommunicationStyle) => void;
  selectTaskForAudit: (taskId: string) => void;
  leaveTaskAudit: () => void;
  submitEngineeringDecision: (
    taskId: string,
    decisionId: string,
  ) => { title: string; message: string; isTrap: boolean };
  submitJournalEntry: (params: {
    selectedQuickAnswerId: string | null;
    freeTextNote: string;
    skippedDetails: boolean;
  }) => PersonalzyEvaluationResult;
  submitJournalEntryAsync: (params: {
    selectedQuickAnswerId: string | null;
    freeTextNote: string;
    skippedDetails: boolean;
  }) => Promise<PersonalzyEvaluationResult>;
  confirmAndStartNextDay: () => { ok: boolean; reason?: string };
  clearCurrentPlayerMemory: () => void;
}

export const WALK_STEP_DURATION_MS = 185;

const GameContext = createContext<GameStateContextValue | null>(null);

export function GameProvider({
  children,
  initialScreen = 'auth_login',
}: {
  children: React.ReactNode;
  initialScreen?: ActiveScreenId;
}): React.JSX.Element {
  const [activeScreen, setActiveScreen] =
    useState<ActiveScreenId>(initialScreen);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialScreen !== 'auth_login',
  );
  const [activePlayerUid, setActivePlayerUid] = useState<string>(
    TEST_PLAYER_ACCOUNTS[0].uid,
  );
  const [playerStore, setPlayerStore] = useState<
    Record<string, PerPlayerIsolatedState>
  >(() => createInitialStoreFromSeeds(TEST_PLAYER_ACCOUNTS));

  const [tasks] = useState<EngineeringTask[]>(INITIAL_ENGINEERING_TASKS);
  const [statusBanner, setStatusBanner] = useState<string>(
    'SYS.READY // Haritada gitmek istediğin yere veya NPC’ye dokun.',
  );
  const [targetWalkTile, setTargetWalkTile] = useState<GridPosition | null>(
    null,
  );
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [activeDialogueQueue, setActiveDialogueQueue] = useState<
    DialogueBubbleTurn[]
  >([]);
  const walkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopWalkTimer = () => {
    if (walkTimerRef.current) {
      clearInterval(walkTimerRef.current);
      walkTimerRef.current = null;
    }
    setIsWalking(false);
    setTargetWalkTile(null);
  };

  const current =
    playerStore[activePlayerUid] ||
    createInitialPlayerState({
      uid: activePlayerUid,
      defaultName: 'Deniz Yılmaz',
    });
  const livePosRef = useRef<GridPosition>(current.playerPosition);
  livePosRef.current = current.playerPosition;

  const registeredAccounts = useMemo<RegisteredAccountSummary[]>(() => {
    return Object.values(playerStore).map(st => ({
      uid: st.profile.uid,
      email: st.profile.email,
      username: st.profile.username,
      name: st.profile.name,
      grade: st.profile.grade,
      tokenLimit: st.tokenLimit,
      tokensUsed: st.tokensUsed,
    }));
  }, [playerStore]);

  const updateCurrentPlayer = (
    updater: (prev: PerPlayerIsolatedState) => PerPlayerIsolatedState,
  ) => {
    setPlayerStore(prevMap => {
      const existing =
        prevMap[activePlayerUid] ||
        createInitialPlayerState({
          uid: activePlayerUid,
          defaultName: 'Deniz Yılmaz',
        });
      const updated = updater(existing);
      return {
        ...prevMap,
        [activePlayerUid]: {
          ...updated,
          worldRevision: existing.worldRevision + 1,
        },
      };
    });
  };

  const switchPlayerAccount = (uid: string) => {
    const targetAcc = TEST_PLAYER_ACCOUNTS.find(a => a.uid === uid);
    setPlayerStore(prev => {
      if (prev[uid]) {
        return prev;
      }
      return {
        ...prev,
        [uid]: createInitialPlayerState({
          uid,
          email: targetAcc?.email,
          password: targetAcc?.password,
          defaultName: targetAcc?.defaultName || uid,
          username: targetAcc?.username,
          grade: targetAcc?.grade,
          initialTheme: targetAcc?.initialTheme,
          dailyTokenLimit: targetAcc?.dailyTokenLimit,
          initialTokensUsed: targetAcc?.initialTokensUsed,
        }),
      };
    });
    setActivePlayerUid(uid);
    setStatusBanner(
      `[HESAP İZOLASYONU] Aktif kullanıcı: @${
        targetAcc?.username || uid
      } (${targetAcc?.defaultName || uid}) yüklendi.`,
    );
  };

  const loginWithCredentials = (
    emailOrUsername: string,
    password: string,
  ): { ok: boolean; error?: string } => {
    const normalizedInput = emailOrUsername.trim().toLocaleLowerCase('tr-TR');
    const trimmedPass = password.trim();

    if (!normalizedInput || !trimmedPass) {
      return {
        ok: false,
        error: 'Lütfen e-posta adresi ve şifrenizi girin.',
      };
    }

    const matchedState = Object.values(playerStore).find(
      st =>
        st.profile.email.toLocaleLowerCase('tr-TR') === normalizedInput ||
        st.profile.username.toLocaleLowerCase('tr-TR') === normalizedInput,
    );

    if (!matchedState) {
      return {
        ok: false,
        error:
          'Bu e-posta ile kayıtlı hesap bulunamadı. Kayıt Ol sekmesinden yeni hesap oluşturabilirsiniz.',
      };
    }

    if (matchedState.password !== trimmedPass) {
      return {
        ok: false,
        error: 'Hatalı şifre girdiniz. Lütfen kontrol edip tekrar deneyin.',
      };
    }

    if (matchedState.tokensUsed >= matchedState.tokenLimit) {
      return {
        ok: false,
        error:
          'Bu hesabın günlük AI token kotası dolmuş! Başka bir hesap seçin veya yeni gün başlatın.',
      };
    }

    stopWalkTimer();
    setActiveDialogueQueue([]);
    setActivePlayerUid(matchedState.profile.uid);
    setIsAuthenticated(true);
    setActiveScreen('world_hud');
    setStatusBanner(
      `[OTURUM AÇILDI] Hoş geldin @${matchedState.profile.username} (${
        matchedState.profile.name
      } • ${matchedState.profile.grade}. Sınıf) | Kalan Token: ${
        matchedState.tokenLimit - matchedState.tokensUsed
      }/${matchedState.tokenLimit}`,
    );

    return { ok: true };
  };

  const registerAccount = (params: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    grade: 1 | 2 | 3 | 4;
  }): { ok: boolean; error?: string } => {
    const cleanEmail = params.email.trim().toLocaleLowerCase('tr-TR');
    const cleanPass = params.password.trim();
    const cleanFullName = params.fullName.trim();
    const cleanUsername = params.username
      .trim()
      .replace(/^@+/, '')
      .replace(/\s+/g, '_');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return {
        ok: false,
        error: 'Lütfen geçerli bir e-posta adresi girin.',
      };
    }
    if (cleanPass.length < 4) {
      return {
        ok: false,
        error: 'Şifre en az 4 karakter olmalıdır.',
      };
    }
    if (!cleanFullName) {
      return {
        ok: false,
        error: 'Lütfen Ad Soyad bilginizi girin.',
      };
    }
    if (!cleanUsername || cleanUsername.length < 2) {
      return {
        ok: false,
        error: 'Lütfen en az 2 karakterli bir kullanıcı adı girin.',
      };
    }

    const duplicate = Object.values(playerStore).find(
      st =>
        st.profile.email.toLocaleLowerCase('tr-TR') === cleanEmail ||
        st.profile.username.toLocaleLowerCase('tr-TR') ===
          cleanUsername.toLocaleLowerCase('tr-TR'),
    );
    if (duplicate) {
      return {
        ok: false,
        error: 'Bu e-posta veya kullanıcı adı zaten kullanımda.',
      };
    }

    const newUid = `player_${cleanUsername.toLocaleLowerCase('tr-TR')}_${Date.now()}`;
    const initialThemeByGrade: Record<1 | 2 | 3 | 4, FloorThemeId> = {
      1: 'terminal_matrix',
      2: 'blueprint_cyber',
      3: 'necrosis_purple',
      4: 'amber_warm',
    };

    const newState = createInitialPlayerState({
      uid: newUid,
      email: cleanEmail,
      password: cleanPass,
      defaultName: cleanFullName,
      username: cleanUsername,
      grade: params.grade,
      initialTheme: initialThemeByGrade[params.grade],
      dailyTokenLimit: 1000,
      initialTokensUsed: 0,
    });

    stopWalkTimer();
    setActiveDialogueQueue([]);
    setPlayerStore(prev => ({
      ...prev,
      [newUid]: newState,
    }));
    setActivePlayerUid(newUid);
    setIsAuthenticated(true);
    setActiveScreen('world_hud');
    setStatusBanner(
      `[KAYIT TAMAMLANDI] Hoş geldin @${cleanUsername} (${cleanFullName} • ${params.grade}. Sınıf)! Günlük 1000 AI Token kotası tanımlandı.`,
    );

    return { ok: true };
  };

  const logoutAccount = () => {
    stopWalkTimer();
    setActiveDialogueQueue([]);
    setIsAuthenticated(false);
    setActiveScreen('auth_login');
    setStatusBanner('[OTURUM KAPATILDI] Başka bir öğrenci hesabıyla giriş yapabilirsiniz.');
  };

  const analyzeChatAndAdaptTheme = (
    userMessage: string,
  ): { themeId: FloorThemeId; reason: string } => {
    const analysis = analyzeConversationForFloorTheme({
      text: userMessage,
      communicationStyle: current.communicationStyle,
      currentTheme: current.floorTheme,
    });

    updateCurrentPlayer(prev => ({
      ...prev,
      floorTheme: analysis.themeId,
      lastThemeAnalysisReason: analysis.reason,
      tokensUsed: Math.min(prev.tokenLimit, prev.tokensUsed + 15),
      verifiedPreferences: syncThemeRuleInPreferences(
        prev.verifiedPreferences,
        analysis.designMdRule,
      ),
    }));

    setStatusBanner(
      `[DESIGN.MD // ZEMİN TEMASI UYARLANDI] ${
        FLOOR_THEMES[analysis.themeId].name
      } — ${analysis.reason}`,
    );

    return {
      themeId: analysis.themeId,
      reason: analysis.reason,
    };
  };

  const formattedClock = useMemo(() => {
    const h = Math.floor(current.gameMinutes / 60) % 24;
    const m = current.gameMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }, [current.gameMinutes]);

  const startCareer = (nextProfile: Partial<PlayerProfile>) => {
    updateCurrentPlayer(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...nextProfile,
        name: nextProfile.name?.trim() || prev.profile.name,
        username: nextProfile.username?.trim() || prev.profile.username,
      },
      energy: 100,
      motivation: 90,
      location: 'dorm',
      playerPosition: {
        x: WORLD_MAPS.dorm.spawn.x,
        y: WORLD_MAPS.dorm.spawn.y,
      },
      playerFacing: WORLD_MAPS.dorm.spawn.facing,
    }));
    setIsAuthenticated(true);
    setActiveScreen('world_hud');
    setStatusBanner(
      `[SYS.INIT] Hoş geldin @${
        nextProfile.username?.trim() || current.profile.username
      } (${nextProfile.name?.trim() || current.profile.name})!`,
    );
  };

  const changeLocation = (target: LocationId) => {
    stopWalkTimer();
    setActiveDialogueQueue([]);
    const targetMap = WORLD_MAPS[target];
    updateCurrentPlayer(prev => {
      const nextActivities =
        target === 'university' &&
        !prev.activitiesToday.some(a => a.id === 'act_uni_visit')
          ? [
              ...prev.activitiesToday,
              {
                id: 'act_uni_visit',
                label: '1 Üniversite Dersi Tamamlandı',
                badge: '+20 XP',
              },
            ]
          : prev.activitiesToday;

      return {
        ...prev,
        location: target,
        playerPosition: { x: targetMap.spawn.x, y: targetMap.spawn.y },
        playerFacing: targetMap.spawn.facing,
        gameMinutes: prev.gameMinutes + 15,
        energy: Math.max(10, prev.energy - 4),
        activitiesToday: nextActivities,
      };
    });

    if (target === 'university') {
      setStatusBanner(
        '[ÜNİVERSİTE] BMB201 Amfi & Lab binasına girdin. Prof. Demir kürsüde!',
      );
    } else if (target === 'gym') {
      setStatusBanner(
        '[SPOR SALONU] Kampüs spor salonundasın. Koç Burak ile antrenman yapabilirsin.',
      );
    } else {
      setStatusBanner(
        '[YURT ODASI] Çalışma odana döndün. ZombieOS bilgisayar veya yatak aktif.',
      );
    }
  };

  const movePlayer = (dir: Direction) => {
    const currentMap = WORLD_MAPS[current.location];
    const result = attemptPlayerStep(currentMap, current.playerPosition, dir);

    if (result.blocked) {
      updateCurrentPlayer(prev => ({ ...prev, playerFacing: result.facing }));
      setStatusBanner(
        `[ÇARPIŞMA] (${result.position.x}, ${result.position.y}) yönünde engel var!`,
      );
      return;
    }

    updateCurrentPlayer(prev => ({
      ...prev,
      playerPosition: result.position,
      playerFacing: result.facing,
      gameMinutes: prev.gameMinutes + 2,
    }));

    const spot = getActiveInteraction(
      currentMap,
      result.position,
      result.facing,
    );
    if (spot) {
      setStatusBanner(`${spot.keyHint} ${spot.label} — Etkileşime hazır.`);
    } else {
      setStatusBanner(
        `Konum: X:${String(result.position.x).padStart(2, '0')} // Y:${String(
          result.position.y,
        ).padStart(2, '0')} (${currentMap.title})`,
      );
    }
  };

  const walkToTile = (clickedTile: GridPosition, onArrive?: () => void) => {
    stopWalkTimer();
    setActiveDialogueQueue([]);
    const currentMap = WORLD_MAPS[current.location];
    const startPos = livePosRef.current;
    const pathResult = findWalkablePath(currentMap, startPos, clickedTile);

    if (pathResult.steps.length === 0) {
      updateCurrentPlayer(prev => ({
        ...prev,
        playerFacing: pathResult.finalFacing,
      }));
      const spot = getActiveInteraction(
        currentMap,
        startPos,
        pathResult.finalFacing,
      );
      if (spot) {
        setStatusBanner(`${spot.keyHint} ${spot.label} — Etkileşime hazır.`);
      }
      if (onArrive) {
        onArrive();
      }
      return;
    }

    setIsWalking(true);
    setTargetWalkTile(pathResult.destination);
    setStatusBanner(
      `Yürünüyor → Hedef (${pathResult.destination.x}, ${pathResult.destination.y})...`,
    );

    const firstStep = pathResult.steps[0];
    livePosRef.current = firstStep.position;
    updateCurrentPlayer(prev => ({
      ...prev,
      playerPosition: firstStep.position,
      playerFacing: firstStep.facing,
      gameMinutes: prev.gameMinutes + 1,
    }));

    let nextIndex = 1;

    const timer = setInterval(() => {
      if (nextIndex < pathResult.steps.length) {
        const step = pathResult.steps[nextIndex];
        livePosRef.current = step.position;
        updateCurrentPlayer(prev => ({
          ...prev,
          playerPosition: step.position,
          playerFacing: step.facing,
          gameMinutes: prev.gameMinutes + 1,
        }));
        nextIndex += 1;
        return;
      }

      stopWalkTimer();
      const finalStep = pathResult.steps[pathResult.steps.length - 1];
      const finalFacing = pathResult.finalFacing || finalStep.facing;
      updateCurrentPlayer(prev => ({
        ...prev,
        playerFacing: finalFacing,
      }));

      const spot = getActiveInteraction(
        currentMap,
        finalStep.position,
        finalFacing,
      );
      if (spot) {
        setStatusBanner(`${spot.keyHint} ${spot.label} — Etkileşime hazır.`);
      } else {
        setStatusBanner(
          `Konum: X:${String(finalStep.position.x).padStart(
            2,
            '0',
          )} // Y:${String(finalStep.position.y).padStart(2, '0')} (${
            currentMap.title
          })`,
        );
      }

      if (onArrive) {
        onArrive();
      }
    }, WALK_STEP_DURATION_MS);

    (timer as unknown as { unref?: () => void })?.unref?.();
    walkTimerRef.current = timer;
  };

  const interactWithCurrentSpot = () => {
    const currentMap = WORLD_MAPS[current.location];
    const spot = getActiveInteraction(
      currentMap,
      current.playerPosition,
      current.playerFacing,
    );

    if (!spot) {
      setStatusBanner(
        'Yakında etkileşime girilecek bir nesne yok. Bilgisayar, yatak veya kapıya yaklaş.',
      );
      return;
    }

    switch (spot.kind) {
      case 'open_computer':
        updateCurrentPlayer(prev => ({
          ...prev,
          gameMinutes: prev.gameMinutes + 10,
        }));
        setActiveScreen('zombie_os');
        setStatusBanner('[ZombieOS v2.4] Masaüstü çalışma alanı açıldı.');
        break;

      case 'sleep_journal':
        setActiveScreen('end_of_day_journal');
        setStatusBanner(
          '[GÜN SONU] Yatağa gidildi — Zorunlu günlük değerlendirmesi başlatıldı.',
        );
        break;

      case 'exit_campus':
        if (current.location === 'dorm') {
          changeLocation('university');
        } else if (current.location === 'university') {
          changeLocation('gym');
        } else {
          changeLocation('dorm');
        }
        break;

      case 'inspect_bonsai':
        if (current.location === 'gym') {
          talkToNpc('coach_burak');
        } else {
          updateCurrentPlayer(prev => ({
            ...prev,
            motivation: Math.min(100, prev.motivation + 5),
          }));
          setStatusBanner(
            '[BONSAI] Oda bitkisiyle ilgilendin. Motivasyon +5 arttı!',
          );
        }
        break;
    }
  };

  const setCommunicationStyle = (style: PlayerCommunicationStyle) => {
    const themeFromStyle = analyzeConversationForFloorTheme({
      communicationStyle: style,
      currentTheme: current.floorTheme,
    });

    updateCurrentPlayer(prev => ({
      ...prev,
      communicationStyle: style,
      floorTheme: themeFromStyle.themeId,
      lastThemeAnalysisReason: themeFromStyle.reason,
      verifiedPreferences: syncThemeRuleInPreferences(
        prev.verifiedPreferences,
        themeFromStyle.designMdRule,
      ),
    }));
    const labelMap: Record<PlayerCommunicationStyle, string> = {
      casual: 'Samimi / Rahat',
      balanced: 'Dengeli',
      formal: 'Resmi / Akademik',
    };
    setStatusBanner(
      `[ÜSLUP & ZEMİN ADAPTASYONU] Tarz: ${labelMap[style]} → Zemin: ${
        FLOOR_THEMES[themeFromStyle.themeId].shortLabel
      }`,
    );
  };

  const talkToNpc = (npcId: NpcId): NpcDialogueVariant => {
    const currentRel = current.npcRelationships[npcId];
    const result = interactWithNpc({
      relationship: currentRel,
      playerStyle: current.communicationStyle,
      gameDay: current.gameDay,
    });

    const themeAnalysis = analyzeConversationForFloorTheme({
      npcId,
      communicationStyle: current.communicationStyle,
      currentTheme: current.floorTheme,
    });

    updateCurrentPlayer(prev => {
      const isGym = npcId === 'coach_burak';
      const nextActivities =
        isGym && !prev.activitiesToday.some(a => a.id === 'act_gym')
          ? [
              ...prev.activitiesToday,
              {
                id: 'act_gym',
                label: 'Spor Salonu Antrenmanı Tamamlandı',
                badge: `+${result.dialogue.motivationBonus} MOTİVASYON`,
              },
            ]
          : prev.activitiesToday;

      return {
        ...prev,
        tokensUsed: Math.min(prev.tokenLimit, prev.tokensUsed + 25),
        floorTheme: themeAnalysis.themeId,
        lastThemeAnalysisReason: themeAnalysis.reason,
        verifiedPreferences: syncThemeRuleInPreferences(
          prev.verifiedPreferences,
          themeAnalysis.designMdRule,
        ),
        visitedGymToday: prev.visitedGymToday || isGym,
        motivation: Math.min(
          100,
          prev.motivation + result.dialogue.motivationBonus,
        ),
        socialBonds: Math.min(
          100,
          prev.socialBonds + result.dialogue.socialBonus,
        ),
        energy: isGym ? Math.max(15, prev.energy - 8) : prev.energy,
        gameMinutes: prev.gameMinutes + (isGym ? 25 : 10),
        npcRelationships: {
          ...prev.npcRelationships,
          [npcId]: result.updatedRelationship,
        },
        lastNpcDialogue: result.dialogue,
        activitiesToday: nextActivities,
      };
    });

    const turns = buildDialogueBubbleSequence({
      relationship: result.updatedRelationship,
      dialogue: result.dialogue,
      playerName: `@${current.profile.username}`,
      playerStyle: current.communicationStyle,
    });
    setActiveDialogueQueue(turns);

    setStatusBanner(
      `[${currentRel.name.toUpperCase()} // Zemin: ${
        FLOOR_THEMES[themeAnalysis.themeId].shortLabel
      }] "${result.dialogue.greeting} ${result.dialogue.body}"`,
    );

    return result.dialogue;
  };

  const advanceDialogueBubble = () => {
    setActiveDialogueQueue(prev => prev.slice(1));
  };

  const dismissDialogueBubble = () => {
    setActiveDialogueQueue([]);
  };

  const selectTaskForAudit = (taskId: string) => {
    updateCurrentPlayer(prev => ({
      ...prev,
      selectedTaskId: taskId,
      taskStatuses: {
        ...prev.taskStatuses,
        [taskId]:
          prev.taskStatuses[taskId] === 'completed'
            ? 'completed'
            : 'in_progress',
      },
    }));
    setActiveScreen('code_audit');
  };

  const leaveTaskAudit = () => {
    setActiveScreen('zombie_os');
    setStatusBanner(
      'Görev incelemesi yarım bırakıldı — istediğin zaman kaldığın yerden devam edebilirsin.',
    );
  };

  const submitEngineeringDecision = (taskId: string, decisionId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const decision = task?.decisions.find(d => d.id === decisionId);

    if (!task || !decision) {
      return {
        title: 'Karar Bulunamadı',
        message: 'Lütfen geçerli bir mühendislik kararı seçin.',
        isTrap: false,
      };
    }

    updateCurrentPlayer(prev => {
      const nextMetrics = { ...prev.metrics };
      (Object.keys(decision.metricDeltas) as EngineeringMetricKey[]).forEach(
        k => {
          const delta = decision.metricDeltas[k] ?? 0;
          nextMetrics[k] = Math.max(0, nextMetrics[k] + delta);
        },
      );

      const nextPrefs =
        decision.designMdRuleToAdd &&
        !prev.verifiedPreferences.includes(decision.designMdRuleToAdd)
          ? [...prev.verifiedPreferences, decision.designMdRuleToAdd]
          : prev.verifiedPreferences;

      const isTrap = Boolean(decision.isTrapFall);
      const nextStatuses: Record<string, TaskStatus> = {
        ...prev.taskStatuses,
        [taskId]: isTrap ? 'needs_retry' : 'completed',
      };

      const nextCompletedToday =
        !isTrap && !prev.completedTaskIdsToday.includes(taskId)
          ? [...prev.completedTaskIdsToday, taskId]
          : prev.completedTaskIdsToday;

      const nextActivities = isTrap
        ? [
            ...prev.activitiesToday,
            {
              id: `trap_${task.id}_${Date.now()}`,
              label: `${task.title}: Zombie Trap Deneyimlendi`,
              badge: 'ÖĞRENME',
            },
          ]
        : prev.activitiesToday.some(a => a.id === `done_${task.id}`)
        ? prev.activitiesToday
        : [
            ...prev.activitiesToday,
            {
              id: `done_${task.id}`,
              label: `1 Zombie Kod Açığı Denetlendi (${task.fileName})`,
              badge: 'SOLVED',
            },
          ];

      return {
        ...prev,
        tokensUsed: Math.min(prev.tokenLimit, prev.tokensUsed + 20),
        gameMinutes: prev.gameMinutes + decision.timeCostMinutes,
        energy: Math.max(5, prev.energy - decision.energyCost),
        motivation: Math.max(
          10,
          Math.min(100, prev.motivation + decision.motivationDelta),
        ),
        metrics: nextMetrics,
        verifiedPreferences: nextPrefs,
        taskStatuses: nextStatuses,
        completedTaskIdsToday: nextCompletedToday,
        triggeredTrapToday: prev.triggeredTrapToday || isTrap,
        activitiesToday: nextActivities,
      };
    });

    setStatusBanner(`[${task.fileName}] ${decision.feedbackTitle}`);

    return {
      title: decision.feedbackTitle,
      message: decision.feedbackMessage,
      isTrap: Boolean(decision.isTrapFall),
    };
  };

  const applyEvaluationToPlayer = (
    evalResult: PersonalzyEvaluationResult,
    questionId: string,
    source: 'gemini_live' | 'validated_fallback',
    freeTextNote?: string,
  ) => {
    const themeAnalysis = analyzeConversationForFloorTheme({
      text: freeTextNote,
      communicationStyle: current.communicationStyle,
      currentTheme: current.floorTheme,
    });

    updateCurrentPlayer(prev => ({
      ...prev,
      tokensUsed: Math.min(prev.tokenLimit, prev.tokensUsed + 40),
      floorTheme: themeAnalysis.themeId,
      lastThemeAnalysisReason: themeAnalysis.reason,
      verifiedPreferences: syncThemeRuleInPreferences(
        prev.verifiedPreferences,
        themeAnalysis.designMdRule,
      ),
      metrics: {
        sistem_dusuncesi: Math.max(
          0,
          prev.metrics.sistem_dusuncesi +
            evalResult.metrik_degisimleri.sistem_dusuncesi,
        ),
        kod_okuryazarligi: Math.max(
          0,
          prev.metrics.kod_okuryazarligi +
            evalResult.metrik_degisimleri.kod_okuryazarligi,
        ),
        ai_denetimi: Math.max(
          0,
          prev.metrics.ai_denetimi + evalResult.metrik_degisimleri.ai_denetimi,
        ),
        hata_ayiklama_sabri: Math.max(
          0,
          prev.metrics.hata_ayiklama_sabri +
            evalResult.metrik_degisimleri.hata_ayiklama_sabri,
        ),
      },
      lastQuestionId: questionId,
      latestEvaluation: evalResult,
      latestEvaluationSource: source,
      recommendedNextDayTaskTitle:
        evalResult.ertesi_gun_remediasyon_gorevi.gorev_adi,
      journalCompletedForCurrentDay: true,
    }));
  };

  const submitJournalEntry = (params: {
    selectedQuickAnswerId: string | null;
    freeTextNote: string;
    skippedDetails: boolean;
  }): PersonalzyEvaluationResult => {
    const activeQuestion = selectJournalQuestionForDay({
      completedTaskCountToday: current.completedTaskIdsToday.length,
      triggeredTrapToday: current.triggeredTrapToday,
      lastQuestionId: current.lastQuestionId,
    });

    const evalResult = evaluateJournalWithPersonalzy({
      gameDay: current.gameDay,
      completedTaskIdsToday: current.completedTaskIdsToday,
      triggeredTrapToday: current.triggeredTrapToday,
      selectedQuickAnswerId: params.selectedQuickAnswerId,
      freeTextNote: params.freeTextNote,
      skippedDetails: params.skippedDetails,
      visitedGymToday: current.visitedGymToday,
    });

    applyEvaluationToPlayer(
      evalResult,
      activeQuestion.id,
      'validated_fallback',
      params.freeTextNote,
    );
    return evalResult;
  };

  const submitJournalEntryAsync = async (params: {
    selectedQuickAnswerId: string | null;
    freeTextNote: string;
    skippedDetails: boolean;
  }): Promise<PersonalzyEvaluationResult> => {
    const activeQuestion = selectJournalQuestionForDay({
      completedTaskCountToday: current.completedTaskIdsToday.length,
      triggeredTrapToday: current.triggeredTrapToday,
      lastQuestionId: current.lastQuestionId,
    });

    const remoteRes = await requestBackendPersonalzyReflect({
      uid: activePlayerUid,
      gameDay: current.gameDay,
      grade: current.profile.grade,
      questionId: activeQuestion.id,
      completedTaskIdsToday: current.completedTaskIdsToday,
      triggeredTrapToday: current.triggeredTrapToday,
      visitedGymToday: current.visitedGymToday,
      selectedQuickAnswerId: params.selectedQuickAnswerId,
      freeTextNote: params.freeTextNote,
      skippedDetails: params.skippedDetails,
    });

    if (remoteRes) {
      applyEvaluationToPlayer(
        remoteRes.evaluation,
        activeQuestion.id,
        remoteRes.source,
        params.freeTextNote,
      );
      return remoteRes.evaluation;
    }

    return submitJournalEntry(params);
  };

  const confirmAndStartNextDay = (): { ok: boolean; reason?: string } => {
    if (!current.journalCompletedForCurrentDay) {
      return {
        ok: false,
        reason:
          'Gün sonu günlüğü tamamlanmadan yeni güne geçilemez! (İsterseniz "Bugün paylaşmak istemiyorum" seçeneğini kullanabilirsiniz.)',
      };
    }

    const nextDay = current.gameDay + 1;
    const nextTaskHint = current.recommendedNextDayTaskTitle;

    updateCurrentPlayer(prev => ({
      ...prev,
      gameDay: nextDay,
      gameMinutes: 9 * 60,
      energy: 95,
      tokensUsed: 0,
      motivation: Math.min(100, prev.motivation + 10),
      location: 'dorm',
      playerPosition: {
        x: WORLD_MAPS.dorm.spawn.x,
        y: WORLD_MAPS.dorm.spawn.y,
      },
      playerFacing: WORLD_MAPS.dorm.spawn.facing,
      activitiesToday: [],
      completedTaskIdsToday: [],
      triggeredTrapToday: false,
      visitedGymToday: false,
      journalCompletedForCurrentDay: false,
      latestEvaluation: null,
      latestEvaluationSource: null,
    }));

    setActiveScreen('world_hud');
    setStatusBanner(
      `[GÜN ${nextDay} BAŞLADI] Enerjin (%95) ve günlük AI Token kotan (1000) yenilendi. ${
        nextTaskHint || 'Yeni görevler ZombieOS üzerinde hazır!'
      }`,
    );

    return { ok: true };
  };

  const clearCurrentPlayerMemory = () => {
    updateCurrentPlayer(prev => ({
      ...prev,
      verifiedPreferences: [FLOOR_THEMES[prev.floorTheme].designMdRule],
      openQuestions: [],
    }));
    setStatusBanner(
      `[GİZLİLİK] @${current.profile.username} (${activePlayerUid}) için AI hafızası ve tercih dosyası temizlendi.`,
    );
  };

  const value: GameStateContextValue = {
    activeScreen,
    setActiveScreen,
    isAuthenticated,
    activePlayerUid,
    registeredAccounts,
    switchPlayerAccount,
    loginWithCredentials,
    registerAccount,
    logoutAccount,
    worldRevision: current.worldRevision,
    profile: current.profile,
    tokenLimit: current.tokenLimit,
    tokensUsed: current.tokensUsed,
    floorTheme: current.floorTheme,
    lastThemeAnalysisReason: current.lastThemeAnalysisReason,
    analyzeChatAndAdaptTheme,
    gameDay: current.gameDay,
    gameMinutes: current.gameMinutes,
    formattedClock,
    location: current.location,
    playerPosition: current.playerPosition,
    playerFacing: current.playerFacing,
    energy: current.energy,
    motivation: current.motivation,
    socialBonds: current.socialBonds,
    coffeeCups: current.coffeeCups,
    metrics: current.metrics,
    tasks,
    taskStatuses: current.taskStatuses,
    selectedTaskId: current.selectedTaskId,
    verifiedPreferences: current.verifiedPreferences,
    openQuestions: current.openQuestions,
    activitiesToday: current.activitiesToday,
    completedTaskIdsToday: current.completedTaskIdsToday,
    triggeredTrapToday: current.triggeredTrapToday,
    visitedGymToday: current.visitedGymToday,
    journalCompletedForCurrentDay: current.journalCompletedForCurrentDay,
    lastQuestionId: current.lastQuestionId,
    latestEvaluation: current.latestEvaluation,
    latestEvaluationSource: current.latestEvaluationSource,
    recommendedNextDayTaskTitle: current.recommendedNextDayTaskTitle,
    npcRelationships: current.npcRelationships,
    communicationStyle: current.communicationStyle,
    lastNpcDialogue: current.lastNpcDialogue,
    targetWalkTile,
    isWalking,
    activeDialogueBubble: activeDialogueQueue[0] || null,
    statusBanner,
    setStatusBanner,
    startCareer,
    movePlayer,
    walkToTile,
    changeLocation,
    interactWithCurrentSpot,
    talkToNpc,
    advanceDialogueBubble,
    dismissDialogueBubble,
    setCommunicationStyle,
    selectTaskForAudit,
    leaveTaskAudit,
    submitEngineeringDecision,
    submitJournalEntry,
    submitJournalEntryAsync,
    confirmAndStartNextDay,
    clearCurrentPlayerMemory,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameStateContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used inside a GameProvider');
  }
  return ctx;
}
