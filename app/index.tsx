import React, { useState } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";

function Home() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.png" />
        <title>Hello App</title>
      </head>
      <Body />
    </html>
  );
}

function square(n: number): number {
  return n * n;
}

const Body = () => {
  const [count, setCount] = useState(1);
  return (
    <body>
      <main>
        <p>hello world</p>
        <p>
          <button onClick={() => setCount(square(count))}>Count {count}</button>
        </p>
      </main>
    </body>
  );
};

if (typeof window !== "undefined") {
  const root = hydrateRoot(document.body, <Body />);
  console.log(root);
}

export function ssr() {
  return "<!DOCTYPE html>" + renderToString(<Home />);
}
