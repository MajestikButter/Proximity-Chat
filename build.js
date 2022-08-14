require("esbuild").build({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  minify: true,
  bundle: true,
  target: "es2020",
  sourcemap: "linked",
  format: "cjs",
  watch: JSON.parse(process.argv[2] ?? "false"),
  platform: "browser",
  external: ["esbuild"],
  define: {
    global: "window",
  },
});
