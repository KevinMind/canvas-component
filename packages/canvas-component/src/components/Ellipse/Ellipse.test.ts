import { createCanvas } from "canvas";
import fs from "fs";

import { drawEllipse } from "./Ellipse.utilities";

const canvas = createCanvas(500, 500);
const ctx = canvas.getContext("2d");

describe("drawEllipse", () => {
  afterEach(() => {
    const out = fs.createWriteStream(__dirname + "/test.png");
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log("The PNG file was created."));
  });
  it("default", () => {
    drawEllipse(ctx, { radius: 10, center: { x: 250, y: 250 } });
  });
});
