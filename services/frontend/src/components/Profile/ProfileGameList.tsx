import Babact from "babact";
import Pagination from "../../ui/Pagination";
import ProfileGameListItem from "./ProfileGameListItem";

export default function ProfileGameList({}: {}) {

	return <table className='profile-game-list flex flex-col items-center h-full gap-4'>
		<div className='profile-game-list-header flex flex-row items-center justify-between w-full'>
			Match History
		</div>
		<div className='profile-game-list-body flex flex-col items-center w-full h-full scrollbar gap-2'>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
			<ProfileGameListItem/>
		</div>
		<div className='profile-game-list-footer flex flex-row items-center justify-center w-full'>
			<Pagination
				page={1}
				total={10}
				setPage={(page) => {
					console.log(page);
				}}
			/>
		</div>
	</table>
}