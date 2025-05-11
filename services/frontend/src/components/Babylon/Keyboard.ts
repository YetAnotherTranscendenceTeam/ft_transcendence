import { KeyState } from "./types";

export default class Keyboard {
	private _keys: Map<string, KeyState>;
	private _downKeys: Set<string> = new Set();
	private _autoRegister: boolean;

	public constructor(autoRegister: boolean = true) {
		this._keys = new Map();
		this._downKeys = new Set();
		this._autoRegister = autoRegister;
	}

	public update(): void {
		this._keys.forEach((state, key) => {
			if (this._downKeys.has(key)) {
				if (state === KeyState.IDLE || state === KeyState.RELEASED) {
					this._keys.set(key, KeyState.PRESSED);
				} else if (state === KeyState.PRESSED) {
					this._keys.set(key, KeyState.HELD);
				}
			} else {
				if (state === KeyState.PRESSED || state === KeyState.HELD) {
					this._keys.set(key, KeyState.RELEASED);
				} else if (state === KeyState.RELEASED) {
					this._keys.set(key, KeyState.IDLE);
				}
			}
		});
	}

	public registerKey(key: string): void {
		const loweredKey = key.toLowerCase();
		if (!this._keys.has(loweredKey)) {
			this._keys.set(loweredKey, KeyState.IDLE);
		}
	}

	public removeKey(key: string): void {
		const loweredKey = key.toLowerCase();
		if (this._keys.has(loweredKey)) {
			this._keys.delete(loweredKey);
		}
		if (this._downKeys.has(loweredKey)) {
			this._downKeys.delete(loweredKey);
		}
	}

	public keyDown(key: string): void {
		if (!key)
			return;
		const loweredKey = key.toLowerCase();
		this._downKeys.add(loweredKey);
		if (this._autoRegister && !this._keys.has(loweredKey)) {
			this._keys.set(loweredKey, KeyState.IDLE);
		}
	}

	public keyUp(key: string): void {
		if (!key)
			return;
		const loweredKey = key.toLowerCase();
		this._downKeys.delete(loweredKey);
	}

	public isPressed(key: string): boolean {
		const loweredKey = key.toLowerCase();
		return this._keys.get(loweredKey) === KeyState.PRESSED;
	}

	public isHeld(key: string): boolean {
		const loweredKey = key.toLowerCase();
		return this._keys.get(loweredKey) === KeyState.HELD;
	}

	public isReleased(key: string): boolean {
		const loweredKey = key.toLowerCase();
		return this._keys.get(loweredKey) === KeyState.RELEASED;
	}

	public isIdle(key: string): boolean {
		const loweredKey = key.toLowerCase();
		return this._keys.get(loweredKey) === KeyState.IDLE;
	}

	public isDown(key: string): boolean {
		const loweredKey = key.toLowerCase();
		return this._downKeys.has(loweredKey);
	}

	public isUp(key: string): boolean {
		const loweredKey = key.toLowerCase();
		return !this._downKeys.has(loweredKey);
	}
	
	public getState(key: string): KeyState {
		const loweredKey = key.toLowerCase();
		return this._keys.get(loweredKey) ?? KeyState.IDLE;
	}

	public reset(): void {
		this._keys.forEach((_, key) => {
			this._keys.set(key, KeyState.IDLE);
		});
		this._downKeys.clear();
	}

	public clear(): void {
		this._keys.clear();
		this._downKeys.clear();
	}

	public get keys(): Map<string, KeyState> {
		return this._keys;
	}
	public get downKeys(): Set<string> {
		return this._downKeys;
	}
}