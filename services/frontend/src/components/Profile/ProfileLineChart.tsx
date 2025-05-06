import Babact from "babact";
import { Chart } from "chart.js";

export default function ProfileLineChart() {

	const data = {
	labels: ['6', '5', '4', '3', '2', '1', '0'],
	datasets: [
		{
			label: '1v1',
			data: [65, 59, 80, 81, 56, 55, 40],
			fill: false,
			borderColor: 'rgb(127, 98, 255)',
			tension: 0
		},
		{
			label: '2v2',
			data: [34, 53, 43, 58, 83, 70, 87],
			fill: false,
			borderColor: 'rgb(255, 115, 50)',
			tension: 0
		}
	]
	};

	Babact.useEffect(() => {

		const canvas = document.getElementById('mmr-chart') as HTMLCanvasElement;
		const { width, height } = canvas.getBoundingClientRect();
		const chart = new Chart(
			canvas,
			{
				type: 'line',
  				data: data,
				options: {
					plugins: {
						legend: {
							display: true,
							position: 'bottom',
							labels: {
								color: 'white'
							}
						},
						tooltip: {
							callbacks: {
								title: () => '',
								label: (context) => context.formattedValue,
							},
							displayColors: false,
						}
					},
					scales: {
						x: {
							ticks: {
								display: false,
							},
							border: {
								display: false
							},
							grid: {
								display: false
							}
						},
						y: {
							ticks: {
								color: 'white'
							},
							grid: {
								color: 'rgba(117, 117, 117, 0.61)',
							}
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
		<h2 className='w-full'>MMR Evolution</h2>
		<div className='flex justify-center items-center flex-1'>
			<canvas className='w-full h-full' id="mmr-chart"></canvas>
		</div>
	</div>

}