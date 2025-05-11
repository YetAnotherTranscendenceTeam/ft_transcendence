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
		totalPages,
		setPage,
		onSelectMatch,
	}: {
		matches: Match[]
		loading: boolean,
		page: number,
		totalPages: number,
		setPage: (page: number) => void,
		onSelectMatch: (match: Match) => void
	}) {

	return <table className='profile-game-list flex flex-col items-center h-full gap-4'>
		<div className='profile-game-list-header flex flex-row items-center justify-between w-full'>
			Match History
		</div>
		{
			!loading && matches.length > 0 ? <div className='profile-game-list-body flex flex-col items-center w-full h-full scrollbar gap-2 '>
				{matches.map((match, index) => {
					return <ProfileGameListItem
						key={match.match_id}
						match={match}
						onSelect={() => onSelectMatch(match)}
					/>
				})}
			</div>:
			<div className='profile-game-list-body flex flex-col items-center justify-center w-full h-full '>
				{ loading ?
					<Spinner /> :
					<p>
						No matches yet.
					</p>
				}
			</div>
		}
		<div className='profile-game-list-footer flex flex-row items-center justify-center w-full'>
			<Pagination
				page={page}
				total={totalPages}
				setPage={(page) => {
					setPage(page);
				}}
			/>
		</div>
	</table>
}