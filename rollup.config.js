import commonjs from "@rollup/plugin-commonjs";
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const extensions = [".js", ".jsx", ".ts", ".tsx"];

/** @type {import('rollup').RollupOptions} */
export default {
    input: "src/index.ts",
    output: {
        file: "dist/demo.js",
        format: "module",
        name: "bundle",
        sourcemap: true,
    },
    treeshake: "recommended",
    plugins: [
        typescript(),
        replace({ 'process.env.NODE_ENV': JSON.stringify('development'), preventAssignment: true }),
        commonjs({ extensions, sourceMap: true }),
        resolve({ extensions }),
    ],
}
