export const sortForTest = (a: string | number | boolean, b: string | number | boolean):number => {
    return a.toString().localeCompare(b.toString(), undefined, {
        // caseFirst: true,
        ignorePunctuation: true,
        // localeMatcher,
        // numeric:,
        // sensitivity:,
        usage: "search",
    });
};

describe("Аномальные сортировки", () => {
    it("sort 1", () => {
        const a = [
            "davonte_metz",
            "dominique75",
            "dominique.torphy61",
            "donna_bogan",
            "douglas.wiza5",
        ];
        const b = [...a];
        b.sort(sortForTest);
        expect(b).toEqual(a);
    });

    it("sort 2", () => {
        const a = [
            "bobby_breitenberg46",
            "bradly29",
            "brad.torp",
            "brayan.runolfsdottir97",
            "brielle.watsica",
        ];
        const b = [...a];
        b.sort(sortForTest);
        expect(b).toEqual(a);
    });

    it("sort 3", () => {
        const a = [
            "adam_zemlak70",
            "adella_goodwin",
            "adella.hamill42",
            "amie_conn",
        ];
        const b = [...a];
        b.sort(sortForTest);
        expect(b).toEqual(a);
    });

    it("sort 4", () => {
        const a = [
            "erwin_kassulke",
            "foster41",
            "fredrick.fay23",
            "garret62",
            "garret.hintz8",
            "geoffrey.tromp",
            "georgiana61",
            "gerry_feest",
            "gilda_pfannerstill",
            "giovanni.vonrueden",
            "haskell9",
            "haskell.pacocha6",
            "helen42",
            "isaias23",
            "isidro.hackett",
            "janis_kris",
        ];
        const b = [...a];
        b.sort(sortForTest);
        expect(b).toEqual(a);
    });

    it("sort 5", () => {
        const a = [
            "новосельская road classical",
            "озерная cambridgeshire world",
            "окружная stub pop",
            "омская credit rock",
            "омская край soul",
            "парковая follow rap",
            "партизанская compliment blues",
            "песочная клатч folk",
        ];
        const b = [...a];
        b.sort(sortForTest);
        expect(b).toEqual(a);
    });
});