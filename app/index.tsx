import React from "react";
import { ClientJavaScript } from "../src/client";

export default function Home() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.png" />
        <title>Hello App</title>
      </head>
      <body>
        <main>
          <p>hello world</p>
          <p>
            <button onClick={() => console.log("client side code")}>click me</button>
          </p>
        </main>
        <ClientJavaScript />
      </body>
    </html>
  );
}
