import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { INITIAL_ENGINEERING_TASKS } from '../src/features/tasks/taskCatalog';
import {
  evaluateJournalWithPersonalzy,
  selectJournalQuestionForDay,
} from '../src/features/journal/journalEngine';
import { WORLD_MAPS } from '../src/game/maps/worldMaps';

describe('Faz 3 & Faz 4 — Yaşam Döngüsü, Görevler ve Zorunlu Günlük', () => {
  test('renders all 6 screens including auth_login without crashing', async () => {
    const screens = [
      'auth_login',
      'world_hud',
      'career_setup',
      'zombie_os',
      'code_audit',
      'end_of_day_journal',
    ] as const;

    for (const scr of screens) {
      await ReactTestRenderer.act(() => {
        ReactTestRenderer.create(<App initialScreen={scr} />);
      });
    }
  });

  test('provides 3 distinct 2D location maps (Dorm, University, Gym)', () => {
    expect(WORLD_MAPS.dorm.id).toBe('dorm_study_room');
    expect(WORLD_MAPS.university.id).toBe('university_campus');
    expect(WORLD_MAPS.gym.id).toBe('campus_gym');
  });

  test('includes at least 3 distinct engineering task types in ZombieOS', () => {
    expect(INITIAL_ENGINEERING_TASKS.length).toBeGreaterThanOrEqual(3);
    const folders = new Set(INITIAL_ENGINEERING_TASKS.map(t => t.folder));
    expect(folders.has('zombie_projects')).toBe(true);
    expect(folders.has('university')).toBe(true);
    expect(folders.has('my_projects')).toBe(true);
  });

  test('enforces non-repeating journal questions (plan.md 4.4)', () => {
    const q1 = selectJournalQuestionForDay({
      completedTaskCountToday: 1,
      triggeredTrapToday: false,
    });
    const q2 = selectJournalQuestionForDay({
      completedTaskCountToday: 1,
      triggeredTrapToday: false,
      lastQuestionId: q1.id,
    });
    expect(q2.id).not.toBe(q1.id);
  });

  test('accepts "Bugün paylaşmak istemiyorum" minimum journal response without penalty', () => {
    const evaluation = evaluateJournalWithPersonalzy({
      gameDay: 1,
      completedTaskIdsToday: [],
      triggeredTrapToday: false,
      selectedQuickAnswerId: null,
      freeTextNote: '',
      skippedDetails: true,
      visitedGymToday: false,
    });

    expect(evaluation.tespit_edilen_durum).toBe(
      'dinlenme_ve_kisisel_alan_tercihi',
    );
    expect(evaluation.metrik_degisimleri.kod_okuryazarligi).toBeGreaterThanOrEqual(0);
    expect(evaluation.ertesi_gun_remediasyon_gorevi.gorev_adi).toBeTruthy();
    expect(evaluation.oyuncuya_mesaj).toContain('doğal');
  });
});
