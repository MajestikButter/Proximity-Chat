require("esbuild").build({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  minify: true,
  bundle: true,
  target: ["edge", "chrome", "firefox", "opera", "safari"],
  sourcemap: "linked",
  format: "cjs",
  watch: JSON.parse(process.argv[2] ?? "false"),
  platform: "browser",
  external: ["esbuild"],
  define: {
    global: "window",
  },
});
