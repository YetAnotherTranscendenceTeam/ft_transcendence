import Babact from "babact";
import Card from "../../ui/Card";
import Key from "../../ui/Key";

export type KeyHintProp = {
	keybind: string;
	icon?: any;
	description: string;
};

export default function KeyHint({ keybinds, title, team }: { keybinds: KeyHintProp[], title: string, team: number }) {

	return <Card className={`key-hint gap-4 ${team === 0 ? 'left' : 'right'} team${team + 1}`}>
		<h2>{title}</h2>
		<div className="flex flex-col gap-2">
			{keybinds.map((keybind, i) => {
				return <div key={i} className="flex gap-2">
					<Key key={keybind.keybind}>{keybind.icon ?? null}</Key>
					<p>{keybind.description}</p>
				</div>
			})}
		</div>
	</Card>
}