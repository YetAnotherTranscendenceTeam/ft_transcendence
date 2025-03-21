import Babact from "babact";
import { Match } from "../../views/TournamentView";
import './tournament.css'
import MatchCard from "./MatchCard";

export default function Stage({
		stage,
		positionH,
		id,
		...props
	}: {
		stage: Match[],
		positionH: 'left' | 'right' | 'center',
		id: number
		[key: string]: any
	}) {

	const nbMaxMatch = Math.pow(2, id);
	const nbMatch = stage.length;

	const getPositionV = (i: number): 'top' | 'middle' | 'bottom' => {
		if (nbMaxMatch === 1) return 'middle';
		if (i === 0) return 'top';
		if (i === nbMatch - 1) return 'bottom';
		return 'middle';
	}

	return (
		<div
			className='stage-column flex flex-col items-center justify-around'
			{...props}
		>
			{stage.map((match, i) =>
				<MatchCard
					key={i}
					match={match}
					positionH={positionH}
					positionV={getPositionV(i)}
				/>
			)}
			{Array(nbMaxMatch - nbMatch).fill(null).map((_, i) =>
				<div className='match-card-container' key={'empty' + i}>
					
				</div>
			)}
		</div>
	)
}