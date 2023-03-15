import { value } from "tactile/reactive";

function square(n: number): number {
  return n * n;
}

function Home() {
  const [count, setCount] = value(1);

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
          <h1>hello world</h1>
          <p>
            <button onClick={() => setCount(square(count()))}>Count {count}</button>
          </p>
        </main>
      </body>
    </html>
  );
}

export default Home;
