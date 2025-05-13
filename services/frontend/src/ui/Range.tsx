import Babact from "babact";

export default function Range({
		value,
		onChange,
		min = 0,
		max = 100,
		step = 1,
		className = '',
	}: {
		value: number;
		onChange: (value: number) => void;
		min?: number;
		max?: number;
		step?: number;
		className?: string;
	}) {

	return <input
		className={`range ${className}`}
		type="range"
		min={min}
		max={max}
		step={step}
		value={value}
		onChange={(e) => onChange(parseInt(e.target.value))}
	/>;
}