import Babact from "babact";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import { Profile } from "../../contexts/useAuth";

export default function SocialManager({ className = '', children, ...props }: { className?: string, children?: any }) {

	const [selected, setSelected] = Babact.useState('follow');

	const follows: Profile[]= [
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
		{
			username: 'ibertran',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/jgigault.jpg'
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
		{
			username: 'ibertran',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/jgigault.jpg'
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
		{
			username: 'ibertran',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/jgigault.jpg'
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
		{
			username: 'ibertran',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/jgigault.jpg'
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
		{
			username: 'ibertran',
			elo: 1200,
			avatar: 'https://cdn.intra.42.fr/users/jgigault.jpg'
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
		<div className={`social-manager-tab flex flex-col gap-2 ${selected === 'follow' ? 'open' : ''}`}>
			{
				follows.map((follow) => <div className='social-manager-follow-card flex flex-row items-center justify-between gap-2 w-full'>
					<div className='flex flex-row items-center gap-2'>
						<Avatar src={follow.avatar} name={follow.username}/>
						<div className=' flex flex-col gap-1'>
							<h1>{follow.username}</h1>
							<h2>{follow.elo} Elo</h2>
						</div>
					</div> 
					<div className='flex flex-row items-center gap-2'>
						<Button className='icon'>
							<i class="fa-solid fa-user-minus"></i>
						</Button>
					</div>
				</div>)
			}
		</div>
	</div>
}