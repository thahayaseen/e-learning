import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable TypeScript strict rules
      "@typescript-eslint/no-unused-vars": "off", // Disable unused variable rule
      "@typescript-eslint/no-unused-expressions": "off", // Allow unused expressions
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type usage
      "@typescript-eslint/no-unsafe-member-access": "off", // Allow unsafe member access
      "@typescript-eslint/explicit-module-boundary-types": "off", // Disable explicit return types
      "@typescript-eslint/explicit-function-return-type": "off", // Disable explicit function return type requirement
      "@typescript-eslint/no-inferrable-types": "off", // Disable inferrable types warning
      "@typescript-eslint/no-unsafe-call": "off", // Allow unsafe calls
      "@typescript-eslint/no-unsafe-assignment": "off", // Allow unsafe assignments

      // Disable general JavaScript rules that are strict
      "prefer-const": "off", // Allow non-const declarations
      "react/no-unescaped-entities": "off", // Allow unescaped entities
      "react-hooks/exhaustive-deps": "off", // Disable exhaustive deps warning for hooks

      // Next.js specific rules
      "@next/next/no-img-element": "off", // Allow <img> element in Next.js
    },
  },
];

export default eslintConfig;
