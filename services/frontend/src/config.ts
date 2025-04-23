export default {
	API_URL: `${process.env.BACKEND_URL}`,
	WS_URL: `${process.env.WS_URL}`,
	PASSWORD_REGEX: process.env.PASSWORD_REGEX || "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*\\(\\)_\\-+=\\[\\]\\{\\}\\|;:'\",.<>\\/?]).{8,24}$",
	EMAIL_REGEX: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
	USERNAME_REGEX: "^[a-zA-Z0-9_\\-]{4,15}$",
	GOOGLE_CLIENT_ID: `${process.env.GOOGLE_CLIENT_ID}`,
	NEXT_ROUND_TIMEOUT: 3,
	PAUSE_TIMEOUT: 3,
	START_TIMEOUT: 3,
}