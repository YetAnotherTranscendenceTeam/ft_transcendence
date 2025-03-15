import { Vec2, Mat2 } from 'gl-matrix';
import { ShapeType } from './Shape/Shape';
import { CircleShape } from './Shape/CircleShape';
import { PolygonShape } from './Shape/PolygonShape';
import { Body } from './Body';
import type { Manifold } from './Manifold';
import { PhysicsType } from './properties';
import { EPSILON } from 'gl-matrix/common';

export type CollisionCallback = (manifold: Manifold, bodyA: Body, bodyB: Body) => void;

export const COLLISION_CALLBACKS: Map<ShapeType, Map<ShapeType, CollisionCallback>> = new Map([
	[ShapeType.CIRCLE, new Map([
		[ShapeType.CIRCLE, circleCircleCollision],
		[ShapeType.POLYGON, circlePolygonCollision]
	])],
	[ShapeType.POLYGON, new Map([
		[ShapeType.CIRCLE, polygonCircleCollision],
		[ShapeType.POLYGON, polygonPolygonCollision]
	])]
]);

function circleCircleCollision(manifold: Manifold, bodyA: Body, bodyB: Body): void {
	const circleA: CircleShape = bodyA.shape as CircleShape;
	const circleB: CircleShape = bodyB.shape as CircleShape;

	const normal: Vec2 = Vec2.subtract(Vec2.create(), bodyB.position, bodyA.position) as Vec2;
	const distance_sqr: number = Vec2.squaredLength(normal);
	const radius: number = circleA.radius + circleB.radius;

	if (distance_sqr >= radius * radius) {
		manifold.contacts.length = 0;
		return;
	}

	const distance: number = Math.sqrt(distance_sqr);

	if (distance === 0) {
		manifold.penetration = circleA.radius;
		manifold.normal = Vec2.fromValues(1, 0);
		manifold.contacts[0] = Vec2.clone(bodyA.position);
	} else {
		manifold.penetration = radius - distance;
		Vec2.scale(manifold.normal, normal, 1 / distance);
		Vec2.scaleAndAdd(manifold.contacts[0], bodyA.position, manifold.normal, circleA.radius);
	}
}

function circlePolygonCollision(manifold: Manifold, bodyA: Body, bodyB: Body): void {
	const circle: CircleShape = bodyA.shape as CircleShape;
	const polygon: PolygonShape = bodyB.shape as PolygonShape;

	const center: Vec2 = Vec2.clone(bodyA.position).sub(bodyB.position);
	Vec2.transformMat2(center, center, Mat2.transpose(Mat2.create(), polygon.u));

	let separation: number = -Number.MAX_VALUE;
	let faceNormal: number = 0;

	for (let i = 0; i < polygon.vertices.length; i++) {
		const s: number = Vec2.dot(polygon.normals[i], Vec2.subtract(Vec2.create(), center, polygon.vertices[i]));
		if (s > circle.radius) {
			return;
		}
		if (s > separation) {
			separation = s;
			faceNormal = i;
		}
	}

	const v1: Vec2 = polygon.vertices[faceNormal];
	const i2: number = (faceNormal + 1) % polygon.vertices.length;
	const v2: Vec2 = polygon.vertices[i2];

	if (separation < EPSILON) {
		const normal: Vec2 = Vec2.clone(polygon.normals[faceNormal]);
		Vec2.negate(manifold.normal, Vec2.transformMat2(normal, normal, polygon.u));
		manifold.penetration = circle.radius;
		manifold.contacts[0] = Vec2.clone(bodyA.position).add(Vec2.scale(Vec2.create(), manifold.normal, circle.radius));
		return;
	}

	const dot1: number = Vec2.dot(Vec2.subtract(Vec2.create(), center, v1), Vec2.subtract(Vec2.create(), v2, v1));
	const dot2: number = Vec2.dot(Vec2.subtract(Vec2.create(), center, v2), Vec2.subtract(Vec2.create(), v1, v2));
	manifold.penetration = circle.radius - separation;

	if (dot1 <= 0) {
		if (Vec2.squaredLength(Vec2.subtract(Vec2.create(), center, v1)) > circle.radius * circle.radius) {
			return;
		}
		const normal: Vec2 = Vec2.subtract(Vec2.create(), v1, center) as Vec2;
		Vec2.transformMat2(normal, normal, polygon.u);
		Vec2.normalize(manifold.normal, normal);
		Vec2.add(manifold.contacts[0], Vec2.transformMat2(Vec2.create(), v1, polygon.u), bodyB.position);
	} else if (dot2 <= 0) {	
		if (Vec2.squaredLength(Vec2.subtract(Vec2.create(), center, v2)) > circle.radius * circle.radius) {
			return;
		}
		const normal: Vec2 = Vec2.subtract(Vec2.create(), v2, center) as Vec2;
		Vec2.transformMat2(normal, normal, polygon.u);
		Vec2.normalize(manifold.normal, normal);
		Vec2.add(manifold.contacts[0], Vec2.transformMat2(Vec2.create(), v2, polygon.u), bodyB.position);
	} else {
		const normal: Vec2 = Vec2.clone(polygon.normals[faceNormal]);
		if (Vec2.dot(Vec2.subtract(Vec2.create(), center, v1), normal) > circle.radius) {
			return;
		}
		Vec2.transformMat2(normal, normal, polygon.u);
		Vec2.negate(manifold.normal, normal);
		Vec2.scaleAndAdd(manifold.contacts[0], bodyA.position, manifold.normal, circle.radius);
	}
}

