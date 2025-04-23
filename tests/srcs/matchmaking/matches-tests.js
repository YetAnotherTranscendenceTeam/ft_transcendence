export const matchmaking_tests = [
	/* 1 match */
	{ lobby_player_count: [1, 1], gamemode: "unranked_1v1", expected_matches: [[0,1]], expected_tolerances: [0] },
	{ lobby_player_count: [2, 2], gamemode: "unranked_2v2", expected_matches: [[0,1]], expected_tolerances: [0] },
	{ lobby_player_count: [1, 1, 2], gamemode: "unranked_2v2", expected_matches: [[0,1,2]], expected_tolerances: [1] },
	{ lobby_player_count: [2, 1, 1], gamemode: "unranked_2v2", expected_matches: [[0,1,2]], expected_tolerances: [1] },
	{ lobby_player_count: [1, 1, 1, 1], gamemode: "unranked_2v2", expected_matches: [[0,1,2,3]], expected_tolerances: [0] },
	/* 2 matches */
	{ lobby_player_count: [1, 1, 1, 1], gamemode: "unranked_1v1", expected_matches: [[0,1], [2,3]], expected_tolerances: [0, 0] },
	{ lobby_player_count: [1, 2, 1, 1, 1, 2], gamemode: "unranked_2v2", expected_matches: [[0,2,3,4], [1,5]], expected_tolerances: [0,0] },
	{ lobby_player_count: [2, 1, 1, 1, 1, 2], gamemode: "unranked_2v2", expected_matches: [[0,5], [1,2,3,4]], expected_tolerances: [0,0] },
	{ lobby_player_count: [1, 1, 1, 1, 2, 2], gamemode: "unranked_2v2", expected_matches: [[0,1,2,3], [4,5]], expected_tolerances: [0,0] },
	/* 3 matches */
	{ lobby_player_count: [1, 1, 2, 2, 2, 2, 2], gamemode: "unranked_2v2", expected_matches: [[2,3], [4,5], [0,1,6]], expected_tolerances: [0,0,1] },
	{ lobby_player_count: [1, 1, 1, 1, 1, 1, 2, 2, 2], gamemode: "unranked_2v2", expected_matches: [[0,1,2,3], [6,7], [4,5,8]], expected_tolerances: [0,0,1] },
	/* 4 matches */
	{ lobby_player_count: [2, 2, 2, 2, 2, 2, 2, 2], gamemode: "unranked_2v2", expected_matches: [[0,1], [2,3], [4,5], [6,7]], expected_tolerances: [0,0,0,0] },
	{ lobby_player_count: [1, 1, 1, 2, 2, 2, 2, 2, 1, 2], gamemode: "unranked_2v2", expected_matches: [[0,1,2,8], [3,4], [5,6], [7,9]], expected_tolerances: [0,0,0,0] },
]
  