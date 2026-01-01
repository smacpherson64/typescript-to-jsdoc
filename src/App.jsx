import { useState, useEffect, useReducer, Fragment } from "react";
import { useDebounce } from "react-use";
import Editor from "@monaco-editor/react";
import { dependencies, devDependencies } from "../package.json";

// Get all dependencies except ts-to-jsdoc (which highlighted).
const otherDependencies = Object.keys({
  ...dependencies,
  ...devDependencies,
}).filter((dependency) => dependency !== "ts-to-jsdoc");

// =============================
// Constants
// =============================

const initialCode = `
/** Example description... */
type Person = {
  id: string
  name: string
  /** The mailing address of the person. */
  address: {
    street: string[]
    city: string
    county: string
    state: string
    postalCode: string
  }

  age: number
}
`;

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

// =============================
// Components
// =============================

/**
 * The rendered page
 */
function App() {
  const [code, setCode] = useState(initialCode);

  return (
    <div className="w-full min-h-screen flex max-w-7xl p-4 mx-auto overflow-hidden">
      <div className="flex flex-col items-center flex-1 h-screen w-full">
        <header className="basis-32 flex flex-col items-center justify-center text-slate-400">
          <h1 className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-bl from-red-500 to-purple-500">
            Typescript to JSDoc
          </h1>

          <p className="text-xs lg:text-sm text-slate-500 mt-2">
            Transform typescript types, interfaces, and TSDoc into JSDoc.
          </p>
        </header>

        <main className="grid lg:grid-cols-2 w-full text-gray-300 flex-1 overflow-x-hidden">
          <section className="h-full text-slate-400 w-full ring-2 ring-slate-700 focus-within:ring-blue-900 font-mono">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              defaultValue={code}
              theme="vs-dark"
              onChange={setCode}
            />
          </section>

          <section className="h-full -order-1 lg:order-1 flex items-stretch text-xs lg:text-sm">
            <OutputView code={code} />
          </section>
        </main>

        <footer className="text-xs text-slate-500 pt-8 basis-32 text-center flex flex-col gap-1">
          <div>Made possible by the following dependencies: </div>

          <nav className="flex gap-x-3 gap-y-1 flex-wrap">
            <a
              href="https://www.npmjs.com/package/ts-to-jsdoc"
              className="text-orange-400 hover:text-orange-500 focus:text-orange-500"
            >
              ts-to-jsdoc
            </a>
            {otherDependencies.map((dependency) => {
              return (
                <Fragment key={dependency}>
                  {" "}
                  <a href={`https://www.npmjs.com/package/${dependency}`}>
                    {dependency}
                  </a>
                </Fragment>
              );
            })}
          </nav>

          <div className="pt-8">
            Found a problem?{" "}
            <a href="https://github.com/smacpherson64/typescript-to-jsdoc/issues">
              Please log an issue on github.
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * The view that displays the generated JSDoc output
 *
 * @param {{code: string}} props
 */
function OutputView({ code }) {
  const [loading, setLoading] = useState(false);
  const [{ output, error }, setState] = useReducer((a, b) => ({ ...a, ...b }), {
    output: "",
    error: null,
  });

  useDebounce(
    () => {
      setLoading(true);
      worker.postMessage(code);
    },
    1000,
    [code],
  );

  useEffect(() => {
    worker.onmessage = function (event) {
      if (event.data.status === "error") {
        setState({ error: event.data.error, output: "" });
      }

      if (event.data.status === "success") {
        setState({ error: null, output: event.data.result });
      }

      setLoading(false);
    };
  }, []);

  if (error)
    return (
      <div className="bg-slate-50/5 ring ring-red-700 p-4 w-full">
        {error.message}
      </div>
    );

  return (
    <div
      className={[
        "bg-white/5 p-4 w-full text-green-600 overflow-x-scroll transition-opacity duration-500 selection:bg-slate-700 selection:text-green-500",
        loading && "opacity-30",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <pre>{output}</pre>
    </div>
  );
}

// =============================
// Exports
// =============================

export default App;
