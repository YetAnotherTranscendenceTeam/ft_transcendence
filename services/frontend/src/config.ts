export default {
	API_URL: `${process.env.BACKEND_URL}`,
	WS_URL: `${process.env.WS_URL}`,
	PASSWORD_REGEX: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$",
	EMAIL_REGEX: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
	GOOGLE_CLIENT_ID: `${process.env.GOOGLE_CLIENT_ID}`,
	NEXT_ROUND_TIMEOUT: 3,
	PAUSE_TIMEOUT: 3,
	START_TIMEOUT: 3,
}