/**
 * Kullanıcıyla Olan Sohbetten ve İletişim Tercihlerinden Zemin/Tema Analizi (design.md Uyarlaması)
 */

import {
  NpcId,
  PlayerCommunicationStyle,
} from '../social/npcRelationshipEngine';

export type FloorThemeId =
  | 'terminal_matrix'
  | 'blueprint_cyber'
  | 'necrosis_purple'
  | 'amber_warm';

export interface FloorThemeConfig {
  id: FloorThemeId;
  name: string;
  shortLabel: string;
  designMdRule: string;
  description: string;
  floorEven: string;
  floorOdd: string;
  rugEven: string;
  rugOdd: string;
  wallBase: string;
  wallTrim: string;
  gridStroke: string;
  ambientGlow: string;
  accentColor: string;
}

export const FLOOR_THEMES: Record<FloorThemeId, FloorThemeConfig> = {
  terminal_matrix: {
    id: 'terminal_matrix',
    name: 'Neon Matrix // Terminal Yeşili',
    shortLabel: 'Matrix Yeşil',
    designMdRule: 'Zemin Teması: Neon Matrix (Terminal Yeşili)',
    description:
      'Sohbet analizi: Hızlı prototipleme, terminal odaklı pratik üslup tespit edildi.',
    floorEven: '#0b1a14',
    floorOdd: '#0f231b',
    rugEven: '#133326',
    rugOdd: '#173d2e',
    wallBase: '#12211c',
    wallTrim: '#0a1410',
    gridStroke: 'rgba(0, 255, 102, 0.14)',
    ambientGlow: 'rgba(0, 255, 102, 0.13)',
    accentColor: '#00ff66',
  },
  blueprint_cyber: {
    id: 'blueprint_cyber',
    name: 'Siber Mimari // Blueprint Mavi',
    shortLabel: 'Blueprint Mavi',
    designMdRule: 'Zemin Teması: Siber Mimari (Blueprint Mavi)',
    description:
      'Sohbet analizi: Akademik, sistem mimarisi ve temiz kod odaklı yaklaşım tespit edildi.',
    floorEven: '#0c192c',
    floorOdd: '#102138',
    rugEven: '#163050',
    rugOdd: '#1b395e',
    wallBase: '#142238',
    wallTrim: '#0b1320',
    gridStroke: 'rgba(76, 215, 246, 0.16)',
    ambientGlow: 'rgba(76, 215, 246, 0.14)',
    accentColor: '#4cd7f6',
  },
  necrosis_purple: {
    id: 'necrosis_purple',
    name: 'AI Denetim // Siber Mor',
    shortLabel: 'Siber Mor',
    designMdRule: 'Zemin Teması: AI Denetim (Siber Mor)',
    description:
      'Sohbet analizi: AI kod denetimi, derin analiz ve siberpunk estetik tercihi tespit edildi.',
    floorEven: '#181128',
    floorOdd: '#1f1633',
    rugEven: '#2d1e4a',
    rugOdd: '#352457',
    wallBase: '#211836',
    wallTrim: '#120d1f',
    gridStroke: 'rgba(168, 85, 247, 0.16)',
    ambientGlow: 'rgba(168, 85, 247, 0.14)',
    accentColor: '#a855f7',
  },
  amber_warm: {
    id: 'amber_warm',
    name: 'Odak & Denge // Kehribar Ahşap',
    shortLabel: 'Kehribar Ahşap',
    designMdRule: 'Zemin Teması: Odak & Denge (Kehribar Ahşap)',
    description:
      'Sohbet analizi: Fiziksel-zihinsel denge, sıcak çalışma ortamı ve sabırlı hata ayıklama tespit edildi.',
    floorEven: '#221711',
    floorOdd: '#2a1d15',
    rugEven: '#3d251b',
    rugOdd: '#472b20',
    wallBase: '#2b1e17',
    wallTrim: '#17100c',
    gridStroke: 'rgba(245, 158, 11, 0.15)',
    ambientGlow: 'rgba(245, 158, 11, 0.13)',
    accentColor: '#f59e0b',
  },
};

/**
 * Kullanıcının sohbet mesajını, NPC etkileşimini veya günlük notunu analiz ederek
 * en uygun zemin temasını (`FloorThemeId`) ve gerekçesini döner.
 */
