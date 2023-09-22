import { test, expect, describe, vi } from 'vitest'
import path from 'node:path'

import * as gast_path from "../code/gast-path"
import { REP_ROOT } from '../code/gast-globals'

describe("Tests gast-path.", () => {

    test("basename_n", () => {
        const dirut = path.resolve(REP_ROOT,"gas-tools","vitests"); // directory under test
        expect(gast_path.basename_n(dirut, 2)).toBe('gas-tools/vitests/')
        expect(gast_path.basename_n(dirut + '/', 2)).toBe('gas-tools/vitests/')
    });

    test("extname_n", () => {
        const pathut = path.resolve(REP_ROOT,"gas-tools","vitests","gast-path.test.ts"); // path under test
        expect(gast_path.extname_n(pathut, 1)).toBe('.ts')
        expect(gast_path.extname_n(pathut, 2)).toBe('.test')
        expect(gast_path.extname_n(pathut, 3)).toBe('')
    });

    test("common_path", () => {
        const dirut1 = path.resolve(REP_ROOT,"gas-tools","vitests"); // directory under test
        const dirut2 = path.resolve(REP_ROOT,"gas-tools","@types"); // directory under test
        const dirut3 = path.resolve(REP_ROOT,"gas-tools"); // directory under test

        expect(gast_path.common_path(dirut1,dirut2)).toBe(dirut3+path.sep);
        expect(gast_path.common_path(dirut1,dirut3)).toBe(dirut3+path.sep);

    });

    test("common_paths", () => {
        const dirut1 = path.resolve(REP_ROOT,"gas-tools","vitests"); // directory under test
        const dirut2 = path.resolve(REP_ROOT,"gas-tools","@types"); // directory under test
        const dirut3 = path.resolve(REP_ROOT,"gas-tools"); // directory under test

        expect(gast_path.common_paths(dirut1,dirut2)).toBe(dirut3+path.sep);

        expect(gast_path.common_paths(dirut1,dirut2,dirut3)).toBe(dirut3+path.sep);
    });

    test("list_subdirectories_with_name",async () => {
        const dirut = path.resolve(REP_ROOT,"gas-tools"); // directory under test
        const expected =   ["code","dist","logs", "@types","vitests"].map(x => path.resolve(dirut,x));
        const e = expect(await gast_path.list_subdirectories_with_name(dirut));
        e.toHaveLength(expected.length);
        expected.forEach( x=>e.toContain(x))
    });
})

