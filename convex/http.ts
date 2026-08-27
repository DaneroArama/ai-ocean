import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Mount authentication routes
auth.addHttpRoutes(http);

export default http;
