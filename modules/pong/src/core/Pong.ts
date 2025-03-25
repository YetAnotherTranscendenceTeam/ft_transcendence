import * as PH2D from "physics-engine";
import { Vec2 } from "gl-matrix";
import { GameMode } from "./types.js";
import { DT, ballSpeedMin, bounceMaterial } from "./constants.js";

export class Pong {
	private _counter: number = 0;

	public constructor() {}

	public incrementCounter(): void {
		this._counter++;
	}

	public decrementCounter(): void {
		this._counter--;
	}

	public get counter(): number {
		return this._counter;
	}

	public set counter(value: number) {	// imagine this setter has some validation logic
		this._counter = value;
	}
}
