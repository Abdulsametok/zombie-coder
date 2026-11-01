import {
  NPC_PERSONAS,
  createInitialNpcRelationships,
  getFirstMeetingPrompts,
  getRelationshipTier,
  needsFirstMeeting,
} from '../src/features/social/npcRelationshipEngine';
import {
  FOUR_YEAR_CURRICULUM_ROADMAP,
  getCurriculumForYear,
} from '../src/features/curriculum/curriculumRoadmap';
import { INITIAL_ENGINEERING_TASKS } from '../src/features/tasks/taskCatalog';
import {
  GAME_LOGO_ASSET,
  MAIN_CHAR_FEMALE_FRAMES,
  MAIN_CHAR_FEMALE_PORTRAIT,
  MAIN_CHAR_FRAMES,
  MAIN_CHAR_PORTRAIT,
  MAIN_CHAR_SPRITESHEET,
  NPC_SPRITE_ASSETS,
  getAvatarPreviewSource,
  getCharacterFrameSource,
  getMainCharPortrait,
} from '../src/game/sprites/mainCharSprites';
import { TEST_PLAYER_ACCOUNTS } from '../src/services/playerWorldService';
import {
  analyzeConversationForFloorTheme,
  syncThemeRuleInPreferences,
} from '../src/features/theme/adaptiveFloorTheme';

describe('Faz 7 & Faz 8 — NPC Sosyal İlişkiler, Üslup Adaptasyonu ve 4 Yıllık Müfredat', () => {
  test('Faz 7: İlişki seviyesi yakınlığa göre ilk tanışma → tanıdık → güvenilir arkadaş olarak ilerler', () => {
    const rels = createInitialNpcRelationships('player_a_deniz');
    expect(getRelationshipTier(rels.coach_burak.familiarity)).toBe('first_time');
    expect(getRelationshipTier(35)).toBe('acquaintance');
    expect(getRelationshipTier(68)).toBe('regular_trusted');

    for (const rel of Object.values(rels)) {
      expect(rel.playerId).toBe('player_a_deniz');
      expect(rel.hasMet).toBe(false);
      expect(needsFirstMeeting(rel)).toBe(true);
      expect(rel.recentMessages).toEqual([]);
    }
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
      expect(MAIN_CHAR_FEMALE_FRAMES[dir].idle).toHaveLength(2);
      expect(MAIN_CHAR_FEMALE_FRAMES[dir].walk).toHaveLength(6);

      const idleFrame0 = getCharacterFrameSource(dir, 'idle', 0);
      const walkFrame1 = getCharacterFrameSource(dir, 'walk', 1);
      const femaleIdle0 = getCharacterFrameSource(dir, 'idle', 0, 'female');
      const femaleWalk1 = getCharacterFrameSource(dir, 'walk', 1, 'female');
      expect(idleFrame0).toBeDefined();
      expect(walkFrame1).toBeDefined();
      expect(femaleIdle0).toBeDefined();
      expect(femaleWalk1).toBeDefined();
    }

    expect(MAIN_CHAR_PORTRAIT).toBeDefined();
    expect(MAIN_CHAR_FEMALE_PORTRAIT).toBeDefined();
    expect(getMainCharPortrait('female')).toBe(MAIN_CHAR_FEMALE_PORTRAIT);
    expect(getMainCharPortrait('male')).toBe(MAIN_CHAR_PORTRAIT);
    expect(getAvatarPreviewSource('hacker_hoodie', 'female')).toBeDefined();
    expect(getAvatarPreviewSource('hacker_hoodie', 'male')).toBeDefined();
    expect(NPC_SPRITE_ASSETS.prof_demir.idle).toBeDefined();
    expect(NPC_SPRITE_ASSETS.prof_demir.talk).toBeDefined();
    expect(NPC_SPRITE_ASSETS.prof_demir.portrait).toBeDefined();
    expect(NPC_SPRITE_ASSETS.coach_burak.idle).toBeDefined();
    expect(NPC_SPRITE_ASSETS.coach_burak.talk).toBeDefined();
    expect(NPC_SPRITE_ASSETS.coach_burak.portrait).toBeDefined();
  });

  test('3 farklı seed kullanıcı (Deniz, Mert, Zeynep) ve sohbetten dinamik zemin teması (design.md) analizi çalışır', () => {
    expect(TEST_PLAYER_ACCOUNTS).toHaveLength(3);
    expect(TEST_PLAYER_ACCOUNTS[0].username).toBe('deniz_dev');
    expect(TEST_PLAYER_ACCOUNTS[1].username).toBe('mert_arch');
    expect(TEST_PLAYER_ACCOUNTS[2].username).toBe('zeynep_ai');

    const blueprintRes = analyzeConversationForFloorTheme({
      text: 'Sistem mimarisi ve akademik mavi zemin istiyorum',
      currentTheme: 'terminal_matrix',
    });
    expect(blueprintRes.themeId).toBe('blueprint_cyber');

    const amberRes = analyzeConversationForFloorTheme({
      npcId: 'coach_burak',
      currentTheme: 'terminal_matrix',
    });
    expect(amberRes.themeId).toBe('amber_warm');

    const prefs = syncThemeRuleInPreferences(
      ['Zemin Teması: Neon Matrix (Terminal Yeşili)', 'JWT Auth'],
      blueprintRes.designMdRule,
    );
    expect(prefs[0]).toBe(blueprintRes.designMdRule);
    expect(prefs.filter(p => p.startsWith('Zemin Teması:'))).toHaveLength(1);
  });

  test('Kaan üniversitededir; kişiliği planlama mentorluğundan ibaret değildir ve ilk tanışmada 2 hazır cümle sunulur', () => {
    const rels = createInitialNpcRelationships('player_a_deniz');
    expect(rels.kaan_mentor.location).toBe('university');
    expect(rels.prof_demir.location).toBe('university');
    expect(rels.coach_burak.location).toBe('gym');

    const kaan = NPC_PERSONAS.kaan_mentor;
    expect(kaan.name).toBe('Kaan');
    expect(kaan.personalityTraits).toEqual(
      expect.arrayContaining(['Samimi', 'Esprili', 'Zaman zaman alaycı']),
    );
    expect(kaan.boundaries).toContain('Her sohbeti proje yönetimine bağlamaz');

    const starters = getFirstMeetingPrompts('Deniz');
    expect(starters).toHaveLength(2);
    expect(starters[0].messageText).toBe('Merhaba, ben Deniz. Okuldaki ilk günüm.');
    expect(starters[1].messageText).toBe('Selam dostum, naber? Ben Deniz.');

    // Görevlerde kopya veren "HIZLI / RİSKLİ" veya "EN İYİ ÇÖZÜM" etiketleri kaldırılmıştır
    for (const task of INITIAL_ENGINEERING_TASKS) {
      for (const dec of task.decisions) {
        expect(dec.badgeText).not.toContain('EN İYİ ÇÖZÜM');
        expect(dec.badgeText).not.toContain('HIZLI / RİSKLİ');
      }
    }
  });
});
