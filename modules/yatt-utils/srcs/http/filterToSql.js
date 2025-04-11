export default function filterToSql(filter) {
  if (!filter) return {filterClause: null, filterParams: []};
  const filterClause = Object.keys(filter)
    .map((key) => `${key} IN (${filter[key].map((v) => "?").join(",")})`)
    .join(" AND ");
  const filterParams = Object.values(filter).flat();
  return {filterClause, filterParams};
}
