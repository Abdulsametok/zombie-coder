import { DORM_ROOM_MAP } from '../src/game/maps/dormRoomMap';
import {
  attemptPlayerStep,
  canMoveToTile,
  findWalkablePath,
  getActiveInteraction,
} from '../src/game/collision/collision';

describe('Zombie Coder 2D Tile Map & Collision Engine', () => {
  test('spawn position is walkable', () => {
    expect(canMoveToTile(DORM_ROOM_MAP, DORM_ROOM_MAP.spawn)).toBe(true);
  });

  test('blocks movement into solid walls and furniture', () => {
    // Top wall at (4, 0)
    expect(canMoveToTile(DORM_ROOM_MAP, { x: 4, y: 0 })).toBe(false);
    // ZombieOS Computer desk at (2, 4)
    expect(canMoveToTile(DORM_ROOM_MAP, { x: 2, y: 4 })).toBe(false);
    // Bed at (9, 4)
    expect(canMoveToTile(DORM_ROOM_MAP, { x: 9, y: 4 })).toBe(false);
  });

  test('allows movement onto floor, rug, and exit door tiles', () => {
    const stepDown = attemptPlayerStep(
      DORM_ROOM_MAP,
      { x: 4, y: 5 },
      'down',
    );
    expect(stepDown.blocked).toBe(false);
    expect(stepDown.position).toEqual({ x: 4, y: 6 });

    // Exit door at (8, 0) is walkable trigger
    expect(canMoveToTile(DORM_ROOM_MAP, { x: 8, y: 0 })).toBe(true);
  });

  test('detects ZombieOS desk interaction when standing next to or facing desk', () => {
    const spot = getActiveInteraction(DORM_ROOM_MAP, { x: 3, y: 4 }, 'left');
    expect(spot).not.toBeNull();
    expect(spot?.kind).toBe('open_computer');
    expect(spot?.label).toBe('Bilgisayara Otur');
  });

  test('detects bed interaction for mandatory end-of-day journal', () => {
    const spot = getActiveInteraction(DORM_ROOM_MAP, { x: 7, y: 4 }, 'right');
    expect(spot).not.toBeNull();
    expect(spot?.kind).toBe('sleep_journal');
  });

  test('computes BFS walkable path to clicked tile or adjacent object interaction tile', () => {
    // Clicking directly on walkable tile (6, 7) from spawn (4, 5)
    const walkRes = findWalkablePath(
      DORM_ROOM_MAP,
      { x: 4, y: 5 },
      { x: 6, y: 7 },
    );
    expect(walkRes.destination).toEqual({ x: 6, y: 7 });
    expect(walkRes.steps.length).toBe(4);

    // Clicking on solid ZombieOS computer desk (2, 4) routes to adjacent trigger tile (3, 4) facing left
    const deskRes = findWalkablePath(
      DORM_ROOM_MAP,
      { x: 5, y: 5 },
      { x: 2, y: 4 },
    );
    expect(deskRes.matchedInteraction?.kind).toBe('open_computer');
    expect(canMoveToTile(DORM_ROOM_MAP, deskRes.destination)).toBe(true);
    expect(deskRes.steps.length).toBeGreaterThan(0);
  });
});
