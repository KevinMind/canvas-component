export { ObjectPool, positionPool, boundsPool, colorPool, matrixPool } from './ObjectPool';
export { PathCache, globalPathCache, generatePathKey } from './PathCache';
export {
  HitRegion,
  pointInPolygon,
  pointInAABB,
  calculateAABB,
  expandAABB,
  type AABB,
  type HitRegionConfig,
} from './HitRegion';
export {
  InteractionManager,
  type InteractionEvent,
  type InteractionEventType,
  type InteractionHandler,
} from './InteractionManager';
