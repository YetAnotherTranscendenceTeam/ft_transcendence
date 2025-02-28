import "./core/scheduler"
import { fragment } from "./core/fragment";
import { render } from "./core/render";
import { createElement } from "./core/vdom";
import useEffect from "./hooks/useEffect";
import useState from "./hooks/useState";
import useContext from "./hooks/useContext";
import createContext from "./hooks/createContext";

const Babact = {
	createElement,
	render,
	fragment,
	useState,
	useEffect,
	useContext,
	createContext
}
export default Babact;
