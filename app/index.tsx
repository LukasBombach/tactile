import React, { useState } from "react";
import { ClientJavaScript } from "../src/client";

export default function Home() {
  const [count, setCount] = useState(1);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hello App</title>
      </head>
      <body>
        <main>
          <p>hello world</p>
          <p>
            <button onClick={() => setCount(count + 1)}>click me {count}</button>
          </p>
        </main>
        <ClientJavaScript />
      </body>
    </html>
  );
}
