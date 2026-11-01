import React from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Rect,
  RoundedRect,
} from '@shopify/react-native-skia';
import {
  Direction,
  InteractionSpot,
  TileMapConfig,
  TileType,
} from '../maps/dormRoomMap';
import { GridPosition } from '../collision/collision';
import {
  CharacterAnimState,
  MAIN_CHAR_PORTRAIT,
  NPC_SPRITE_ASSETS,
  getCharacterFrameSource,
  getMainCharPortrait,
  PlayerGender,
} from '../sprites/mainCharSprites';
import { ENVIRONMENT_SPRITES } from '../sprites/environmentSprites';
import {
  DialogueBubbleTurn,
  NpcId,
} from '../../features/social/npcRelationshipEngine';
import {
  FLOOR_THEMES,
  FloorThemeId,
} from '../../features/theme/adaptiveFloorTheme';
import { Colors } from '../../theme/designSystem';

const STEP_GLIDE_MS = 180;

export interface DormSceneCanvasProps {
  map: TileMapConfig;
  playerPosition: GridPosition;
  playerFacing: Direction;
  playerUsername?: string;
  playerGender?: PlayerGender;
  floorTheme?: FloorThemeId;
  activeInteraction: InteractionSpot | null;
  onTriggerInteraction: () => void;
  targetWalkTile?: GridPosition | null;
  isWalking?: boolean;
  onTapTile?: (tile: GridPosition, onArrive?: () => void) => void;
  activeDialogueBubble?: DialogueBubbleTurn | null;
  onAdvanceDialogue?: () => void;
  onTalkToSceneNpc?: (npcId: NpcId) => void;
}

interface SceneFurnitureProp {
  id: string;
  source: ImageSourcePropType;
  x: number;
  y: number;
  w: number;
  h: number;
  zIndex: number;
}

function getTileFillColor(
  tile: TileType,
  x: number,
  y: number,
  themeId: FloorThemeId,
): string {
  const theme = FLOOR_THEMES[themeId] || FLOOR_THEMES.terminal_matrix;
  if (tile === 'wall') {
    return theme.wallBase;
  }
  if (tile === 'exit_door') {
    return '#3b1c26';
  }
  if (tile === 'rug') {
    return (x + y) % 2 === 0 ? theme.rugEven : theme.rugOdd;
  }
  return (x + y) % 2 === 0 ? theme.floorEven : theme.floorOdd;
}

