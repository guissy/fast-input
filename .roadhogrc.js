export default {
  "entry": "src/index.ts",
  "env": {
    "development": {
      "extraBabelPlugins": [
        "dva-hmr",
        "transform-runtime",  ["import", { "libraryName": "antd", "libraryDirectory": "lib", "style": true }]
      ]
    },
    "production": {
      "extraBabelPlugins": [
        "transform-runtime"
      ]
    }
  }
}
