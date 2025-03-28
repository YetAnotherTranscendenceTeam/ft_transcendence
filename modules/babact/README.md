# Babact

Babact is a lightweight, React-like framework built with TypeScript. It is designed to provide a simple and efficient way to build user interfaces.

## Features

- **Scheduler System**: Provides a smooth user experience.
- **Fiber Tree**: Efficient rendering performance.
- **Reconciliation**: Fiber reconciliation by key.
- **Hooks**: Includes many hooks for state and lifecycle management:
  - `useState`
  - `useRef`
  - `useContext`
  - `useEffect`

## Usage

Here's a simple example of how to use Babact:

```typescript
import { createElement, render } from 'babact';

const App = () => {
  return createElement('div', null, 'Hello, Babact!');
};

render(createElement(App, null), document.getElementById('root'));
```

### Using TSX for Better Development Experience

If you want to have a better development experience, you can use TSX. Here’s an example:

```typescript
import Babact from 'babact';

const App = () => {
  return <div>Hello, Babact with TSX!</div>;
};

render(<App />, document.getElementById('root'));
```

To enable TSX, you can use the following `tsconfig.json` configuration:

```json name=tsconfig.json
{
	"compilerOptions": {
		"outDir": "dist",
		"module": "ES6",
		"target": "ES6",
	  	"declaration": true,
		"esModuleInterop": true,
		"lib": ["ES2015", "DOM", "ES6", "ES5", "ES2019"],
		"moduleResolution": "node",
		"jsx": "react",
		"jsxFactory": "Babact.createElement",
		"jsxFragmentFactory": "Babact.fragment"
	},
	"include": ["src"]
}
```

## Development

To build and develop Babact locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/YetAnotherTranscendenceTeam/ft_transcendence.git
cd ft_transcendence/modules/babact
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Run in development mode:

```bash
npm run dev
```

## License

This project is licensed under the MIT License.