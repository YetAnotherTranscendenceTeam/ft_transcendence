import Babact from "babact";
import { Chart } from "chart.js/auto";
import { MatchCount } from "../../hooks/useUser";


export default function ProfilePieChart({
		gamemodes,
	}: {
		gamemodes: MatchCount[]
		[key: string]: any
	}) {

	const data = {
		labels: gamemodes?.map((item) => item.name) ?? [],
		datasets: [{
		  data: gamemodes?.map((item) => item.count) ?? [],
		  backgroundColor: gamemodes?.map((item) => item.color) ?? [],
		}]
	};

	Babact.useEffect(() => {

		const canvas = document.getElementById('gamemode-chart') as HTMLCanvasElement;
		const chart = new Chart(
			canvas,
			{
				type: 'doughnut',
				data: data,
				options: {
					plugins: {
						legend: {
							display: false
						},
						tooltip: {
							enabled: true,
						}
					}
				}
			}
		);
		return () => {
			chart.destroy();
		}

	}, [])

	return <div className='profile-chart flex flex-col items-center w-full h-full gap-2'>
		<h2 className='w-full'>Gamemodes</h2>
		<div className='profile-chart-container flex justify-center items-center flex-1'>
			<canvas className='w-full h-full' id="gamemode-chart"></canvas>
		</div>
	</div>
}