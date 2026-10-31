import {
  CURRENT_SCHEMA_VERSION,
  FirestoreEventDoc,
  FirestoreJournalEntryDoc,
  FirestorePlayerProfileDoc,
  IsolatedPlayerNamespace,
} from '../../schemas/gameSchemas';
import { WORLD_MAPS } from '../../../../src/game/maps/worldMaps';
import { INITIAL_ENGINEERING_TASKS } from '../../../../src/features/tasks/taskCatalog';
import {
  NpcId,
  NpcRelationship,
  createInitialNpcRelationships,
} from '../../../../src/features/social/npcRelationshipEngine';

/**
 * Faz 5 — UID Bazlı İzole Firestore Veri Katmanı (`users/{uid}/...`)
 * A oyuncusunun dünyası, görevleri, günlüğü ve tercihleri B oyuncusundan
 * tamamen izole tutulur; olaylar `eventId` ile idempotent işlenir.
 */
export class IsolatedFirestoreWorldStore {
  private users = new Map<string, IsolatedPlayerNamespace>();

  private assertAuthorized(requesterUid: string, targetUid: string): void {
    if (!requesterUid || !targetUid || requesterUid !== targetUid) {
      throw new Error(
        `PERMISSION_DENIED: Kullanıcı (${requesterUid}) başka bir oyuncunun (${targetUid}) verisine erişemez.`,
      );
    }
  }

