import { renderToString } from "react-dom/server";
import Home from "../dist/app";

const html = renderToString(<Home />);
