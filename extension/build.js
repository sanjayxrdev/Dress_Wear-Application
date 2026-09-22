const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const rootDir = __dirname;
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const iconsDir = path.join(rootDir, "icons");
const distIconsDir = path.join(distDir, "icons");

console.log("Building Fitted Chrome Extension...");

// Ensure output directories exist
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(distIconsDir, { recursive: true });

// Compile TypeScript files in src/
const filesToCompile = ["background.ts", "content-script.ts"];

for (const file of filesToCompile) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing source file: ${filePath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(filePath, "utf-8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      removeComments: false,
    },
  });

  const outName = file.replace(/\.ts$/, ".js");
  const outPath = path.join(distDir, outName);
  fs.writeFileSync(outPath, result.outputText);
  console.log(`✓ Compiled: src/${file} -> dist/${outName}`);
}

// Copy manifest.json
const manifestSrc = path.join(rootDir, "manifest.json");
const manifestDist = path.join(distDir, "manifest.json");
fs.copyFileSync(manifestSrc, manifestDist);
console.log("✓ Copied: manifest.json -> dist/manifest.json");

// Copy icons
const iconFiles = ["icon-16.png", "icon-48.png", "icon-128.png"];
for (const icon of iconFiles) {
  const src = path.join(iconsDir, icon);
  const dst = path.join(distIconsDir, icon);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`✓ Copied: icons/${icon} -> dist/icons/${icon}`);
  }
}

console.log("\nExtension build complete! Output folder: extension/dist/");
console.log("To load in Chrome: go to chrome://extensions -> Enable Developer Mode -> Click 'Load unpacked' -> Select extension/dist/");
