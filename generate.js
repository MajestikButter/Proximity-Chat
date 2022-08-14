require("esbuild").buildSync({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  minify: true,
  bundle: true,
  target: "es2022",
  platform: "browser",
  external: ["esbuild", "events"],
});

const fs = require("fs");
const files = fs.readdirSync(__dirname);
const ignored = ["index.html", "dist", "README.md", "generate.js", "node_modules", ".git"];
for (let file of files) {
  if (ignored.includes(file)) continue;

  const path = `${__dirname}/${file}`;
  const stat = fs.statSync(path);
  if (stat.isFile()) {
    fs.unlinkSync(path);
  } else {
    fs.rmdirSync(path, { recursive: true });
  }
}
