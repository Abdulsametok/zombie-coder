import {
  DORM_ROOM_MAP,
  TileMapConfig,
} from './dormRoomMap';

export type LocationId = 'dorm' | 'university' | 'gym';

export const UNIVERSITY_MAP: TileMapConfig = {
  id: 'university_campus',
  title: 'ÜNİVERSİTE // BMB LAB',
  subtitle: 'Mühendislik & Ürün Stratejisi B-Blok',
  cols: 12,
  rows: 12,
  spawn: { x: 5, y: 9, facing: 'up' },
  grid: [
    ['wall', 'wall', 'wall', 'wall', 'wall', 'exit_door', 'exit_door', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'bookshelf', 'bookshelf', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'plant', 'bookshelf', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'desk_computer', 'desk_computer', 'desk_computer', 'desk_computer', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'desk_computer', 'desk_computer', 'floor', 'rug', 'rug', 'rug', 'rug', 'floor', 'desk_computer', 'desk_computer', 'wall'],
    ['wall', 'desk_computer', 'desk_computer', 'floor', 'rug', 'rug', 'rug', 'rug', 'floor', 'desk_computer', 'desk_computer', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'plant', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'plant', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'exit_door', 'exit_door', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ],
  interactions: [
    {
      id: 'prof_demir_lectern',
      kind: 'talk_prof_demir',
      label: 'Prof. Demir Dersi (Algoritma, Veri Yapıları & Mimari)',
      keyHint: '[E]',
      badgeText: 'Prof. Demir // Kürsü',
      objectTiles: [
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 2 },
        { x: 7, y: 2 },
      ],
      triggerTiles: [
        { x: 4, y: 3 },
        { x: 5, y: 3 },
        { x: 6, y: 3 },
        { x: 7, y: 3 },
      ],
    },
    {
      id: 'kaan_planning_desk',
      kind: 'talk_kaan',
      label: 'Kaan ile Ürün Planlama & Pazarlama Konuş',
      keyHint: '[E]',
      badgeText: 'Kaan // Planlama Masası',
      objectTiles: [
        { x: 9, y: 4 },
        { x: 10, y: 4 },
        { x: 9, y: 5 },
        { x: 10, y: 5 },
      ],
      triggerTiles: [
        { x: 8, y: 4 },
        { x: 8, y: 5 },
        { x: 8, y: 6 },
        { x: 9, y: 6 },
      ],
    },
    {
      id: 'lab_workstation_left',
      kind: 'open_computer',
      label: 'Lab Bilgisayarına Otur (ZombieOS)',
      keyHint: '[E]',
      badgeText: 'Lab Terminali',
      objectTiles: [
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 5 },
      ],
      triggerTiles: [
        { x: 3, y: 4 },
        { x: 3, y: 5 },
      ],
    },
    {
      id: 'uni_to_gym_door',
      kind: 'exit_campus',
      label: 'Spor Salonuna / Yurda Geçiş',
      keyHint: '[E]',
      badgeText: 'KAMPÜS KAPISI',
      objectTiles: [
        { x: 5, y: 0 },
        { x: 6, y: 0 },
        { x: 5, y: 11 },
        { x: 6, y: 11 },
      ],
      triggerTiles: [
        { x: 5, y: 0 },
        { x: 6, y: 0 },
        { x: 5, y: 1 },
        { x: 6, y: 1 },
        { x: 5, y: 10 },
        { x: 6, y: 10 },
        { x: 5, y: 11 },
        { x: 6, y: 11 },
      ],
    },
  ],
};

export const GYM_MAP: TileMapConfig = {
  id: 'campus_gym',
  title: 'SPOR SALONU // KAMPÜS',
  subtitle: 'Kondisyon & Satış Stratejisi Alanı',
  cols: 12,
  rows: 12,
  spawn: { x: 5, y: 8, facing: 'up' },
  grid: [
    ['wall', 'wall', 'wall', 'wall', 'wall', 'exit_door', 'exit_door', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'plant', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'plant', 'wall'],
    ['wall', 'floor', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'floor', 'wall'],
    ['wall', 'floor', 'rug', 'desk_computer', 'desk_computer', 'rug', 'rug', 'desk_computer', 'desk_computer', 'rug', 'floor', 'wall'],
    ['wall', 'floor', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'floor', 'wall'],
    ['wall', 'floor', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'rug', 'floor', 'wall'],
    ['wall', 'floor', 'rug', 'bed', 'bed', 'rug', 'rug', 'bed', 'bed', 'rug', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'bookshelf', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'bookshelf', 'wall'],
    ['wall', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'floor', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ],
  interactions: [
    {
      id: 'coach_burak_station',
      kind: 'inspect_bonsai',
      label: 'Koç Burak ile Antrenman & Satış Taktikleri',
      keyHint: '[E]',
      badgeText: 'Koç Burak // Satış & Spor',
      objectTiles: [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 7, y: 3 },
        { x: 8, y: 3 },
      ],
      triggerTiles: [
        { x: 3, y: 4 },
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 6, y: 4 },
        { x: 7, y: 4 },
        { x: 8, y: 4 },
      ],
    },
    {
      id: 'gym_exit_door',
      kind: 'exit_campus',
      label: 'Yurda / Çalışma Odasına Dön',
      keyHint: '[E]',
      badgeText: 'YURDA DÖNÜŞ',
      objectTiles: [
        { x: 5, y: 0 },
        { x: 6, y: 0 },
      ],
      triggerTiles: [
        { x: 5, y: 0 },
        { x: 6, y: 0 },
        { x: 5, y: 1 },
        { x: 6, y: 1 },
      ],
    },
  ],
};

export const WORLD_MAPS: Record<LocationId, TileMapConfig> = {
  dorm: DORM_ROOM_MAP,
  university: UNIVERSITY_MAP,
  gym: GYM_MAP,
};
