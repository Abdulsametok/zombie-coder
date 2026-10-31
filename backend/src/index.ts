import http from 'http';
import { loadBackendEnv } from './config/env';
import { defaultWorldStore } from './modules/world/firestoreWorldStore';
import { reflectWithPersonalzy } from './modules/personalzy/personalzyService';
import { chatWithNpc } from './modules/npc/npcConversationService';
import { NpcChatApiRequest } from './schemas/gameSchemas';
import { isNpcId } from '../../src/features/social/npcRelationshipEngine';

function readJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Player-Uid',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function extractUid(req: http.IncomingMessage): string | null {
  const headerUid = req.headers['x-player-uid'];
  if (typeof headerUid === 'string' && headerUid.trim()) {
    return headerUid.trim();
  }
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return auth.slice('Bearer '.length).trim();
  }
  return null;
}

/**
 * Zombie Coder — Cloud Run / Node.js Backend API (`technic.md` Bölüm 9)
 */
export function createBackendServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    const uid = extractUid(req);
    if (!uid) {
      sendJson(res, 401, {
        error: 'UNAUTHORIZED',
        message: 'Geçerli bir kullanıcı kimliği (X-Player-Uid / Bearer token) gerekli.',
      });
      return;
    }

    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = url.pathname;

    try {
      // GET /v1/world & GET /v1/sync
      if (
        req.method === 'GET' &&
        (pathname === '/v1/world' || pathname === '/v1/sync')
      ) {
        const snapshot = defaultWorldStore.getPlayerSnapshot(uid, uid);
        sendJson(res, 200, { ok: true, data: snapshot });
        return;
      }

      // POST /v1/world/actions
      if (req.method === 'POST' && pathname === '/v1/world/actions') {
        const body = await readJsonBody(req);
        const eventId = String(body.eventId || `evt_${Date.now()}`);
        const result = defaultWorldStore.applyWorldEvent(uid, uid, {
          eventId,
          playerId: uid,
          type: body.type || 'MOVE',
          occurredAt: new Date().toISOString(),
          payload: body.payload || {},
        });
        sendJson(res, 200, { ok: true, ...result });
        return;
      }

      // GET /v1/memory
      if (req.method === 'GET' && pathname === '/v1/memory') {
        const snapshot = defaultWorldStore.getPlayerSnapshot(uid, uid);
        sendJson(res, 200, { ok: true, memory: snapshot.memory });
        return;
      }

      // PATCH /v1/memory/preferences
      if (req.method === 'PATCH' && pathname === '/v1/memory/preferences') {
        const body = await readJsonBody(req);
        const snapshot = defaultWorldStore.updatePreferences(
          uid,
          uid,
          Array.isArray(body.verifiedPreferences)
            ? body.verifiedPreferences
            : [],
          Array.isArray(body.openQuestions) ? body.openQuestions : undefined,
        );
        sendJson(res, 200, { ok: true, memory: snapshot.memory });
        return;
      }

      // DELETE /v1/memory (Oyuncunun kendi hafızasını silme hakkı - technic.md 12)
      if (req.method === 'DELETE' && pathname === '/v1/memory') {
        const snapshot = defaultWorldStore.clearPlayerMemory(uid, uid);
        sendJson(res, 200, { ok: true, memory: snapshot.memory });
        return;
      }

      // POST /v1/personalzy/reflect (Gemini API Gün Sonu Analizi - agent.md)
      if (req.method === 'POST' && pathname === '/v1/personalzy/reflect') {
        const body = await readJsonBody(req);
        const snapshot = defaultWorldStore.getPlayerSnapshot(uid, uid);

        const reflection = await reflectWithPersonalzy({
          playerId: uid,
          gameDay: Number(body.gameDay || snapshot.world.gameDay),
          grade: Number(body.grade || snapshot.profile.grade),
          completedTaskIdsToday: Array.isArray(body.completedTaskIdsToday)
            ? body.completedTaskIdsToday
            : [],
          triggeredTrapToday: Boolean(body.triggeredTrapToday),
          visitedGymToday: Boolean(body.visitedGymToday),
          selectedQuickAnswerId: body.selectedQuickAnswerId || null,
          freeTextNote: String(body.freeTextNote || ''),
          skippedDetails: Boolean(body.skippedDetails),
          verifiedPreferences: snapshot.memory.preferences.verifiedPreferences,
          previousRecommendedTaskTitle:
            snapshot.world.recommendedNextDayTaskTitle,
        });

        defaultWorldStore.saveJournalEntry(uid, uid, {
          id: `journal_day_${body.gameDay || snapshot.world.gameDay}`,
          gameDay: Number(body.gameDay || snapshot.world.gameDay),
          questionId: String(body.questionId || 'q_ai_code_trust_1'),
          selectedQuickAnswerId: body.selectedQuickAnswerId || null,
          freeTextNote: String(body.freeTextNote || ''),
          skippedDetails: Boolean(body.skippedDetails),
          completedAt: new Date().toISOString(),
          reflectionStatus:
            reflection.source === 'gemini_live' ? 'ready' : 'fallback',
          evaluation: reflection.evaluation,
        });

        sendJson(res, 200, { ok: true, ...reflection });
        return;
      }

      // POST /v1/npc/chat (AI-Native NPC sohbeti — her mesajda Gemini çağrılır)
      if (req.method === 'POST' && pathname === '/v1/npc/chat') {
        const body = (await readJsonBody(req)) as Partial<NpcChatApiRequest>;
        if (!isNpcId(body.npcId)) {
          sendJson(res, 400, { error: 'INVALID_NPC', npcId: body.npcId });
          return;
        }
        if (typeof body.playerMessage !== 'string' || !body.playerMessage.trim()) {
          sendJson(res, 400, { error: 'EMPTY_MESSAGE' });
          return;
        }
        const snapshot = defaultWorldStore.getPlayerSnapshot(uid, uid);

        const chatResult = await chatWithNpc({
          playerId: uid,
          npcId: body.npcId,
          playerMessage: body.playerMessage,
          playerName: String(body.playerName || snapshot.profile.name),
          playerStyle: body.playerStyle || 'casual',
          gameDay: Number(body.gameDay || snapshot.world.gameDay),
          clock: body.clock || null,
          playerLocationLabel: body.playerLocationLabel || null,
          activeTaskTitle: body.activeTaskTitle || null,
          clientRelationship: body.relationship,
        });

        sendJson(res, 200, { ok: true, result: chatResult });
        return;
      }

      // GET /v1/npc/relationships (Oyuncunun kendi NPC ilişkileri ve hafızası)
      if (req.method === 'GET' && pathname === '/v1/npc/relationships') {
        const snapshot = defaultWorldStore.getPlayerSnapshot(uid, uid);
        sendJson(res, 200, { ok: true, relationships: snapshot.npcRelationships });
        return;
      }

      sendJson(res, 404, { error: 'NOT_FOUND', path: pathname });
    } catch (err: any) {
      sendJson(res, 500, {
        error: 'INTERNAL_ERROR',
        message: err?.message || 'Sunucu hatası',
      });
    }
  });
}

if (require.main === module) {
  const env = loadBackendEnv();
  const server = createBackendServer();
  server.listen(env.port, () => {
    console.log(
      `[ZombieCoder Backend] Cloud Run API dinleniyor: http://localhost:${env.port} (Personalzy: ${env.geminiModel}, NPC: ${env.geminiNpcModel}, API anahtarı: ${env.geminiApiKey ? 'var' : 'YOK'})`,
    );
  });
}
