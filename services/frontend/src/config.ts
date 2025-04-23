export default {
	  API_URL: `${process.env.BACKEND_URL}`,
	  WS_URL: `${process.env.WS_URL}`,
	  PASSWORD_REGEX: process.env.PASSWORD_REGEX || "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*\\(\\)_\\-+=\\[\\]\\{\\}\\|;:'\",.<>\\/?]).{8,24}$",
	  EMAIL_REGEX: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
	  GOOGLE_CLIENT_ID: `${process.env.GOOGLE_CLIENT_ID}`,
}