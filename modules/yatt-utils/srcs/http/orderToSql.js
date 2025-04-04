export default function orderToSql(order) {
  if (!order) return {orderClause: null, orderParams: []};
  const orderClause = Object.keys(order)
	.map((key) => `${key} ${order[key]}`)
	.join(", ");
  const orderParams = [];
  return {orderClause, orderParams};
}
