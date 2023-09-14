import { test, expect, describe, vi } from 'vitest'
import * as gast_path from "../code/gast-path"

describe("Tests gast-path.", () => {

    test("basename_n", () => {
        expect(gast_path.basename_n('/home/benj/Documents/code/javascript/bb-immo/src/libs/tools/', 2)).toBe('libs/tools/')
        expect(gast_path.basename_n('/home/benj/Documents/code/javascript/bb-immo/src/libs/tools', 2)).toBe('libs/tools/')
    });

    test("extname_n", () => {
        expect(gast_path.extname_n('/home/benj/Documents/code/javascript/bb-immo/src/libs/cmp/code/tests/cmp.test.js', 1)).toBe('.js')
        expect(gast_path.extname_n('/home/benj/Documents/code/javascript/bb-immo/src/libs/cmp/code/tests/cmp.test.js', 2)).toBe('.test')
        expect(gast_path.extname_n('/home/benj/Documents/code/javascript/bb-immo/src/libs/cmp/code/tests/cmp.test.js', 3)).toBe('')
    });

    test("common_path", () => {

        expect(gast_path.common_path("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/",
            "/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/tests/")
        ).toBe("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/");

        expect(gast_path.common_path("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/tests/",
            "/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/")
        ).toBe("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/");
    });

    test("common_paths", () => {

        expect(gast_path.common_paths("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code",
            "/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/tests")
        ).toBe("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/");

        expect(gast_path.common_paths("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/tests",
            "/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code")
        ).toBe("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/");

        expect(gast_path.common_paths("/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code/tests",
            "/home/benj/Documents/code/javascript/bb-immo/dist/libs/tools/code",
            "/home/benj/Documents/code/javascript/bb-immo/dist/libs/")
        ).toBe("/home/benj/Documents/code/javascript/bb-immo/dist/libs/");
    });

})

