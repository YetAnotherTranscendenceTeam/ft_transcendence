import Babact from "babact";
import { Chart } from "chart.js/auto";


export default function ProfilePieChart() {

	const data = {
		labels: [
		  'Wins',
		  'Losses',
		],
		datasets: [{
		  data: [300, 50],
		  backgroundColor: [
			'rgb(63, 160, 39)',
			'rgb(255, 77, 77)',
		  ],
		}]
	};

	Babact.useEffect(() => {

		const canvas = document.getElementById('win-lose-chart') as HTMLCanvasElement;
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
							enabled: false
						}
					}
				}
			}
		);

		return () => {
			chart.destroy();
		}

	}, [])

	return <div className='profile-pie-chart flex flex-col items-center w-full h-full gap-2'>
		<h2 className='w-full'>Wins/Looses</h2>
		<center>
			<canvas id="win-lose-chart"></canvas>
		</center>
	</div>
}