function polygonCircleCollision(manifold: Manifold, bodyA: Body, bodyB: Body): void {
	circlePolygonCollision(manifold, bodyB, bodyA);
	Vec2.negate(manifold.normal, manifold.normal);
}

function findAxisLeastPenetration(bodyA: Body, bodyB: Body): [number, number] {
	const polygonA: PolygonShape = bodyA.shape as PolygonShape;
	const polygonB: PolygonShape = bodyB.shape as PolygonShape;

	let bestDistance: number = -Number.MAX_VALUE;
	let bestIndex: number = 0;

	for (let i = 0; i < polygonA.vertices.length; i++) {
		const normal: Vec2 = Vec2.clone(polygonA.normals[i]);
		Vec2.transformMat2(normal, normal, polygonA.u);

		const buT: Mat2 = Mat2.transpose(Mat2.create(), polygonB.u) as Mat2;
		Vec2.transformMat2(normal, normal, buT);

		const support: Vec2 = polygonB.getSupport(Vec2.negate(Vec2.create(), normal) as Vec2);

		const v: Vec2 = Vec2.clone(polygonA.vertices[i]);
		Vec2.transformMat2(v, v, polygonA.u);
		Vec2.add(v, v, bodyA.position);
		Vec2.subtract(v, v, bodyB.position);
		Vec2.transformMat2(v, v, buT);

		const distance: number = Vec2.dot(normal, Vec2.subtract(Vec2.create(), support, v));

		if (distance > bestDistance) {
			bestDistance = distance;
			bestIndex = i;
		}
	}

	
	return [bestDistance, bestIndex];
}

function findIncidentFace(refBody: Body, incBody: Body, referenceIndex: number): [Vec2, Vec2] {
	const refPolygon: PolygonShape = refBody.shape as PolygonShape;
	const incPolygon: PolygonShape = incBody.shape as PolygonShape;

	const refNormal: Vec2 = Vec2.clone(refPolygon.normals[referenceIndex]);
	Vec2.transformMat2(refNormal, refNormal, refPolygon.u);
	Vec2.transformMat2(refNormal, refNormal, Mat2.transpose(Mat2.create(), incPolygon.u));

	let incidentFace: number = 0;
	let minDot: number = Number.MAX_VALUE;

	for (let i = 0; i < incPolygon.vertices.length; i++) {
		const dot: number = Vec2.dot(refNormal, incPolygon.normals[i]);
		if (dot < minDot) {
			minDot = dot;
			incidentFace = i;
		}
	}

	const v1: Vec2 = incPolygon.vertices[incidentFace];
	Vec2.transformMat2(v1, v1, incPolygon.u);
	Vec2.add(v1, v1, incBody.position);
	const i2: number = (incidentFace + 1) % incPolygon.vertices.length;
	const v2: Vec2 = incPolygon.vertices[i2];
	Vec2.transformMat2(v2, v2, incPolygon.u);
	Vec2.add(v2, v2, incBody.position);

	return [v1, v2];
}

