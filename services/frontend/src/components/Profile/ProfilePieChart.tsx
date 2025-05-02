import Babact from "babact";
import { Chart } from "chart.js/auto";


export default function ProfilePieChart() {

	const data = {
		labels: [
		  'Unranked',
		  'Ranked',
		  'Tournament',
		  'Custom',
		],
		datasets: [{
		  data: [300, 50, 65, 89],
		  backgroundColor: [
			'rgb(247, 94, 255)',
			'rgb(127, 98, 255)',
			'rgb(50, 255, 115)',
			'rgb(255, 115, 50)',
		  ],
		}]
	};

	Babact.useEffect(() => {

		const canvas = document.getElementById('gamemode-chart') as HTMLCanvasElement;
		const { width, height } = canvas.getBoundingClientRect();
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
		chart.resize(width, height);

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