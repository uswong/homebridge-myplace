// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Provide recommendedConfig / allConfig to FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // file ignore patterns (replaces globalIgnores)
  { ignores: ["**/*.[0-9]*"] },

  // convert legacy "extends" (eg. "eslint:recommended") into flat-config entries
  ...compat.extends("eslint:recommended"),

  // your custom globals / language options / rules
  {
    languageOptions: {
      globals: {
        // disable browser + commonjs globals
        ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
        ...Object.fromEntries(Object.entries(globals.commonjs).map(([key]) => [key, "off"])),

        // enable node + mocha
        ...globals.node,
        ...globals.mocha,

        // custom plugin globals
        assert: "writable",
        expect: "writable",
        sinon: "writable",
        window: "writable",
        ACC_EOL: "readonly",
        DEVICE_EOL: "readonly",
        FORMAT_EOL: "readonly",
        UNITS_EOL: "readonly",
        PERMS_EOL: "readonly",
        CMD5_ACC_TYPE_ENUM: "readonly",
        CMD5_DEVICE_TYPE_ENUM: "readonly",
        cleanStatesDir: "readonly",
        fs: "writable",
        HomebridgeAPI: "writable",
        Logger: "writable",
        platformAccessory_1: "writable",
        document: "readonly",
      },
      ecmaVersion: 12,
      sourceType: "module",
    },

    rules: {
      "no-fallthrough": ["error", { commentPattern: "break[\\s\\w]*omitted" }],
      "no-whitespace-before-property": "error",
      "arrow-spacing": "error",
    },
  },
];
