import config from "../config";
import { useAuth } from "../contexts/useAuth";
import useFetch from "./useFetch";

export default function useProfile() {

	const { ft_fetch, isLoading } = useFetch();

	const { me, refresh } = useAuth();

	const setSettings = async (settings: any) => {
		let patch: {
			username?: string,
			avatar?: string
		} = {};
		if (settings.avatar !== me.avatar)
			patch.avatar = settings.avatar;
		if (settings.username !== me.username && settings.username !== '')
			patch.username = settings.username;
		const response = await ft_fetch(`${config.API_URL}/settings/profile`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(patch)
		}, {
			success_message: "Settings updated successfully",
			show_error: true,
			error_messages: {
				400: "Invalid username",
				403: "Invalid avatar",
				409: "Username already exists",
			}
		});
		if (response)
			refresh();
		return response;
	};

	return {
		setSettings,
		isLoading
	}

}