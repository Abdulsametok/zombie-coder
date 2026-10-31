import { ImageSourcePropType } from 'react-native';

export interface EnvironmentSpriteCatalog {
  home: {
    deskComputer: ImageSourcePropType;
    bed: ImageSourcePropType;
    bookshelf: ImageSourcePropType;
    wardrobe: ImageSourcePropType;
    chair: ImageSourcePropType;
    rug: ImageSourcePropType;
    window: ImageSourcePropType;
  };
  university: {
    board: ImageSourcePropType;
    lectern: ImageSourcePropType;
    desks: ImageSourcePropType;
    bookshelf: ImageSourcePropType;
  };
  gym: {
    treadmill: ImageSourcePropType;
    bike: ImageSourcePropType;
    benchPress: ImageSourcePropType;
    weights: ImageSourcePropType;
    bench: ImageSourcePropType;
    punchingBag: ImageSourcePropType;
    mat: ImageSourcePropType;
    lockers: ImageSourcePropType;
  };
  common: {
    plantPot: ImageSourcePropType;
    plantBonsai: ImageSourcePropType;
    doorWood: ImageSourcePropType;
    doorDouble: ImageSourcePropType;
    floorHome: ImageSourcePropType;
    floorUni: ImageSourcePropType;
    floorGym: ImageSourcePropType;
  };
}

export const ENVIRONMENT_SPRITES: EnvironmentSpriteCatalog = {
  home: {
    deskComputer: require('../../../assets/environment/home/desk_computer.png'),
    bed: require('../../../assets/environment/home/bed.png'),
    bookshelf: require('../../../assets/environment/home/bookshelf.png'),
    wardrobe: require('../../../assets/environment/home/wardrobe.png'),
    chair: require('../../../assets/environment/home/chair.png'),
    rug: require('../../../assets/environment/home/rug.png'),
    window: require('../../../assets/environment/home/window.png'),
  },
  university: {
    board: require('../../../assets/environment/university/board.png'),
    lectern: require('../../../assets/environment/university/lectern.png'),
    desks: require('../../../assets/environment/university/desks.png'),
    bookshelf: require('../../../assets/environment/university/bookshelf.png'),
  },
  gym: {
    treadmill: require('../../../assets/environment/gym/treadmill.png'),
    bike: require('../../../assets/environment/gym/bike.png'),
    benchPress: require('../../../assets/environment/gym/bench_press.png'),
    weights: require('../../../assets/environment/gym/weights.png'),
    bench: require('../../../assets/environment/gym/bench.png'),
    punchingBag: require('../../../assets/environment/gym/punching_bag.png'),
    mat: require('../../../assets/environment/gym/mat.png'),
    lockers: require('../../../assets/environment/gym/lockers.png'),
  },
  common: {
    plantPot: require('../../../assets/environment/common/plant_pot.png'),
    plantBonsai: require('../../../assets/environment/common/plant_bonsai.png'),
    doorWood: require('../../../assets/environment/common/door_wood.png'),
    doorDouble: require('../../../assets/environment/common/door_double.png'),
    floorHome: require('../../../assets/environment/common/floor_home.png'),
    floorUni: require('../../../assets/environment/common/floor_uni.png'),
    floorGym: require('../../../assets/environment/common/floor_gym.png'),
  },
};
