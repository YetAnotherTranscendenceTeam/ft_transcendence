export default class WsCloseErrorClass {
	constructor(code, reason) {
		this.code = code;
		this.reason = reason;
	}

	close(socket) {
		socket.close(this.code, this.reason);
	}

	static Unauthorized = new WsCloseErrorClass(3000, "UNAUTHORIZED");
	static NotFound = new WsCloseErrorClass(4000, "NOT_FOUND");
	static LobbyFull = new WsCloseErrorClass(4001, "LOBBY_FULL");
	static Inaccessible = new WsCloseErrorClass(4002, "INACCESSIBLE");
	static OtherLocation = new WsCloseErrorClass(4003, "OTHER_LOCATION");
	static InvalidFormat = new WsCloseErrorClass(4004, "INVALID_FORMAT");
	static InvalidMode = new WsCloseErrorClass(4005, "INVALID_MODE");
	static Kicked = new WsCloseErrorClass(4006, "KICKED");
	static Forbidden = new WsCloseErrorClass(4007, "FORBIDDEN");
}