import {
  buildDialogueBubbleSequence,
  createInitialNpcRelationships,
  getRelationshipTier,
  interactWithNpc,
} from '../src/features/social/npcRelationshipEngine';
import {
  FOUR_YEAR_CURRICULUM_ROADMAP,
  getCurriculumForYear,
} from '../src/features/curriculum/curriculumRoadmap';
import { INITIAL_ENGINEERING_TASKS } from '../src/features/tasks/taskCatalog';
import {
  GAME_LOGO_ASSET,
  MAIN_CHAR_FRAMES,
  MAIN_CHAR_PORTRAIT,
  MAIN_CHAR_SPRITESHEET,
  NPC_SPRITE_ASSETS,
  getCharacterFrameSource,
} from '../src/game/sprites/mainCharSprites';

describe('Faz 7 & Faz 8 — NPC Sosyal İlişkiler, Üslup Adaptasyonu ve 4 Yıllık Müfredat', () => {
  test('Faz 7: Spor salonuna ilk kez giden oyuncu ile düzenli giden oyuncu Koç Burak’tan farklı ve tutarlı yanıtlar alır', () => {
    const initialRels = createInitialNpcRelationships();
    const firstTimeBurak = initialRels.coach_burak;

    expect(getRelationshipTier(firstTimeBurak.familiarity)).toBe('first_time');

    const firstVisit = interactWithNpc({
      relationship: firstTimeBurak,
      playerStyle: 'casual',
      gameDay: 1,
    });

    expect(firstVisit.dialogue.tier).toBe('first_time');

    // Düzenli spor salonu müdavimi (familiarity >= 60)
    const regularBurak = {
      ...firstTimeBurak,
      familiarity: 68,
      trust: 65,
      interactionCount: 5,
    };

    expect(getRelationshipTier(regularBurak.familiarity)).toBe(
      'regular_trusted',
    );

    const regularVisit = interactWithNpc({
      relationship: regularBurak,
      playerStyle: 'casual',
      gameDay: 6,
    });

    expect(regularVisit.dialogue.tier).toBe('regular_trusted');
    expect(regularVisit.dialogue.id).not.toBe(firstVisit.dialogue.id);
    expect(regularVisit.dialogue.motivationBonus).toBeGreaterThan(
      firstVisit.dialogue.motivationBonus,
    );
  });

  test('Faz 7: NPC yanıtları oyuncunun iletişim üslubuna (casual vs formal) uyum sağlar ve tekrara düşmez', () => {
    const baseRel = {
      ...createInitialNpcRelationships().prof_demir,
      familiarity: 70,
      trust: 75,
    };

    const casualRes = interactWithNpc({
      relationship: baseRel,
      playerStyle: 'casual',
      gameDay: 4,
    });

    const formalRes = interactWithNpc({
      relationship: baseRel,
      playerStyle: 'formal',
      gameDay: 4,
    });

    expect(casualRes.dialogue.style).toBe('casual');
    expect(formalRes.dialogue.style).toBe('formal');
    expect(casualRes.dialogue.greeting).not.toBe(formalRes.dialogue.greeting);

    // Ardışık konuşmada son kullanılan diyalog tekrar seçilmez
    const firstTurn = interactWithNpc({
      relationship: createInitialNpcRelationships().coach_burak,
      playerStyle: 'casual',
      gameDay: 1,
    });
    // familiarity < 20 kalacak şekilde test edelim
    const stillFirstTierRel = {
      ...firstTurn.updatedRelationship,
      familiarity: 15,
    };
    const secondTurn = interactWithNpc({
      relationship: stillFirstTierRel,
      playerStyle: 'casual',
      gameDay: 1,
    });

    expect(secondTurn.dialogue.id).not.toBe(firstTurn.dialogue.id);
  });

  test('Faz 8: 4 yıllık müfredat şeması (G1.1 - G8.2) 4 sınıf ve 8 dönemin tamamını kapsar', () => {
    expect(FOUR_YEAR_CURRICULUM_ROADMAP).toHaveLength(16);

    for (const year of [1, 2, 3, 4] as const) {
      const modules = getCurriculumForYear(year);
      expect(modules).toHaveLength(4);
    }

    const taskIds = new Set(INITIAL_ENGINEERING_TASKS.map(t => t.id));
    const linkedModules = FOUR_YEAR_CURRICULUM_ROADMAP.filter(
      m => m.linkedTaskId,
    );
    expect(linkedModules.length).toBeGreaterThanOrEqual(7);

    for (const mod of linkedModules) {
      expect(taskIds.has(mod.linkedTaskId!)).toBe(true);
    }
  });

  test('Ana karakter sprite ve animasyon kareleri 4 yön (down, up, left, right) ve oyun logosu için eksiksiz tanımlıdır', () => {
    expect(GAME_LOGO_ASSET).toBeDefined();
    expect(MAIN_CHAR_SPRITESHEET).toBeDefined();

    for (const dir of ['down', 'up', 'left', 'right'] as const) {
      expect(MAIN_CHAR_FRAMES[dir].idle).toHaveLength(2);
      expect(MAIN_CHAR_FRAMES[dir].walk).toHaveLength(6);

      const idleFrame0 = getCharacterFrameSource(dir, 'idle', 0);
      const walkFrame1 = getCharacterFrameSource(dir, 'walk', 1);
      expect(idleFrame0).toBeDefined();
      expect(walkFrame1).toBeDefined();
    }

    expect(MAIN_CHAR_PORTRAIT).toBeDefined();
    expect(NPC_SPRITE_ASSETS.prof_demir.idle).toBeDefined();
    expect(NPC_SPRITE_ASSETS.prof_demir.talk).toBeDefined();
    expect(NPC_SPRITE_ASSETS.prof_demir.portrait).toBeDefined();
    expect(NPC_SPRITE_ASSETS.coach_burak.idle).toBeDefined();
    expect(NPC_SPRITE_ASSETS.coach_burak.talk).toBeDefined();
    expect(NPC_SPRITE_ASSETS.coach_burak.portrait).toBeDefined();
  });

  test('Konuşmalar 3 adımlı konuşma balonu (NPC -> Oyuncu -> NPC) şeklinde ilerler', () => {
    const rels = createInitialNpcRelationships();
    const res = interactWithNpc({
      relationship: rels.prof_demir,
      playerStyle: 'casual',
      gameDay: 1,
    });

    const bubbles = buildDialogueBubbleSequence({
      relationship: res.updatedRelationship,
      dialogue: res.dialogue,
      playerName: 'Deniz Yılmaz',
      playerStyle: 'casual',
    });

    expect(bubbles).toHaveLength(3);
    expect(bubbles[0].speakerKind).toBe('npc');
    expect(bubbles[0].speakerName).toBe('Prof. Demir');
    expect(bubbles[1].speakerKind).toBe('player');
    expect(bubbles[1].speakerName).toBe('Deniz Yılmaz');
    expect(bubbles[2].speakerKind).toBe('npc');
    expect(bubbles[2].stepIndex).toBe(2);
  });
});
