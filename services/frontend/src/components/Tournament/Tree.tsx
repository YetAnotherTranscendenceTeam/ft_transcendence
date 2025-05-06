import Babact from "babact";
import Stage from "./Stage";
import { TournamentMatch } from "../../hooks/useTournament";

export default function Tree({
		matches,
		...props
	}: {
		matches: TournamentMatch[],
		[key: string]: any
	}) {

	const [stages, setStages] = Babact.useState<TournamentMatch[][]>([]);
	
	const createStages = () => {
		const newStages: TournamentMatch[][] = [];
		const nbRounds = Math.log2(matches.length + 1);
		for(let i = 0; i < nbRounds; i++) {
			const start = Math.pow(2, i) - 1;
			const end = start + Math.pow(2, i);
			newStages.push(matches.slice(start, end));
		}
		setStages(newStages);
	}

	Babact.useEffect(() => {
		createStages();
	}, [matches])
	
	return <div className="tournament-tree flex">
			{
				stages.map((stage, index) => (
					<Stage
						stage={stage}
						stageIndex={index}
						key={index}
						nextStage={stages[index + 1]}
					/>
				))
			}
		</div>
}