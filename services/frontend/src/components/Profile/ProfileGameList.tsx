import Babact from "babact";
import Pagination from "../../ui/Pagination";
import ProfileGameListItem from "./ProfileGameListItem";
import ProfileFilter from "./ProfileFilter";
import { Match } from "../../hooks/useMatches";
import Spinner from "../../ui/Spinner";

export default function ProfileGameList({
		matches,
		loading,
		page,
		onSelectMatch,
	}: {
		matches: Match[]
		loading: boolean,
		page: number,
		onSelectMatch: (match: Match) => void
	}) {

	return <table className='profile-game-list flex flex-col items-center h-full gap-4'>
		<div className='profile-game-list-header flex flex-row items-center justify-between w-full'>
			Match History
		</div>
		{
			!loading ? <div className='profile-game-list-body flex flex-col items-center w-full h-full scrollbar gap-2 '>
				{matches.map((match, index) => {
					return <ProfileGameListItem
						key={match.match_id}
						match={match}
						onSelect={() => onSelectMatch(match)}
					/>
				})}
			</div>:
			<div className='profile-game-list-body flex flex-col items-center justify-center w-full h-full '>
				<Spinner />
			</div>
		}
		<div className='profile-game-list-footer flex flex-row items-center justify-center w-full'>
			<Pagination
				page={page}
				total={1}
				setPage={(page) => {
					console.log(page);
				}}
			/>
		</div>
	</table>
}