const fs = require("fs");
const path = require("path");

function copyPdfs(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyPdfs(srcPath, destPath);
    } else if (entry.name.endsWith(".pdf")) {
      fs.mkdirSync(dest, { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyPdfs(
  path.join(__dirname, "../content"),
  path.join(__dirname, "../public/pdfs")
);