  private createDefaultNamespace(
    uid: string,
    defaultName = 'Deniz Yılmaz',
  ): IsolatedPlayerNamespace {
    const now = new Date().toISOString();
    const tasksMap: IsolatedPlayerNamespace['tasks'] = {};
    for (const t of INITIAL_ENGINEERING_TASKS) {
      tasksMap[t.id] = {
        taskId: t.id,
        status: 'available',
        attempts: 0,
        updatedAt: now,
      };
    }

    return {
      profile: {
        uid,
        name: defaultName,
        avatarStyle: 'hacker_hoodie',
        grade: 1,
        gpa: '3.82',
        createdAt: now,
        updatedAt: now,
      },
      world: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        worldRevision: 1,
        updatedAt: now,
        gameDay: 1,
        gameMinutes: 9 * 60,
        location: 'dorm',
        playerPosition: {
          x: WORLD_MAPS.dorm.spawn.x,
          y: WORLD_MAPS.dorm.spawn.y,
        },
        playerFacing: WORLD_MAPS.dorm.spawn.facing,
        journalCompletedForCurrentDay: false,
        recommendedNextDayTaskTitle: null,
      },
      stats: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        updatedAt: now,
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
      },
      tasks: tasksMap,
      journal: {},
      npcRelationships: createInitialNpcRelationships(uid),
      memory: {
        preferences: {
          verifiedPreferences: [
            'Dark Mode Zorunlu',
            'JWT Auth',
            'Katı Tip Güvenliği',
          ],
          openQuestions: [
            'Şifre hash algoritmasında geriye dönük uyumluluk riski var mı?',
          ],
          updatedAt: now,
        },
        observations: {},
        summaries: [],
      },
      events: {},
      aiProposals: {},
    };
  }

  public getPlayerSnapshot(
    requesterUid: string,
    targetUid: string = requesterUid,
    defaultName?: string,
  ): IsolatedPlayerNamespace {
    this.assertAuthorized(requesterUid, targetUid);
    if (!this.users.has(targetUid)) {
      this.users.set(
        targetUid,
        this.createDefaultNamespace(targetUid, defaultName),
      );
    }
    // Deep clone to prevent accidental cross-reference mutation
    return JSON.parse(JSON.stringify(this.users.get(targetUid)!));
  }

  public updatePlayerProfile(
    requesterUid: string,
    targetUid: string,
    patch: Partial<
      Pick<
        FirestorePlayerProfileDoc,
        'name' | 'avatarStyle' | 'grade' | 'gpa'
      >
    >,
  ): IsolatedPlayerNamespace {
    this.assertAuthorized(requesterUid, targetUid);
    const ns = this.getPlayerSnapshot(requesterUid, targetUid);
    const now = new Date().toISOString();
    ns.profile = {
      ...ns.profile,
      ...patch,
      updatedAt: now,
    };
    ns.world.worldRevision += 1;
    ns.world.updatedAt = now;
    this.users.set(targetUid, ns);
    return this.getPlayerSnapshot(requesterUid, targetUid);
  }

  /**
   * Idempotent olay kaydı (`technic.md` Bölüm 8 & 11):
   * Aynı `eventId` tekrar gönderilirse dünya revizyonu ve durum ikinci kez değişmez.
   */
  public applyWorldEvent(
    requesterUid: string,
    targetUid: string,
    event: FirestoreEventDoc,
    mutator?: (ns: IsolatedPlayerNamespace) => void,
  ): { applied: boolean; duplicate: boolean; snapshot: IsolatedPlayerNamespace } {
    this.assertAuthorized(requesterUid, targetUid);
    const ns = this.getPlayerSnapshot(requesterUid, targetUid);

    if (ns.events[event.eventId]) {
      return {
        applied: false,
        duplicate: true,
        snapshot: ns,
      };
    }

    if (mutator) {
      mutator(ns);
    }

    const now = new Date().toISOString();
    ns.events[event.eventId] = {
      ...event,
      playerId: targetUid,
      occurredAt: event.occurredAt || now,
    };
    ns.world.worldRevision += 1;
    ns.world.updatedAt = now;
    ns.stats.updatedAt = now;

    this.users.set(targetUid, ns);
    return {
      applied: true,
      duplicate: false,
      snapshot: this.getPlayerSnapshot(requesterUid, targetUid),
    };
  }

  public saveJournalEntry(
    requesterUid: string,
    targetUid: string,
    entry: FirestoreJournalEntryDoc,
  ): IsolatedPlayerNamespace {
    this.assertAuthorized(requesterUid, targetUid);
    const ns = this.getPlayerSnapshot(requesterUid, targetUid);
    const now = new Date().toISOString();

    ns.journal[entry.id] = entry;
    ns.world.journalCompletedForCurrentDay = true;
    ns.world.lastQuestionId = entry.questionId;

    if (entry.evaluation) {
      ns.world.recommendedNextDayTaskTitle =
        entry.evaluation.ertesi_gun_remediasyon_gorevi.gorev_adi;
      ns.stats.metrics = {
        sistem_dusuncesi: Math.max(
          0,
          ns.stats.metrics.sistem_dusuncesi +
            entry.evaluation.metrik_degisimleri.sistem_dusuncesi,
        ),
        kod_okuryazarligi: Math.max(
          0,
          ns.stats.metrics.kod_okuryazarligi +
            entry.evaluation.metrik_degisimleri.kod_okuryazarligi,
        ),
        ai_denetimi: Math.max(
          0,
          ns.stats.metrics.ai_denetimi +
            entry.evaluation.metrik_degisimleri.ai_denetimi,
        ),
        hata_ayiklama_sabri: Math.max(
          0,
          ns.stats.metrics.hata_ayiklama_sabri +
            entry.evaluation.metrik_degisimleri.hata_ayiklama_sabri,
        ),
      };
      ns.memory.summaries = [
        entry.evaluation.gunluk_ozeti,
        ...ns.memory.summaries.slice(0, 9),
      ];
    }

    ns.world.worldRevision += 1;
    ns.world.updatedAt = now;
    this.users.set(targetUid, ns);
    return this.getPlayerSnapshot(requesterUid, targetUid);
  }

  public updatePreferences(
    requesterUid: string,
    targetUid: string,
    verifiedPreferences: string[],
    openQuestions?: string[],
  ): IsolatedPlayerNamespace {
    this.assertAuthorized(requesterUid, targetUid);
    const ns = this.getPlayerSnapshot(requesterUid, targetUid);
    const now = new Date().toISOString();
    ns.memory.preferences = {
      verifiedPreferences: [...verifiedPreferences],
      openQuestions: openQuestions
        ? [...openQuestions]
        : ns.memory.preferences.openQuestions,
      updatedAt: now,
    };
    ns.world.worldRevision += 1;
    ns.world.updatedAt = now;
    this.users.set(targetUid, ns);
    return this.getPlayerSnapshot(requesterUid, targetUid);
  }

  /** `users/{uid}/npcRelationships/{npcId}` — yalnızca sahibi okuyabilir. */
  public getNpcRelationship(
    requesterUid: string,
    targetUid: string,
    npcId: NpcId,
  ): NpcRelationship {
    const ns = this.getPlayerSnapshot(requesterUid, targetUid);
    return ns.npcRelationships[npcId];
  }

  public saveNpcRelationship(
    requesterUid: string,
    targetUid: string,
    relationship: NpcRelationship,
  ): NpcRelationship {
    this.assertAuthorized(requesterUid, targetUid);
    if (relationship.playerId !== targetUid) {
      throw new Error(
        `PERMISSION_DENIED: ${relationship.npcId} ilişkisi başka bir oyuncuya (${relationship.playerId}) ait.`,
      );
    }
    const ns = this.getPlayerSnapshot(requesterUid, targetUid);
    ns.npcRelationships[relationship.npcId] = relationship;
    ns.world.worldRevision += 1;
    ns.world.updatedAt = new Date().toISOString();
    this.users.set(targetUid, ns);
    return this.getNpcRelationship(requesterUid, targetUid, relationship.npcId);
  }

  public clearPlayerMemory(
    requesterUid: string,
    targetUid: string,
  ): IsolatedPlayerNamespace {
    this.assertAuthorized(requesterUid, targetUid);
    const ns = this.getPlayerSnapshot(requesterUid, targetUid);
    const now = new Date().toISOString();
    ns.memory = {
      preferences: {
        verifiedPreferences: [],
        openQuestions: [],
        updatedAt: now,
      },
      observations: {},
      summaries: [],
    };
    ns.npcRelationships = createInitialNpcRelationships(targetUid);
    ns.world.worldRevision += 1;
    ns.world.updatedAt = now;
    this.users.set(targetUid, ns);
    return this.getPlayerSnapshot(requesterUid, targetUid);
  }
}

export const defaultWorldStore = new IsolatedFirestoreWorldStore();