export function DormSceneCanvas({
  map,
  playerPosition,
  playerFacing,
  playerUsername = 'deniz_dev',
  playerGender = 'female',
  floorTheme = 'terminal_matrix',
  activeInteraction,
  onTriggerInteraction,
  targetWalkTile,
  isWalking = false,
  onTapTile,
  activeDialogueBubble,
  onAdvanceDialogue,
  onTalkToSceneNpc,
}: DormSceneCanvasProps): React.JSX.Element {
  const [canvasSize, setCanvasSize] = React.useState({
    width: 320,
    height: 320,
  });

  const [animState, setAnimState] = React.useState<CharacterAnimState>('idle');
  const [frameTick, setFrameTick] = React.useState<number>(0);

  // Smooth pixel-interpolated tile coordinates so character walks smoothly instead of teleporting
  const animGridX = React.useRef(new Animated.Value(playerPosition.x)).current;
  const animGridY = React.useRef(new Animated.Value(playerPosition.y)).current;
  const lastMapIdRef = React.useRef<string>(map.id);
  const lastGridPosRef = React.useRef<GridPosition>(playerPosition);

  React.useEffect(() => {
    const mapChanged = lastMapIdRef.current !== map.id;
    const dx = Math.abs(playerPosition.x - lastGridPosRef.current.x);
    const dy = Math.abs(playerPosition.y - lastGridPosRef.current.y);
    lastMapIdRef.current = map.id;
    lastGridPosRef.current = playerPosition;

    // Snap immediately only when switching rooms or resetting career
    if (mapChanged || dx + dy > 3) {
      animGridX.stopAnimation();
      animGridY.stopAnimation();
      animGridX.setValue(playerPosition.x);
      animGridY.setValue(playerPosition.y);
      return;
    }

    if (dx === 0 && dy === 0) {
      return;
    }

    setAnimState('walk');
    setFrameTick(prev => prev + 1);

    const anim = Animated.parallel([
      Animated.timing(animGridX, {
        toValue: playerPosition.x,
        duration: STEP_GLIDE_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(animGridY, {
        toValue: playerPosition.y,
        duration: STEP_GLIDE_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]);

    anim.start();

    return () => {
      anim.stop();
    };
  }, [playerPosition, map.id, animGridX, animGridY]);

  // Continuous walking sprite frame cycle while moving
  React.useEffect(() => {
    if (!isWalking && animState !== 'walk') {
      return;
    }

    let ticks = 0;
    const walkTimer = setInterval(() => {
      ticks += 1;
      setFrameTick(prev => prev + 1);
      if (!isWalking && ticks >= 3) {
        clearInterval(walkTimer);
        setAnimState('idle');
      }
    }, 60);
    (walkTimer as unknown as { unref?: () => void })?.unref?.();

    return () => clearInterval(walkTimer);
  }, [isWalking, animState]);

  // Subtle idle breathing cycle when standing still
  React.useEffect(() => {
    if (animState !== 'idle' || isWalking) {
      return;
    }
    const idleTimer = setInterval(() => {
      setFrameTick(prev => prev + 1);
    }, 650);
    (idleTimer as unknown as { unref?: () => void })?.unref?.();
    return () => clearInterval(idleTimer);
  }, [animState, isWalking]);

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

  const isDorm = map.id === 'dorm_study_room';
  const isUni = map.id === 'university_campus';

  const sceneProps: SceneFurnitureProp[] = React.useMemo(() => {
    if (isDorm) {
      return [
        {
          id: 'home_rug',
          source: ENVIRONMENT_SPRITES.home.rug,
          x: 3.85,
          y: 3.85,
          w: 3.3,
          h: 3.3,
          zIndex: 4,
        },
        {
          id: 'home_window',
          source: ENVIRONMENT_SPRITES.home.window,
          x: 2.1,
          y: 0.0,
          w: 1.9,
          h: 1.25,
          zIndex: 5,
        },
        {
          id: 'home_door',
          source: ENVIRONMENT_SPRITES.common.doorWood,
          x: 8.0,
          y: 0.0,
          w: 2.0,
          h: 1.35,
          zIndex: 5,
        },
        {
          id: 'home_bonsai',
          source: ENVIRONMENT_SPRITES.common.plantBonsai,
          x: 0.85,
          y: 0.5,
          w: 1.45,
          h: 1.55,
          zIndex: 6,
        },
        {
          id: 'home_bookshelf_top',
          source: ENVIRONMENT_SPRITES.home.bookshelf,
          x: 3.9,
          y: 0.35,
          w: 2.2,
          h: 1.75,
          zIndex: 6,
        },
        {
          id: 'home_wardrobe',
          source: ENVIRONMENT_SPRITES.home.wardrobe,
          x: 9.75,
          y: 0.25,
          w: 1.35,
          h: 1.85,
          zIndex: 6,
        },
        {
          id: 'home_desk_computer',
          source: ENVIRONMENT_SPRITES.home.deskComputer,
          x: 0.65,
          y: 2.55,
          w: 2.65,
          h: 3.55,
          zIndex: 7,
        },
        {
          id: 'home_bed',
          source: ENVIRONMENT_SPRITES.home.bed,
          x: 7.75,
          y: 2.55,
          w: 3.35,
          h: 3.6,
          zIndex: 7,
        },
        {
          id: 'home_bookshelf_bottom',
          source: ENVIRONMENT_SPRITES.home.bookshelf,
          x: 7.9,
          y: 8.35,
          w: 2.2,
          h: 1.75,
          zIndex: 8,
        },
      ];
    }

    if (isUni) {
      return [
        {
          id: 'uni_rug',
          source: ENVIRONMENT_SPRITES.home.rug,
          x: 3.85,
          y: 3.85,
          w: 4.3,
          h: 2.3,
          zIndex: 4,
        },
        {
          id: 'uni_door_top',
          source: ENVIRONMENT_SPRITES.common.doorDouble,
          x: 5.0,
          y: 0.0,
          w: 2.0,
          h: 1.15,
          zIndex: 5,
        },
        {
          id: 'uni_board',
          source: ENVIRONMENT_SPRITES.university.board,
          x: 3.5,
          y: 0.2,
          w: 5.0,
          h: 1.55,
          zIndex: 6,
        },
        {
          id: 'uni_bookshelf_tl',
          source: ENVIRONMENT_SPRITES.university.bookshelf,
          x: 0.9,
          y: 0.3,
          w: 2.1,
          h: 1.8,
          zIndex: 6,
        },
        {
          id: 'uni_plant_tr',
          source: ENVIRONMENT_SPRITES.common.plantPot,
          x: 8.85,
          y: 0.45,
          w: 1.2,
          h: 1.6,
          zIndex: 6,
        },
        {
          id: 'uni_bookshelf_tr',
          source: ENVIRONMENT_SPRITES.university.bookshelf,
          x: 9.85,
          y: 0.3,
          w: 1.3,
          h: 1.8,
          zIndex: 6,
        },
        {
          id: 'uni_lectern',
          source: ENVIRONMENT_SPRITES.university.lectern,
          x: 3.95,
          y: 1.65,
          w: 1.55,
          h: 1.5,
          zIndex: 7,
        },
        {
          id: 'uni_desks_left',
          source: ENVIRONMENT_SPRITES.university.desks,
          x: 0.7,
          y: 3.6,
          w: 2.65,
          h: 2.6,
          zIndex: 7,
        },
        {
          id: 'uni_desks_right',
          source: ENVIRONMENT_SPRITES.university.desks,
          x: 8.65,
          y: 3.6,
          w: 2.65,
          h: 2.6,
          zIndex: 7,
        },
        {
          id: 'uni_plant_bl',
          source: ENVIRONMENT_SPRITES.common.plantPot,
          x: 0.85,
          y: 7.45,
          w: 1.25,
          h: 1.65,
          zIndex: 8,
        },
        {
          id: 'uni_plant_br',
          source: ENVIRONMENT_SPRITES.common.plantPot,
          x: 9.85,
          y: 7.45,
          w: 1.25,
          h: 1.65,
          zIndex: 8,
        },
        {
          id: 'uni_door_bottom',
          source: ENVIRONMENT_SPRITES.common.doorDouble,
          x: 5.0,
          y: 10.75,
          w: 2.0,
          h: 1.25,
          zIndex: 8,
        },
      ];
    }

    // Gym Scene Furniture & Equipment Props
    return [
      {
        id: 'gym_door_top',
        source: ENVIRONMENT_SPRITES.common.doorDouble,
        x: 5.0,
        y: 0.0,
        w: 2.0,
        h: 1.25,
        zIndex: 5,
      },
      {
        id: 'gym_plant_tl',
        source: ENVIRONMENT_SPRITES.common.plantPot,
        x: 0.85,
        y: 0.45,
        w: 1.25,
        h: 1.65,
        zIndex: 6,
      },
      {
        id: 'gym_plant_tr',
        source: ENVIRONMENT_SPRITES.common.plantPot,
        x: 9.85,
        y: 0.45,
        w: 1.25,
        h: 1.65,
        zIndex: 6,
      },
      {
        id: 'gym_treadmill',
        source: ENVIRONMENT_SPRITES.gym.treadmill,
        x: 2.55,
        y: 2.15,
        w: 1.55,
        h: 1.95,
        zIndex: 7,
      },
      {
        id: 'gym_bike',
        source: ENVIRONMENT_SPRITES.gym.bike,
        x: 4.05,
        y: 2.2,
        w: 1.35,
        h: 1.85,
        zIndex: 7,
      },
      {
        id: 'gym_bench_press',
        source: ENVIRONMENT_SPRITES.gym.benchPress,
        x: 6.75,
        y: 2.15,
        w: 1.65,
        h: 1.95,
        zIndex: 7,
      },
      {
        id: 'gym_weights',
        source: ENVIRONMENT_SPRITES.gym.weights,
        x: 8.35,
        y: 2.3,
        w: 1.6,
        h: 1.8,
        zIndex: 7,
      },
      {
        id: 'gym_punching_bag',
        source: ENVIRONMENT_SPRITES.gym.punchingBag,
        x: 1.85,
        y: 4.0,
        w: 1.15,
        h: 2.1,
        zIndex: 7,
      },
      {
        id: 'gym_mat_left',
        source: ENVIRONMENT_SPRITES.gym.mat,
        x: 2.8,
        y: 5.75,
        w: 2.3,
        h: 1.35,
        zIndex: 6,
      },
      {
        id: 'gym_mat_right',
        source: ENVIRONMENT_SPRITES.gym.mat,
        x: 6.8,
        y: 5.75,
        w: 2.3,
        h: 1.35,
        zIndex: 6,
      },
      {
        id: 'gym_lockers_left',
        source: ENVIRONMENT_SPRITES.gym.lockers,
        x: 0.75,
        y: 8.3,
        w: 1.95,
        h: 1.9,
        zIndex: 8,
      },
      {
        id: 'gym_lockers_right',
        source: ENVIRONMENT_SPRITES.gym.lockers,
        x: 9.3,
        y: 8.3,
        w: 1.95,
        h: 1.9,
        zIndex: 8,
      },
    ];
  }, [isDorm, isUni]);

  const sceneNpcs = React.useMemo(() => {
    if (isUni) {
      return [
        {
          npcId: 'prof_demir' as NpcId,
          name: 'Prof. Demir',
          tileX: 6.1,
          tileY: 2.35,
          walkTarget: { x: 6, y: 3 },
          sprites: NPC_SPRITE_ASSETS.prof_demir,
        },
        {
          npcId: 'kaan_mentor' as NpcId,
          name: 'Kaan (Planlama)',
          tileX: 9.2,
          tileY: 6.2,
          walkTarget: { x: 8, y: 6 },
          sprites: NPC_SPRITE_ASSETS.kaan_mentor,
        },
      ];
    }
    if (!isDorm) {
      return [
        {
          npcId: 'coach_burak' as NpcId,
          name: 'Koç Burak',
          tileX: 5.8,
          tileY: 3.35,
          walkTarget: { x: 5, y: 4 },
          sprites: NPC_SPRITE_ASSETS.coach_burak,
        },
      ];
    }
    // Ev / Yurt odasında artık NPC yok; Kaan üniversiteye taşındı
    return [];
  }, [isDorm, isUni]);

  const isPlayerSpeaking = activeDialogueBubble?.speakerKind === 'player';

  const activeSpriteSource = getCharacterFrameSource(
    playerFacing,
    animState,
    frameTick,
    playerGender,
  );
  const spriteWidth = tileW * 1.48;
  const spriteHeight = tileH * 2.15;
  const idleBobOffset =
    animState === 'idle' && !isWalking && frameTick % 2 === 1 ? -1.5 : 0;

  // Smoothly animated left/top coordinates for the player sprite container
  const animatedPlayerLeft = Animated.add(
    Animated.multiply(animGridX, tileW),
    0.5 * tileW - spriteWidth * 0.5,
  );
  const animatedPlayerTop = Animated.add(
    Animated.multiply(animGridY, tileH),
    0.86 * tileH - spriteHeight * 1.25 + idleBobOffset,
  );

  const activeTheme =
    FLOOR_THEMES[floorTheme] || FLOOR_THEMES.terminal_matrix;

  return (
    <View style={styles.viewportContainer} onLayout={handleLayout}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* 1. Base Tile Grid (Kullanıcıya Göre Dinamik Zemin Teması) */}
        {map.grid.map((row, y) =>
          row.map((tile, x) => {
            const rx = x * tileW;
            const ry = y * tileH;
            const fill = getTileFillColor(tile, x, y, floorTheme);

            return (
              <Group key={`tile-${x}-${y}`}>
                <Rect x={rx} y={ry} width={tileW} height={tileH} color={fill} />
                <Rect
                  x={rx}
                  y={ry}
                  width={tileW}
                  height={tileH}
                  color={activeTheme.gridStroke}
                  style="stroke"
                  strokeWidth={1}
                />
                {tile === 'wall' && (
                  <Rect
                    x={rx}
                    y={ry + tileH * 0.78}
                    width={tileW}
                    height={tileH * 0.22}
                    color={activeTheme.wallTrim}
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

        {/* 2.5 Target Walk Destination Marker (Point-and-Click Hedef Halkası) */}
        {targetWalkTile && (
          <Group>
            <RoundedRect
              x={targetWalkTile.x * tileW + 3}
              y={targetWalkTile.y * tileH + 3}
              width={tileW - 6}
              height={tileH - 6}
              r={6}
              color={Colors.secondary}
              style="stroke"
              strokeWidth={2}
            />
            <Circle
              cx={(targetWalkTile.x + 0.5) * tileW}
              cy={(targetWalkTile.y + 0.5) * tileH}
              r={Math.min(tileW, tileH) * 0.16}
              color={Colors.secondary}
            />
          </Group>
        )}

        {/* 3. Ambient Desk / Room Glow (Temaya Uyarlı) */}
        <Circle
          cx={isDorm ? 2.2 * tileW : 5.8 * tileW}
          cy={isDorm ? 4.2 * tileH : 2.5 * tileH}
          r={tileW * 2.4}
          color={activeTheme.ambientGlow}
        />

        {/* 3.5 Scene NPC Ground Rings */}
        {sceneNpcs.map(npc => {
          const nx = npc.tileX * tileW;
          const ny = npc.tileY * tileH;
          return (
            <Group key={`npc-ring-${npc.npcId}`}>
              <Circle
                cx={nx}
                cy={ny + tileH * 0.24}
                r={Math.min(tileW, tileH) * 0.36}
                color="rgba(0, 0, 0, 0.58)"
              />
              <Circle
                cx={nx}
                cy={ny + tileH * 0.2}
                r={Math.min(tileW, tileH) * 0.42}
                color="rgba(76, 215, 246, 0.24)"
              />
            </Group>
          );
        })}
      </Canvas>

      {/* 3.8 Real Pixel-Art Furniture & Environment Props Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {sceneProps.map(prop => (
          <Image
            key={prop.id}
            source={prop.source}
            resizeMode="contain"
            style={[
              styles.scenePropImage,
              {
                left: prop.x * tileW,
                top: prop.y * tileH,
                width: prop.w * tileW,
                height: prop.h * tileH,
                zIndex: prop.zIndex,
              },
            ]}
          />
        ))}
      </View>

      {/* 4.5 Tappable Tile Grid Surface (Tıklanan Konuma Yürüme) */}
      <View style={styles.tapGridOverlay}>
        {map.grid.map((row, y) => (
          <View key={`tap-row-${y}`} style={styles.tapGridRow}>
            {row.map((_, x) => (
              <TouchableOpacity
                key={`tap-cell-${x}-${y}`}
                accessibilityLabel={`Karo ${x},${y}`}
                activeOpacity={0.7}
                style={styles.tapGridCell}
                onPress={() => onTapTile?.({ x, y })}
              />
            ))}
          </View>
        ))}
      </View>

      {/* 4.8 Scene NPC Sprites & Overhead Portrait Badges */}
      {sceneNpcs.map(npc => {
        const nx = npc.tileX * tileW;
        const ny = npc.tileY * tileH;
        const isThisNpcSpeaking =
          activeDialogueBubble?.speakerKind === 'npc' &&
          activeDialogueBubble?.npcId === npc.npcId;

        return (
          <TouchableOpacity
            key={`npc-sprite-${npc.npcId}`}
            accessibilityLabel={`${npc.name} ile Konuş`}
            activeOpacity={0.85}
            onPress={() => {
              onTapTile?.(npc.walkTarget, () => onTalkToSceneNpc?.(npc.npcId));
            }}
            style={[
              styles.npcSpriteContainer,
              {
                width: spriteWidth * 1.05,
                height: spriteHeight * 1.25,
                left: nx - spriteWidth * 0.525,
                top: ny + tileH * 0.32 - spriteHeight * 1.25,
              },
            ]}>
            <View
              style={[
                styles.speakerOverheadBadge,
                isThisNpcSpeaking && styles.speakerOverheadBadgeActive,
              ]}>
              <Image
                source={npc.sprites.portrait}
                style={styles.speakerOverheadAvatar}
                resizeMode="contain"
              />
              <Text style={styles.speakerOverheadName} numberOfLines={1}>
                {npc.name}
              </Text>
            </View>
            <Image
              source={isThisNpcSpeaking ? npc.sprites.talk : npc.sprites.idle}
              style={styles.playerSpriteImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        );
      })}

      {/* 5. Smoothly Gliding Animated Main Character Sprite Layer + Overhead Username & Portrait */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.playerSpriteContainer,
          {
            width: spriteWidth * 1.15,
            height: spriteHeight * 1.25,
            left: animatedPlayerLeft,
            top: animatedPlayerTop,
          },
        ]}>
        <View
          style={[
            styles.speakerOverheadBadge,
            isPlayerSpeaking && styles.speakerOverheadBadgeActive,
          ]}>
          <Image
            source={getMainCharPortrait(playerGender)}
            style={styles.speakerOverheadAvatar}
            resizeMode="contain"
          />
          <Text style={styles.speakerOverheadName} numberOfLines={1}>
            @{playerUsername}
          </Text>
        </View>
        <View
          style={[
            styles.playerFootRing,
            {
              width: tileW * 0.82,
              height: tileH * 0.34,
            },
          ]}
        />
        <Image
          source={activeSpriteSource}
          style={styles.playerSpriteImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 6. Konuşma Balonu (Speech Bubble) Katmanı — Her Konuşmacının Üstünde Resmi */}
      {activeDialogueBubble && (
        <View style={styles.speechBubbleWrapper}>
          <TouchableOpacity
            accessibilityLabel="Sonraki Konuşma Balonu"
            activeOpacity={0.92}
            onPress={onAdvanceDialogue}
            style={[
              styles.speechBubbleCard,
              activeDialogueBubble.speakerKind === 'player' &&
                styles.speechBubbleCardPlayer,
            ]}>
            <View style={styles.bubbleSpeakerHeader}>
              <View style={styles.bubblePortraitFrame}>
                <Image
                  source={
                    activeDialogueBubble.speakerKind === 'player'
                      ? getMainCharPortrait(playerGender)
                      : NPC_SPRITE_ASSETS[activeDialogueBubble.npcId].portrait
                  }
                  style={styles.bubblePortraitImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.bubbleSpeakerMeta}>
                <Text style={styles.bubbleSpeakerName}>
                  {activeDialogueBubble.speakerName}
                </Text>
                <Text style={styles.bubbleSpeakerRole} numberOfLines={1}>
                  {activeDialogueBubble.speakerRole}
                </Text>
              </View>
              <View style={styles.bubbleStepBadge}>
                <Text style={styles.bubbleStepText}>
                  {activeDialogueBubble.stepIndex + 1}/
                  {activeDialogueBubble.totalSteps}
                </Text>
              </View>
            </View>

            <Text style={styles.bubbleDialogueText}>
              “{activeDialogueBubble.text}”
            </Text>

            <View style={styles.bubbleFooterRow}>
              <Text style={styles.bubbleTapHint}>
                {activeDialogueBubble.stepIndex + 1 <
                activeDialogueBubble.totalSteps
                  ? 'Devam etmek için balona dokun ▶'
                  : 'Sohbeti tamamlamak için dokun ✓'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

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
            ? 'Kaan // Planlama'
            : 'Satış & Kondisyon'}
        </Text>
      </View>

      {/* Floating Interaction Prompt Bubble */}
      {activeInteraction && !isWalking && (
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
  scenePropImage: {
    position: 'absolute',
  },
  playerSpriteContainer: {
    position: 'absolute',
    zIndex: 22,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  playerFootRing: {
    position: 'absolute',
    bottom: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 255, 102, 0.22)',
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  npcSpriteContainer: {
    position: 'absolute',
    zIndex: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  playerSpriteImage: {
    width: '100%',
    height: '78%',
  },
  tapGridOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 14,
    flexDirection: 'column',
  },
  tapGridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  tapGridCell: {
    flex: 1,
  },
  speakerOverheadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 18, 28, 0.92)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(76, 215, 246, 0.45)',
    gap: 3,
    marginBottom: 2,
  },
  speakerOverheadBadgeActive: {
    borderColor: Colors.primaryContainer,
    backgroundColor: 'rgba(0, 229, 91, 0.22)',
  },
  speakerOverheadAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  speakerOverheadName: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
  },
  speechBubbleWrapper: {
    position: 'absolute',
    bottom: 28,
    left: 10,
    right: 10,
    zIndex: 45,
  },
  speechBubbleCard: {
    backgroundColor: 'rgba(20, 25, 36, 0.96)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    gap: 6,
  },
  speechBubbleCardPlayer: {
    borderColor: Colors.primaryContainer,
  },
  bubbleSpeakerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bubblePortraitFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bubblePortraitImg: {
    width: 34,
    height: 34,
  },
  bubbleSpeakerMeta: {
    flex: 1,
  },
  bubbleSpeakerName: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  bubbleSpeakerRole: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
  },
  bubbleStepBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bubbleStepText: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  bubbleDialogueText: {
    color: Colors.onSurface,
    fontSize: 12,
    lineHeight: 17,
  },
  bubbleFooterRow: {
    alignItems: 'flex-end',
  },
  bubbleTapHint: {
    color: Colors.primaryContainer,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
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
    borderColor: '#2a3346',
    zIndex: 25,
  },
  bonsaiIcon: {
    color: Colors.primaryContainer,
    fontSize: 10,
  },
  bonsaiText: {
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '600',
  },
  exitDoorTag: {
    position: 'absolute',
    top: 8,
    right: 22,
    backgroundColor: 'rgba(147, 0, 10, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.error,
    zIndex: 25,
  },
  exitDoorText: {
    color: '#ffdad6',
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  zombieOsTag: {
    position: 'absolute',
    top: '22%',
    left: 10,
    backgroundColor: 'rgba(20, 24, 34, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
    zIndex: 25,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryContainer,
  },
  zombieOsText: {
    color: Colors.primary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  bedTag: {
    position: 'absolute',
    top: '22%',
    right: 12,
    backgroundColor: 'rgba(28, 31, 42, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#2d3748',
    zIndex: 25,
  },
  bedIcon: {
    fontSize: 10,
  },
  bedText: {
    color: Colors.secondary,
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
  },
  floatingPromptContainer: {
    position: 'absolute',
    zIndex: 30,
  },
  floatingPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 24, 34, 0.96)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
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
    color: Colors.onSurface,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
  },
});
