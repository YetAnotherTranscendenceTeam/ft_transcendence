import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { bounceMaterial, maxGoalHealth } from "./constants.js";
import { IGoalSync, MapSide } from "./types.js";
import Ball from "./Ball.js";

export default class Goal extends PH2D.Body {
	private _scored: boolean;
	private _width: number;
	private _height: number;
	// This value is used to determine if the goal protection is destroyed or not.
	// It is used by the multiball powerup to make sure players don't lose instantly.
	private _health: number;

	/**
	 * Create a goal.
	 * @param shape The shape of the goal.
	 * @param position The position of the goal.
	 * @param size The size of the goal.
	 */
	public constructor(shape: PH2D.Shape, position: Vec2, size: Vec2) {
		super(PH2D.PhysicsType.TRIGGER, shape, bounceMaterial, position, Vec2.create());
		this._scored = false;
		this._width = size[0];
		this._height = size[1];
		this._health = 0;	
	}

	/**
	 * Get the width of the goal.
	 * @returns The width of the goal.
	 */
	public get width(): number {
		return this._width;
	}

	/**
	 * Get the height of the goal.
	 * @returns The height of the goal.
	 */
	public get height(): number {
		return this._height;
	}

	public get scored(): boolean {
		return this._scored;
	}

	public get health(): number {
		return this._health;
	}

	public side(): MapSide {
		if (this.position[0] < 0) {
			return MapSide.LEFT;
		} else {
			return MapSide.RIGHT;
		}
	}

	public heal() {
		this._health = maxGoalHealth;
	}

	public destroyWall() {
		this._health = 0;
	}

	public getDamage(bounce_coun: number): number {
		return 1 / (1 + Math.exp(-bounce_coun/1.5 + 4.2)) * 8 + 1;
	}

	public score(ball: Ball): boolean {
		if (this._health <= 0) {
			this._scored = true;
			return true;
		}
		// if (ball.bounceCount > 0) {
			const damage = this.getDamage(ball.bounceCount);
			this._health -= damage;
			// console.log('goal damage', ball.bounceCount, damage);
			ball.resetDamage();
			if (this._health <= 0) {
				this._health = 0;
			}
		// }
		// console.log('goal health', this.id, this._health);
		return false;
	}

	public resetScore(): void {
		this._scored = false;
	}

	public sync(other: IGoalSync): void {
		this._health = other.health;
	}
}
