import Babact from "babact";
import './tournament.css'
import MatchCard from "./MatchCard";
import { TournamentMatch, MatchState } from "../../hooks/useTournament";


export enum HPosition {
	START = 'start',
	CENTER = 'center',
	END = 'end'
}

export enum VPosition {
	TOP = 'top',
	BOTTOM = 'bottom'
}


export default function Stage({
		stage,
		nextStage,
		stageIndex,
		...props
	}: {
		stage: TournamentMatch[],
		nextStage: TournamentMatch[],
		stageIndex: number
		[key: string]: any
	}) {

	const nbMaxMatch = Math.pow(2, stageIndex);
	const nbMatch = stage.length;

	const getPositionV = (matchIndex: number): VPosition => {
		if (matchIndex % 2 === 0)
			return VPosition.TOP;
		return VPosition.BOTTOM;
	}

	const getPositionH = (matchIndex: number): HPosition => {
		if (stageIndex === 0)
			return HPosition.START;
		if (!nextStage)
			return HPosition.END;

		const limit = matchIndex * 2 + 1;
		if (nextStage.length < limit) {
			return HPosition.END;
		}
		return HPosition.CENTER;
	
	}

	return (
		<div
			className='stage-column flex flex-col'
			style={`--stage-index: ${stageIndex}`}
			{...props}
		>
			{stage.map((match, i) =>
				<MatchCard
					key={i}
					match={match}
					positionH={getPositionH(i)}
					positionV={getPositionV(i)}
				/>
			)}
			{Array(nbMaxMatch - nbMatch).fill(null).map((_, i) =>
				<div className='match-card-container empty' key={'empty' + i}>
					<MatchCard
						match={new TournamentMatch({team_ids: [], scores: [0, 0], state: MatchState.DONE, stage: stageIndex, index: i}, [])}
						positionH={HPosition.CENTER}
						positionV={VPosition.TOP}
					/>
				</div>
			)}
		</div>
	)
}