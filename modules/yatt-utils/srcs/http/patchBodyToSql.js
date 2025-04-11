
export default function patchBodyToSql(body) {
	return {
	  setClause: Object.keys(body)
		.map((key) => `${key} = ?`)
		.join(", "),
	  params: Object.values(body)
	};
  }
  