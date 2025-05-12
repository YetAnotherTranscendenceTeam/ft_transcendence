import Babact from "babact";

export default function Switch({
		value,
		onChange,
	}: {
		value: boolean;
		onChange: (value: boolean) => void;
	}) {


	return <label className="switch">
		<input type="checkbox"
			checked={value}
			onChange={(e) => onChange(e.target.checked)}
		/>
		<span className="slider round"></span>
  	</label>
}