export function analyzeConversationForFloorTheme(params: {
  text?: string;
  npcId?: NpcId;
  communicationStyle?: PlayerCommunicationStyle;
  currentTheme: FloorThemeId;
}): {
  themeId: FloorThemeId;
  reason: string;
  designMdRule: string;
} {
  const raw = (params.text || '').toLocaleLowerCase('tr-TR');

  // 1. Açık anahtar kelime / sohbet analizi
  if (
    raw.includes('yeşil') ||
    raw.includes('matrix') ||
    raw.includes('terminal') ||
    raw.includes('hacker') ||
    raw.includes('hızlı')
  ) {
    const cfg = FLOOR_THEMES.terminal_matrix;
    return {
      themeId: cfg.id,
      reason: 'Sohbette terminal/matrix ve hızlı kodlama vurgusu algılandı.',
      designMdRule: cfg.designMdRule,
    };
  }

  if (
    raw.includes('mavi') ||
    raw.includes('mimari') ||
    raw.includes('akademik') ||
    raw.includes('blueprint') ||
    raw.includes('sistem') ||
    raw.includes('sql')
  ) {
    const cfg = FLOOR_THEMES.blueprint_cyber;
    return {
      themeId: cfg.id,
      reason: 'Sohbette sistem mimarisi ve akademik düzen vurgusu algılandı.',
      designMdRule: cfg.designMdRule,
    };
  }

  if (
    raw.includes('mor') ||
    raw.includes('siber') ||
    raw.includes('ai') ||
    raw.includes('yapay zeka') ||
    raw.includes('neon') ||
    raw.includes('tuzak')
  ) {
    const cfg = FLOOR_THEMES.necrosis_purple;
    return {
      themeId: cfg.id,
      reason: 'Sohbette AI denetimi ve siber mor tema tercihi algılandı.',
      designMdRule: cfg.designMdRule,
    };
  }

  if (
    raw.includes('ahşap') ||
    raw.includes('sıcak') ||
    raw.includes('kehribar') ||
    raw.includes('spor') ||
    raw.includes('dinlen') ||
    raw.includes('denge') ||
    raw.includes('kahve')
  ) {
    const cfg = FLOOR_THEMES.amber_warm;
    return {
      themeId: cfg.id,
      reason: 'Sohbette sıcak ahşap zemin ve motivasyon/denge odağı algılandı.',
      designMdRule: cfg.designMdRule,
    };
  }

  // 2. NPC + Üslup (CommunicationStyle) bağlamından analiz
  if (params.npcId === 'coach_burak') {
    const cfg = FLOOR_THEMES.amber_warm;
    return {
      themeId: cfg.id,
      reason:
        'Koç Burak ile yapılan antrenman ve motivasyon sohbetine göre zemin sıcak kehribar temaya uyarlandı.',
      designMdRule: cfg.designMdRule,
    };
  }

  if (params.npcId === 'prof_demir' || params.communicationStyle === 'formal') {
    const cfg = FLOOR_THEMES.blueprint_cyber;
    return {
      themeId: cfg.id,
      reason:
        'Prof. Demir ile akademik/resmi üslup analizi sonucunda zemin Siber Mimari (Mavi) temasına uyarlandı.',
      designMdRule: cfg.designMdRule,
    };
  }

  if (params.npcId === 'kaan_mentor') {
    const cfg =
      params.communicationStyle === 'casual'
        ? FLOOR_THEMES.terminal_matrix
        : FLOOR_THEMES.necrosis_purple;
    return {
      themeId: cfg.id,
      reason:
        params.communicationStyle === 'casual'
          ? 'Kaan ile samimi/pratik terminal sohbetinden Neon Matrix (Yeşil) zemin teması seçildi.'
          : 'Kaan ile AI denetim sohbetinden Siber Mor zemin teması seçildi.',
      designMdRule: cfg.designMdRule,
    };
  }

  const fallback = FLOOR_THEMES[params.currentTheme];
  return {
    themeId: fallback.id,
    reason: fallback.description,
    designMdRule: fallback.designMdRule,
  };
}

/**
 * design.md tercih listesindeki eski zemin teması kuralını yenisiyle günceller.
 */
export function syncThemeRuleInPreferences(
  existingPreferences: string[],
  newThemeRule: string,
): string[] {
  const filtered = existingPreferences.filter(
    p => !p.startsWith('Zemin Teması:'),
  );
  return [newThemeRule, ...filtered];
}
