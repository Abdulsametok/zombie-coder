import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutChangeEvent,
} from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Line,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import {
  Direction,
  InteractionSpot,
  TileMapConfig,
  TileType,
} from '../maps/dormRoomMap';
import { GridPosition } from '../collision/collision';
import { Colors } from '../../theme/designSystem';

export interface DormSceneCanvasProps {
  map: TileMapConfig;
  playerPosition: GridPosition;
  playerFacing: Direction;
  activeInteraction: InteractionSpot | null;
  onTriggerInteraction: () => void;
}

function getTileFillColor(tile: TileType, x: number, y: number): string {
  switch (tile) {
    case 'wall':
      return '#1b2030';
    case 'exit_door':
      return '#5c1118';
    case 'rug':
      return (x + y) % 2 === 0 ? '#182438' : '#1b2940';
    case 'desk_computer':
      return '#232a3b';
    case 'bed':
      return '#1b2d45';
    case 'plant':
      return '#182c25';
    case 'bookshelf':
      return '#282c3e';
    case 'floor':
    default:
      return (x + y) % 2 === 0 ? '#0d121c' : '#101622';
  }
}

export function DormSceneCanvas({
  map,
  playerPosition,
  playerFacing,
  activeInteraction,
  onTriggerInteraction,
}: DormSceneCanvasProps): React.JSX.Element {
  const [canvasSize, setCanvasSize] = React.useState({
    width: 320,
    height: 320,
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCanvasSize({ width, height });
    }
  };

  const tileW = canvasSize.width / map.cols;
  const tileH = canvasSize.height / map.rows;

  const playerPixelX = (playerPosition.x + 0.5) * tileW;
  const playerPixelY = (playerPosition.y + 0.5) * tileH;

  const visorOffset = React.useMemo(() => {
    const d = Math.min(tileW, tileH) * 0.18;
    switch (playerFacing) {
      case 'up':
        return { dx: 0, dy: -d };
      case 'down':
        return { dx: 0, dy: d };
      case 'left':
        return { dx: -d, dy: 0 };
      case 'right':
        return { dx: d, dy: 0 };
    }
  }, [playerFacing, tileW, tileH]);

  const coordText = `X: ${String(playerPosition.x).padStart(2, '0')} // Y: ${String(
    playerPosition.y,
  ).padStart(2, '0')}`;

  const isDorm = map.id === 'dorm_study_room';
  const isUni = map.id === 'university_campus';

  return (
    <View style={styles.viewportContainer} onLayout={handleLayout}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* 1. Base Tile Grid */}
        {map.grid.map((row, y) =>
          row.map((tile, x) => {
            const rx = x * tileW;
            const ry = y * tileH;
            const fill = getTileFillColor(tile, x, y);

            return (
              <Group key={`tile-${x}-${y}`}>
                <Rect x={rx} y={ry} width={tileW} height={tileH} color={fill} />
                <Rect
                  x={rx}
                  y={ry}
                  width={tileW}
                  height={tileH}
                  color="#161d2b"
                  style="stroke"
                  strokeWidth={1}
                />

                {/* Terminal Desk Monitor Glow */}
                {tile === 'desk_computer' && (
                  <Group>
                    <RoundedRect
                      x={rx + tileW * 0.18}
                      y={ry + tileH * 0.15}
                      width={tileW * 0.65}
                      height={tileH * 0.7}
                      r={3}
                      color="rgba(0, 255, 102, 0.22)"
                    />
                    <RoundedRect
                      x={rx + tileW * 0.25}
                      y={ry + tileH * 0.22}
                      width={tileW * 0.45}
                      height={tileH * 0.56}
                      r={2}
                      color={Colors.primaryContainer}
                    />
                  </Group>
                )}

                {/* Bed Pillow & Blanket Accent */}
                {tile === 'bed' && y === 3 && (
                  <RoundedRect
                    x={rx + tileW * 0.15}
                    y={ry + tileH * 0.2}
                    width={tileW * 0.7}
                    height={tileH * 0.55}
                    r={3}
                    color="#c5d4eb"
                  />
                )}
                {tile === 'bed' && y > 3 && (
                  <RoundedRect
                    x={rx + tileW * 0.08}
                    y={ry + tileH * 0.08}
                    width={tileW * 0.84}
                    height={tileH * 0.84}
                    r={2}
                    color="#0c4a6e"
                  />
                )}

                {/* Plant Foliage */}
                {tile === 'plant' && (
                  <Group>
                    <Circle
                      cx={rx + tileW * 0.5}
                      cy={ry + tileH * 0.5}
                      r={Math.min(tileW, tileH) * 0.36}
                      color="rgba(0, 229, 91, 0.25)"
                    />
                    <Circle
                      cx={rx + tileW * 0.5}
                      cy={ry + tileH * 0.5}
                      r={Math.min(tileW, tileH) * 0.24}
                      color={Colors.primaryFixedDim}
                    />
                  </Group>
                )}

                {/* Bookshelf Spines */}
                {tile === 'bookshelf' && (
                  <Group>
                    <Rect
                      x={rx + tileW * 0.15}
                      y={ry + tileH * 0.2}
                      width={tileW * 0.2}
                      height={tileH * 0.6}
                      color={Colors.secondary}
                    />
                    <Rect
                      x={rx + tileW * 0.42}
                      y={ry + tileH * 0.25}
                      width={tileW * 0.2}
                      height={tileH * 0.55}
                      color={Colors.necrosisPurple}
                    />
                    <Rect
                      x={rx + tileW * 0.68}
                      y={ry + tileH * 0.18}
                      width={tileW * 0.18}
                      height={tileH * 0.62}
                      color={Colors.primaryContainer}
                    />
                  </Group>
                )}

                {/* Exit Door Threshold Bar */}
                {tile === 'exit_door' && (
                  <Rect
                    x={rx + 2}
                    y={ry + tileH * 0.3}
                    width={tileW - 4}
                    height={tileH * 0.4}
                    color={Colors.errorBright}
                  />
                )}
              </Group>
            );
          }),
        )}

        {/* 2. Active Interaction Object Highlight */}
        {activeInteraction &&
          activeInteraction.objectTiles.map(t => (
            <RoundedRect
              key={`hl-${t.x}-${t.y}`}
              x={t.x * tileW + 2}
              y={t.y * tileH + 2}
              width={tileW - 4}
              height={tileH - 4}
              r={4}
              color={Colors.primaryContainer}
              style="stroke"
              strokeWidth={2}
            />
          ))}

        {/* 3. Ambient Desk Terminal Light Cone */}
        <Circle
          cx={2.5 * tileW}
          cy={4.5 * tileH}
          r={tileW * 1.9}
          color="rgba(0, 255, 102, 0.06)"
        />

        {/* 4. Player Character Avatar on Tile Grid */}
        <Group>
          <Circle
            cx={playerPixelX}
            cy={playerPixelY + tileH * 0.28}
            r={Math.min(tileW, tileH) * 0.32}
            color="rgba(0, 0, 0, 0.55)"
          />
          <Circle
            cx={playerPixelX}
            cy={playerPixelY}
            r={Math.min(tileW, tileH) * 0.44}
            color="rgba(0, 255, 102, 0.18)"
          />
          <RoundedRect
            x={playerPixelX - tileW * 0.34}
            y={playerPixelY - tileH * 0.34}
            width={tileW * 0.68}
            height={tileH * 0.68}
            r={6}
            color={Colors.surfaceContainerHigh}
          />
          <RoundedRect
            x={playerPixelX - tileW * 0.34}
            y={playerPixelY - tileH * 0.34}
            width={tileW * 0.68}
            height={tileH * 0.68}
            r={6}
            color={Colors.primaryContainer}
            style="stroke"
            strokeWidth={2}
          />
          <Circle
            cx={playerPixelX + visorOffset.dx}
            cy={playerPixelY + visorOffset.dy}
            r={Math.min(tileW, tileH) * 0.13}
            color={Colors.secondary}
          />
          <Line
            p1={vec(playerPixelX, playerPixelY)}
            p2={vec(
              playerPixelX + visorOffset.dx * 1.8,
              playerPixelY + visorOffset.dy * 1.8,
            )}
            color={Colors.primaryContainer}
            strokeWidth={2}
          />
        </Group>
      </Canvas>

      {/* Scene Floating Labels & Badges */}
      <View style={styles.bonsaiTag} pointerEvents="none">
        <Text style={styles.bonsaiIcon}>✿</Text>
        <Text style={styles.bonsaiText}>
          {isDorm ? 'Bonsai' : isUni ? 'BMB201 Amfi' : 'Koç Burak'}
        </Text>
      </View>

      <View style={styles.exitDoorTag} pointerEvents="none">
        <Text style={styles.exitDoorText}>
          ⇥ {isDorm ? 'KAMPÜSE ÇIKIŞ' : isUni ? 'SPOR SALONU' : 'YURDA DÖNÜŞ'}
        </Text>
      </View>

      <View style={styles.zombieOsTag} pointerEvents="none">
        <View style={styles.greenPulseDot} />
        <Text style={styles.zombieOsText}>
          {isDorm
            ? 'ZombieOS: Aktif'
            : isUni
            ? 'Prof. Demir // Kürsü'
            : 'Antrenman İstasyonu'}
        </Text>
      </View>

      <View style={styles.bedTag} pointerEvents="none">
        <Text style={styles.bedIcon}>{isDorm ? '🛏' : '◈'}</Text>
        <Text style={styles.bedText}>
          {isDorm
            ? 'Dinlenme Alanı'
            : isUni
            ? 'Lab Terminalleri'
            : 'Dinlenme & Esneme'}
        </Text>
      </View>

      {/* Floating Interaction Prompt Bubble */}
      {activeInteraction && (
        <View
          style={[
            styles.floatingPromptContainer,
            {
              left: Math.max(
                12,
                Math.min(canvasSize.width - 190, playerPixelX - 85),
              ),
              top: Math.max(10, playerPixelY - tileH * 1.35),
            },
          ]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onTriggerInteraction}
            style={styles.floatingPromptBtn}>
            <View style={styles.keyHintBadge}>
              <Text style={styles.keyHintText}>{activeInteraction.keyHint}</Text>
            </View>
            <Text style={styles.promptLabelText} numberOfLines={1}>
              {activeInteraction.label}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom-right Coordinate Readout */}
      <View style={styles.coordBadge} pointerEvents="none">
        <Text style={styles.coordText}>{coordText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewportContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    position: 'relative',
  },
  bonsaiTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(28, 31, 42, 0.88)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.25)',
  },
  bonsaiIcon: {
    color: Colors.primaryContainer,
    fontSize: 10,
  },
  bonsaiText: {
    color: Colors.onSurfaceVariant,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  exitDoorTag: {
    position: 'absolute',
    top: 8,
    right: 14,
    backgroundColor: Colors.errorContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  exitDoorText: {
    color: Colors.onErrorContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  zombieOsTag: {
    position: 'absolute',
    top: '30%',
    left: 10,
    backgroundColor: 'rgba(38, 42, 53, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primaryContainer,
  },
  zombieOsText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  bedTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(28, 31, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.25)',
  },
  bedIcon: {
    color: Colors.secondary,
    fontSize: 11,
  },
  bedText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '600',
  },
  floatingPromptContainer: {
    position: 'absolute',
    zIndex: 30,
  },
  floatingPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
    gap: 6,
  },
  keyHintBadge: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  keyHintText: {
    color: Colors.onPrimary,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
  promptLabelText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  coordBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(10, 14, 24, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coordText: {
    color: Colors.outline,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
});
