import React, { createContext, useContext, useMemo, useState } from 'react';
import { Direction } from '../game/maps/dormRoomMap';
import { LocationId, WORLD_MAPS } from '../game/maps/worldMaps';
import {
  GridPosition,
  attemptPlayerStep,
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

export type ActiveScreenId =
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

export type TaskStatus = 'available' | 'in_progress' | 'completed' | 'needs_retry';

export interface PlayerProfile {
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

export interface GameStateContextValue {
  activeScreen: ActiveScreenId;
  setActiveScreen: (screen: ActiveScreenId) => void;
  careerStarted: boolean;
  profile: PlayerProfile;
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
  recommendedNextDayTaskTitle: string | null;
  statusBanner: string;
  setStatusBanner: (msg: string) => void;

  // Actions
  startCareer: (nextProfile: Partial<PlayerProfile>) => void;
  movePlayer: (dir: Direction) => void;
  changeLocation: (target: LocationId) => void;
  interactWithCurrentSpot: () => void;
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
  confirmAndStartNextDay: () => { ok: boolean; reason?: string };
}

const GameContext = createContext<GameStateContextValue | null>(null);

export function GameProvider({
  children,
  initialScreen = 'world_hud',
}: {
  children: React.ReactNode;
  initialScreen?: ActiveScreenId;
}): React.JSX.Element {
  const [activeScreen, setActiveScreen] =
    useState<ActiveScreenId>(initialScreen);
  const [careerStarted, setCareerStarted] = useState<boolean>(true);
  const [profile, setProfile] = useState<PlayerProfile>({
    name: 'Deniz Yılmaz',
    avatarStyle: 'hacker_hoodie',
    grade: 1,
    gpa: '3.82',
  });

  const [gameDay, setGameDay] = useState<number>(1);
  const [gameMinutes, setGameMinutes] = useState<number>(9 * 60); // 09:00
  const [location, setLocation] = useState<LocationId>('dorm');
  const [playerPosition, setPlayerPosition] = useState<GridPosition>({
    x: WORLD_MAPS.dorm.spawn.x,
    y: WORLD_MAPS.dorm.spawn.y,
  });
  const [playerFacing, setPlayerFacing] = useState<Direction>(
    WORLD_MAPS.dorm.spawn.facing,
  );

  const [energy, setEnergy] = useState<number>(85);
  const [motivation, setMotivation] = useState<number>(90);
  const [socialBonds, setSocialBonds] = useState<number>(60);
  const [coffeeCups] = useState<number>(3);

  const [metrics, setMetrics] = useState<Record<EngineeringMetricKey, number>>({
    sistem_dusuncesi: 12,
    kod_okuryazarligi: 15,
    ai_denetimi: 14,
    hata_ayiklama_sabri: 12,
  });

  const [tasks] = useState<EngineeringTask[]>(INITIAL_ENGINEERING_TASKS);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({
    task_legacy_login_audit: 'available',
    task_g1_1_loop_syntax: 'available',
    task_g1_2_edge_case_rogue: 'available',
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    'task_legacy_login_audit',
  );

  const [verifiedPreferences, setVerifiedPreferences] = useState<string[]>([
    'Dark Mode Zorunlu',
    'JWT Auth',
    'Katı Tip Güvenliği',
  ]);
  const [openQuestions, setOpenQuestions] = useState<string[]>([
    'Şifre hash algoritmasında geriye dönük uyumluluk riski var mı?',
  ]);

  const [activitiesToday, setActivitiesToday] = useState<ActivityLogItem[]>([
    {
      id: 'act_init_1',
      label: '1 Üniversite Dersi Planlandı (BMB201)',
      badge: 'AKTİF',
    },
  ]);
  const [completedTaskIdsToday, setCompletedTaskIdsToday] = useState<string[]>(
    [],
  );
  const [triggeredTrapToday, setTriggeredTrapToday] = useState<boolean>(false);
  const [visitedGymToday, setVisitedGymToday] = useState<boolean>(false);
  const [journalCompletedForCurrentDay, setJournalCompletedForCurrentDay] =
    useState<boolean>(false);
  const [lastQuestionId, setLastQuestionId] = useState<string | undefined>(
    undefined,
  );
  const [latestEvaluation, setLatestEvaluation] =
    useState<PersonalzyEvaluationResult | null>(null);
  const [recommendedNextDayTaskTitle, setRecommendedNextDayTaskTitle] =
    useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string>(
    'SYS.READY // D-Pad ile hareket et, nesnelerin yanında ETKİLEŞİM butonuna bas.',
  );

  const formattedClock = useMemo(() => {
    const h = Math.floor(gameMinutes / 60) % 24;
    const m = gameMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }, [gameMinutes]);

  const startCareer = (nextProfile: Partial<PlayerProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...nextProfile,
      name: nextProfile.name?.trim() || prev.name,
    }));
    setCareerStarted(true);
    setEnergy(100);
    setMotivation(90);
    setGameDay(1);
    setGameMinutes(9 * 60);
    setLocation('dorm');
    setPlayerPosition({
      x: WORLD_MAPS.dorm.spawn.x,
      y: WORLD_MAPS.dorm.spawn.y,
    });
    setPlayerFacing(WORLD_MAPS.dorm.spawn.facing);
    setActiveScreen('world_hud');
    setStatusBanner(
      `[SYS.INIT] Hoş geldin ${
        nextProfile.name?.trim() || profile.name
      }! 1. Sınıf yolculuğun başladı.`,
    );
  };

  const changeLocation = (target: LocationId) => {
    const targetMap = WORLD_MAPS[target];
    setLocation(target);
    setPlayerPosition({ x: targetMap.spawn.x, y: targetMap.spawn.y });
    setPlayerFacing(targetMap.spawn.facing);
    setGameMinutes(prev => prev + 15);
    setEnergy(prev => Math.max(10, prev - 4));

    if (target === 'university') {
      setStatusBanner(
        '[ÜNİVERSİTE] BMB201 Amfi & Lab binasına girdin. Prof. Demir kürsüde!',
      );
      setActivitiesToday(prev =>
        prev.some(a => a.id === 'act_uni_visit')
          ? prev
          : [
              ...prev,
              {
                id: 'act_uni_visit',
                label: '1 Üniversite Dersi Tamamlandı',
                badge: '+20 XP',
              },
            ],
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
    const currentMap = WORLD_MAPS[location];
    const result = attemptPlayerStep(currentMap, playerPosition, dir);
    setPlayerFacing(result.facing);

    if (result.blocked) {
      setStatusBanner(
        `[ÇARPIŞMA] (${result.position.x}, ${result.position.y}) yönünde engel var!`,
      );
      return;
    }

    setPlayerPosition(result.position);
    setGameMinutes(prev => prev + 2);

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

  const interactWithCurrentSpot = () => {
    const currentMap = WORLD_MAPS[location];
    const spot = getActiveInteraction(
      currentMap,
      playerPosition,
      playerFacing,
    );

    if (!spot) {
      setStatusBanner(
        'Yakında etkileşime girilecek bir nesne yok. Bilgisayar, yatak veya kapıya yaklaş.',
      );
      return;
    }

    switch (spot.kind) {
      case 'open_computer':
        setGameMinutes(prev => prev + 10);
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
        if (location === 'dorm') {
          changeLocation('university');
        } else if (location === 'university') {
          changeLocation('gym');
        } else {
          changeLocation('dorm');
        }
        break;

      case 'inspect_bonsai':
        if (location === 'gym') {
          setVisitedGymToday(true);
          setMotivation(prev => Math.min(100, prev + 12));
          setSocialBonds(prev => Math.min(100, prev + 8));
          setEnergy(prev => Math.max(15, prev - 8));
          setGameMinutes(prev => prev + 30);
          setActivitiesToday(prev =>
            prev.some(a => a.id === 'act_gym')
              ? prev
              : [
                  ...prev,
                  {
                    id: 'act_gym',
                    label: 'Spor Salonu Antrenmanı Tamamlandı',
                    badge: '+12 MOTİVASYON',
                  },
                ],
          );
          setStatusBanner(
            '[KOÇ BURAK] "Harika antrenmandı! Zihnin açıldı, motivasyonun +12 arttı!"',
          );
        } else {
          setMotivation(prev => Math.min(100, prev + 5));
          setStatusBanner(
            '[BONSAI] Oda bitkisiyle ilgilendin. Motivasyon +5 arttı!',
          );
        }
        break;
    }
  };

  const selectTaskForAudit = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskStatuses(prev => ({
      ...prev,
      [taskId]: prev[taskId] === 'completed' ? 'completed' : 'in_progress',
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

    setGameMinutes(prev => prev + decision.timeCostMinutes);
    setEnergy(prev => Math.max(5, prev - decision.energyCost));
    setMotivation(prev =>
      Math.max(10, Math.min(100, prev + decision.motivationDelta)),
    );

    // Gizli/Mühendislik metriklerini güncelle
    setMetrics(prev => {
      const next = { ...prev };
      (Object.keys(decision.metricDeltas) as EngineeringMetricKey[]).forEach(
        k => {
          const delta = decision.metricDeltas[k] ?? 0;
          next[k] = Math.max(0, next[k] + delta);
        },
      );
      return next;
    });

    if (decision.designMdRuleToAdd) {
      const rule = decision.designMdRuleToAdd;
      setVerifiedPreferences(prev =>
        prev.includes(rule) ? prev : [...prev, rule],
      );
    }

    if (decision.isTrapFall) {
      setTriggeredTrapToday(true);
      setTaskStatuses(prev => ({ ...prev, [taskId]: 'needs_retry' }));
      setOpenQuestions(prev => [
        `[${task.fileName}] ${task.warningTitle} için ek doğrulama yapılacak.`,
        ...prev.slice(0, 2),
      ]);
      setActivitiesToday(prev => [
        ...prev,
        {
          id: `trap_${task.id}_${Date.now()}`,
          label: `${task.title}: Zombie Trap Deneyimlendi`,
          badge: 'ÖĞRENME',
        },
      ]);
    } else {
      setTaskStatuses(prev => ({ ...prev, [taskId]: 'completed' }));
      setCompletedTaskIdsToday(prev =>
        prev.includes(taskId) ? prev : [...prev, taskId],
      );
      setActivitiesToday(prev =>
        prev.some(a => a.id === `done_${task.id}`)
          ? prev
          : [
              ...prev,
              {
                id: `done_${task.id}`,
                label: `1 Zombie Kod Açığı Denetlendi (${task.fileName})`,
                badge: 'SOLVED',
              },
            ],
      );
    }

    setStatusBanner(`[${task.fileName}] ${decision.feedbackTitle}`);

    return {
      title: decision.feedbackTitle,
      message: decision.feedbackMessage,
      isTrap: Boolean(decision.isTrapFall),
    };
  };

  const submitJournalEntry = (params: {
    selectedQuickAnswerId: string | null;
    freeTextNote: string;
    skippedDetails: boolean;
  }): PersonalzyEvaluationResult => {
    const activeQuestion = selectJournalQuestionForDay({
      completedTaskCountToday: completedTaskIdsToday.length,
      triggeredTrapToday,
      lastQuestionId,
    });

    const evalResult = evaluateJournalWithPersonalzy({
      gameDay,
      completedTaskIdsToday,
      triggeredTrapToday,
      selectedQuickAnswerId: params.selectedQuickAnswerId,
      freeTextNote: params.freeTextNote,
      skippedDetails: params.skippedDetails,
      visitedGymToday,
    });

    setMetrics(prev => ({
      sistem_dusuncesi: Math.max(
        0,
        prev.sistem_dusuncesi + evalResult.metrik_degisimleri.sistem_dusuncesi,
      ),
      kod_okuryazarligi: Math.max(
        0,
        prev.kod_okuryazarligi +
          evalResult.metrik_degisimleri.kod_okuryazarligi,
      ),
      ai_denetimi: Math.max(
        0,
        prev.ai_denetimi + evalResult.metrik_degisimleri.ai_denetimi,
      ),
      hata_ayiklama_sabri: Math.max(
        0,
        prev.hata_ayiklama_sabri +
          evalResult.metrik_degisimleri.hata_ayiklama_sabri,
      ),
    }));

    setLastQuestionId(activeQuestion.id);
    setLatestEvaluation(evalResult);
    setRecommendedNextDayTaskTitle(
      evalResult.ertesi_gun_remediasyon_gorevi.gorev_adi,
    );
    setJournalCompletedForCurrentDay(true);

    return evalResult;
  };

  const confirmAndStartNextDay = (): { ok: boolean; reason?: string } => {
    if (!journalCompletedForCurrentDay) {
      return {
        ok: false,
        reason:
          'Gün sonu günlüğü tamamlanmadan yeni güne geçilemez! (İsterseniz "Bugün paylaşmak istemiyorum" seçeneğini kullanabilirsiniz.)',
      };
    }

    const nextDay = gameDay + 1;
    setGameDay(nextDay);
    setGameMinutes(9 * 60); // 09:00
    setEnergy(95);
    setMotivation(prev => Math.min(100, prev + 10));
    setLocation('dorm');
    setPlayerPosition({
      x: WORLD_MAPS.dorm.spawn.x,
      y: WORLD_MAPS.dorm.spawn.y,
    });
    setPlayerFacing(WORLD_MAPS.dorm.spawn.facing);
    setActivitiesToday([]);
    setCompletedTaskIdsToday([]);
    setTriggeredTrapToday(false);
    setVisitedGymToday(false);
    setJournalCompletedForCurrentDay(false);
    setLatestEvaluation(null);
    setActiveScreen('world_hud');
    setStatusBanner(
      `[GÜN ${nextDay} BAŞLADI] Enerjin yenilendi (%95). ${
        recommendedNextDayTaskTitle || 'Yeni görevler ZombieOS üzerinde hazır!'
      }`,
    );

    return { ok: true };
  };

  const value: GameStateContextValue = {
    activeScreen,
    setActiveScreen,
    careerStarted,
    profile,
    gameDay,
    gameMinutes,
    formattedClock,
    location,
    playerPosition,
    playerFacing,
    energy,
    motivation,
    socialBonds,
    coffeeCups,
    metrics,
    tasks,
    taskStatuses,
    selectedTaskId,
    verifiedPreferences,
    openQuestions,
    activitiesToday,
    completedTaskIdsToday,
    triggeredTrapToday,
    visitedGymToday,
    journalCompletedForCurrentDay,
    lastQuestionId,
    latestEvaluation,
    recommendedNextDayTaskTitle,
    statusBanner,
    setStatusBanner,
    startCareer,
    movePlayer,
    changeLocation,
    interactWithCurrentSpot,
    selectTaskForAudit,
    leaveTaskAudit,
    submitEngineeringDecision,
    submitJournalEntry,
    confirmAndStartNextDay,
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
