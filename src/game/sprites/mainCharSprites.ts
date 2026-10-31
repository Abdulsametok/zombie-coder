import { ImageSourcePropType } from 'react-native';
import { Direction } from '../maps/dormRoomMap';

export type CharacterAnimState = 'idle' | 'walk';

export interface DirectionalSpriteSet {
  idle: ImageSourcePropType[];
  walk: ImageSourcePropType[];
}

export const GAME_LOGO_ASSET: ImageSourcePropType = require('../../../assets/logo/oyunlogo.png');

export const MAIN_CHAR_SPRITESHEET: ImageSourcePropType = require('../../../assets/main_char/main_char_spritesheet.png');

export const MAIN_CHAR_FRAMES: Record<Direction, DirectionalSpriteSet> = {
  down: {
    idle: [
      require('../../../assets/main_char/down_0.png'),
      require('../../../assets/main_char/down_3.png'),
    ],
    walk: [
      require('../../../assets/main_char/down_1.png'),
      require('../../../assets/main_char/down_2.png'),
      require('../../../assets/main_char/down_3.png'),
      require('../../../assets/main_char/down_4.png'),
      require('../../../assets/main_char/down_5.png'),
      require('../../../assets/main_char/down_0.png'),
    ],
  },
  right: {
    idle: [
      require('../../../assets/main_char/right_0.png'),
      require('../../../assets/main_char/right_3.png'),
    ],
    walk: [
      require('../../../assets/main_char/right_1.png'),
      require('../../../assets/main_char/right_2.png'),
      require('../../../assets/main_char/right_3.png'),
      require('../../../assets/main_char/right_4.png'),
      require('../../../assets/main_char/right_5.png'),
      require('../../../assets/main_char/right_0.png'),
    ],
  },
  left: {
    idle: [
      require('../../../assets/main_char/left_0.png'),
      require('../../../assets/main_char/left_3.png'),
    ],
    walk: [
      require('../../../assets/main_char/left_1.png'),
      require('../../../assets/main_char/left_2.png'),
      require('../../../assets/main_char/left_3.png'),
      require('../../../assets/main_char/left_4.png'),
      require('../../../assets/main_char/left_5.png'),
      require('../../../assets/main_char/left_0.png'),
    ],
  },
  up: {
    idle: [
      require('../../../assets/main_char/up_0.png'),
      require('../../../assets/main_char/up_3.png'),
    ],
    walk: [
      require('../../../assets/main_char/up_1.png'),
      require('../../../assets/main_char/up_2.png'),
      require('../../../assets/main_char/up_3.png'),
      require('../../../assets/main_char/up_4.png'),
      require('../../../assets/main_char/up_5.png'),
      require('../../../assets/main_char/up_0.png'),
    ],
  },
};

export const AVATAR_STYLE_SPRITE_PREVIEW: Record<
  'hacker_hoodie' | 'cyber_casual' | 'insomniac' | 'glitch_mod',
  ImageSourcePropType
> = {
  hacker_hoodie: require('../../../assets/main_char/down_0.png'),
  cyber_casual: require('../../../assets/main_char/side_alt_0.png'),
  insomniac: require('../../../assets/main_char/down_2.png'),
  glitch_mod: require('../../../assets/main_char/side_alt_4.png'),
};

export const MAIN_CHAR_PORTRAIT: ImageSourcePropType = require('../../../assets/main_char/portrait.png');

export interface NpcSpriteSet {
  idle: ImageSourcePropType;
  talk: ImageSourcePropType;
  poseAlt: ImageSourcePropType;
  side: ImageSourcePropType;
  back: ImageSourcePropType;
  portrait: ImageSourcePropType;
}

export const NPC_SPRITE_ASSETS: Record<
  'prof_demir' | 'coach_burak' | 'asistan_elif' | 'kaan_mentor',
  NpcSpriteSet
> = {
  prof_demir: {
    idle: require('../../../assets/npcs/akademisyen/idle.png'),
    talk: require('../../../assets/npcs/akademisyen/talk.png'),
    poseAlt: require('../../../assets/npcs/akademisyen/pose_alt.png'),
    side: require('../../../assets/npcs/akademisyen/side.png'),
    back: require('../../../assets/npcs/akademisyen/back.png'),
    portrait: require('../../../assets/npcs/akademisyen/portrait.png'),
  },
  coach_burak: {
    idle: require('../../../assets/npcs/coach/idle.png'),
    talk: require('../../../assets/npcs/coach/talk.png'),
    poseAlt: require('../../../assets/npcs/coach/pose_alt.png'),
    side: require('../../../assets/npcs/coach/side.png'),
    back: require('../../../assets/npcs/coach/back.png'),
    portrait: require('../../../assets/npcs/coach/portrait.png'),
  },
  asistan_elif: {
    idle: require('../../../assets/npcs/akademisyen/pose_alt.png'),
    talk: require('../../../assets/npcs/akademisyen/talk.png'),
    poseAlt: require('../../../assets/npcs/akademisyen/idle.png'),
    side: require('../../../assets/npcs/akademisyen/side.png'),
    back: require('../../../assets/npcs/akademisyen/back.png'),
    portrait: require('../../../assets/npcs/akademisyen/portrait.png'),
  },
  kaan_mentor: {
    idle: require('../../../assets/main_char/side_alt_0.png'),
    talk: require('../../../assets/main_char/down_4.png'),
    poseAlt: require('../../../assets/main_char/down_2.png'),
    side: require('../../../assets/main_char/right_0.png'),
    back: require('../../../assets/main_char/up_0.png'),
    portrait: require('../../../assets/main_char/portrait.png'),
  },
};

export function getCharacterFrameSource(
  facing: Direction,
  animState: CharacterAnimState,
  frameTick: number,
): ImageSourcePropType {
  const dirSet = MAIN_CHAR_FRAMES[facing] || MAIN_CHAR_FRAMES.down;
  const list = animState === 'walk' ? dirSet.walk : dirSet.idle;
  const idx = Math.abs(frameTick) % list.length;
  return list[idx];
}
