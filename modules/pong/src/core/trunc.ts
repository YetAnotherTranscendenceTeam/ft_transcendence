

export default function trunc(value: number, decimals = 2): number {
	const factor = 10 ** decimals;
	return Math.trunc(value * factor) / factor;
}