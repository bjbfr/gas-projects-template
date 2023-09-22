import { test, expect } from 'vitest'
import path from 'node:path'

import * as gas_tsc_config from '../code/gas-tsc-config'
import { REP_ROOT, GAST_ROOT } from '../code/gast-globals'

const tsconfig_test = () => {
    const test_dir = path.resolve(GAST_ROOT, "./vitests")
    return gas_tsc_config.read_tsconfig(test_dir, "tsconfig-test.json");
}

test("Test build_dirs", () => {
    const tsconfig = tsconfig_test();
    if (tsconfig)
        expect(gas_tsc_config.build_dirs(tsconfig)).toStrictEqual([path.resolve(REP_ROOT, "./dist/gas-tools/code")])
})

test("Test build_artefacts", () => {
    const tsconfig = tsconfig_test();
    if (tsconfig)
        expect(gas_tsc_config.build_artefacts(tsconfig)).toStrictEqual(
            [
                {
                    "dir": path.resolve(REP_ROOT, "./dist/gas-tools/code"),
                    "files": ["gas-tools.ts", "gas-cli.ts", "gast-tsc-parser.ts"]
                }
            ]
        )
})

test("Test out dir", () => {
    const tsconfig = tsconfig_test();
    if (tsconfig)
        expect(gas_tsc_config.out_dir_root(path.resolve(REP_ROOT, "./gas-tools/vitests"),tsconfig)).toStrictEqual(path.resolve(REP_ROOT, "./dist/gas-tools/vitests"))
})