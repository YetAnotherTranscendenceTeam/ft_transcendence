import Babact from "babact";
import Button from "./Button";

export default function Pagination({
		page,
		total,
		setPage,
	}: {
		page: number;
		total: number;
		setPage: (page: number) => void;
	}) {
	return (
		<div className="pagination">
			<Button
				className="icon"
				onClick={() => setPage(page - 1)}
				disabled={page === 1}
			>
				<i className="fa-solid fa-chevron-left"></i>
			</Button>
			<span>
				Page {page} of {total}
			</span>
			<Button
				className="icon"
				onClick={() => setPage(page + 1)}
				disabled={page === total}
			>
				<i className="fa-solid fa-chevron-right"></i>
			</Button>
		</div>
	);
}