import { create, start } from "./server";

const PORT = 3000;

create({ standalone: true }).then((app) => start(app, PORT));
