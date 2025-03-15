import "./core/scheduler"
import { fragment } from "./core/fragment";
import { render } from "./core/render";
import { createElement } from "./core/vdom";
import useEffect from "./hooks/useEffect";
import useState from "./hooks/useState";
import useContext from "./hooks/useContext";
import createContext from "./hooks/createContext";
import useRef from "./hooks/useRef";

const Babact = {
	createElement,
	render,
	fragment,
	useState,
	useEffect,
	useContext,
	useRef,
	createContext
}
export default Babact;
