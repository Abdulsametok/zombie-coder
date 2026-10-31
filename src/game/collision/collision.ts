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

export interface PathStep {
  position: GridPosition;
  facing: Direction;
}

export interface PathResult {
  destination: GridPosition;
  steps: PathStep[];
  finalFacing: Direction;
  matchedInteraction: InteractionSpot | null;
}

function getDirectionBetween(from: GridPosition, to: GridPosition): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'right' : 'left';
  }
  return dy >= 0 ? 'down' : 'up';
}

/**
 * Tıklanan karoya (veya tıklanan nesnenin/NPC'nin en yakın yürünebilir etkileşim karosuna)
 * BFS (Breadth-First Search) ile en kısa yürüyüş rotasını hesaplar.
 */
export function findWalkablePath(
  map: TileMapConfig,
  start: GridPosition,
  clickedTile: GridPosition,
): PathResult {
  const clampedClick: GridPosition = {
    x: Math.max(0, Math.min(map.cols - 1, clickedTile.x)),
    y: Math.max(0, Math.min(map.rows - 1, clickedTile.y)),
  };

  // Tıklanan karo bir etkileşim nesnesine veya tetikleyicisine ait mi?
  const matchedInteraction =
    map.interactions.find(
      spot =>
        spot.objectTiles.some(
          t => t.x === clampedClick.x && t.y === clampedClick.y,
        ) ||
        spot.triggerTiles.some(
          t => t.x === clampedClick.x && t.y === clampedClick.y,
        ),
    ) || null;

  let targetTile: GridPosition = clampedClick;

  if (!canMoveToTile(map, targetTile)) {
    // 1) Eğer etkileşim nesnesine tıklandıysa onun en yakın yürünebilir trigger karosunu seç
    const candidateTiles: GridPosition[] = [];
    if (matchedInteraction) {
      for (const trig of matchedInteraction.triggerTiles) {
        if (canMoveToTile(map, trig)) {
          candidateTiles.push(trig);
        }
      }
    }

    // 2) Yoksa tıklanan karonun etrafındaki en yakın yürünebilir komşuyu bul
    if (candidateTiles.length === 0) {
      for (let radius = 1; radius <= 3; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const cand = { x: clampedClick.x + dx, y: clampedClick.y + dy };
            if (canMoveToTile(map, cand)) {
              candidateTiles.push(cand);
            }
          }
        }
        if (candidateTiles.length > 0) {
          break;
        }
      }
    }

    if (candidateTiles.length > 0) {
      candidateTiles.sort((a, b) => {
        const distA = Math.abs(a.x - start.x) + Math.abs(a.y - start.y);
        const distB = Math.abs(b.x - start.x) + Math.abs(b.y - start.y);
        return distA - distB;
      });
      targetTile = candidateTiles[0];
    } else {
      targetTile = start;
    }
  }

  // Zaten hedef karodaysak sadece tıklanan yöne dön
  if (targetTile.x === start.x && targetTile.y === start.y) {
    const face =
      clampedClick.x !== start.x || clampedClick.y !== start.y
        ? getDirectionBetween(start, clampedClick)
        : 'down';
    return {
      destination: start,
      steps: [],
      finalFacing: face,
      matchedInteraction,
    };
  }

  // BFS ile en kısa yol
  const dirs: Direction[] = ['up', 'down', 'left', 'right'];
  const key = (p: GridPosition) => `${p.x},${p.y}`;
  const visited = new Set<string>([key(start)]);
  const parentMap = new Map<
    string,
    { prev: GridPosition; dir: Direction; pos: GridPosition }
  >();
  const queue: GridPosition[] = [start];

  let found = false;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === targetTile.x && curr.y === targetTile.y) {
      found = true;
      break;
    }

    for (const d of dirs) {
      const nxt = getNextPosition(curr, d);
      const nk = key(nxt);
      if (!visited.has(nk) && canMoveToTile(map, nxt)) {
        visited.add(nk);
        parentMap.set(nk, { prev: curr, dir: d, pos: nxt });
        queue.push(nxt);
      }
    }
  }

  if (!found) {
    return {
      destination: start,
      steps: [],
      finalFacing: getDirectionBetween(start, clampedClick),
      matchedInteraction: null,
    };
  }

  const steps: PathStep[] = [];
  let cursorKey = key(targetTile);
  while (cursorKey !== key(start)) {
    const node = parentMap.get(cursorKey);
    if (!node) {
      break;
    }
    steps.unshift({ position: node.pos, facing: node.dir });
    cursorKey = key(node.prev);
  }

  let finalFacing = steps.length > 0 ? steps[steps.length - 1].facing : 'down';
  if (clampedClick.x !== targetTile.x || clampedClick.y !== targetTile.y) {
    finalFacing = getDirectionBetween(targetTile, clampedClick);
    if (steps.length > 0) {
      steps[steps.length - 1] = {
        ...steps[steps.length - 1],
        facing: finalFacing,
      };
    }
  }

  return {
    destination: targetTile,
    steps,
    finalFacing,
    matchedInteraction,
  };
}
