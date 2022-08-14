require("esbuild").build({
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  minify: true,
  bundle: true,
  target: "commonjs",
  sourcemap: "linked",
  watch: JSON.parse(process.argv[2] ?? "false"),
  platform: "browser",
  external: ["esbuild"],
  define: {
    global: "window",
  },
});
