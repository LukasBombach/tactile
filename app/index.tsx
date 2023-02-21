import { ClientJavaScript } from "../src/client";

export default function Home() {
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
            <button onClick={() => console.log("hello world")}>click me</button>
          </p>
        </main>
        <ClientJavaScript />
      </body>
    </html>
  );
}
