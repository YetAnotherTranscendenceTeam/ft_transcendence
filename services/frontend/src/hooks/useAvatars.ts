import Babact from "babact";
import useFetch from "./useFetch";
import config from "../config";
import { useAuth } from "../contexts/useAuth";

interface IAvatar {
	url: string;
	isRemovable: boolean;
}

export default function useAvatars(): {
	avatars: IAvatar[],
	uploadAvatar: (file: File) => void,
	deleteAvatar: (url: string) => Promise<any>
} {

	const [avatars, setAvatars] = Babact.useState<{
		default: string[],
		user: string[]
	}>(null);
	const { ft_fetch } = useFetch();

	const mapAvatars = (avatars) => {
		if (!avatars) return [];
		const mappedAvatars = avatars.user.map((avatar) => ({
				url: avatar,
				isRemovable: true
		}));
		mappedAvatars.push(...avatars.default.map((avatar) => ({
			url: avatar,
			isRemovable: false
		})));
		return mappedAvatars;
	}

	const fetchAvatars = async () => {
		const response = await ft_fetch(`${config.API_URL}/avatars`, {
			method: 'GET'
		}, {
			show_error: true
		});
		if (response) {
			setAvatars(response);
		}
	};

	Babact.useEffect(() => {
		fetchAvatars();
	}, []);

	const uploadAvatar = async (file: File) => {
		const response = await ft_fetch(`${config.API_URL}/avatars`, {
			method: 'POST',
			body: file,
			headers: {
				'Content-Type': 'text/plain'
			}
		}, {
			show_error: true,
			error_messages: {
				400: 'Invalid file format',
				413: 'File too large'
			}
		})
		if (response)
			setAvatars({
				default: avatars.default,
				user: [response.url, ...avatars.user]
			});
	}

	const deleteAvatar = async (url: string) => {
		const response = await ft_fetch(`${config.API_URL}/avatars?url=${url}`, {
			method: 'DELETE'
		}, {
			show_error: true,
			success_message: 'Avatar deleted'
		});
		if (response) {
			setAvatars({
				default: avatars.default,
				user: avatars.user.filter(avatar => avatar !== url)
			});
		}
		return response;
	}

	return {
		avatars: mapAvatars(avatars),
		uploadAvatar,
		deleteAvatar
	}

}