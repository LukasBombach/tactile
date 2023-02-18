import { renderToString } from "react-dom/server";
import Home from "../app";

const html = renderToString(<Home />);
