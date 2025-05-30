import fs from "fs";
import path from "path";

// Use the optimal size for favicon visibility
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Return the favicon.png image specifically designed for browser tabs
export default async function Icon() {
  // Read the image file from public/images/favicon.png
  const filePath = path.join(process.cwd(), "public", "images", "favicon.png");
  const data = await fs.promises.readFile(filePath);

  // Return the image data
  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
