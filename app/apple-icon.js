import fs from "fs";
import path from "path";

// Export metadata for the apple icon
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Return the favicon.png image for Apple devices
export default async function AppleIcon() {
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
