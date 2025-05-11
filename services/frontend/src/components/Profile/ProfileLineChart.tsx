import Babact from "babact";
import { Chart } from "chart.js";
import { EloDataPoints } from "../../hooks/useUser";

export default function ProfileLineChart({
		elos,
	}: {
		elos: EloDataPoints
		[key: string]: any
	}) {

	const data = {
	labels: new Array(Math.max(elos["1v1"]?.length, elos["2v2"].length) ?? 10).fill(''),
	datasets: [
		{
			label: '1v1',
			data: elos["1v1"] ?? [],
			fill: false,
			borderColor: 'rgb(127, 98, 255)',
			tension: 0
		},
		{
			label: '2v2',
			data: elos["2v2"] ?? [],
			fill: false,
			borderColor: 'rgb(255, 115, 50)',
			tension: 0
		}
	]
	};

	Babact.useEffect(() => {
		if (elos["1v1"]?.length === 0 && elos["2v2"]?.length === 0)
			return;
		const canvas = document.getElementById('mmr-chart') as HTMLCanvasElement;
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
		return () => {
			chart.destroy();
		}

	}, [])

	return <div className='profile-chart flex flex-col items-center w-full h-full gap-2'>
		<h2 className='w-full'>MMR Evolution</h2>
		<div className='flex justify-center items-center flex-1'>
		{ elos["1v1"]?.length > 0 || elos["2v2"]?.length > 0 ?
			<canvas className='w-full h-full' id="mmr-chart"></canvas>:
			<p className='text-white'>No data available</p>
		}
		</div>	
	</div>

}