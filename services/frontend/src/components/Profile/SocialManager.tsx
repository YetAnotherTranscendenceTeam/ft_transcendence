import Babact from "babact";
import Button from "../../ui/Button";

export default function SocialManager({ className = '', children, ...props }: { className?: string, children?: any }) {

	const [selected, setSelected] = Babact.useState('follow');

	const follows = [
		{
			username: 'bwisniew',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/c4d09e1b88c5f1eaf042f81914ccdbb8/bwisniew.JPG'
		},
		{
			username: 'lcottet',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/lecottet.jpg'
		},
		{
			username: 'jgigault',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/jgigault.jpg'
		},
		{
			username: 'ibertran',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/jgigault.jpg'
		},

	]

	return <div className={`social-manager ${className}`} {...props}>
		<div className='social-manager-tabbar flex flex-row'>
			<Button className={`ghost ${selected === 'follow' ? 'selected' : ''}`} onClick={() => setSelected('follow')}>
				<i className="fa-solid fa-user-group"></i> Follow
			</Button>
			<Button className={`ghost ${selected === 'friend' ? 'selected' : ''}`} onClick={() => setSelected('friend')}>
				<i className="fa-solid fa-user-plus"></i> Add
			</Button>
		</div>
		<div className='social-manager-follow flex flex-col gap-2'>

		</div>
	</div>
}