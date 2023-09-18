import { test, expect } from 'vitest'
import path from 'node:path'

import * as gas_tsc_config from '../code/gas-tsc-config'
import { REP_ROOT, GAST_ROOT } from '../code/gast-globals'

test("Test build_dirs", () => {
    const test_dir = path.resolve(GAST_ROOT, "./vitests")
    const tsconfig = gas_tsc_config.read_tsconfig(test_dir, "tsconfig-test.json");
    if (tsconfig)
        expect(gas_tsc_config.build_dirs(tsconfig)).toStrictEqual([path.resolve(REP_ROOT, "./dist/gas-tools/code")])
})

test("Test build_artefacts", () => {
    const test_dir = path.resolve(GAST_ROOT, "./vitests")
    const tsconfig = gas_tsc_config.read_tsconfig(test_dir, "tsconfig-test.json");
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