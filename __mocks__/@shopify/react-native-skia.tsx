import React from 'react';
import { View } from 'react-native';

export const Canvas = ({ children, style }: any) => (
  <View style={style}>{children}</View>
);
export const Group = ({ children }: any) => <>{children}</>;
export const Rect = () => null;
export const RoundedRect = () => null;
export const Circle = () => null;
export const Line = () => null;
export const vec = (x: number, y: number) => ({ x, y });
