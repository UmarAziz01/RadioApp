declare module 'react-native-svg' {
  import * as React from 'react';
  // Basic SVG components used in the project
  export const Svg: React.ComponentType<any>;
  export const Path: React.ComponentType<any>;
  export const Circle: React.ComponentType<any>;
  export const Rect: React.ComponentType<any>;
  export const G: React.ComponentType<any>;
  export const Line: React.ComponentType<any>;
  export const Polygon: React.ComponentType<any>;
  export const Ellipse: React.ComponentType<any>;
  export const Polyline: React.ComponentType<any>;
  // Export any other members as any to avoid type errors
  const _default: any;
  export default _default;
}