function clip(n: Vec2, c: number, face: [Vec2, Vec2]): number {
	let sp:number = 0;
	const out: Vec2[] = [face[0], face[1]];

	const d1: number = Vec2.dot(n, face[0]) - c;
	const d2: number = Vec2.dot(n, face[1]) - c;

	if (d1 <= 0) out[sp++] = face[0];
	if (d2 <= 0) out[sp++] = face[1];

	if (d1 * d2 < 0) {
		const alpha: number = d1 / (d1 - d2);
		const tmp: Vec2 = Vec2.create();
		Vec2.add(tmp, face[0], Vec2.scale(tmp, Vec2.subtract(tmp, face[1], face[0]), alpha));
		out[sp++] = tmp;
		sp++;
	}

	face[0].set(out[0]);
	face[1].set(out[1]);

	return sp;
}

function polygonPolygonCollision(manifold: Manifold, bodyA: Body, bodyB: Body): void {
	const polygonA: PolygonShape = bodyA.shape as PolygonShape;
	const polygonB: PolygonShape = bodyB.shape as PolygonShape;

	const [penetrationA, faceA] = findAxisLeastPenetration(bodyA, bodyB);
	if (penetrationA >= 0) {
		return;
	}

	const [penetrationB, faceB] = findAxisLeastPenetration(bodyB, bodyA);
	if (penetrationB >= 0) {
		return;
	}

	const flip: boolean = !(penetrationA >= penetrationB * 0.95 + penetrationA * 0.01);
	// const referenceIndex: number = penetrationA >= penetrationB * 0.95 + penetrationA * 0.01 ? faceA : faceB;
	// const refBody: Body = penetrationA >= penetrationB * 0.95 + penetrationA * 0.01 ? bodyA : bodyB;
	// const incBody: Body = penetrationA >= penetrationB * 0.95 + penetrationA * 0.01 ? bodyB : bodyA;
	const referenceIndex: number = flip ? faceB : faceA;
	const refBody: Body = flip ? bodyB : bodyA;
	const incBody: Body = flip ? bodyA : bodyB;

	const refPolygon: PolygonShape = refBody.shape as PolygonShape;

	const incidentFace: [Vec2, Vec2] = findIncidentFace(refBody, incBody, referenceIndex);

	const v1: Vec2 = Vec2.clone(refPolygon.vertices[referenceIndex]);
	Vec2.transformMat2(v1, v1, refPolygon.u);
	Vec2.add(v1, v1, refBody.position);
	const i2: number = (referenceIndex + 1) % refPolygon.vertices.length;
	const v2: Vec2 = Vec2.clone(refPolygon.vertices[i2]);
	Vec2.transformMat2(v2, v2, refPolygon.u);
	Vec2.add(v2, v2, refBody.position);

	const sidePlaneNormal: Vec2 = Vec2.subtract(Vec2.create(), v2, v1) as Vec2;
	Vec2.normalize(sidePlaneNormal, sidePlaneNormal);

	const refFaceNormal: Vec2 = Vec2.fromValues(sidePlaneNormal[1], -sidePlaneNormal[0]);

	const refC: number = Vec2.dot(refFaceNormal, v1);
	const negSide: number = -Vec2.dot(sidePlaneNormal, v1);
	const posSide: number = Vec2.dot(sidePlaneNormal, v2);

	if (clip(Vec2.negate(Vec2.create(), sidePlaneNormal) as Vec2, negSide, incidentFace) < 2) {
		return;
	}

	if (clip(sidePlaneNormal, posSide, incidentFace) < 2) {
		return;
	}

	manifold.normal = Vec2.clone(refFaceNormal);
	if (!flip) {
		Vec2.negate(manifold.normal, manifold.normal);
	}

	let cp: number = 0;
	let separation: number = Vec2.dot(refFaceNormal, incidentFace[0]) - refC;
	if (separation >= 0) {
		manifold.contacts[cp++] = incidentFace[0];
		manifold.penetration = -separation;
	} else {
		manifold.penetration = 0;
	}

	separation = Vec2.dot(refFaceNormal, incidentFace[1]) - refC;
	if (separation >= 0) {
		manifold.contacts[cp++] = incidentFace[1];
		manifold.penetration += -separation;

		manifold.penetration /= cp;
	}
}
