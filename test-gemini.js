import { analyzeSkinImage } from "./src/services/skinAnalyzer.js";
import { config } from "dotenv";
config();

async function test() {
  const buffer = Buffer.from("test");
  const res = await analyzeSkinImage(buffer, "image/jpeg");
  console.log("Analysis:", res);
}
test();
