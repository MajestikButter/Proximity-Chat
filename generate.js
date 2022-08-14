require("esbuild").buildSync({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  minify: true,
  bundle: true,
  target: ["edge", "chrome", "firefox", "opera", "safari"],
  platform: "browser",
  format: "cjs",
  external: ["esbuild"],
  define: {
    global: "window",
  },
});

const fs = require("fs");
const files = fs.readdirSync(__dirname);
const ignored = ["index.html", "dist", "README.md", "generate.js", ".git", "generate.gitignore"];
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
fs.renameSync(`${__dirname}/generate.gitignore`, `${__dirname}/.gitignore`);
