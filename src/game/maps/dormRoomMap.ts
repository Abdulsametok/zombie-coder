export type TileType =
  | 'floor'
  | 'wall'
  | 'rug'
  | 'desk_computer'
  | 'bed'
  | 'exit_door'
  | 'plant'
  | 'bookshelf';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type InteractionKind =
  | 'open_computer'
  | 'sleep_journal'
  | 'exit_campus'
  | 'inspect_bonsai'
  | 'inspect_bookshelf'
  | 'talk_prof_demir'
  | 'talk_kaan';

export interface InteractionSpot {
  id: string;
  kind: InteractionKind;
  label: string;
  keyHint: string;
  badgeText: string;
  /** Tiles on the map that represent the object itself */
  objectTiles: Array<{ x: number; y: number }>;
  /** Tiles where the player can stand or face to trigger interaction */
  triggerTiles: Array<{ x: number; y: number }>;
}

export interface TileMapConfig {
  id: string;
  title: string;
  subtitle: string;
  cols: number;
  rows: number;
  spawn: { x: number; y: number; facing: Direction };
  grid: TileType[][];
  interactions: InteractionSpot[];
}

const SOLID_TILES: ReadonlySet<TileType> = new Set<TileType>([
  'wall',
  'desk_computer',
  'bed',
  'plant',
  'bookshelf',
]);

export function isTileSolid(tile: TileType): boolean {
  return SOLID_TILES.has(tile);
}

/**
 * 12x12 Karo Tabanlı (Tile-grid) Öğrenci Yurt/Çalışma Odası Haritası
 * Stitch "Main 2D Game World HUD" sahnesindeki yerleşimle birebir uyumlu:
 * - Sol üst: Bonsai bitkisi
 * - Sağ üst: Kitaplık & Kampüse Çıkış kapısı
 * - Sol orta: ZombieOS Bilgisayar Masası
 * - Sağ orta/alt: Dinlenme Alanı (Yatak)
 */
export const DORM_ROOM_MAP: TileMapConfig = {
  id: 'dorm_study_room',
  title: 'EV // ÇALIŞMA ODASI',
  subtitle: 'Blok B-402 Dorm',
  cols: 12,
  rows: 12,
  spawn: { x: 4, y: 5, facing: 'left' },
  grid: [
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'exit_door', 'exit_door', 'wall', 'wall'],
    ['wall', 'plant', 'floor', 'floor', 'bookshelf', 'bookshelf', 'floor', 'floor', 'floor', 'floor', 'bookshelf', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'desk_computer', 'desk_computer', 'floor', 'floor', 'floor', 'floor', 'floor', 'bed', 'bed', 'bed', 'wall'],
    ['wall', 'desk_computer', 'desk_computer', 'floor', 'rug', 'rug', 'rug', 'floor', 'bed', 'bed', 'bed', 'wall'],
    ['wall', 'desk_computer', 'desk_computer', 'floor', 'rug', 'rug', 'rug', 'floor', 'bed', 'bed', 'bed', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'rug', 'rug', 'rug', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'bookshelf', 'bookshelf', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ],
  interactions: [
    {
      id: 'zombieos_desk',
      kind: 'open_computer',
      label: 'Bilgisayara Otur',
      keyHint: '[E]',
      badgeText: 'ZombieOS: Aktif',
      objectTiles: [
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 5 },
      ],
      triggerTiles: [
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 2, y: 6 },
      ],
    },
    {
      id: 'dorm_bed',
      kind: 'sleep_journal',
      label: 'Günü Bitir & Günlük Yaz',
      keyHint: '[E]',
      badgeText: 'Dinlenme Alanı',
      objectTiles: [
        { x: 8, y: 3 },
        { x: 9, y: 3 },
        { x: 10, y: 3 },
        { x: 8, y: 4 },
        { x: 9, y: 4 },
        { x: 10, y: 4 },
        { x: 8, y: 5 },
        { x: 9, y: 5 },
        { x: 10, y: 5 },
      ],
      triggerTiles: [
        { x: 7, y: 3 },
        { x: 7, y: 4 },
        { x: 7, y: 5 },
        { x: 8, y: 6 },
        { x: 9, y: 6 },
        { x: 10, y: 6 },
      ],
    },
    {
      id: 'campus_exit_door',
      kind: 'exit_campus',
      label: 'Kampüse Çık',
      keyHint: '[E]',
      badgeText: 'KAMPÜSE ÇIKIŞ',
      objectTiles: [
        { x: 8, y: 0 },
        { x: 9, y: 0 },
      ],
      triggerTiles: [
        { x: 8, y: 0 },
        { x: 9, y: 0 },
        { x: 8, y: 1 },
        { x: 9, y: 1 },
      ],
    },
    {
      id: 'bonsai_plant',
      kind: 'inspect_bonsai',
      label: 'Bonsai Bitkisini İncele (+Motivasyon)',
      keyHint: '[E]',
      badgeText: 'Bonsai',
      objectTiles: [{ x: 1, y: 1 }],
      triggerTiles: [
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
      ],
    },
  ],
};
