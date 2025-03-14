export const EPSILON = 0.0001;

export type Material = {
  density: number;
  restitution: number;
  staticFriction: number;
  dynamicFriction: number;
};

export type MassData = {
  mass: number;
  invMass: number;
  inertia: number;
  invInertia: number;
};

export enum PhysicsType {
  STATIC = 0,
  DYNAMIC = 1,
  KINEMATIC = 2
};
