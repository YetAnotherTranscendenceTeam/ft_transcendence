import Babact from "babact";
import SegmentedControl from "../../ui/SegmentedControl";

export default function ProfileFilter({
		onChange
	}: {
		onChange: (value: string) => void
		[key: string]: any
	}) {

	return <div
		className='profile-filter flex items-center justify-end w-full gap-4'
	>
		<SegmentedControl
			buttons={[
				{ label: 'No filter', value: '' },
				{ label: <><i className="fa-solid fa-trophy"></i> Ranked</>, value: 'ranked' },
				{ label: <><i className="fa-solid fa-gamepad"></i> Unranked</>, value: 'unranked' },
				{ label: <><i className="fa-solid fa-users"></i> Custom</>, value: 'custom' },
				{ label: <><i className="fa-solid fa-people-group"></i> Clash</>, value: 'tournament' },
			]}
			onChange={(value) => {
				onChange(value);
			}}
			value=""
		/>
	</div>
}