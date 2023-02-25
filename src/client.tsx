import { readFileSync } from "node:fs";

export const ClientJavaScript = () => {
  const contents = readFileSync("dist/app/public/manifest.json", "utf-8");
  const data = JSON.parse(contents);
  const srcs = Object.values(data).map(file => `/public/${file}`);
  return (
    <>
      {srcs.map(src => (
        <script defer src={src} key={src} />
      ))}
    </>
  );
};
