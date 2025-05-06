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
				{ label: 'All modes', value: '' },
				{ label: 'Ranked', value: 'ranked' },
				{ label: 'Unranked', value: 'unranked' },
				{ label: 'Custom', value: 'custom' },
				{ label: 'Tournament', value: 'tournament' },
			]}
			onChange={(value) => {
				onChange(value);
			}}
			value=""
		/>
	</div>
}