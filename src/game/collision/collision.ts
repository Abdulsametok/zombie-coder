import {
  Direction,
  InteractionSpot,
  TileMapConfig,
  isTileSolid,
} from '../maps/dormRoomMap';

export interface GridPosition {
  x: number;
  y: number;
}

export function getNextPosition(
  current: GridPosition,
  direction: Direction,
): GridPosition {
  switch (direction) {
    case 'up':
      return { x: current.x, y: current.y - 1 };
    case 'down':
      return { x: current.x, y: current.y + 1 };
    case 'left':
      return { x: current.x - 1, y: current.y };
    case 'right':
      return { x: current.x + 1, y: current.y };
  }
}

export function canMoveToTile(
  map: TileMapConfig,
  target: GridPosition,
): boolean {
  if (
    target.x < 0 ||
    target.y < 0 ||
    target.x >= map.cols ||
    target.y >= map.rows
  ) {
    return false;
  }

  const row = map.grid[target.y];
  if (!row) {
    return false;
  }

  const tile = row[target.x];
  if (!tile) {
    return false;
  }

  return !isTileSolid(tile);
}

export function attemptPlayerStep(
  map: TileMapConfig,
  current: GridPosition,
  direction: Direction,
): { position: GridPosition;facing: Direction; blocked: boolean } {
  const next = getNextPosition(current, direction);
  if (canMoveToTile(map, next)) {
    return { position: next, facing: direction, blocked: false };
  }
  return { position: current, facing: direction, blocked: true };
}

export function getActiveInteraction(
  map: TileMapConfig,
  position: GridPosition,
  facing: Direction,
): InteractionSpot | null {
  const facingTile = getNextPosition(position, facing);

  // 1. Öncelik: Oyuncunun baktığı yöndeki nesne karosu
  for (const spot of map.interactions) {
    const facesObject = spot.objectTiles.some(
      t => t.x === facingTile.x && t.y === facingTile.y,
    );
    if (facesObject) {
      return spot;
    }
  }

  // 2. Öncelik: Oyuncunun üzerinde durduğu tetikleyici karo
  for (const spot of map.interactions) {
    const onTrigger = spot.triggerTiles.some(
      t => t.x === position.x && t.y === position.y,
    );
    if (onTrigger) {
      return spot;
    }
  }

  return null;
}
