// src/knowledge/effect-index.ts
import { readdir, stat } from "fs/promises";
import { existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";

// src/formats/index.ts
import { existsSync, readFileSync as readFileSync2 } from "fs";
import { join } from "path";

// src/formats/normalize.ts
function normalizeGlobal(key, spec) {
  return {
    name: key,
    type: spec.type || "float",
    uniform: spec.uniform || key,
    default: spec.default,
    min: spec.min,
    max: spec.max,
    step: spec.step,
    choices: spec.choices,
    control: spec.control,
    define: spec.define,
    ui: spec.ui
  };
}
function normalizePass(p) {
  return {
    name: p.name,
    program: p.program || "main",
    type: p.type,
    inputs: p.inputs,
    outputs: p.outputs
  };
}

// src/formats/definition-json.ts
function parseDefinitionJson(json, effectDir) {
  const globals = {};
  const rawGlobals = json.globals || {};
  for (const [key, spec] of Object.entries(rawGlobals)) {
    globals[key] = normalizeGlobal(key, spec);
  }
  const rawPasses = json.passes || [];
  const passes = rawPasses.map(normalizePass);
  return {
    func: json.func,
    name: json.name,
    namespace: json.namespace,
    description: json.description,
    starter: json.starter,
    tags: json.tags,
    globals,
    passes,
    format: "json",
    effectDir
  };
}

// src/formats/definition-js.ts
import { readFileSync } from "fs";

// node_modules/acorn/dist/acorn.mjs
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 31, 4, 33, 15, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 7, 0, 259, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 481, 1, 61, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 12, 2, 9, 1, 3, 0, 33, 1, 1357, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 13, 65, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 18, 21, 18, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 18, 0, 182, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 22, 0, 239, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 111, 6, 206, 13, 310, 2314, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7386, 37, 33, 96, 114, 14, 913, 15, 50, 7710, 3, 2, 6, 2, 1, 2, 296, 10, 0, 30, 2, 3, 0, 15, 4, 8, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 340, 2, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 129, 15, 6, 55, 50, 49, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4382, 2, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489, 39815, 11327];
var nonASCIIidentifierChars = "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7-\u05C9\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B53-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1AF0\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65";
var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0558\u0559\u0560-\u0588\u058B\u058C\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u208F-\u209F\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DD\uA7E2\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB6C\uAB6D\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};
var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
var keywords$1 = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};
var keywordRelationalOperator = /^in(stanceof)?$/;
var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
function isInAstralSet(code, set) {
  var pos = 65536;
  for (var i2 = 0; i2 < set.length; i2 += 2) {
    pos += set[i2];
    if (pos > code) {
      return false;
    }
    pos += set[i2 + 1];
    if (pos >= code) {
      return true;
    }
  }
  return false;
}
function isIdentifierStart(code, astral) {
  if (code < 65) {
    return code === 36;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes);
}
function isIdentifierChar(code, astral) {
  if (code < 48) {
    return code === 36;
  }
  if (code < 58) {
    return true;
  }
  if (code < 65) {
    return false;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
var TokenType = function TokenType2(label, conf) {
  if (conf === void 0) conf = {};
  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};
function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
var beforeExpr = { beforeExpr: true };
var startsExpr = { startsExpr: true };
var keywords = {};
function kw(name, options) {
  if (options === void 0) options = {};
  options.keyword = name;
  return keywords[name] = new TokenType(name, options);
}
var types$1 = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),
  // Punctuation token types.
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.
  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", { beforeExpr: true }),
  coalesce: binop("??", 1),
  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", { isLoop: true, beforeExpr: true }),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", { isLoop: true }),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", { isLoop: true }),
  _with: kw("with"),
  _new: kw("new", { beforeExpr: true, startsExpr: true }),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", { beforeExpr: true, binop: 7 }),
  _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
  _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
  _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
  _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
};
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");
function isNewLine(code) {
  return code === 10 || code === 13 || code === 8232 || code === 8233;
}
function nextLineBreak(code, from, end) {
  if (end === void 0) end = code.length;
  for (var i2 = from; i2 < end; i2++) {
    var next = code.charCodeAt(i2);
    if (isNewLine(next)) {
      return i2 < end - 1 && next === 13 && code.charCodeAt(i2 + 1) === 10 ? i2 + 2 : i2 + 1;
    }
  }
  return -1;
}
var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;
var hasOwn = Object.hasOwn || (function(obj, propName) {
  return hasOwnProperty.call(obj, propName);
});
var isArray = Array.isArray || (function(obj) {
  return toString.call(obj) === "[object Array]";
});
var regexpCache = /* @__PURE__ */ Object.create(null);
function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
}
function codePointToString(code) {
  if (code <= 65535) {
    return String.fromCharCode(code);
  }
  code -= 65536;
  return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
}
var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
var Position = function Position2(line, col) {
  this.line = line;
  this.column = col;
};
Position.prototype.offset = function offset(n) {
  return new Position(this.line, this.column + n);
};
var SourceLocation = function SourceLocation2(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) {
    this.source = p.sourceFile;
  }
};
function getLineInfo(input, offset2) {
  for (var line = 1, cur = 0; ; ) {
    var nextBreak = nextLineBreak(input, cur, offset2);
    if (nextBreak < 0) {
      return new Position(line, offset2 - cur);
    }
    ++line;
    cur = nextBreak;
  }
}
var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
  // (the latest version the library supports). This influences
  // support for strict mode, the set of reserved words, and support
  // for new syntax features.
  ecmaVersion: null,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"`, `"module"` or `"commonjs"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // When set to true, enable strict parsing mode even if `sourceType`
  // is `"script"`.
  strict: false,
  // `onInsertedSemicolon` can be a callback that will be called when
  // a semicolon is automatically inserted. It will be passed the
  // position of the inserted semicolon as an offset, and if
  // `locations` is enabled, it is given the location as a `{line,
  // column}` object as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program, and an import.meta expression
  // in a script isn't considered an error.
  allowImportExportEverywhere: false,
  // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: null,
  // When enabled, super identifiers are not constrained to
  // appearing in methods and do not raise an error when they appear elsewhere.
  allowSuperOutsideMethod: null,
  // When enabled, hashbang directive in the beginning of file is
  // allowed and treated as a line comment. Enabled by default when
  // `ecmaVersion` >= 2023.
  allowHashBang: false,
  // By default, the parser will verify that private properties are
  // only used in places where they are valid and have been declared.
  // Set this to false to turn such checks off.
  checkPrivateFields: true,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // Pass an optional `{line, column}` object to use for the start of
  // the parse. This is mostly useful when using `parseExpressionAt`
  // with `locations: true`, to prevent the parser from having to
  // determine the line position at the start position.
  startLocation: null,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  // When this option has an array as value, objects representing the
  // comments are pushed to it.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false
};
var warnedAboutEcmaVersion = false;
function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
  }
  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }
  if (options.allowReserved == null) {
    options.allowReserved = options.ecmaVersion < 5;
  }
  if (!opts || opts.allowHashBang == null) {
    options.allowHashBang = options.ecmaVersion >= 14;
  }
  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function(token) {
      return tokens.push(token);
    };
  }
  if (isArray(options.onComment)) {
    options.onComment = pushComment(options, options.onComment);
  }
  if (options.sourceType === "commonjs" && options.allowAwaitOutsideFunction) {
    throw new Error("Cannot use allowAwaitOutsideFunction with sourceType: commonjs");
  }
  return options;
}
function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start,
      end
    };
    if (options.locations) {
      comment.loc = new SourceLocation(this, startLoc, endLoc);
    }
    if (options.ranges) {
      comment.range = [start, end];
    }
    array.push(comment);
  };
}
var SCOPE_TOP = 1;
var SCOPE_FUNCTION = 2;
var SCOPE_ASYNC = 4;
var SCOPE_GENERATOR = 8;
var SCOPE_ARROW = 16;
var SCOPE_SIMPLE_CATCH = 32;
var SCOPE_SUPER = 64;
var SCOPE_DIRECT_SUPER = 128;
var SCOPE_CLASS_STATIC_BLOCK = 256;
var SCOPE_CLASS_FIELD_INIT = 512;
var SCOPE_SWITCH = 1024;
var SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
}
var BIND_NONE = 0;
var BIND_VAR = 1;
var BIND_LEXICAL = 2;
var BIND_FUNCTION = 3;
var BIND_SIMPLE_CATCH = 4;
var BIND_OUTSIDE = 5;
var Parser = function Parser2(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") {
      reserved += " await";
    }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);
  this.containsEsc = false;
  this.pos = startPos || 0;
  this.curLine = 1;
  if (options.startLocation) {
    this.lineStart = this.pos - options.startLocation.column;
    this.curLine = options.startLocation.line;
  } else if (startPos) {
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    if (this.options.locations) {
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    }
  } else {
    this.lineStart = 0;
  }
  this.type = types$1.eof;
  this.value = null;
  this.start = this.end = this.pos;
  this.startLoc = this.endLoc = this.curPosition();
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;
  this.context = this.initialContext();
  this.exprAllowed = true;
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || options.strict === true || this.strictDirective(this.pos);
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  this.labels = [];
  this.undefinedExports = /* @__PURE__ */ Object.create(null);
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
    this.skipLineComment(2);
  }
  this.scopeStack = [];
  this.enterScope(
    this.options.sourceType === "commonjs" ? SCOPE_FUNCTION : SCOPE_TOP
  );
  this.regexpState = null;
  this.privateNameStack = [];
};
var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowReturn: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, allowUsing: { configurable: true }, inClassStaticBlock: { configurable: true } };
Parser.prototype.parse = function parse() {
  var this$1$1 = this;
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.catchStackOverflow(function() {
    return this$1$1.parseTopLevel(node);
  });
};
prototypeAccessors.inFunction.get = function() {
  return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
};
prototypeAccessors.inGenerator.get = function() {
  return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
};
prototypeAccessors.inAsync.get = function() {
  return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
};
prototypeAccessors.canAwait.get = function() {
  for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
    var ref2 = this.scopeStack[i2];
    var flags = ref2.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
      return false;
    }
    if (flags & SCOPE_FUNCTION) {
      return (flags & SCOPE_ASYNC) > 0;
    }
  }
  return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
};
prototypeAccessors.allowReturn.get = function() {
  if (this.inFunction) {
    return true;
  }
  if (this.options.allowReturnOutsideFunction && this.currentVarScope().flags & SCOPE_TOP) {
    return true;
  }
  return false;
};
prototypeAccessors.allowSuper.get = function() {
  var ref2 = this.currentThisScope();
  var flags = ref2.flags;
  return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
};
prototypeAccessors.allowDirectSuper.get = function() {
  return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
};
prototypeAccessors.treatFunctionsAsVar.get = function() {
  return this.treatFunctionsAsVarInScope(this.currentScope());
};
prototypeAccessors.allowNewDotTarget.get = function() {
  for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
    var ref2 = this.scopeStack[i2];
    var flags = ref2.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
      return true;
    }
  }
  return false;
};
prototypeAccessors.allowUsing.get = function() {
  var ref2 = this.currentScope();
  var flags = ref2.flags;
  if (flags & SCOPE_SWITCH) {
    return false;
  }
  if (!this.inModule && flags & SCOPE_TOP) {
    return false;
  }
  return true;
};
prototypeAccessors.inClassStaticBlock.get = function() {
  return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
};
Parser.extend = function extend() {
  var plugins = [], len = arguments.length;
  while (len--) plugins[len] = arguments[len];
  var cls = this;
  for (var i2 = 0; i2 < plugins.length; i2++) {
    cls = plugins[i2](cls);
  }
  return cls;
};
Parser.parse = function parse2(input, options) {
  return new this(options, input).parse();
};
Parser.parseExpressionAt = function parseExpressionAt(input, pos, options) {
  var parser = new this(options, input, pos);
  parser.nextToken();
  return parser.parseExpression();
};
Parser.tokenizer = function tokenizer(input, options) {
  return new this(options, input);
};
Object.defineProperties(Parser.prototype, prototypeAccessors);
var pp$9 = Parser.prototype;
var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
pp$9.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) {
    return false;
  }
  for (; ; ) {
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) {
      return false;
    }
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=" || next === "i" && keywordOpAt(this, end));
    }
    start += match[0].length;
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";") {
      start++;
    }
  }
};
function keywordOpAt(parser, pos) {
  var end = pos + 1, stop = Math.min(parser.input.length, pos + 11);
  while (end < stop) {
    var ch = parser.fullCharCodeAt(end);
    if (!isIdentifierChar(ch, true)) {
      break;
    }
    end += ch <= 65535 ? 1 : 2;
  }
  return end === pos + 2 && parser.input.slice(pos, end) === "in" || end === pos + 10 && parser.input.slice(pos, end) === "instanceof";
}
pp$9.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
};
pp$9.isContextual = function(name) {
  return this.type === types$1.name && this.value === name && !this.containsEsc;
};
pp$9.eatContextual = function(name) {
  if (!this.isContextual(name)) {
    return false;
  }
  this.next();
  return true;
};
pp$9.catchStackOverflow = function(f) {
  try {
    return f();
  } catch (e) {
    if (e instanceof Error && (/\bstack\b.*\b(exceeded|overflow)\b/i.test(e.message) || /\btoo much recursion\b/i.test(e.message))) {
      this.raise(this.start, "Not enough stack space to parse input");
    } else {
      throw e;
    }
  }
};
pp$9.expectContextual = function(name) {
  if (!this.eatContextual(name)) {
    this.unexpected();
  }
};
pp$9.canInsertSemicolon = function() {
  return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$9.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) {
      this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    }
    return true;
  }
};
pp$9.semicolon = function() {
  if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
    this.unexpected();
  }
};
pp$9.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma) {
      this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    }
    if (!notNext) {
      this.next();
    }
    return true;
  }
};
pp$9.expect = function(type) {
  this.eat(type) || this.unexpected();
};
pp$9.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};
var DestructuringErrors = function DestructuringErrors2() {
  this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
};
pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) {
    return;
  }
  if (refDestructuringErrors.trailingComma > -1) {
    this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
  }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) {
    this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
  }
};
pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) {
    return false;
  }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) {
    return shorthandAssign >= 0 || doubleProto >= 0;
  }
  if (shorthandAssign >= 0) {
    this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
  }
  if (doubleProto >= 0) {
    this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
  }
};
pp$9.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
    this.raise(this.yieldPos, "Yield expression cannot be a default value");
  }
  if (this.awaitPos) {
    this.raise(this.awaitPos, "Await expression cannot be a default value");
  }
};
pp$9.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression") {
    return this.isSimpleAssignTarget(expr.expression);
  }
  return expr.type === "Identifier" || expr.type === "MemberExpression";
};
var pp$8 = Parser.prototype;
pp$8.parseTopLevel = function(node) {
  var exports$1 = /* @__PURE__ */ Object.create(null);
  if (!node.body) {
    node.body = [];
  }
  while (this.type !== types$1.eof) {
    var stmt = this.parseStatement(null, true, exports$1);
    node.body.push(stmt);
  }
  if (this.inModule) {
    for (var i2 = 0, list2 = Object.keys(this.undefinedExports); i2 < list2.length; i2 += 1) {
      var name = list2[i2];
      this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
    }
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType === "commonjs" ? "script" : this.options.sourceType;
  return this.finishNode(node, "Program");
};
var loopLabel = { kind: "loop" };
var switchLabel = { kind: "switch" };
pp$8.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.fullCharCodeAt(next);
  if (nextCh === 91 || nextCh === 92) {
    return true;
  }
  if (context) {
    return false;
  }
  if (nextCh === 123) {
    return true;
  }
  if (isIdentifierStart(nextCh)) {
    var start = next;
    do {
      next += nextCh <= 65535 ? 1 : 2;
    } while (isIdentifierChar(nextCh = this.fullCharCodeAt(next)));
    if (nextCh === 92) {
      return true;
    }
    var ident = this.input.slice(start, next);
    if (!keywordRelationalOperator.test(ident)) {
      return true;
    }
  }
  return false;
};
pp$8.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, after;
  return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.fullCharCodeAt(next + 8)) || after === 92));
};
pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
  if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  if (lineBreak.test(this.input.slice(this.pos, next))) {
    return false;
  }
  if (isAwaitUsing) {
    var usingEndPos = next + 5, after;
    if (this.input.slice(next, usingEndPos) !== "using" || usingEndPos === this.input.length || isIdentifierChar(after = this.fullCharCodeAt(usingEndPos)) || after === 92) {
      return false;
    }
    skipWhiteSpace.lastIndex = usingEndPos;
    var skipAfterUsing = skipWhiteSpace.exec(this.input);
    next = usingEndPos + skipAfterUsing[0].length;
    if (skipAfterUsing && lineBreak.test(this.input.slice(usingEndPos, next))) {
      return false;
    }
  }
  var ch = this.fullCharCodeAt(next);
  if (!isIdentifierStart(ch) && ch !== 92) {
    return false;
  }
  var idStart = next;
  do {
    next += ch <= 65535 ? 1 : 2;
  } while (isIdentifierChar(ch = this.fullCharCodeAt(next)));
  if (ch === 92) {
    return true;
  }
  var id = this.input.slice(idStart, next);
  if (keywordRelationalOperator.test(id)) {
    return false;
  }
  if (isFor && !isAwaitUsing && id === "of") {
    skipWhiteSpace.lastIndex = next;
    var skipAfterOf = skipWhiteSpace.exec(this.input);
    next = next + skipAfterOf[0].length;
    if (this.input.charCodeAt(next) !== 61 || // Check for ==, === and => operators
    (ch = this.input.charCodeAt(next + 1)) === 61 || ch === 62) {
      return false;
    }
  }
  return true;
};
pp$8.isAwaitUsing = function(isFor) {
  return this.isUsingKeyword(true, isFor);
};
pp$8.isUsing = function(isFor) {
  return this.isUsingKeyword(false, isFor);
};
pp$8.parseStatement = function(context, topLevel, exports$1) {
  var starttype = this.type, node = this.startNode(), kind;
  if (this.isLet(context)) {
    starttype = types$1._var;
    kind = "let";
  }
  switch (starttype) {
    case types$1._break:
    case types$1._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case types$1._debugger:
      return this.parseDebuggerStatement(node);
    case types$1._do:
      return this.parseDoStatement(node);
    case types$1._for:
      return this.parseForStatement(node);
    case types$1._function:
      if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
        this.unexpected();
      }
      return this.parseFunctionStatement(node, false, !context);
    case types$1._class:
      if (context) {
        this.unexpected();
      }
      return this.parseClass(node, true);
    case types$1._if:
      return this.parseIfStatement(node);
    case types$1._return:
      return this.parseReturnStatement(node);
    case types$1._switch:
      return this.parseSwitchStatement(node);
    case types$1._throw:
      return this.parseThrowStatement(node);
    case types$1._try:
      return this.parseTryStatement(node);
    case types$1._const:
    case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") {
        this.unexpected();
      }
      return this.parseVarStatement(node, kind);
    case types$1._while:
      return this.parseWhileStatement(node);
    case types$1._with:
      return this.parseWithStatement(node);
    case types$1.braceL:
      return this.parseBlock(true, node);
    case types$1.semi:
      return this.parseEmptyStatement(node);
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) {
          return this.parseExpressionStatement(node, this.parseExpression());
        }
      }
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) {
          this.raise(this.start, "'import' and 'export' may only appear at the top level");
        }
        if (!this.inModule) {
          this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
        }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports$1);
    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction()) {
        if (context) {
          this.unexpected();
        }
        this.next();
        return this.parseFunctionStatement(node, true, !context);
      }
      var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
      if (usingKind) {
        if (!this.allowUsing) {
          this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script` or in the bare case statement");
        }
        if (context) {
          this.raise(this.start, "Using declaration is not allowed in single-statement positions");
        }
        if (usingKind === "await using") {
          if (!this.canAwait) {
            this.raise(this.start, "Await using cannot appear outside of async function");
          }
          this.next();
        }
        this.next();
        this.parseVar(node, false, usingKind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      }
      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
        return this.parseLabeledStatement(node, maybeName, expr, context);
      } else {
        return this.parseExpressionStatement(node, expr);
      }
  }
};
pp$8.parseBreakContinueStatement = function(node, keyword) {
  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.label = null;
  } else if (this.type !== types$1.name) {
    this.unexpected();
  } else {
    node.label = this.parseIdent();
    this.semicolon();
  }
  var i2 = 0;
  for (; i2 < this.labels.length; ++i2) {
    var lab = this.labels[i2];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) {
        break;
      }
      if (node.label && isBreak) {
        break;
      }
    }
  }
  if (i2 === this.labels.length) {
    this.raise(node.start, "Unsyntactic " + keyword);
  }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};
pp$8.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};
pp$8.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(types$1._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) {
    this.eat(types$1.semi);
  } else {
    this.semicolon();
  }
  return this.finishNode(node, "DoWhileStatement");
};
pp$8.parseForStatement = function(node) {
  this.next();
  var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(types$1.parenL);
  if (this.type === types$1.semi) {
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, null);
  }
  var isLet = this.isLet();
  if (this.type === types$1._var || this.type === types$1._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    return this.parseForAfterInit(node, init$1, awaitAt);
  }
  var startsWithLet = this.isContextual("let"), isForOf = false;
  var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
  if (usingKind) {
    var init$2 = this.startNode();
    this.next();
    if (usingKind === "await using") {
      if (!this.canAwait) {
        this.raise(this.start, "Await using cannot appear outside of async function");
      }
      this.next();
    }
    this.parseVar(init$2, true, usingKind);
    this.finishNode(init$2, "VariableDeclaration");
    return this.parseForAfterInit(node, init$2, awaitAt);
  }
  var containsEsc = this.containsEsc;
  var refDestructuringErrors = new DestructuringErrors();
  var initPos = this.start;
  var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
  if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (awaitAt > -1) {
      if (this.type === types$1._in) {
        this.unexpected(awaitAt);
      }
      node.await = true;
    } else if (isForOf && this.options.ecmaVersion >= 8) {
      if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
        this.unexpected();
      } else if (this.options.ecmaVersion >= 9) {
        node.await = false;
      }
    }
    if (startsWithLet && isForOf) {
      this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
    }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init);
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseForAfterInit = function(node, init, awaitAt) {
  if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
    if (this.type === types$1._in) {
      if ((init.kind === "using" || init.kind === "await using") && !init.declarations[0].init) {
        this.raise(this.start, "Using declaration is not allowed in for-in loops");
      }
      if (this.options.ecmaVersion >= 9 && awaitAt > -1) {
        this.unexpected(awaitAt);
      }
    } else if (this.options.ecmaVersion >= 9) {
      node.await = awaitAt > -1;
    }
    return this.parseForIn(node, init);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
};
pp$8.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement");
};
pp$8.parseReturnStatement = function(node) {
  if (!this.allowReturn) {
    this.raise(this.start, "'return' outside of function");
  }
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.argument = null;
  } else {
    node.argument = this.parseExpression();
    this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};
pp$8.parseSwitchStatement = function(node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types$1.braceL);
  this.labels.push(switchLabel);
  this.enterScope(SCOPE_SWITCH);
  var cur;
  for (var sawDefault = false; this.type !== types$1.braceR; ) {
    if (this.type === types$1._case || this.type === types$1._default) {
      var isCase = this.type === types$1._case;
      if (cur) {
        this.finishNode(cur, "SwitchCase");
      }
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) {
          this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
        }
        sawDefault = true;
        cur.test = null;
      }
      this.expect(types$1.colon);
    } else {
      if (!cur) {
        this.unexpected();
      }
      cur.consequent.push(this.parseStatement(null));
    }
  }
  this.exitScope();
  if (cur) {
    this.finishNode(cur, "SwitchCase");
  }
  this.next();
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};
pp$8.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
    this.raise(this.lastTokEnd, "Illegal newline after throw");
  }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
};
var empty$1 = [];
pp$8.parseCatchClauseParam = function() {
  var param = this.parseBindingAtom();
  var simple = param.type === "Identifier";
  this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  this.expect(types$1.parenR);
  return param;
};
pp$8.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types$1._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types$1.parenL)) {
      clause.param = this.parseCatchClauseParam();
    } else {
      if (this.options.ecmaVersion < 10) {
        this.unexpected();
      }
      clause.param = null;
      this.enterScope(0);
    }
    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) {
    this.raise(node.start, "Missing catch or finally clause");
  }
  return this.finishNode(node, "TryStatement");
};
pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  this.next();
  this.parseVar(node, false, kind, allowMissingInitializer);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};
pp$8.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};
pp$8.parseWithStatement = function(node) {
  if (this.strict) {
    this.raise(this.start, "'with' in strict mode");
  }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement");
};
pp$8.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement");
};
pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (var i$1 = 0, list2 = this.labels; i$1 < list2.length; i$1 += 1) {
    var label = list2[i$1];
    if (label.name === maybeName) {
      this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    }
  }
  var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  for (var i2 = this.labels.length - 1; i2 >= 0; i2--) {
    var label$1 = this.labels[i2];
    if (label$1.statementStart === node.start) {
      label$1.statementStart = this.start;
      label$1.kind = kind;
    } else {
      break;
    }
  }
  this.labels.push({ name: maybeName, kind, statementStart: this.start });
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};
pp$8.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
};
pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  if (createNewLexicalScope === void 0) createNewLexicalScope = true;
  if (node === void 0) node = this.startNode();
  node.body = [];
  this.expect(types$1.braceL);
  if (createNewLexicalScope) {
    this.enterScope(0);
  }
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  if (exitStrict) {
    this.strict = false;
  }
  this.next();
  if (createNewLexicalScope) {
    this.exitScope();
  }
  return this.finishNode(node, "BlockStatement");
};
pp$8.parseFor = function(node, init) {
  node.init = init;
  this.expect(types$1.semi);
  node.test = this.type === types$1.semi ? null : this.parseExpression();
  this.expect(types$1.semi);
  node.update = this.type === types$1.parenR ? null : this.parseExpression();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
};
pp$8.parseForIn = function(node, init) {
  var isForIn = this.type === types$1._in;
  this.next();
  if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
    this.raise(
      init.start,
      (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer"
    );
  }
  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
};
pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  node.declarations = [];
  node.kind = kind;
  for (; ; ) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);
    if (this.eat(types$1.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
      this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
    } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(types$1.comma)) {
      break;
    }
  }
  return node;
};
pp$8.parseVarId = function(decl, kind) {
  decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};
var FUNC_STATEMENT = 1;
var FUNC_HANGING_STATEMENT = 2;
var FUNC_NULLABLE_ID = 4;
pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
      this.unexpected();
    }
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  if (statement & FUNC_STATEMENT) {
    node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
      this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
    }
  }
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));
  if (!(statement & FUNC_STATEMENT)) {
    node.id = this.type === types$1.name ? this.parseIdent() : null;
  }
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
};
pp$8.parseFunctionParams = function(node) {
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};
pp$8.parseClass = function(node, isStatement) {
  this.next();
  var oldStrict = this.strict;
  this.strict = true;
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types$1.braceL);
  while (this.type !== types$1.braceR) {
    var element = this.parseClassElement(node.superClass !== null);
    if (element) {
      classBody.body.push(element);
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) {
          this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
        }
        hadConstructor = true;
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
      }
    }
  }
  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};
pp$8.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(types$1.semi)) {
    return null;
  }
  var ecmaVersion2 = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;
  if (this.eatContextual("static")) {
    if (ecmaVersion2 >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node;
    }
    if (this.isClassElementNameStart() || this.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion2 >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName && (ecmaVersion2 >= 9 || !isAsync) && this.eat(types$1.star)) {
    isGenerator = true;
  }
  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }
  if (keyName) {
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  }
  if (ecmaVersion2 < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper;
    if (isConstructor && kind !== "method") {
      this.raise(node.key.start, "Constructor can't have get/set modifier");
    }
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }
  return node;
};
pp$8.isClassElementNameStart = function() {
  return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
};
pp$8.parseClassElementName = function(element) {
  if (this.type === types$1.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};
pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  var key = method.key;
  if (method.kind === "constructor") {
    if (isGenerator) {
      this.raise(key.start, "Constructor can't be a generator");
    }
    if (isAsync) {
      this.raise(key.start, "Constructor can't be an async method");
    }
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }
  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
  if (method.kind === "get" && value.params.length !== 0) {
    this.raiseRecoverable(value.start, "getter should have no params");
  }
  if (method.kind === "set" && value.params.length !== 1) {
    this.raiseRecoverable(value.start, "setter should have exactly one param");
  }
  if (method.kind === "set" && value.params[0].type === "RestElement") {
    this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
  }
  return this.finishNode(method, "MethodDefinition");
};
pp$8.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }
  if (this.eat(types$1.eq)) {
    this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
    field.value = this.parseMaybeAssign();
    this.exitScope();
  } else {
    field.value = null;
  }
  this.semicolon();
  return this.finishNode(field, "PropertyDefinition");
};
pp$8.parseClassStaticBlock = function(node) {
  node.body = [];
  var oldLabels = this.labels;
  this.labels = [];
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  this.next();
  this.exitScope();
  this.labels = oldLabels;
  return this.finishNode(node, "StaticBlock");
};
pp$8.parseClassId = function(node, isStatement) {
  if (this.type === types$1.name) {
    node.id = this.parseIdent();
    if (isStatement) {
      this.checkLValSimple(node.id, BIND_LEXICAL, false);
    }
  } else {
    if (isStatement === true) {
      this.unexpected();
    }
    node.id = null;
  }
};
pp$8.parseClassSuper = function(node) {
  node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};
pp$8.enterClassBody = function() {
  var element = { declared: /* @__PURE__ */ Object.create(null), used: [] };
  this.privateNameStack.push(element);
  return element.declared;
};
pp$8.exitClassBody = function() {
  var ref2 = this.privateNameStack.pop();
  var declared = ref2.declared;
  var used = ref2.used;
  if (!this.options.checkPrivateFields) {
    return;
  }
  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];
  for (var i2 = 0; i2 < used.length; ++i2) {
    var id = used[i2];
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
      }
    }
  }
};
function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];
  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }
  if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
    privateNameMap[name] = "true";
    return false;
  } else if (!curr) {
    privateNameMap[name] = next;
    return false;
  } else {
    return true;
  }
}
function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
}
pp$8.parseExportAllDeclaration = function(node, exports$1) {
  if (this.options.ecmaVersion >= 11) {
    if (this.eatContextual("as")) {
      node.exported = this.parseModuleExportName();
      this.checkExport(exports$1, node.exported, this.lastTokStart);
    } else {
      node.exported = null;
    }
  }
  this.expectContextual("from");
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.source = this.parseExprAtom();
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ExportAllDeclaration");
};
pp$8.parseExport = function(node, exports$1) {
  this.next();
  if (this.eat(types$1.star)) {
    return this.parseExportAllDeclaration(node, exports$1);
  }
  if (this.eat(types$1._default)) {
    this.checkExport(exports$1, "default", this.lastTokStart);
    node.declaration = this.parseExportDefaultDeclaration();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseExportDeclaration(node);
    if (node.declaration.type === "VariableDeclaration") {
      this.checkVariableExport(exports$1, node.declaration.declarations);
    } else {
      this.checkExport(exports$1, node.declaration.id, node.declaration.id.start);
    }
    node.specifiers = [];
    node.source = null;
    if (this.options.ecmaVersion >= 16) {
      node.attributes = [];
    }
  } else {
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports$1);
    if (this.eatContextual("from")) {
      if (this.type !== types$1.string) {
        this.unexpected();
      }
      node.source = this.parseExprAtom();
      if (this.options.ecmaVersion >= 16) {
        node.attributes = this.parseWithClause();
      }
    } else {
      for (var i2 = 0, list2 = node.specifiers; i2 < list2.length; i2 += 1) {
        var spec = list2[i2];
        this.checkUnreserved(spec.local);
        this.checkLocalExport(spec.local);
        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
        }
      }
      node.source = null;
      if (this.options.ecmaVersion >= 16) {
        node.attributes = [];
      }
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};
pp$8.parseExportDeclaration = function(node) {
  return this.parseStatement(null);
};
pp$8.parseExportDefaultDeclaration = function() {
  var isAsync;
  if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
    var fNode = this.startNode();
    this.next();
    if (isAsync) {
      this.next();
    }
    return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
  } else if (this.type === types$1._class) {
    var cNode = this.startNode();
    return this.parseClass(cNode, "nullableID");
  } else {
    var declaration = this.parseMaybeAssign();
    this.semicolon();
    return declaration;
  }
};
pp$8.checkExport = function(exports$1, name, pos) {
  if (!exports$1) {
    return;
  }
  if (typeof name !== "string") {
    name = name.type === "Identifier" ? name.name : name.value;
  }
  if (hasOwn(exports$1, name)) {
    this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
  }
  exports$1[name] = true;
};
pp$8.checkPatternExport = function(exports$1, pat) {
  var type = pat.type;
  if (type === "Identifier") {
    this.checkExport(exports$1, pat, pat.start);
  } else if (type === "ObjectPattern") {
    for (var i2 = 0, list2 = pat.properties; i2 < list2.length; i2 += 1) {
      var prop = list2[i2];
      this.checkPatternExport(exports$1, prop);
    }
  } else if (type === "ArrayPattern") {
    for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];
      if (elt) {
        this.checkPatternExport(exports$1, elt);
      }
    }
  } else if (type === "Property") {
    this.checkPatternExport(exports$1, pat.value);
  } else if (type === "AssignmentPattern") {
    this.checkPatternExport(exports$1, pat.left);
  } else if (type === "RestElement") {
    this.checkPatternExport(exports$1, pat.argument);
  }
};
pp$8.checkVariableExport = function(exports$1, decls) {
  if (!exports$1) {
    return;
  }
  for (var i2 = 0, list2 = decls; i2 < list2.length; i2 += 1) {
    var decl = list2[i2];
    this.checkPatternExport(exports$1, decl.id);
  }
};
pp$8.shouldParseExportStatement = function() {
  return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
};
pp$8.parseExportSpecifier = function(exports$1) {
  var node = this.startNode();
  node.local = this.parseModuleExportName();
  node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  this.checkExport(
    exports$1,
    node.exported,
    node.exported.start
  );
  return this.finishNode(node, "ExportSpecifier");
};
pp$8.parseExportSpecifiers = function(exports$1) {
  var nodes = [], first = true;
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseExportSpecifier(exports$1));
  }
  return nodes;
};
pp$8.parseImport = function(node) {
  this.next();
  if (this.type === types$1.string) {
    node.specifiers = empty$1;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  }
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};
pp$8.parseImportSpecifier = function() {
  var node = this.startNode();
  node.imported = this.parseModuleExportName();
  if (this.eatContextual("as")) {
    node.local = this.parseIdent();
  } else {
    this.checkUnreserved(node.imported);
    node.local = node.imported;
  }
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportSpecifier");
};
pp$8.parseImportDefaultSpecifier = function() {
  var node = this.startNode();
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportDefaultSpecifier");
};
pp$8.parseImportNamespaceSpecifier = function() {
  var node = this.startNode();
  this.next();
  this.expectContextual("as");
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportNamespaceSpecifier");
};
pp$8.parseImportSpecifiers = function() {
  var nodes = [], first = true;
  if (this.type === types$1.name) {
    nodes.push(this.parseImportDefaultSpecifier());
    if (!this.eat(types$1.comma)) {
      return nodes;
    }
  }
  if (this.type === types$1.star) {
    nodes.push(this.parseImportNamespaceSpecifier());
    return nodes;
  }
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseImportSpecifier());
  }
  return nodes;
};
pp$8.parseWithClause = function() {
  var nodes = [];
  if (!this.eat(types$1._with)) {
    return nodes;
  }
  this.expect(types$1.braceL);
  var attributeKeys = {};
  var first = true;
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var attr = this.parseImportAttribute();
    var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
    if (hasOwn(attributeKeys, keyName)) {
      this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
    }
    attributeKeys[keyName] = true;
    nodes.push(attr);
  }
  return nodes;
};
pp$8.parseImportAttribute = function() {
  var node = this.startNode();
  node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  this.expect(types$1.colon);
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.value = this.parseExprAtom();
  return this.finishNode(node, "ImportAttribute");
};
pp$8.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
    var stringLiteral = this.parseLiteral(this.value);
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
    }
    return stringLiteral;
  }
  return this.parseIdent(true);
};
pp$8.adaptDirectivePrologue = function(statements) {
  for (var i2 = 0; i2 < statements.length && this.isDirectiveCandidate(statements[i2]); ++i2) {
    statements[i2].directive = statements[i2].expression.raw.slice(1, -1);
  }
};
pp$8.isDirectiveCandidate = function(statement) {
  return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
  (this.input[statement.start] === '"' || this.input[statement.start] === "'");
};
var pp$7 = Parser.prototype;
pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await") {
          this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
        }
        break;
      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break;
      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        for (var i2 = 0, list2 = node.properties; i2 < list2.length; i2 += 1) {
          var prop = list2[i2];
          this.toAssignable(prop, isBinding);
          if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break;
      case "Property":
        if (node.kind !== "init") {
          this.raise(node.key.start, "Object pattern can't contain getter or setter");
        }
        this.toAssignable(node.value, isBinding);
        break;
      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        this.toAssignableList(node.elements, isBinding);
        break;
      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern") {
          this.raise(node.argument.start, "Rest elements cannot have a default value");
        }
        break;
      case "AssignmentExpression":
        if (node.operator !== "=") {
          this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
        }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break;
      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break;
      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break;
      case "MemberExpression":
        if (!isBinding) {
          break;
        }
      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) {
    this.checkPatternErrors(refDestructuringErrors, true);
  }
  return node;
};
pp$7.toAssignableList = function(exprList, isBinding) {
  var end = exprList.length;
  for (var i2 = 0; i2 < end; i2++) {
    var elt = exprList[i2];
    if (elt) {
      this.toAssignable(elt, isBinding);
    }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
      this.unexpected(last.argument.start);
    }
  }
  return exprList;
};
pp$7.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement");
};
pp$7.parseRestBinding = function() {
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
    this.unexpected();
  }
  node.argument = this.parseBindingAtom();
  return this.finishNode(node, "RestElement");
};
pp$7.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern");
      case types$1.braceL:
        return this.parseObj(true);
    }
  }
  return this.parseIdent();
};
pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) {
      first = false;
    } else {
      this.expect(types$1.comma);
    }
    if (allowEmpty && this.type === types$1.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === types$1.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      this.expect(close);
      break;
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts;
};
pp$7.parseAssignableListItem = function(allowModifiers) {
  var elem = this.parseMaybeDefault(this.start, this.startLoc);
  this.parseBindingListItem(elem);
  return elem;
};
pp$7.parseBindingListItem = function(param) {
  return param;
};
pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
    return left;
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
};
pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0) bindingType = BIND_NONE;
  var isBind = bindingType !== BIND_NONE;
  switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
        this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let") {
          this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
        }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name)) {
            this.raiseRecoverable(expr.start, "Argument name clash");
          }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) {
          this.declareName(expr.name, bindingType, expr.start);
        }
      }
      break;
    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break;
    case "MemberExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding member expression");
      }
      break;
    case "ParenthesizedExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding parenthesized expression");
      }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes);
    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};
pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0) bindingType = BIND_NONE;
  switch (expr.type) {
    case "ObjectPattern":
      for (var i2 = 0, list2 = expr.properties; i2 < list2.length; i2 += 1) {
        var prop = list2[i2];
        this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break;
    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];
        if (elem) {
          this.checkLValInnerPattern(elem, bindingType, checkClashes);
        }
      }
      break;
    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
  }
};
pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0) bindingType = BIND_NONE;
  switch (expr.type) {
    case "Property":
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break;
    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break;
    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break;
    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
  }
};
var TokContext = function TokContext2(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};
var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function(p) {
    return p.tryReadTemplateToken();
  }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};
var pp$6 = Parser.prototype;
pp$6.initialContext = function() {
  return [types.b_stat];
};
pp$6.curContext = function() {
  return this.context[this.context.length - 1];
};
pp$6.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types.f_expr || parent === types.f_stat) {
    return true;
  }
  if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
    return !parent.isExpr;
  }
  if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  }
  if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
    return true;
  }
  if (prevType === types$1.braceL) {
    return parent === types.b_stat;
  }
  if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
    return false;
  }
  return !this.exprAllowed;
};
pp$6.inGeneratorContext = function() {
  for (var i2 = this.context.length - 1; i2 >= 1; i2--) {
    var context = this.context[i2];
    if (context.token === "function") {
      return context.generator;
    }
  }
  return false;
};
pp$6.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types$1.dot) {
    this.exprAllowed = false;
  } else if (update = type.updateContext) {
    update.call(this, prevType);
  } else {
    this.exprAllowed = type.beforeExpr;
  }
};
pp$6.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx;
  }
};
types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return;
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};
types$1.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};
types$1.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};
types$1.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};
types$1.incDec.updateContext = function() {
};
types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
    this.context.push(types.f_expr);
  } else {
    this.context.push(types.f_stat);
  }
  this.exprAllowed = false;
};
types$1.colon.updateContext = function() {
  if (this.curContext().token === "function") {
    this.context.pop();
  }
  this.exprAllowed = true;
};
types$1.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl) {
    this.context.pop();
  } else {
    this.context.push(types.q_tmpl);
  }
  this.exprAllowed = false;
};
types$1.star.updateContext = function(prevType) {
  if (prevType === types$1._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types.f_expr) {
      this.context[index] = types.f_expr_gen;
    } else {
      this.context[index] = types.f_gen;
    }
  }
  this.exprAllowed = true;
};
types$1.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
    if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
      allowed = true;
    }
  }
  this.exprAllowed = allowed;
};
var pp$5 = Parser.prototype;
pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
    return;
  }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
    return;
  }
  var key = prop.key;
  var name;
  switch (key.type) {
    case "Identifier":
      name = key.name;
      break;
    case "Literal":
      name = String(key.value);
      break;
    default:
      return;
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start;
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
      }
      propHash.proto = true;
    }
    return;
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition) {
      this.raiseRecoverable(key.start, "Redefinition of property");
    }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};
pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  var this$1$1 = this;
  return this.catchStackOverflow(function() {
    var startPos = this$1$1.start, startLoc = this$1$1.startLoc;
    var expr = this$1$1.parseMaybeAssign(forInit, refDestructuringErrors);
    if (this$1$1.type === types$1.comma) {
      var node = this$1$1.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this$1$1.eat(types$1.comma)) {
        node.expressions.push(this$1$1.parseMaybeAssign(forInit, refDestructuringErrors));
      }
      return this$1$1.finishNode(node, "SequenceExpression");
    }
    return expr;
  });
};
pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) {
      return this.parseYield(forInit);
    } else {
      this.exprAllowed = false;
    }
  }
  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    oldDoubleProto = refDestructuringErrors.doubleProto;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors();
    ownDestructuringErrors = true;
  }
  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types$1.parenL || this.type === types$1.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }
  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) {
    left = afterLeftParse.call(this, left, startPos, startLoc);
  }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === types$1.eq) {
      left = this.toAssignable(left, false, refDestructuringErrors);
    }
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
      if (refDestructuringErrors.shorthandAssign >= left.start) {
        refDestructuringErrors.shorthandAssign = -1;
      }
      if (refDestructuringErrors.doubleProto >= left.start) {
        refDestructuringErrors.doubleProto = -1;
      }
    }
    if (this.type === types$1.eq) {
      this.checkLValPattern(left);
    } else {
      this.checkLValSimple(left);
    }
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    if (oldDoubleProto > -1) {
      refDestructuringErrors.doubleProto = oldDoubleProto;
    }
    return this.finishNode(node, "AssignmentExpression");
  } else {
    if (ownDestructuringErrors) {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
  }
  if (oldParenAssign > -1) {
    refDestructuringErrors.parenthesizedAssign = oldParenAssign;
  }
  if (oldTrailingComma > -1) {
    refDestructuringErrors.trailingComma = oldTrailingComma;
  }
  return left;
};
pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  if (!(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types$1.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};
pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
};
pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  var prec = this.type.binop;
  if (prec != null && (!forInit || this.type !== types$1._in)) {
    if (prec > minPrec) {
      var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
      var coalesce = this.type === types$1.coalesce;
      if (coalesce) {
        prec = types$1.logicalAND.binop;
      }
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
      if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
    }
  }
  return left;
};
pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") {
    this.raise(right.start, "Private identifier can only be left side of binary expression");
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
};
pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit);
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types$1.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update, forInit);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) {
      this.checkLValSimple(node.argument);
    } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
    } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Private fields can not be deleted");
    } else {
      sawUnary = true;
    }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (!sawUnary && this.type === types$1.privateId) {
    if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
      this.unexpected();
    }
    expr = this.parsePrivateIdent();
    if (this.type !== types$1._in) {
      this.unexpected();
    }
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.operator = this.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(node$1, "UpdateExpression");
    }
  }
  if (!incDec && !(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.starstar)) {
    if (sawUnary) {
      this.unexpected(this.lastTokStart);
    } else {
      return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
    }
  } else {
    return expr;
  }
};
function isLocalVariableAccess(node) {
  return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
}
function isPrivateFieldAccess(node) {
  return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
}
pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  var startPos = this.start, startLoc = this.startLoc;
  var oldDoubleProto = -1, oldShorthandAssign = -1;
  if (refDestructuringErrors) {
    oldDoubleProto = refDestructuringErrors.doubleProto;
    oldShorthandAssign = refDestructuringErrors.shorthandAssign;
    refDestructuringErrors.doubleProto = refDestructuringErrors.shorthandAssign = -1;
  }
  var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
    return expr;
  }
  var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  if (refDestructuringErrors) {
    if (result.end > expr.end) {
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (refDestructuringErrors.parenthesizedAssign >= result.start) {
        refDestructuringErrors.parenthesizedAssign = -1;
      }
      if (refDestructuringErrors.parenthesizedBind >= result.start) {
        refDestructuringErrors.parenthesizedBind = -1;
      }
      if (refDestructuringErrors.trailingComma >= result.start) {
        refDestructuringErrors.trailingComma = -1;
      }
    }
    if (oldDoubleProto > -1) {
      refDestructuringErrors.doubleProto = oldDoubleProto;
    }
    if (oldShorthandAssign > -1) {
      refDestructuringErrors.shorthandAssign = oldShorthandAssign;
    }
  }
  return result;
};
pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
  var optionalChained = false;
  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
    if (element.optional) {
      optionalChained = true;
    }
    if (element.end === base.end || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }
      return element;
    }
    base = element;
    maybeAsyncArrow = false;
  }
};
pp$5.shouldParseAsyncArrow = function() {
  return !this.canInsertSemicolon() && this.eat(types$1.arrow);
};
pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
};
pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(types$1.questionDot);
  if (noCalls && optional) {
    this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
  }
  var computed = this.eat(types$1.bracketL);
  if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    if (computed) {
      node.property = this.parseExpression();
      this.expect(types$1.bracketR);
    } else if (this.type === types$1.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }
    node.computed = !!computed;
    if (optionalSupported) {
      node.optional = optional;
    }
    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(types$1.parenL)) {
    var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
    if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0) {
        this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
      }
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
    var node$1 = this.startNodeAt(startPos, startLoc);
    node$1.callee = base;
    node$1.arguments = exprList;
    if (optionalSupported) {
      node$1.optional = optional;
    }
    base = this.finishNode(node$1, "CallExpression");
  } else if (this.type === types$1.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }
    var node$2 = this.startNodeAt(startPos, startLoc);
    node$2.tag = base;
    node$2.quasi = this.parseTemplate({ isTagged: true });
    base = this.finishNode(node$2, "TaggedTemplateExpression");
  }
  return base;
};
pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  if (this.type === types$1.slash) {
    this.readRegexp();
  }
  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
    case types$1._super:
      if (!this.allowSuper) {
        this.raise(this.start, "'super' keyword outside a method");
      }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper) {
        this.raise(node.start, "super() call outside constructor of a subclass");
      }
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
        this.unexpected();
      }
      return this.finishNode(node, "Super");
    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression");
    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow)) {
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
        }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
            this.unexpected();
          }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
        }
      }
      return id;
    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = { pattern: value.pattern, flags: value.flags };
      return node;
    case types$1.num:
    case types$1.string:
      return this.parseLiteral(this.value);
    case types$1._null:
    case types$1._true:
    case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");
    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
          refDestructuringErrors.parenthesizedAssign = start;
        }
        if (refDestructuringErrors.parenthesizedBind < 0) {
          refDestructuringErrors.parenthesizedBind = start;
        }
      }
      return expr;
    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression");
    case types$1.braceL:
      this.overrideContext(types.b_expr);
      return this.parseObj(false, refDestructuringErrors);
    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0);
    case types$1._class:
      return this.parseClass(this.startNode(), false);
    case types$1._new:
      return this.parseNew();
    case types$1.backQuote:
      return this.parseTemplate();
    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew);
      } else {
        return this.unexpected();
      }
    default:
      return this.parseExprAtomDefault();
  }
};
pp$5.parseExprAtomDefault = function() {
  this.unexpected();
};
pp$5.parseExprImport = function(forNew) {
  var node = this.startNode();
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword import");
  }
  this.next();
  if (this.type === types$1.parenL && !forNew) {
    return this.parseDynamicImport(node);
  } else if (this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "import";
    node.meta = this.finishNode(meta, "Identifier");
    return this.parseImportMeta(node);
  } else {
    this.unexpected();
  }
};
pp$5.parseDynamicImport = function(node) {
  this.next();
  node.source = this.parseMaybeAssign();
  if (this.options.ecmaVersion >= 16) {
    if (!this.eat(types$1.parenR)) {
      this.expect(types$1.comma);
      if (!this.afterTrailingComma(types$1.parenR)) {
        node.options = this.parseMaybeAssign();
        if (!this.eat(types$1.parenR)) {
          this.expect(types$1.comma);
          if (!this.afterTrailingComma(types$1.parenR)) {
            this.unexpected();
          }
        }
      } else {
        node.options = null;
      }
    } else {
      node.options = null;
    }
  } else {
    if (!this.eat(types$1.parenR)) {
      var errorPos = this.start;
      if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
        this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
      } else {
        this.unexpected(errorPos);
      }
    }
  }
  return this.finishNode(node, "ImportExpression");
};
pp$5.parseImportMeta = function(node) {
  this.next();
  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);
  if (node.property.name !== "meta") {
    this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
  }
  if (containsEsc) {
    this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
  }
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
    this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
  }
  return this.finishNode(node, "MetaProperty");
};
pp$5.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
    node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
  }
  this.next();
  return this.finishNode(node, "Literal");
};
pp$5.parseParenExpression = function() {
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.expect(types$1.parenR);
  return val;
};
pp$5.shouldParseArrow = function(exprList) {
  return !this.canInsertSemicolon();
};
pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();
    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    while (this.type !== types$1.parenR) {
      first ? first = false : this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
        lastIsComma = true;
        break;
      } else if (this.type === types$1.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === types$1.comma) {
          this.raiseRecoverable(
            this.start,
            "Comma is not permitted after the rest element"
          );
        }
        break;
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
    this.expect(types$1.parenR);
    if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
    }
    if (!exprList.length || lastIsComma) {
      this.unexpected(this.lastTokStart);
    }
    if (spreadStart) {
      this.unexpected(spreadStart);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }
  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};
pp$5.parseParenItem = function(item) {
  return item;
};
pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
};
var empty = [];
pp$5.parseNew = function() {
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword new");
  }
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "new";
    node.meta = this.finishNode(meta, "Identifier");
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") {
      this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
    }
    if (containsEsc) {
      this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
    }
    if (!this.allowNewDotTarget) {
      this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
    }
    return this.finishNode(node, "MetaProperty");
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  if (node.callee.type === "Super") {
    this.raiseRecoverable(startPos, "Invalid use of 'super'");
  }
  if (this.eat(types$1.parenL)) {
    node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
  } else {
    node.arguments = empty;
  }
  return this.finishNode(node, "NewExpression");
};
pp$5.parseTemplateElement = function(ref2) {
  var isTagged = ref2.isTagged;
  var elem = this.startNode();
  if (this.type === types$1.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value.replace(/\r\n?/g, "\n"),
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement");
};
pp$5.parseTemplate = function(ref2) {
  if (ref2 === void 0) ref2 = {};
  var isTagged = ref2.isTagged;
  if (isTagged === void 0) isTagged = false;
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({ isTagged });
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this.type === types$1.eof) {
      this.raise(this.pos, "Unterminated template literal");
    }
    this.expect(types$1.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(types$1.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
};
pp$5.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) {
      this.checkPropClash(prop, propHash, refDestructuringErrors);
    }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};
pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement");
    }
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    return this.finishNode(prop, "SpreadElement");
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern) {
      isGenerator = this.eat(types$1.star);
    }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
    this.parsePropertyName(prop);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property");
};
pp$5.parseGetterSetter = function(prop) {
  var kind = prop.key.name;
  this.parsePropertyName(prop);
  prop.value = this.parseMethod(false);
  prop.kind = kind;
  var paramCount = prop.kind === "get" ? 0 : 1;
  if (prop.value.params.length !== paramCount) {
    var start = prop.value.start;
    if (prop.kind === "get") {
      this.raiseRecoverable(start, "getter should have no params");
    } else {
      this.raiseRecoverable(start, "setter should have exactly one param");
    }
  } else {
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
      this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
    }
  }
};
pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types$1.colon) {
    this.unexpected();
  }
  if (this.eat(types$1.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
    if (isPattern) {
      this.unexpected();
    }
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
    prop.kind = "init";
  } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.parseGetterSetter(prop);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = startPos;
    }
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === types$1.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0) {
        refDestructuringErrors.shorthandAssign = this.start;
      }
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }
    prop.kind = "init";
    prop.shorthand = true;
  } else {
    this.unexpected();
  }
};
pp$5.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types$1.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
};
pp$5.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = node.expression = false;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = false;
  }
};
pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) {
    node.generator = isGenerator;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true, false);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression");
};
pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression");
};
pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  var isExpression = isArrowFunction && this.type !== types$1.braceL;
  var oldStrict = this.strict, useStrict = false;
  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit);
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      if (useStrict && nonSimple) {
        this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
      }
    }
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) {
      this.strict = true;
    }
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
    if (this.strict && node.id) {
      this.checkLValSimple(node.id, BIND_OUTSIDE);
    }
    node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitScope();
};
pp$5.isSimpleParamList = function(params) {
  for (var i2 = 0, list2 = params; i2 < list2.length; i2 += 1) {
    var param = list2[i2];
    if (param.type !== "Identifier") {
      return false;
    }
  }
  return true;
};
pp$5.checkParams = function(node, allowDuplicates) {
  var nameHash = /* @__PURE__ */ Object.create(null);
  for (var i2 = 0, list2 = node.params; i2 < list2.length; i2 += 1) {
    var param = list2[i2];
    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
};
pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      }
    } else {
      first = false;
    }
    var elt = void 0;
    if (allowEmpty && this.type === types$1.comma) {
      elt = null;
    } else if (this.type === types$1.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts;
};
pp$5.checkUnreserved = function(ref2) {
  var start = ref2.start;
  var end = ref2.end;
  var name = ref2.name;
  if (this.inGenerator && name === "yield") {
    this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
  }
  if (this.inAsync && name === "await") {
    this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
  }
  if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
    this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
  }
  if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
    this.raise(start, "Cannot use " + name + " in class static initialization block");
  }
  if (this.keywords.test(name)) {
    this.raise(start, "Unexpected keyword '" + name + "'");
  }
  if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
    return;
  }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await") {
      this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
    }
    this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
  }
};
pp$5.parseIdent = function(liberal) {
  var node = this.parseIdentNode();
  this.next(!!liberal);
  this.finishNode(node, "Identifier");
  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = node.start;
    }
  }
  return node;
};
pp$5.parseIdentNode = function() {
  var node = this.startNode();
  if (this.type === types$1.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;
    if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
    this.type = types$1.name;
  } else {
    this.unexpected();
  }
  return node;
};
pp$5.parsePrivateIdent = function() {
  var node = this.startNode();
  if (this.type === types$1.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "PrivateIdentifier");
  if (this.options.checkPrivateFields) {
    if (this.privateNameStack.length === 0) {
      this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
    } else {
      this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
    }
  }
  return node;
};
pp$5.parseYield = function(forInit) {
  if (!this.yieldPos) {
    this.yieldPos = this.start;
  }
  var node = this.startNode();
  this.next();
  if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types$1.star);
    node.argument = this.parseMaybeAssign(forInit);
  }
  return this.finishNode(node, "YieldExpression");
};
pp$5.parseAwait = function(forInit) {
  if (!this.awaitPos) {
    this.awaitPos = this.start;
  }
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true, false, forInit);
  return this.finishNode(node, "AwaitExpression");
};
var pp$4 = Parser.prototype;
pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  if (this.sourceFile) {
    message += " in " + this.sourceFile;
  }
  var err = new SyntaxError(message);
  err.pos = pos;
  err.loc = loc;
  err.raisedAt = this.pos;
  throw err;
};
pp$4.raiseRecoverable = pp$4.raise;
pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart);
  }
};
var pp$3 = Parser.prototype;
var Scope = function Scope2(flags) {
  this.flags = flags;
  this.var = [];
  this.lexical = [];
  this.functions = [];
};
pp$3.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags));
};
pp$3.exitScope = function() {
  this.scopeStack.pop();
};
pp$3.treatFunctionsAsVarInScope = function(scope) {
  return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
};
pp$3.declareName = function(name, bindingType, pos) {
  var redeclared = false;
  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && scope.flags & SCOPE_TOP) {
      delete this.undefinedExports[name];
    }
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var scope$1 = this.currentScope();
    scope$1.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var scope$2 = this.currentScope();
    if (this.treatFunctionsAsVar) {
      redeclared = scope$2.lexical.indexOf(name) > -1;
    } else {
      redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
    }
    scope$2.functions.push(name);
  } else {
    for (var i2 = this.scopeStack.length - 1; i2 >= 0; --i2) {
      var scope$3 = this.scopeStack[i2];
      if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
        redeclared = true;
        break;
      }
      scope$3.var.push(name);
      if (this.inModule && scope$3.flags & SCOPE_TOP) {
        delete this.undefinedExports[name];
      }
      if (scope$3.flags & SCOPE_VAR) {
        break;
      }
    }
  }
  if (redeclared) {
    this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
  }
};
pp$3.checkLocalExport = function(id) {
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};
pp$3.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1];
};
pp$3.currentVarScope = function() {
  for (var i2 = this.scopeStack.length - 1; ; i2--) {
    var scope = this.scopeStack[i2];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
      return scope;
    }
  }
};
pp$3.currentThisScope = function() {
  for (var i2 = this.scopeStack.length - 1; ; i2--) {
    var scope = this.scopeStack[i2];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
      return scope;
    }
  }
};
var Node = function Node2(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) {
    this.loc = new SourceLocation(parser, loc);
  }
  if (parser.options.directSourceFile) {
    this.sourceFile = parser.options.directSourceFile;
  }
  if (parser.options.ranges) {
    this.range = [pos, 0];
  }
};
var pp$2 = Parser.prototype;
pp$2.startNode = function() {
  return new Node(this, this.start, this.startLoc);
};
pp$2.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc);
};
function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) {
    node.loc.end = loc;
  }
  if (this.options.ranges) {
    node.range[1] = pos;
  }
  return node;
}
pp$2.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
};
pp$2.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc);
};
pp$2.copyNode = function(node) {
  var newNode = new Node(this, node.start, this.startLoc);
  for (var prop in node) {
    newNode[prop] = node[prop];
  }
  return newNode;
};
var scriptValuesAddedInUnicode = "Berf Beria_Erfe Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sidetic Sidt Sunu Sunuwar Tai_Yo Tayo Todhri Todr Tolong_Siki Tols Tulu_Tigalari Tutg Unknown Zzzz";
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var ecma14BinaryProperties = ecma13BinaryProperties;
var unicodeBinaryProperties = {
  9: ecma9BinaryProperties,
  10: ecma10BinaryProperties,
  11: ecma11BinaryProperties,
  12: ecma12BinaryProperties,
  13: ecma13BinaryProperties,
  14: ecma14BinaryProperties
};
var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
var unicodeBinaryPropertiesOfStrings = {
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: ecma14BinaryPropertiesOfStrings
};
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
var unicodeScriptValues = {
  9: ecma9ScriptValues,
  10: ecma10ScriptValues,
  11: ecma11ScriptValues,
  12: ecma12ScriptValues,
  13: ecma13ScriptValues,
  14: ecma14ScriptValues
};
var data = {};
function buildUnicodeData(ecmaVersion2) {
  var d = data[ecmaVersion2] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion2] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion2]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion2])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;
  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}
for (i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
  ecmaVersion = list[i];
  buildUnicodeData(ecmaVersion);
}
var ecmaVersion;
var i;
var list;
var pp$1 = Parser.prototype;
var BranchID = function BranchID2(parent, base) {
  this.parent = parent;
  this.base = base || this;
};
BranchID.prototype.separatedFrom = function separatedFrom(alt) {
  for (var self = this; self; self = self.parent) {
    for (var other = alt; other; other = other.parent) {
      if (self.base === other.base && self !== other) {
        return true;
      }
    }
  }
  return false;
};
BranchID.prototype.sibling = function sibling() {
  return new BranchID(this.parent, this.base);
};
var RegExpValidationState = function RegExpValidationState2(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = /* @__PURE__ */ Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
};
RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
  var unicodeSets = flags.indexOf("v") !== -1;
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
    this.switchU = true;
    this.switchV = true;
    this.switchN = true;
  } else {
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchV = false;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  }
};
RegExpValidationState.prototype.raise = function raise(message) {
  this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
};
RegExpValidationState.prototype.at = function at(i2, forceU) {
  if (forceU === void 0) forceU = false;
  var s = this.source;
  var l = s.length;
  if (i2 >= l) {
    return -1;
  }
  var c = s.charCodeAt(i2);
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l) {
    return c;
  }
  var next = s.charCodeAt(i2 + 1);
  return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
};
RegExpValidationState.prototype.nextIndex = function nextIndex(i2, forceU) {
  if (forceU === void 0) forceU = false;
  var s = this.source;
  var l = s.length;
  if (i2 >= l) {
    return l;
  }
  var c = s.charCodeAt(i2), next;
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l || (next = s.charCodeAt(i2 + 1)) < 56320 || next > 57343) {
    return i2 + 1;
  }
  return i2 + 2;
};
RegExpValidationState.prototype.current = function current(forceU) {
  if (forceU === void 0) forceU = false;
  return this.at(this.pos, forceU);
};
RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
  if (forceU === void 0) forceU = false;
  return this.at(this.nextIndex(this.pos, forceU), forceU);
};
RegExpValidationState.prototype.advance = function advance(forceU) {
  if (forceU === void 0) forceU = false;
  this.pos = this.nextIndex(this.pos, forceU);
};
RegExpValidationState.prototype.eat = function eat(ch, forceU) {
  if (forceU === void 0) forceU = false;
  if (this.current(forceU) === ch) {
    this.advance(forceU);
    return true;
  }
  return false;
};
RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
  if (forceU === void 0) forceU = false;
  var pos = this.pos;
  for (var i2 = 0, list2 = chs; i2 < list2.length; i2 += 1) {
    var ch = list2[i2];
    var current2 = this.at(pos, forceU);
    if (current2 === -1 || current2 !== ch) {
      return false;
    }
    pos = this.nextIndex(pos, forceU);
  }
  this.pos = pos;
  return true;
};
pp$1.validateRegExpFlags = function(state) {
  var validFlags = state.validFlags;
  var flags = state.flags;
  var u = false;
  var v = false;
  for (var i2 = 0; i2 < flags.length; i2++) {
    var flag = flags.charAt(i2);
    if (validFlags.indexOf(flag) === -1) {
      this.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i2 + 1) > -1) {
      this.raise(state.start, "Duplicate regular expression flag");
    }
    if (flag === "u") {
      u = true;
    }
    if (flag === "v") {
      v = true;
    }
  }
  if (this.options.ecmaVersion >= 15 && u && v) {
    this.raise(state.start, "Invalid regular expression flag");
  }
};
function hasProp(obj) {
  for (var _ in obj) {
    return true;
  }
  return false;
}
pp$1.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);
  if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};
pp$1.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames = /* @__PURE__ */ Object.create(null);
  state.backReferenceNames.length = 0;
  state.branchID = null;
  this.regexp_disjunction(state);
  if (state.pos !== state.source.length) {
    if (state.eat(
      41
      /* ) */
    )) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(
      93
      /* ] */
    ) || state.eat(
      125
      /* } */
    )) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i2 = 0, list2 = state.backReferenceNames; i2 < list2.length; i2 += 1) {
    var name = list2[i2];
    if (!state.groupNames[name]) {
      state.raise("Invalid named capture referenced");
    }
  }
};
pp$1.regexp_disjunction = function(state) {
  var trackDisjunction = this.options.ecmaVersion >= 16;
  if (trackDisjunction) {
    state.branchID = new BranchID(state.branchID, null);
  }
  this.regexp_alternative(state);
  while (state.eat(
    124
    /* | */
  )) {
    if (trackDisjunction) {
      state.branchID = state.branchID.sibling();
    }
    this.regexp_alternative(state);
  }
  if (trackDisjunction) {
    state.branchID = state.branchID.parent;
  }
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(
    123
    /* { */
  )) {
    state.raise("Lone quantifier brackets");
  }
};
pp$1.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state)) {
  }
};
pp$1.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true;
  }
  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true;
  }
  return false;
};
pp$1.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;
  if (state.eat(
    94
    /* ^ */
  ) || state.eat(
    36
    /* $ */
  )) {
    return true;
  }
  if (state.eat(
    92
    /* \ */
  )) {
    if (state.eat(
      66
      /* B */
    ) || state.eat(
      98
      /* b */
    )) {
      return true;
    }
    state.pos = start;
  }
  if (state.eat(
    40
    /* ( */
  ) && state.eat(
    63
    /* ? */
  )) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(
        60
        /* < */
      );
    }
    if (state.eat(
      61
      /* = */
    ) || state.eat(
      33
      /* ! */
    )) {
      this.regexp_disjunction(state);
      if (!state.eat(
        41
        /* ) */
      )) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true;
    }
  }
  state.pos = start;
  return false;
};
pp$1.regexp_eatQuantifier = function(state, noError) {
  if (noError === void 0) noError = false;
  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(
      63
      /* ? */
    );
    return true;
  }
  return false;
};
pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  return state.eat(
    42
    /* * */
  ) || state.eat(
    43
    /* + */
  ) || state.eat(
    63
    /* ? */
  ) || this.regexp_eatBracedQuantifier(state, noError);
};
pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(
    123
    /* { */
  )) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(
        44
        /* , */
      ) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(
        125
        /* } */
      )) {
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true;
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatAtom = function(state) {
  return this.regexp_eatPatternCharacters(state) || state.eat(
    46
    /* . */
  ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
};
pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatAtomEscape(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(
    40
    /* ( */
  )) {
    if (state.eat(
      63
      /* ? */
    )) {
      if (this.options.ecmaVersion >= 16) {
        var addModifiers = this.regexp_eatModifiers(state);
        var hasHyphen = state.eat(
          45
          /* - */
        );
        if (addModifiers || hasHyphen) {
          for (var i2 = 0; i2 < addModifiers.length; i2++) {
            var modifier = addModifiers.charAt(i2);
            if (addModifiers.indexOf(modifier, i2 + 1) > -1) {
              state.raise("Duplicate regular expression modifiers");
            }
          }
          if (hasHyphen) {
            var removeModifiers = this.regexp_eatModifiers(state);
            if (!addModifiers && !removeModifiers && state.current() === 58) {
              state.raise("Invalid regular expression modifiers");
            }
            for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
              var modifier$1 = removeModifiers.charAt(i$1);
              if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
          }
        }
      }
      if (state.eat(
        58
        /* : */
      )) {
        this.regexp_disjunction(state);
        if (state.eat(
          41
          /* ) */
        )) {
          return true;
        }
        state.raise("Unterminated group");
      }
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatCapturingGroup = function(state) {
  if (state.eat(
    40
    /* ( */
  )) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 63) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(
      41
      /* ) */
    )) {
      state.numCapturingParens += 1;
      return true;
    }
    state.raise("Unterminated group");
  }
  return false;
};
pp$1.regexp_eatModifiers = function(state) {
  var modifiers = "";
  var ch = 0;
  while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
    modifiers += codePointToString(ch);
    state.advance();
  }
  return modifiers;
};
function isRegularExpressionModifier(ch) {
  return ch === 105 || ch === 109 || ch === 115;
}
pp$1.regexp_eatExtendedAtom = function(state) {
  return state.eat(
    46
    /* . */
  ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
};
pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false;
};
pp$1.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isSyntaxCharacter(ch) {
  return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
}
pp$1.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start;
};
pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_groupSpecifier = function(state) {
  if (state.eat(
    63
    /* ? */
  )) {
    if (!this.regexp_eatGroupName(state)) {
      state.raise("Invalid group");
    }
    var trackDisjunction = this.options.ecmaVersion >= 16;
    var known = state.groupNames[state.lastStringValue];
    if (known) {
      if (trackDisjunction) {
        for (var i2 = 0, list2 = known; i2 < list2.length; i2 += 1) {
          var altID = list2[i2];
          if (!altID.separatedFrom(state.branchID)) {
            state.raise("Duplicate capture group name");
          }
        }
      } else {
        state.raise("Duplicate capture group name");
      }
    }
    if (trackDisjunction) {
      (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
    } else {
      state.groupNames[state.lastStringValue] = true;
    }
  }
};
pp$1.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(
    60
    /* < */
  )) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(
      62
      /* > */
    )) {
      return true;
    }
    state.raise("Invalid capture group name");
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
}
pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
}
pp$1.regexp_eatAtomEscape = function(state) {
  if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
    return true;
  }
  if (state.switchU) {
    if (state.current() === 99) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false;
};
pp$1.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true;
    }
    if (n <= state.numCapturingParens) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatKGroupName = function(state) {
  if (state.eat(
    107
    /* k */
  )) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true;
    }
    state.raise("Invalid named reference");
  }
  return false;
};
pp$1.regexp_eatCharacterEscape = function(state) {
  return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
};
pp$1.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(
    99
    /* c */
  )) {
    if (this.regexp_eatControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatZero = function(state) {
  if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 116) {
    state.lastIntValue = 9;
    state.advance();
    return true;
  }
  if (ch === 110) {
    state.lastIntValue = 10;
    state.advance();
    return true;
  }
  if (ch === 118) {
    state.lastIntValue = 11;
    state.advance();
    return true;
  }
  if (ch === 102) {
    state.lastIntValue = 12;
    state.advance();
    return true;
  }
  if (ch === 114) {
    state.lastIntValue = 13;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
function isControlLetter(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
}
pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  if (forceU === void 0) forceU = false;
  var start = state.pos;
  var switchU = forceU || state.switchU;
  if (state.eat(
    117
    /* u */
  )) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (switchU && lead >= 55296 && lead <= 56319) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(
          92
          /* \ */
        ) && state.eat(
          117
          /* u */
        ) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 56320 && trail <= 57343) {
            state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
            return true;
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true;
    }
    if (switchU && state.eat(
      123
      /* { */
    ) && this.regexp_eatHexDigits(state) && state.eat(
      125
      /* } */
    ) && isValidUnicode(state.lastIntValue)) {
      return true;
    }
    if (switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }
  return false;
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 1114111;
}
pp$1.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true;
    }
    if (state.eat(
      47
      /* / */
    )) {
      state.lastIntValue = 47;
      return true;
    }
    return false;
  }
  var ch = state.current();
  if (ch !== 99 && (!state.switchN || ch !== 107)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 49 && ch <= 57) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
      state.advance();
    } while ((ch = state.current()) >= 48 && ch <= 57);
    return true;
  }
  return false;
};
var CharSetNone = 0;
var CharSetOk = 1;
var CharSetString = 2;
pp$1.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();
  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return CharSetOk;
  }
  var negate = false;
  if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
    state.lastIntValue = -1;
    state.advance();
    var result;
    if (state.eat(
      123
      /* { */
    ) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(
      125
      /* } */
    )) {
      if (negate && result === CharSetString) {
        state.raise("Invalid property name");
      }
      return result;
    }
    state.raise("Invalid property name");
  }
  return CharSetNone;
};
function isCharacterClassEscape(ch) {
  return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
}
pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(
    61
    /* = */
  )) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return CharSetOk;
    }
  }
  state.pos = start;
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
  }
  return CharSetNone;
};
pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
    state.raise("Invalid property name");
  }
  if (!state.unicodeProperties.nonBinary[name].test(value)) {
    state.raise("Invalid property value");
  }
};
pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (state.unicodeProperties.binary.test(nameOrValue)) {
    return CharSetOk;
  }
  if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
    return CharSetString;
  }
  state.raise("Invalid property name");
};
pp$1.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 95;
}
pp$1.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
}
pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state);
};
pp$1.regexp_eatCharacterClass = function(state) {
  if (state.eat(
    91
    /* [ */
  )) {
    var negate = state.eat(
      94
      /* ^ */
    );
    var result = this.regexp_classContents(state);
    if (!state.eat(
      93
      /* ] */
    )) {
      state.raise("Unterminated character class");
    }
    if (negate && result === CharSetString) {
      state.raise("Negated character class may contain strings");
    }
    return true;
  }
  return false;
};
pp$1.regexp_classContents = function(state) {
  if (state.current() === 93) {
    return CharSetOk;
  }
  if (state.switchV) {
    return this.regexp_classSetExpression(state);
  }
  this.regexp_nonEmptyClassRanges(state);
  return CharSetOk;
};
pp$1.regexp_nonEmptyClassRanges = function(state) {
  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(
      45
      /* - */
    ) && this.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};
pp$1.regexp_eatClassAtom = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatClassEscape(state)) {
      return true;
    }
    if (state.switchU) {
      var ch$1 = state.current();
      if (ch$1 === 99 || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  var ch = state.current();
  if (ch !== 93) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatClassEscape = function(state) {
  var start = state.pos;
  if (state.eat(
    98
    /* b */
  )) {
    state.lastIntValue = 8;
    return true;
  }
  if (state.switchU && state.eat(
    45
    /* - */
  )) {
    state.lastIntValue = 45;
    return true;
  }
  if (!state.switchU && state.eat(
    99
    /* c */
  )) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
};
pp$1.regexp_classSetExpression = function(state) {
  var result = CharSetOk, subResult;
  if (this.regexp_eatClassSetRange(state)) ;
  else if (subResult = this.regexp_eatClassSetOperand(state)) {
    if (subResult === CharSetString) {
      result = CharSetString;
    }
    var start = state.pos;
    while (state.eatChars(
      [38, 38]
      /* && */
    )) {
      if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
        if (subResult !== CharSetString) {
          result = CharSetOk;
        }
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
    while (state.eatChars(
      [45, 45]
      /* -- */
    )) {
      if (this.regexp_eatClassSetOperand(state)) {
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
  } else {
    state.raise("Invalid character in character class");
  }
  for (; ; ) {
    if (this.regexp_eatClassSetRange(state)) {
      continue;
    }
    subResult = this.regexp_eatClassSetOperand(state);
    if (!subResult) {
      return result;
    }
    if (subResult === CharSetString) {
      result = CharSetString;
    }
  }
};
pp$1.regexp_eatClassSetRange = function(state) {
  var start = state.pos;
  if (this.regexp_eatClassSetCharacter(state)) {
    var left = state.lastIntValue;
    if (state.eat(
      45
      /* - */
    ) && this.regexp_eatClassSetCharacter(state)) {
      var right = state.lastIntValue;
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatClassSetOperand = function(state) {
  if (this.regexp_eatClassSetCharacter(state)) {
    return CharSetOk;
  }
  return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
};
pp$1.regexp_eatNestedClass = function(state) {
  var start = state.pos;
  if (state.eat(
    91
    /* [ */
  )) {
    var negate = state.eat(
      94
      /* ^ */
    );
    var result = this.regexp_classContents(state);
    if (state.eat(
      93
      /* ] */
    )) {
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return result;
    }
    state.pos = start;
  }
  if (state.eat(
    92
    /* \ */
  )) {
    var result$1 = this.regexp_eatCharacterClassEscape(state);
    if (result$1) {
      return result$1;
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_eatClassStringDisjunction = function(state) {
  var start = state.pos;
  if (state.eatChars(
    [92, 113]
    /* \q */
  )) {
    if (state.eat(
      123
      /* { */
    )) {
      var result = this.regexp_classStringDisjunctionContents(state);
      if (state.eat(
        125
        /* } */
      )) {
        return result;
      }
    } else {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_classStringDisjunctionContents = function(state) {
  var result = this.regexp_classString(state);
  while (state.eat(
    124
    /* | */
  )) {
    if (this.regexp_classString(state) === CharSetString) {
      result = CharSetString;
    }
  }
  return result;
};
pp$1.regexp_classString = function(state) {
  var count = 0;
  while (this.regexp_eatClassSetCharacter(state)) {
    count++;
  }
  return count === 1 ? CharSetOk : CharSetString;
};
pp$1.regexp_eatClassSetCharacter = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
      return true;
    }
    if (state.eat(
      98
      /* b */
    )) {
      state.lastIntValue = 8;
      return true;
    }
    state.pos = start;
    return false;
  }
  var ch = state.current();
  if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
    return false;
  }
  if (isClassSetSyntaxCharacter(ch)) {
    return false;
  }
  state.advance();
  state.lastIntValue = ch;
  return true;
};
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
}
function isClassSetSyntaxCharacter(ch) {
  return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
}
pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  var ch = state.current();
  if (isClassSetReservedPunctuator(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isClassSetReservedPunctuator(ch) {
  return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
}
pp$1.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 95) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(
    120
    /* x */
  )) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true;
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
    state.advance();
  }
  return state.pos !== start;
};
function isDecimalDigit(ch) {
  return ch >= 48 && ch <= 57;
}
pp$1.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start;
};
function isHexDigit(ch) {
  return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
}
function hexToInt(ch) {
  if (ch >= 65 && ch <= 70) {
    return 10 + (ch - 65);
  }
  if (ch >= 97 && ch <= 102) {
    return 10 + (ch - 97);
  }
  return ch - 48;
}
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 48;
    state.advance();
    return true;
  }
  state.lastIntValue = 0;
  return false;
};
function isOctalDigit(ch) {
  return ch >= 48 && ch <= 55;
}
pp$1.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i2 = 0; i2 < length; ++i2) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false;
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true;
};
var Token = function Token2(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) {
    this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
  }
  if (p.options.ranges) {
    this.range = [p.start, p.end];
  }
};
var pp = Parser.prototype;
pp.next = function(ignoreEscapeSequenceInKeyword) {
  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
  }
  if (this.options.onToken) {
    this.options.onToken(new Token(this));
  }
  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};
pp.getToken = function() {
  this.next();
  return new Token(this);
};
if (typeof Symbol !== "undefined") {
  pp[Symbol.iterator] = function() {
    var this$1$1 = this;
    return {
      next: function() {
        var token = this$1$1.getToken();
        return {
          done: token.type === types$1.eof,
          value: token
        };
      }
    };
  };
}
pp.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) {
    this.skipSpace();
  }
  this.start = this.pos;
  if (this.options.locations) {
    this.startLoc = this.curPosition();
  }
  if (this.pos >= this.input.length) {
    return this.finishToken(types$1.eof);
  }
  if (curContext.override) {
    return curContext.override(this);
  } else {
    this.readToken(this.fullCharCodeAtPos());
  }
};
pp.readToken = function(code) {
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
    return this.readWord();
  }
  return this.getTokenFromCode(code);
};
pp.fullCharCodeAt = function(pos) {
  var code = this.input.charCodeAt(pos);
  if (code <= 55295 || code >= 56320) {
    return code;
  }
  var next = this.input.charCodeAt(pos + 1);
  return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
};
pp.fullCharCodeAtPos = function() {
  return this.fullCharCodeAt(this.pos);
};
pp.skipBlockComment = function() {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) {
    this.raise(this.pos - 2, "Unterminated comment");
  }
  this.pos = end + 2;
  if (this.options.locations) {
    for (var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
      ++this.curLine;
      pos = this.lineStart = nextBreak;
    }
  }
  if (this.options.onComment) {
    this.options.onComment(
      true,
      this.input.slice(start + 2, end),
      start,
      this.pos,
      startLoc,
      this.curPosition()
    );
  }
};
pp.skipLineComment = function(startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }
  if (this.options.onComment) {
    this.options.onComment(
      false,
      this.input.slice(start + startSkip, this.pos),
      start,
      this.pos,
      startLoc,
      this.curPosition()
    );
  }
};
pp.skipSpace = function() {
  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    switch (ch) {
      case 32:
      case 160:
        ++this.pos;
        break;
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10:
      case 8232:
      case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break;
      case 47:
        switch (this.input.charCodeAt(this.pos + 1)) {
          case 42:
            this.skipBlockComment();
            break;
          case 47:
            this.skipLineComment(2);
            break;
          default:
            break loop;
        }
        break;
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop;
        }
    }
  }
};
pp.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) {
    this.endLoc = this.curPosition();
  }
  var prevType = this.type;
  this.type = type;
  this.value = val;
  this.updateContext(prevType);
};
pp.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) {
    return this.readNumber(true);
  }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    this.pos += 3;
    return this.finishToken(types$1.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(types$1.dot);
  }
};
pp.readToken_slash = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) {
    ++this.pos;
    return this.readRegexp();
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.slash, 1);
};
pp.readToken_mult_modulo_exp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types$1.star : types$1.modulo;
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types$1.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, size + 1);
  }
  return this.finishOp(tokentype, size);
};
pp.readToken_pipe_amp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) {
        return this.finishOp(types$1.assign, 3);
      }
    }
    return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
};
pp.readToken_caret = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.bitwiseXOR, 1);
};
pp.readToken_plus_min = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }
    return this.finishOp(types$1.incDec, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.plusMin, 1);
};
pp.readToken_lt_gt = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) {
      return this.finishOp(types$1.assign, size + 1);
    }
    return this.finishOp(types$1.bitShift, size);
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }
  if (next === 61) {
    size = 2;
  }
  return this.finishOp(types$1.relational, size);
};
pp.readToken_eq_excl = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
  }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    this.pos += 2;
    return this.finishToken(types$1.arrow);
  }
  return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
};
pp.readToken_question = function() {
  var ecmaVersion2 = this.options.ecmaVersion;
  if (ecmaVersion2 >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) {
        return this.finishOp(types$1.questionDot, 2);
      }
    }
    if (next === 63) {
      if (ecmaVersion2 >= 12) {
        var next2$1 = this.input.charCodeAt(this.pos + 2);
        if (next2$1 === 61) {
          return this.finishOp(types$1.assign, 3);
        }
      }
      return this.finishOp(types$1.coalesce, 2);
    }
  }
  return this.finishOp(types$1.question, 1);
};
pp.readToken_numberSign = function() {
  var ecmaVersion2 = this.options.ecmaVersion;
  var code = 35;
  if (ecmaVersion2 >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();
    if (isIdentifierStart(code, true) || code === 92) {
      return this.finishToken(types$1.privateId, this.readWord1());
    }
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.getTokenFromCode = function(code) {
  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46:
      return this.readToken_dot();
    // Punctuation tokens.
    case 40:
      ++this.pos;
      return this.finishToken(types$1.parenL);
    case 41:
      ++this.pos;
      return this.finishToken(types$1.parenR);
    case 59:
      ++this.pos;
      return this.finishToken(types$1.semi);
    case 44:
      ++this.pos;
      return this.finishToken(types$1.comma);
    case 91:
      ++this.pos;
      return this.finishToken(types$1.bracketL);
    case 93:
      ++this.pos;
      return this.finishToken(types$1.bracketR);
    case 123:
      ++this.pos;
      return this.finishToken(types$1.braceL);
    case 125:
      ++this.pos;
      return this.finishToken(types$1.braceR);
    case 58:
      ++this.pos;
      return this.finishToken(types$1.colon);
    case 96:
      if (this.options.ecmaVersion < 6) {
        break;
      }
      ++this.pos;
      return this.finishToken(types$1.backQuote);
    case 48:
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) {
        return this.readRadixNumber(16);
      }
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) {
          return this.readRadixNumber(8);
        }
        if (next === 98 || next === 66) {
          return this.readRadixNumber(2);
        }
      }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      return this.readNumber(false);
    // Quotes produce strings.
    case 34:
    case 39:
      return this.readString(code);
    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.
    case 47:
      return this.readToken_slash();
    case 37:
    case 42:
      return this.readToken_mult_modulo_exp(code);
    case 124:
    case 38:
      return this.readToken_pipe_amp(code);
    case 94:
      return this.readToken_caret();
    case 43:
    case 45:
      return this.readToken_plus_min(code);
    case 60:
    case 62:
      return this.readToken_lt_gt(code);
    case 61:
    case 33:
      return this.readToken_eq_excl(code);
    case 63:
      return this.readToken_question();
    case 126:
      return this.finishOp(types$1.prefix, 1);
    case 35:
      return this.readToken_numberSign();
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};
pp.readRegexp = function() {
  var escaped, inClass, start = this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(start, "Unterminated regular expression");
    }
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) {
      this.raise(start, "Unterminated regular expression");
    }
    if (!escaped) {
      if (ch === "[") {
        inClass = true;
      } else if (ch === "]" && inClass) {
        inClass = false;
      } else if (ch === "/" && !inClass) {
        break;
      }
      escaped = ch === "\\";
    } else {
      escaped = false;
    }
    ++this.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) {
    this.unexpected(flagsStart);
  }
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
  }
  return this.finishToken(types$1.regexp, { pattern, flags, value });
};
pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
  var start = this.pos, total = 0, lastCode = 0;
  for (var i2 = 0, e = len == null ? Infinity : len; i2 < e; ++i2, ++this.pos) {
    var code = this.input.charCodeAt(this.pos), val = void 0;
    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
      }
      if (lastCode === 95) {
        this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
      }
      if (i2 === 0) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
      }
      lastCode = code;
      continue;
    }
    if (code >= 97) {
      val = code - 97 + 10;
    } else if (code >= 65) {
      val = code - 65 + 10;
    } else if (code >= 48 && code <= 57) {
      val = code - 48;
    } else {
      val = Infinity;
    }
    if (val >= radix) {
      break;
    }
    lastCode = code;
    total = total * radix + val;
  }
  if (allowSeparators && lastCode === 95) {
    this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
  }
  if (this.pos === start || len != null && this.pos - start !== len) {
    return null;
  }
  return total;
};
function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8);
  }
  return parseFloat(str.replace(/_/g, ""));
}
function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null;
  }
  return BigInt(str.replace(/_/g, ""));
}
pp.readRadixNumber = function(radix) {
  var start = this.pos;
  this.pos += 2;
  var val = this.readInt(radix);
  if (val == null) {
    this.raise(this.start + 2, "Expected number in radix " + radix);
  }
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  return this.finishToken(types$1.num, val);
};
pp.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10, void 0, true) === null) {
    this.raise(start, "Invalid number");
  }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) {
    this.raise(start, "Invalid number");
  }
  var next = this.input.charCodeAt(this.pos);
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var val$1 = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    return this.finishToken(types$1.num, val$1);
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
    octal = false;
  }
  if (next === 46 && !octal) {
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) {
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) {
      ++this.pos;
    }
    if (this.readInt(10) === null) {
      this.raise(start, "Invalid number");
    }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(types$1.num, val);
};
pp.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;
  if (ch === 123) {
    if (this.options.ecmaVersion < 6) {
      this.unexpected();
    }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 1114111) {
      this.invalidStringToken(codePos, "Code point out of bounds");
    }
  } else {
    code = this.readHexChar(4);
  }
  return code;
};
pp.readString = function(quote) {
  var out = "", chunkStart = ++this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated string constant");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) {
      break;
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else if (ch === 8232 || ch === 8233) {
      if (this.options.ecmaVersion < 10) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
      if (this.options.locations) {
        this.curLine++;
        this.lineStart = this.pos;
      }
    } else {
      if (isNewLine(ch)) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types$1.string, out);
};
var INVALID_TEMPLATE_ESCAPE_ERROR = {};
pp.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err;
    }
  }
  this.inTemplateElement = false;
};
pp.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR;
  } else {
    this.raise(position, message);
  }
};
pp.readTmplToken = function() {
  var out = "", chunkStart = this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated template");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(types$1.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(types$1.backQuote);
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(types$1.template, out);
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) {
            ++this.pos;
          }
        case 10:
          out += "\n";
          break;
        default:
          out += String.fromCharCode(ch);
          break;
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};
pp.readInvalidTemplateToken = function() {
  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break;
      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break;
        }
      // fall through
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
      case "\r":
        if (this.input[this.pos + 1] === "\n") {
          ++this.pos;
        }
      // fall through
      case "\n":
      case "\u2028":
      case "\u2029":
        ++this.curLine;
        this.lineStart = this.pos + 1;
        break;
    }
  }
  this.raise(this.start, "Unterminated template");
};
pp.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
    case 110:
      return "\n";
    // 'n' -> '\n'
    case 114:
      return "\r";
    // 'r' -> '\r'
    case 120:
      return String.fromCharCode(this.readHexChar(2));
    // 'x'
    case 117:
      return codePointToString(this.readCodePoint());
    // 'u'
    case 116:
      return "	";
    // 't' -> '\t'
    case 98:
      return "\b";
    // 'b' -> '\b'
    case 118:
      return "\v";
    // 'v' -> '\u000b'
    case 102:
      return "\f";
    // 'f' -> '\f'
    case 13:
      if (this.input.charCodeAt(this.pos) === 10) {
        ++this.pos;
      }
    // '\r\n'
    case 10:
      if (this.options.locations) {
        this.lineStart = this.pos;
        ++this.curLine;
      }
      return "";
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(
          this.pos - 1,
          "Invalid escape sequence"
        );
      }
      if (inTemplate) {
        var codePos = this.pos - 1;
        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate ? "Octal literal in template string" : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal);
      }
      if (isNewLine(ch)) {
        if (this.options.locations) {
          this.lineStart = this.pos;
          ++this.curLine;
        }
        return "";
      }
      return String.fromCharCode(ch);
  }
};
pp.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) {
    this.invalidStringToken(codePos, "Bad character escape sequence");
  }
  return n;
};
pp.readWord1 = function() {
  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 65535 ? 1 : 2;
    } else if (ch === 92) {
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) {
        this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      }
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
        this.invalidStringToken(escStart, "Invalid Unicode escape");
      }
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos);
};
pp.readWord = function() {
  var word = this.readWord1();
  var type = types$1.name;
  if (this.keywords.test(word)) {
    type = keywords[word];
  }
  return this.finishToken(type, word);
};
var version = "8.19.0";
Parser.acorn = {
  Parser,
  version,
  defaultOptions,
  Position,
  SourceLocation,
  getLineInfo,
  Node,
  TokenType,
  tokTypes: types$1,
  keywordTypes: keywords,
  TokContext,
  tokContexts: types,
  isIdentifierChar,
  isIdentifierStart,
  Token,
  isNewLine,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace
};
function parse3(input, options) {
  return Parser.parse(input, options);
}

// src/formats/definition-js.ts
var Unreadable = class {
  constructor(reason) {
    this.reason = reason;
  }
  reason;
};
function parseDefinitionJs(filePath, effectDir) {
  const source = readFileSync(filePath, "utf-8");
  const reasons = [];
  let ast;
  try {
    ast = parse3(source, { ecmaVersion: "latest", sourceType: "module" });
  } catch (err) {
    return {
      func: "unknown",
      globals: {},
      passes: [],
      format: "js",
      effectDir,
      partial: true,
      partialReasons: [`definition.js does not parse: ${err instanceof Error ? err.message : String(err)}`]
    };
  }
  const props = findConfig(ast, reasons);
  if (!props) {
    return {
      func: "unknown",
      globals: {},
      passes: [],
      format: "js",
      effectDir,
      partial: true,
      partialReasons: ["no effect config (an object literal or class fields with a func, globals or passes key) was found"]
    };
  }
  const read = (key) => {
    const node = props.get(key);
    if (!node) return void 0;
    return readValue(node, key, reasons);
  };
  const func = asString(read("func")) || "unknown";
  const name = asString(read("name"));
  const namespace = asString(read("namespace"));
  const description = asString(read("description"));
  const starterVal = read("starter");
  const starter = typeof starterVal === "boolean" ? starterVal : void 0;
  const tagsVal = read("tags");
  const tags = Array.isArray(tagsVal) ? tagsVal.filter((t) => typeof t === "string") : void 0;
  const globals = {};
  const globalsNode = props.get("globals");
  if (globalsNode) {
    if (globalsNode.type !== "ObjectExpression") {
      reasons.push(`globals: ${describe(globalsNode)} is computed at run time`);
    } else {
      for (const [key, specNode] of objectProperties(globalsNode, "globals", reasons)) {
        const spec = readValue(specNode, `globals.${key}`, reasons);
        if (spec && typeof spec === "object" && !Array.isArray(spec)) {
          globals[key] = normalizeGlobal(key, spec);
        }
      }
    }
  }
  let passes = [];
  const passesNode = props.get("passes");
  if (!passesNode) {
    passes = [{ program: "main" }];
  } else if (passesNode.type !== "ArrayExpression") {
    reasons.push(`passes: ${describe(passesNode)} is computed at run time`);
  } else {
    passesNode.elements.forEach((el, i2) => {
      if (!el) return;
      if (el.type === "SpreadElement") {
        reasons.push(`passes[${i2}]: spread of ${describe(el.argument)} is computed at run time`);
        return;
      }
      const pass = readValue(el, `passes[${i2}]`, reasons);
      if (pass && typeof pass === "object" && !Array.isArray(pass)) {
        passes.push(normalizePass(pass));
      }
    });
  }
  return {
    func,
    name,
    namespace,
    description,
    starter,
    tags,
    globals,
    passes,
    format: "js",
    effectDir,
    ...reasons.length > 0 && { partial: true, partialReasons: reasons }
  };
}
function findConfig(ast, reasons) {
  let found = null;
  walk(ast, (node) => {
    if (found && found.start <= node.start) return;
    let keys;
    if (node.type === "ObjectExpression") {
      keys = node.properties.filter((p) => p.type === "Property" && !p.computed).map((p) => propertyKey(p));
    } else if (node.type === "ClassBody") {
      keys = node.body.filter((p) => p.type === "PropertyDefinition" && !p.static && !p.computed && p.value).map((p) => propertyKey(p));
    } else {
      return;
    }
    if (keys.includes("func") || keys.includes("globals") && keys.includes("passes")) found = node;
  });
  if (!found) return null;
  const config = found;
  if (config.type === "ObjectExpression") return objectProperties(config, "", reasons);
  const out = /* @__PURE__ */ new Map();
  for (const p of config.body) {
    if (p.type !== "PropertyDefinition" || p.static || p.computed || !p.value) continue;
    const key = propertyKey(p);
    if (key !== void 0) out.set(key, p.value);
  }
  return out;
}
function walk(node, visit) {
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) if (child && typeof child.type === "string") walk(child, visit);
    } else if (value && typeof value === "object" && typeof value.type === "string") {
      walk(value, visit);
    }
  }
}
function propertyKey(p) {
  if (p.key.type === "Identifier" || p.key.type === "PrivateIdentifier") return p.key.name;
  if (p.key.type === "Literal") return String(p.key.value);
  return void 0;
}
function objectProperties(obj, path, reasons) {
  const out = /* @__PURE__ */ new Map();
  for (const p of obj.properties) {
    const where = path ? `${path}.` : "";
    if (p.type === "SpreadElement") {
      reasons.push(`${path || "config"}: spread of ${describe(p.argument)} is computed at run time`);
      continue;
    }
    const key = p.computed ? void 0 : propertyKey(p);
    if (key === void 0) {
      reasons.push(`${where}[${describe(p.key)}]: computed key`);
      continue;
    }
    if (p.kind !== "init" || p.method) continue;
    out.set(key, p.value);
  }
  return out;
}
function readValue(node, path, reasons) {
  const value = evaluate(node, path, reasons);
  if (value instanceof Unreadable) {
    reasons.push(`${path}: ${value.reason}`);
    return void 0;
  }
  return value;
}
function evaluate(node, path, reasons) {
  switch (node.type) {
    case "Literal":
      if (node.regex) return new Unreadable("regular expression literal");
      return node.value;
    case "TemplateLiteral":
      if (node.expressions.length > 0) return new Unreadable("template literal with expressions");
      return node.quasis.map((q) => q.value.cooked).join("");
    case "Identifier":
      if (node.name === "undefined") return void 0;
      if (node.name === "Infinity") return Infinity;
      if (node.name === "NaN") return NaN;
      return new Unreadable(`references ${node.name}`);
    case "UnaryExpression": {
      const arg = evaluate(node.argument, path, reasons);
      if (arg instanceof Unreadable) return arg;
      if (node.operator === "-" && typeof arg === "number") return -arg;
      if (node.operator === "+" && typeof arg === "number") return +arg;
      if (node.operator === "!") return !arg;
      return new Unreadable(`unary ${node.operator}`);
    }
    case "BinaryExpression": {
      const left = evaluate(node.left, path, reasons);
      if (left instanceof Unreadable) return left;
      const right = evaluate(node.right, path, reasons);
      if (right instanceof Unreadable) return right;
      if (typeof left === "number" && typeof right === "number") {
        switch (node.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
        }
      }
      if (node.operator === "+" && typeof left === "string" && typeof right === "string") return left + right;
      return new Unreadable(`expression ${describe(node)}`);
    }
    case "ArrayExpression": {
      const out = [];
      for (const [i2, el] of node.elements.entries()) {
        if (!el) {
          out.push(void 0);
          continue;
        }
        if (el.type === "SpreadElement") return new Unreadable(`spread of ${describe(el.argument)} at [${i2}]`);
        const v = evaluate(el, `${path}[${i2}]`, reasons);
        if (v instanceof Unreadable) return v;
        out.push(v);
      }
      return out;
    }
    case "ObjectExpression": {
      const out = {};
      for (const [key, valueNode] of objectProperties(node, path, reasons)) {
        const v = readValue(valueNode, `${path}.${key}`, reasons);
        if (v !== void 0) out[key] = v;
      }
      return out;
    }
    default:
      return new Unreadable(`${describe(node)} is computed at run time`);
  }
}
function describe(node) {
  switch (node.type) {
    case "Identifier":
      return node.name;
    case "MemberExpression": {
      const prop = node.computed ? "[\u2026]" : `.${node.property.name}`;
      return `${describe(node.object)}${prop}`;
    }
    case "CallExpression":
      return `${describe(node.callee)}(\u2026)`;
    default:
      return node.type;
  }
}
function asString(v) {
  return typeof v === "string" ? v : void 0;
}

// src/formats/index.ts
function loadEffectDefinition(effectDir) {
  const jsonPath = join(effectDir, "definition.json");
  if (existsSync(jsonPath)) {
    const raw = JSON.parse(readFileSync2(jsonPath, "utf-8"));
    return parseDefinitionJson(raw, effectDir);
  }
  const jsPath = join(effectDir, "definition.js");
  if (existsSync(jsPath)) {
    return parseDefinitionJs(jsPath, effectDir);
  }
  throw new Error(`No definition.json or definition.js found in ${effectDir}`);
}

// src/knowledge/effect-index.ts
var EffectIndex = class {
  effects = /* @__PURE__ */ new Map();
  initialized = false;
  async initialize(effectsDir) {
    if (this.initialized) return;
    if (!existsSync2(effectsDir)) return;
    const entries = await readdir(effectsDir);
    for (const ns of entries) {
      const nsDir = join2(effectsDir, ns);
      if (!(await stat(nsDir)).isDirectory()) continue;
      const effects = await readdir(nsDir);
      for (const effect of effects) {
        const effectDir = join2(nsDir, effect);
        if (!(await stat(effectDir)).isDirectory()) continue;
        try {
          const def = loadEffectDefinition(effectDir);
          const id = `${ns}/${effect}`;
          this.effects.set(id, { ...def, namespace: ns });
        } catch (err) {
          console.warn(`[shade-mcp] skipping unparseable effect ${ns}/${effect}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
    this.initialized = true;
  }
  search(query, limit = 10) {
    const lower = query.toLowerCase();
    const keywords2 = lower.split(/\s+/).filter((k) => k.length > 1);
    const results = [];
    for (const [id, def] of this.effects) {
      let score = 0;
      if (id.toLowerCase().includes(lower)) score += 20;
      for (const kw2 of keywords2) {
        if (id.toLowerCase().includes(kw2)) score += 8;
        if (def.name?.toLowerCase().includes(kw2)) score += 15;
        if (def.description?.toLowerCase().includes(kw2)) score += 5;
        if (def.tags?.some((t) => t.toLowerCase().includes(kw2))) score += 8;
        if (def.namespace?.toLowerCase().includes(kw2)) score += 12;
      }
      if (score > 0) {
        results.push({ id, def, score });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
  get(effectId) {
    return this.effects.get(effectId);
  }
  list(namespace) {
    const results = [];
    for (const [id, def] of this.effects) {
      if (namespace && def.namespace !== namespace) continue;
      results.push({ id, def });
    }
    return results;
  }
  get size() {
    return this.effects.size;
  }
};

// src/knowledge/glsl-index.ts
import { readdir as readdir2, readFile, stat as stat2 } from "fs/promises";
import { existsSync as existsSync3 } from "fs";
import { join as join3 } from "path";
var GlslIndex = class {
  files = /* @__PURE__ */ new Map();
  initialized = false;
  async initialize(effectsDir) {
    if (this.initialized) return;
    if (!existsSync3(effectsDir)) return;
    const namespaces = await readdir2(effectsDir);
    for (const ns of namespaces) {
      const nsDir = join3(effectsDir, ns);
      if (!(await stat2(nsDir)).isDirectory()) continue;
      const effects = await readdir2(nsDir);
      for (const effect of effects) {
        const effectDir = join3(nsDir, effect);
        if (!(await stat2(effectDir)).isDirectory()) continue;
        const glslDir = join3(effectDir, "glsl");
        if (!existsSync3(glslDir)) continue;
        const glslFiles = (await readdir2(glslDir)).filter((f) => f.endsWith(".glsl"));
        for (const gf of glslFiles) {
          const filePath = join3(glslDir, gf);
          const content = await readFile(filePath, "utf-8");
          const effectId = `${ns}/${effect}`;
          this.files.set(`${effectId}/${gf}`, { effectId, content, file: gf });
        }
      }
    }
    this.initialized = true;
  }
  search(query, contextLines = 5, limit = 10) {
    let regex;
    try {
      regex = new RegExp(query, "gi");
    } catch {
      regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    }
    const results = [];
    for (const [, entry] of this.files) {
      const lines = entry.content.split("\n");
      for (let i2 = 0; i2 < lines.length; i2++) {
        if (!regex.test(lines[i2])) continue;
        regex.lastIndex = 0;
        const start = Math.max(0, i2 - contextLines);
        const end = Math.min(lines.length, i2 + contextLines + 1);
        const contextArr = lines.slice(start, end).map((line, idx) => {
          const lineNum = start + idx + 1;
          const marker = lineNum === i2 + 1 ? ">>>" : "   ";
          return `${marker} ${lineNum}: ${line}`;
        });
        results.push({
          effectId: entry.effectId,
          file: entry.file,
          lineNumber: i2 + 1,
          matchLine: lines[i2].trim(),
          context: contextArr.join("\n")
        });
        i2 += contextLines;
        if (results.length >= limit) return results;
      }
    }
    return results;
  }
  get size() {
    return this.files.size;
  }
};

// src/knowledge/vector-db.ts
var STOP_WORDS = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "shall",
  "to",
  "of",
  "in",
  "for",
  "on",
  "with",
  "at",
  "by",
  "from",
  "as",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "out",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "and",
  "but",
  "or",
  "if",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "me",
  "my",
  "we",
  "us",
  "you",
  "your",
  "he",
  "him",
  "his",
  "she",
  "her",
  "they",
  "them",
  "their",
  "what",
  "which",
  "who",
  "whom"
]);
function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}
function termFrequency(tokens) {
  const freq = /* @__PURE__ */ new Map();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  const len = tokens.length || 1;
  for (const [k, v] of freq) {
    freq.set(k, v / len);
  }
  return freq;
}
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (const [k, v] of a) {
    dot += v * (b.get(k) || 0);
    normA += v * v;
  }
  for (const [, v] of b) {
    normB += v * v;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
var ShaderKnowledgeDB = class {
  documents = /* @__PURE__ */ new Map();
  tfVectors = /* @__PURE__ */ new Map();
  documentFrequency = /* @__PURE__ */ new Map();
  totalDocuments = 0;
  indexBuilt = false;
  addDocument(doc) {
    this.documents.set(doc.id, doc);
    this.indexBuilt = false;
  }
  addDocuments(docs) {
    for (const doc of docs) {
      this.documents.set(doc.id, doc);
    }
    this.indexBuilt = false;
  }
  buildIndex() {
    this.documentFrequency.clear();
    this.tfVectors.clear();
    this.totalDocuments = this.documents.size;
    for (const [id, doc] of this.documents) {
      const text = `${doc.title} ${doc.content} ${(doc.tags || []).join(" ")}`;
      const tokens = tokenize(text);
      const tf = termFrequency(tokens);
      this.tfVectors.set(id, tf);
      for (const term of tf.keys()) {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
      }
    }
    for (const [id, tf] of this.tfVectors) {
      const tfidf = /* @__PURE__ */ new Map();
      for (const [term, tfVal] of tf) {
        const df = this.documentFrequency.get(term) || 0;
        const idf = Math.log((this.totalDocuments + 1) / (df + 1)) + 1;
        tfidf.set(term, tfVal * idf);
      }
      this.tfVectors.set(id, tfidf);
    }
    this.indexBuilt = true;
  }
  search(query, options = {}) {
    if (!this.indexBuilt) this.buildIndex();
    const { limit = 10, category, minScore = 0.05 } = options;
    const queryTokens = tokenize(query);
    const queryTf = termFrequency(queryTokens);
    const queryVec = /* @__PURE__ */ new Map();
    for (const [term, tfVal] of queryTf) {
      const df = this.documentFrequency.get(term) || 0;
      const idf = Math.log((this.totalDocuments + 1) / (df + 1)) + 1;
      queryVec.set(term, tfVal * idf);
    }
    const results = [];
    for (const [id, docVec] of this.tfVectors) {
      const doc = this.documents.get(id);
      if (category && doc.category !== category) continue;
      const score = cosineSimilarity(queryVec, docVec);
      if (score >= minScore) {
        results.push({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          score: Math.round(score * 1e3) / 1e3,
          snippet: this.extractSnippet(doc.content, queryTokens),
          source: doc.source,
          tags: doc.tags
        });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
  extractSnippet(content, queryTokens, snippetLength = 200) {
    const lower = content.toLowerCase();
    let bestStart = 0;
    let bestScore = 0;
    const words = content.split(/\s+/);
    for (let i2 = 0; i2 < words.length; i2++) {
      let score = 0;
      const windowEnd = Math.min(i2 + 30, words.length);
      for (let j = i2; j < windowEnd; j++) {
        const w = words[j].toLowerCase().replace(/[^\w]/g, "");
        if (queryTokens.includes(w)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestStart = content.indexOf(words[i2]);
      }
    }
    const start = Math.max(0, bestStart);
    const end = Math.min(content.length, start + snippetLength);
    let snippet = content.slice(start, end).trim();
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet += "...";
    return snippet;
  }
  getCategories() {
    const cats = /* @__PURE__ */ new Set();
    for (const doc of this.documents.values()) {
      cats.add(doc.category);
    }
    return Array.from(cats);
  }
  getByCategory(category) {
    return Array.from(this.documents.values()).filter((doc) => doc.category === category);
  }
  getStats() {
    const categoryCounts = {};
    for (const doc of this.documents.values()) {
      const cat = doc.category || "uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    return {
      totalDocuments: this.documents.size,
      totalTerms: this.documentFrequency.size,
      indexed: this.indexBuilt,
      categories: categoryCounts
    };
  }
};

// src/config.ts
import { resolve } from "path";
var VALID_BACKENDS = ["webgl2", "webgpu"];
function parseCount(value, fallback) {
  const parsed = parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function parseDuration(value, fallback) {
  const parsed = parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function parseBackend(value) {
  if (value && VALID_BACKENDS.includes(value)) {
    return value;
  }
  return "webgl2";
}
function parseDslUrl(value, fallback, key, module) {
  const input = value ?? fallback;
  const path = input.startsWith("https://") ? new URL(input).pathname : input;
  const segments = path.split("/");
  const validPath = /^\/[A-Za-z0-9._/-]+$/.test(path) && !path.includes("//") && segments.every((segment) => segment !== "." && segment !== "..");
  const validModule = !module || path.endsWith(".js");
  if (!validPath || !validModule) throw new Error(`${key} must be a root-relative path or HTTPS URL${module ? " ending in .js" : ""}`);
  if (input.startsWith("https://")) {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      throw new Error(`${key} must be an HTTPS URL without credentials, query, or fragment`);
    }
  } else if (!input.startsWith("/") || input.startsWith("//")) {
    throw new Error(`${key} must be a root-relative path or HTTPS URL`);
  }
  return input.replace(/\/$/, "");
}
function parseDslBundles(value) {
  if (value === void 0 || value === "false" || value === "0") return false;
  if (value === "true" || value === "1") return true;
  throw new Error("SHADE_DSL_USE_BUNDLES must be true or false");
}
function getConfig() {
  const projectRoot = process.env.SHADE_PROJECT_ROOT || process.cwd();
  return {
    effectsDir: process.env.SHADE_EFFECTS_DIR || resolve(projectRoot, "effects"),
    viewerPort: parseCount(process.env.SHADE_VIEWER_PORT, 0),
    defaultBackend: parseBackend(process.env.SHADE_BACKEND),
    projectRoot,
    globalsPrefix: process.env.SHADE_GLOBALS_PREFIX || void 0,
    viewerPath: process.env.SHADE_VIEWER_PATH || void 0,
    maxBrowsers: parseCount(process.env.SHADE_MAX_BROWSERS, 1),
    timeoutMs: parseDuration(process.env.SHADE_TIMEOUT_MS, 12e4),
    aiTimeoutMs: parseDuration(process.env.SHADE_AI_TIMEOUT_MS, 12e4),
    aiModel: process.env.SHADE_AI_MODEL || void 0,
    dslRendererModule: parseDslUrl(process.env.SHADE_DSL_RENDERER_MODULE, "/shaders/src/index.js", "SHADE_DSL_RENDERER_MODULE", true),
    dslAssetsBase: parseDslUrl(process.env.SHADE_DSL_ASSETS_BASE, "/shaders", "SHADE_DSL_ASSETS_BASE", false),
    dslUseBundles: parseDslBundles(process.env.SHADE_DSL_USE_BUNDLES)
  };
}

// src/knowledge/shared-instances.ts
var INDEX_TTL_MS = 5e3;
var effectIndex = null;
var builtAt = 0;
var building = null;
var epoch = 0;
var buildEpoch = 0;
async function getSharedEffectIndex() {
  if (effectIndex && Date.now() - builtAt < INDEX_TTL_MS) return effectIndex;
  if (building && buildEpoch === epoch) return building;
  const current2 = epoch;
  building = (async () => {
    const index = new EffectIndex();
    await index.initialize(getConfig().effectsDir);
    if (epoch === current2) {
      effectIndex = index;
      builtAt = Date.now();
    }
    return index;
  })();
  buildEpoch = current2;
  const promise = building;
  try {
    return await promise;
  } finally {
    if (building === promise) building = null;
  }
}
function invalidateSharedEffectIndex() {
  effectIndex = null;
  builtAt = 0;
  epoch++;
}

// src/knowledge/shader-knowledge.ts
var TECHNIQUE_SYNONYMS = {
  noise: ["perlin", "simplex", "value noise", "fbm", "fractal", "organic", "procedural"],
  voronoi: ["cellular", "worley", "cell noise", "cells", "diagram"],
  kaleidoscope: ["mirror", "symmetry", "radial", "polar", "reflection"],
  blur: ["gaussian", "smooth", "bokeh", "defocus", "bloom"],
  distortion: ["warp", "twist", "bend", "deform", "displace"],
  feedback: ["delay", "echo", "trail", "persistence", "accumulate"],
  particle: ["points", "agent", "emit", "flow", "swarm"],
  gradient: ["ramp", "color ramp", "palette", "colormap", "interpolation", "blend", "mix"],
  sdf: ["signed distance", "distance field", "raymarching", "shapes"],
  glitch: ["digital", "error", "artifact", "corruption", "databend"],
  wave: ["sine", "cosine", "oscillation", "ripple", "interference"],
  pattern: ["tiling", "grid", "mosaic", "tessellation", "repeat"],
  color: ["hue", "saturation", "brightness", "hsv", "hsl", "palette", "rgb", "mix", "lerp"],
  "3d": ["tunnel", "perspective", "raymarching", "volumetric"],
  edge: ["sobel", "contour", "outline", "detection"],
  film: ["grain", "halftone", "dither", "scanline", "retro"],
  fbm: ["fractal brownian motion", "octaves", "layered noise", "turbulence"],
  simplex: ["perlin", "gradient noise", "coherent noise"],
  polar: ["radial", "angle", "atan", "circular", "spiral"],
  geometric: ["shapes", "sdf", "distance field", "circle", "polygon", "grid"],
  spiral: ["vortex", "swirl", "rotation", "twist"],
  animation: ["time", "motion", "movement", "animate", "loop", "sin", "cos", "TAU"],
  flow: ["curl", "vector field", "advection", "fluid", "stream"],
  warp: ["distort", "displacement", "domain warping", "deform"],
  rainbow: ["spectrum", "hsv rotation", "hue cycle", "chromatic"],
  filter: ["post-process", "image effect", "inputTex", "texture"],
  synth: ["generator", "procedural", "synthesizer"]
};
function expandQueryWithSynonyms(query) {
  const lower = query.toLowerCase();
  const expanded = [query];
  for (const [key, synonyms] of Object.entries(TECHNIQUE_SYNONYMS)) {
    if (lower.includes(key)) {
      expanded.push(...synonyms);
    }
    for (const syn of synonyms) {
      if (lower.includes(syn)) {
        expanded.push(key);
        break;
      }
    }
  }
  return expanded.join(" ");
}
var CURATED_KNOWLEDGE = [
  {
    id: "dsl-basics",
    title: "DSL Basics",
    content: "The shader DSL uses function chaining.\n1. Search the namespace.\n2. Call the effect function with arguments.\n3. Write to the output buffer (o0).\n4. Render.\nExample: search synth\\nnoise(seed: 1).write(o0)\\nrender(o0)",
    category: "dsl",
    tags: ["dsl", "syntax", "basics"]
  },
  {
    id: "effect-definition-format",
    title: "Effect Definition Format",
    content: "Effects use definition.json or definition.js files in namespace directories. Each file specifies:\n- func: the camelCase name\n- namespace\n- description\n- globals: uniforms with type/min/max/default\n- passes: shader programs with inputs/outputs",
    category: "effect-definition",
    tags: ["definition", "format", "structure"]
  },
  {
    id: "glsl-uniforms",
    title: "GLSL Uniform Wiring",
    content: "Declare GLSL uniforms with names that match the globals section. Common system uniforms are resolution (vec2), time (float), and aspect (float). Custom uniforms use the uniform field from globals.",
    category: "glsl",
    tags: ["glsl", "uniforms", "wiring"]
  },
  {
    id: "noise-techniques",
    title: "Noise Generation Techniques",
    content: "Common noise types include:\n- Perlin: smooth gradient noise\n- Simplex: improved Perlin\n- Voronoi/Worley: cellular patterns\n- Value noise: interpolated random values\n- FBM: fractal Brownian motion with layered octaves\nUse the timeCircle pattern for loops without visible seams: vec2 tc = vec2(cos(time*TAU), sin(time*TAU)) * radius.",
    category: "technique",
    tags: ["noise", "perlin", "simplex", "voronoi", "fbm"]
  },
  {
    id: "sdf-techniques",
    title: "Signed Distance Field Techniques",
    content: "Signed distance fields (SDFs) define shapes by distance to the surface. Common operations are union (min), intersection (max), subtraction, and smooth blend (smin). Raymarching advances along a ray and checks the SDF distance. Common shapes are spheres, boxes, tori, and cylinders.",
    category: "technique",
    tags: ["sdf", "raymarching", "distance field", "shapes"]
  },
  {
    id: "color-manipulation",
    title: "Color Manipulation",
    content: "HSV conversion: rgb2hsv/hsv2rgb. Color grading: lift/gamma/gain, temperature/tint. Palette generation: cosine gradient (a + b*cos(2*PI*(c*t+d))). Tone mapping: ACES, Reinhard. Blending modes: multiply, screen, overlay, soft light.",
    category: "technique",
    tags: ["color", "hsv", "palette", "grading", "blend"]
  },
  {
    id: "domain-warping",
    title: "Domain Warping",
    content: "Domain warping deforms UV coordinates before sampling: warpedUV = uv + noise(uv) * amount. Layered warping applies noise multiple times. Feedback warping uses the previous frame as the warp source. Domain warping creates organic, fluid patterns.",
    category: "technique",
    tags: ["warp", "distortion", "domain", "organic"]
  },
  {
    id: "filter-effects",
    title: "Filter Effect Patterns",
    content: "Filter effects process an input texture (inputTex). They receive the previous pass output and modify it. Common filters: blur (gaussian kernel), sharpen, edge detection (Sobel), color grading, distortion. Declare inputTex in the pass inputs.",
    category: "effect-pattern",
    tags: ["filter", "input", "processing", "post-processing"]
  },
  {
    id: "compute-shaders",
    title: "Compute Shader Patterns",
    content: 'Compute shaders run on the GPU without rasterization. They support GPGPU tasks: particle simulation, cellular automata, and physics. Declare the pass type as "compute" or "gpgpu". Access storage buffers and textures directly.',
    category: "technique",
    tags: ["compute", "gpgpu", "simulation", "particles"]
  },
  {
    id: "animation-patterns",
    title: "Seamless Animation Patterns",
    content: "For loops without visible seams, use timeCircle (cos/sin of time*TAU*radius). Avoid raw time in noise. Use periodic functions. For the Bleuje pattern, set t = fract(time). Animate properties with sin/cos of t*TAU. Use integer transitions with floor(t) for discrete changes.",
    category: "technique",
    tags: ["animation", "loop", "seamless", "time"]
  },
  {
    id: "pipeline-architecture",
    title: "Rendering Pipeline Architecture",
    content: "The rendering pipeline processes passes sequentially. Each pass has inputs (textures from previous passes or external sources), outputs (render targets), and a shader program. The pipeline manages texture allocation, uniform propagation, and frame timing.",
    category: "pipeline",
    tags: ["pipeline", "architecture", "rendering", "passes"]
  },
  {
    id: "common-errors",
    title: "Common Shader Errors",
    content: "Blank output: the shader does not write the output color, or the output variable name is wrong.\nStatic animation: time is not connected or the shader does not use it.\nMonochrome: the shader uses one channel without color mapping.\nCompilation errors: types do not match, variables lack declarations, or precision qualifiers are missing.",
    category: "errors",
    tags: ["errors", "debug", "troubleshooting", "fix"]
  }
];

// src/knowledge/innate-knowledge.ts
var INNATE_SHADER_KNOWLEDGE = `## NOISEMAKER SHADER SYSTEM - INNATE KNOWLEDGE

### CURRENT CAPABILITIES - SINGLE-PASS EFFECTS
Your strongest areas are:
- Procedural noise
- Color palettes
- Animated patterns
- Domain warping
- Kaleidoscope effects
- Fractals
- Basic 3D perspective: grids, tunnels, and starfields
You can try complex raymarching/SDF scenes, but these are not your strongest areas. Results may vary.
NAMESPACE CONSTRAINT: NEVER use the synth3d, filter3d, or points namespaces. These require multi-pass rendering, which the current UI does not support. Use only synth/filter/mixer.
If the user asks for particles or 3D volumes:
1. Explain the namespace limitation.
2. Offer single-pass alternatives.

## NOISE ANIMATION - THE TIMECIRCLE PATTERN

When animating noise, ALWAYS use the timeCircle pattern:

\`\`\`glsl
// STANDARD LOOPING NOISE SETUP - copy this exactly
float t = time * TAU;
vec2 timeCircle = vec2(cos(t), sin(t));

// Use timeCircle in noise coordinates:
float n = noise(uv * scale + timeCircle * 0.5);

// Or for 4D noise:
float n = noise4D(vec4(uv * scale, timeCircle));
\`\`\`

Use this prescribed pattern for animated noise in generated shaders.

### THE LAWS (NEVER VIOLATE)
1. **ALL animation MUST use sin(), cos(), or periodicValue().** Use integer cycle counts when these functions receive raw time. Do not use raw nonperiodic time as the animation signal.
2. **ALL noise that uses time MUST sample a circle**: \`vec2(cos(time*TAU), sin(time*TAU))\` as noise coordinates.
3. **Your effects belong to the USER namespace.** The DSL must be \`search user\\nyourEffect().write(o0)\\nrender(o0)\`
4. **Uniforms must match.** Every uniform in definition.js must have a GLSL declaration. Every GLSL uniform must appear in definition.js. Types: float\u2192float, vec3\u2192vec3, boolean\u2192bool
5. **fragColor is required.** You must set \`out vec4 fragColor\` or output is black.

##  WILL IT LOOP - CRITICAL ANIMATION RULES

**This section has the highest priority. You must understand all its rules.**

### Core Definition
Treat \`time\` as **1-periodic** on **[0, 1]**: \`t=1\` must be IDENTICAL to \`t=0\`.
All values driven by time must be continuous across the boundary. They should be smooth enough to prevent a visible "pop" at the seam.

### The Mental Model (Bleuje Pattern)
Use a periodic function with an offset or delay. Everything uses the same looping time basis. Each element varies through an offset.
- Reference: https://bleuje.com/tutorial2/

### WHY LOOPS FAIL - The Derivative Rule
Matching value(0) == value(1) is **NOT ENOUGH**!
The **velocity/derivative** must ALSO be continuous:
- value(0) == value(1)  \u2190 position matches
- value'(0) == value'(1) \u2190 velocity matches (no "hard reset" feel)

**Use sin(), cos(), or periodicValue() as the time basis for generated animation.**
Use integer cycle counts when these functions receive raw time. Both values and derivatives must match at the loop endpoints.
Do not use raw nonperiodic time as the animation signal. Do not substitute ramps from fract(), mod(), smoothstep(), or custom easing.
Spatial uses of fract(), mod(), and smoothstep() are permitted. Compositions with periodic signals must preserve both endpoint values and derivatives.
Check the final animated result. A function name alone does not guarantee a loop.

### HARD REQUIREMENTS (Check ALL Before Shipping)

1. **SEAM EQUALITY + DERIVATIVE CONTINUITY**
   - For EVERY animated scalar/vector: value(0) == value(1) AND value'(0) == value'(1)
   - If the value controls motion, the seam must not create a visible kink
   - Prefer smooth periodic functions (sin/cos families) over piecewise or modulo-based waveforms

2. **ROTATION MUST COMPLETE INTEGER TURNS**
   - Rotations must complete N full turns where N is an integer (1, 2, 3...)
   - Pattern: \`angle = float(N) * TAU * time\`
   - Examples: \`angle = TAU * time\` (1 turn), \`angle = 2.0 * TAU * time\` (2 turns)

3. **TRANSLATION MUST RETURN EXACTLY TO START**
   - Moving elements must return to starting point at t=1
   - Use circular motion: \`pos = start + radius * vec2(cos(TAU * time), sin(TAU * time))\`
   - Or oscillation: \`pos = start + dir * (amplitude * sin(TAU * time))\`

4. **USE TAU FOR PERIODIC MAPPING**
   - Any mapping from loop time to an angle must use TAU (2\u03C0), not \u03C0 or degrees
   - "Turns per loop" converts as: \`turns * TAU\`

5. **NOISE MUST USE TIMECIRCLE**
   - For animated noise, use the timeCircle pattern:
     \`\`\`glsl
     float t = time * TAU;
     vec2 tc = vec2(cos(t), sin(t));
     float n = noise(uv * scale + tc * 0.5);  // or noise4D(vec4(uv, tc))
     \`\`\`
   - Reference: https://bleuje.com/tutorial3/

### APPROVED LOOPING TECHNIQUES

**1. Periodic Function + Offset (Core Bleuje Pattern)**
Choose a 1-periodic function of time (period 1 in t \u2208 [0,1]). Apply an offset to each object:
\`\`\`glsl
float phase = time - offset;  // offset creates delay
float value = 0.5 + 0.5 * sin(phase * TAU);  // smooth 0\u21921\u21920
\`\`\`

**2. Looping Noise via Circle (Bleuje Tutorial 3)**
\`\`\`glsl
vec2 tc = vec2(cos(TAU * time), sin(TAU * time));
float n = noise4D(vec4(uv * scale, tc));
\`\`\`

### CORE HELPER FUNCTIONS (copy exactly)
\`\`\`glsl
#define TAU 6.28318530717958647692

float normalizedSine(float x) {
    return 0.5 + 0.5 * sin(x);
}

// The Bleuje periodic value: normalized_sine((time - offset) * TAU)
// Returns 0\u21921\u21920 smoothly over the loop
float periodicValue(float t, float offset) {
    return normalizedSine((t - offset) * TAU);
}

// Rotation with integer turns - N MUST be int
float loopedAngle(float t, float offsetTurns, int N, float angle0) {
    return angle0 + TAU * (offsetTurns + float(N) * t);
}

// Translation on circle - cyclesN MUST be int
vec2 loopedCircle(vec2 start, float t, float radius, float offsetTurns, int cyclesN) {
    float phase = offsetTurns + float(cyclesN) * t;
    return start + radius * vec2(cos(TAU * phase), sin(TAU * phase));
}

// Linear-looking oscillation - cyclesN MUST be int
vec2 loopedOscillate(vec2 start, vec2 dir, float t, float amp, float offsetTurns, int cyclesN) {
    float phase = offsetTurns + float(cyclesN) * t;
    return start + dir * (amp * sin(TAU * phase));
}

// Looping noise via time-circle (4D required for spatial variation)
float loopedNoise(vec2 p, float t, float scale, float offset, float speed) {
    float phase = (t * speed) + offset;
    vec2 tc = vec2(cos(TAU * phase), sin(TAU * phase));
    return noise4D(vec4(p * scale, tc));  // or simplex4D
}
\`\`\`

### ANIMATION PRIMITIVES - USE ONLY THESE

\`\`\`glsl
// For any animated value, use these patterns:
float t = time * TAU;

float pulse = 0.5 + 0.5 * sin(t);     // Smooth 0\u21921\u21920
float wave = sin(t);                   // Smooth -1\u21921\u2192-1
float angle = t;                       // Full rotation (1 turn)
float angle2 = t * 2.0;                // 2 full rotations
vec2 circular = vec2(cos(t), sin(t)); // Circular motion

// For noise: always use timeCircle
vec2 timeCircle = vec2(cos(t), sin(t));
float n = noise(uv * scale + timeCircle * 0.5);
\`\`\`

###  AGENT PRE-SHIP CHECKLIST

**You MUST check each line in your thinking before calling create_effect.**

For EVERY line that contains "time", "t", or animation:

\`\`\`
Line [N]: [code]
  - Contains time? [yes/no]
  - Wrapped in sin/cos? [yes/no]
  - Has * TAU? [yes/no]
  - Multiplier is integer? [yes/no/N/A]
  VERDICT: [SAFE/UNSAFE - fix if unsafe]
\`\`\`

Then complete these global checks:
- [ ] **SEAM CHECK**: Does value(0) == value(1) for EVERY animated value?
- [ ] **DERIVATIVE CHECK**: Does value'(0) == value'(1)? (velocity matches at seam)
- [ ] **ROTATION CHECK**: Is every rotation N * TAU * time where N is INTEGER?
- [ ] **TRANSLATION CHECK**: Does every moving element return to start at t=1?
- [ ] **NOISE CHECK**: Is noise time-sampled via circle, NOT line?
- [ ] **BANNED PATTERN CHECK**: No fract(time), mod(time), uv+time, time*speed outside sin/cos?

**IF ANY CHECK FAILS, THE LOOP IS BROKEN. FIX IT BEFORE SHIPPING.**

### GLSL TEMPLATE (ALWAYS USE)
\`\`\`glsl
#version 300 es
precision highp float;
uniform float time;      // 0\u21921 looping
uniform vec2 resolution;
uniform float myUniform; // your customs
out vec4 fragColor;
#define TAU 6.28318530718

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * TAU;
    // YOUR CODE HERE
    fragColor = vec4(color, 1.0);
}
\`\`\`

### FILTER TEMPLATE (when processing input)
\`\`\`glsl
uniform sampler2D inputTex;
void main() {
    ivec2 sz = textureSize(inputTex, 0);
    vec2 uv = gl_FragCoord.xy / vec2(sz);
    vec4 c = texture(inputTex, uv);
    fragColor = c;
}
\`\`\`

### NOISE FUNCTIONS (copy exactly)
\`\`\`glsl
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {
    vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p, int oct) {
    float v=0., a=.5;
    for(int i=0;i<oct;i++) { v+=a*noise(p); p*=2.; a*=.5; }
    return v;
}
\`\`\`

### VORONOI (copy exactly)
\`\`\`glsl
float voronoi(vec2 p, float jitter) {
    vec2 n = floor(p), f = fract(p);
    float d = 8.;
    for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++) {
        vec2 g = vec2(x,y);
        vec2 o = hash2(n+g) * jitter;
        d = min(d, length(g+o-f));
    }
    return d;
}
\`\`\`

### COLOR TECHNIQUES
\`\`\`glsl
// Palette interpolation
vec3 pal(float t,vec3 a,vec3 b,vec3 c,vec3 d){return a+b*cos(TAU*(c*t+d));}

// HSV\u2192RGB
vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}

// Rainbow cycle: hsv2rgb(vec3(time + uv.x, 1., 1.))
\`\`\`

### EFFECT TYPES & DSL PATTERNS
| Type | What it does | DSL Pattern |
|------|--------------|-------------|
| synth | Generates image from nothing | \`synth().write(o0); render(o0)\` |
| filter | Transforms input image | \`noise().filter().write(o0)\` |
| mixer | Blends multiple inputs | \`a.blend(b).write(o0)\` |
| feedback | Uses previous frame | reads from \`prev\` texture |

### UNIFORM WIRING
\`\`\`javascript
// definition.js format
globals: {
  speed: { type: "float", default: 1.0, min: 0.1, max: 5.0, uniform: "speed" },
  color1: { type: "vec3", default: [1,0.5,0], uniform: "color1" },
  octaves: { type: "int", default: 4, min: 1, max: 8, uniform: "octaves" }
}
\`\`\`

### COMMON MISTAKES \u2192 FIXES
| Symptom | Cause | Fix |
|---------|-------|-----|
| Black output | fragColor not set | Add \`fragColor = vec4(result, 1.0);\` |
| Jumping animation | Raw time usage | Use \`sin(time*TAU)\` not \`time\` |
| "Unknown effect" | Wrong namespace | Use \`search user\` in DSL |
| Static/frozen | No time in shader | Add \`time*TAU\` somewhere |
| Monochrome | No color mixing | Use \`mix(c1,c2,val)\` or HSV |
| Uniform ignored | Name mismatch | Match GLSL name to uniform: field |

### TOOL SEQUENCE (ALWAYS THIS ORDER)
1. \`create_effect(name, glsl, uniforms)\` \u2192 creates your effect
2. \`compile_dsl("search user\\nname().write(o0)\\nrender(o0)")\` \u2192 tests it
3. \`validate_effect()\` \u2192 checks output isn't blank/static

### QUICK REFERENCE
- Aspect ratio: \`resolution.x/resolution.y\`
- Center coords: \`uv - 0.5\` or \`(uv - 0.5) * vec2(aspect, 1.0)\`
- Polar: \`float a = atan(p.y, p.x); float r = length(p);\`
- Rotation: \`mat2(cos(a),-sin(a),sin(a),cos(a)) * p\`
- SDF circle: \`length(p) - radius\`
- Smooth edge: \`smoothstep(edge-blur, edge+blur, d)\`
`;
var CRITICAL_RULES = {
  generate: `
## CRITICAL RULES FOR SHADER GENERATION

###  THE DERIVATIVE RULE - WHY LOOPS FAIL

Matching value(0) == value(1) is **NOT ENOUGH**! The **velocity/derivative** must ALSO match:
- value(0) == value(1)   \u2190 position matches
- value'(0) == value'(1) \u2190 velocity matches (smooth motion through boundary)

If the velocities do not match, a **HARD RESET** occurs at t\u22480.999, even if the values match.
**Use sin(), cos(), or periodicValue() as the time basis for generated animation.**
Use integer cycle counts when these functions receive raw time. Both values and derivatives must match at the loop endpoints.
Do not use raw nonperiodic time as the animation signal. Do not substitute ramps from fract(), mod(), smoothstep(), or custom easing.
Spatial uses of fract(), mod(), and smoothstep() are permitted. Compositions with periodic signals must preserve both endpoint values and derivatives.
Check the final animated result. A function name alone does not guarantee a loop.

### THE BLEUJE PATTERN (Approved Looping Method)

Use a periodic function with an offset. Everything uses the same looping time basis. Each element varies through an offset.

**CORE HELPERS (copy exactly):**
\`\`\`glsl
const float TAU = 6.28318530717958647692;

float normalizedSine(float x) {
    return 0.5 + 0.5 * sin(x);
}

// The Bleuje periodic value: normalized_sine((time - offset) * TAU)
float periodicValue(float time, float offset) {
    return normalizedSine((time - offset) * TAU);
}
\`\`\`

### HARD REQUIREMENTS

1. **SEAM + DERIVATIVE**: value(0)==value(1) AND value'(0)==value'(1). Use sin/cos/periodicValue with integer cycles of raw time. Check both conditions after composition.

2. **ROTATION**: Integer turns only
   - \`angle = angle0 + TAU * (offsetTurns + float(N) * time)\` where N is INTEGER

3. **TRANSLATION**: Oscillate or circle, never linear
   - Circle: \`start + radius * vec2(cos(TAU*phase), sin(TAU*phase))\`
   - Linear-looking: \`start + dir * (amplitude * sin(TAU*phase))\`

4. **NOISE**: Circle-sample (Bleuje tutorial 3)
   - \`vec2 tc = vec2(cos(TAU*time), sin(TAU*time)); noise4D(vec4(uv, tc));\`

\`\`\`glsl
//  CORRECT - smooth value AND velocity through boundary
float t = time * TAU;
float wave = sin(t);                              // Value AND derivative match
float pulse = 0.5 + 0.5 * sin(t);                // Normalized 0\u21921\u21920
vec2 circular = vec2(cos(t), sin(t)) * radius;   // Circular motion

// Multiple speeds - ALL integers!
float slow = sin(t);           // 1 cycle
float fast = sin(t * 2.0);     // 2 cycles
float faster = sin(t * 3.0);   // 3 cycles

// Animated noise - use timeCircle:
vec2 timeCircle = vec2(cos(t), sin(t));
float n = noise(uv * scale + timeCircle * 0.5);
\`\`\`

### Animation Checklist
- [ ] Using sin(time * TAU) or cos(time * TAU)?
- [ ] Cycle multipliers are integers (1, 2, 3...)?
- [ ] Noise uses timeCircle in coordinates?

### User Effect Namespace
The effects you create belong to the USER namespace. They do not belong to synth/filter/etc.
\`\`\`
search user
myEffectName().write(o0)
render(o0)
\`\`\`

### Required GLSL Structure
\`\`\`glsl
#version 300 es
precision highp float;
precision highp int;

uniform float time;        // 0\u21921 looping - use sin(time*TAU)!
uniform vec2 resolution;
// Your custom uniforms here

out vec4 fragColor;

#define TAU 6.28318530718

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * TAU;  // Convert to radians for sin/cos
    // ALL animation must use sin(t) or cos(t)!
    fragColor = vec4(color, 1.0);
}
\`\`\`
`,
  fix: `
##  COMMON FIXES

### "Unknown effect" Error
Your effect lives in USER namespace:
\`\`\`
search user          \u2190 REQUIRED for your effects
yourEffectName().write(o0)
render(o0)
\`\`\`

### Blank/Black Output
1. Check that the shader sets fragColor.
2. Check that the values are not all 0.0.
3. Add: \`fragColor = vec4(uv, 0.5, 1.0);\` to debug

### No Animation / Static
Replace raw \`time\` with \`sin(time * TAU)\`:
\`\`\`glsl
//  Static or jumping
float x = uv.x + time;

//  Smooth animation
float x = uv.x + sin(time * TAU) * 0.5;
\`\`\`

### Monochrome / No Color
Add color mixing:
\`\`\`glsl
vec3 color1 = vec3(1.0, 0.5, 0.0);  // orange
vec3 color2 = vec3(0.0, 0.5, 1.0);  // blue
vec3 finalColor = mix(color1, color2, value);
\`\`\`
`
};

// src/knowledge/search-helpers.ts
var dbInstance = null;
function getShaderKnowledgeDB() {
  if (!dbInstance) {
    dbInstance = new ShaderKnowledgeDB();
    dbInstance.addDocuments(CURATED_KNOWLEDGE);
    dbInstance.buildIndex();
  }
  return dbInstance;
}
function searchShaderKnowledge(query, options = {}) {
  const db = getShaderKnowledgeDB();
  const expandedQuery = expandQueryWithSynonyms(query);
  return db.search(expandedQuery, options);
}
function getKnowledgeByTopic(topic) {
  const db = getShaderKnowledgeDB();
  return db.getByCategory(topic);
}
function extractCodeBlocks(text) {
  const codeBlocks = [];
  const glslRegex = /```glsl\s*([\s\S]*?)```/gi;
  let match;
  while ((match = glslRegex.exec(text)) !== null) {
    if (match[1].trim().length > 20) codeBlocks.push(match[1].trim());
  }
  const genericRegex = /```\s*([\s\S]*?)```/gi;
  while ((match = genericRegex.exec(text)) !== null) {
    const code = match[1].trim();
    if ((code.includes("vec") || code.includes("float") || code.includes("fragColor")) && code.length > 20 && !codeBlocks.includes(code)) {
      codeBlocks.push(code);
    }
  }
  return codeBlocks;
}
function extractUniformsSummary(content) {
  const uniformsMatch = content.match(/globals["\s:]+\{([\s\S]*?)\}/i);
  if (!uniformsMatch) return "";
  const uniformsSection = uniformsMatch[1];
  const uniforms = [];
  const uniformPattern = /"?(\w+)"?\s*:\s*\{\s*"?type"?\s*:\s*"?(\w+)"?/g;
  let match;
  while ((match = uniformPattern.exec(uniformsSection)) !== null) {
    uniforms.push(`${match[1]}: ${match[2]}`);
  }
  return uniforms.length > 0 ? `Uniforms: ${uniforms.join(", ")}` : "";
}
function retrieveForAgent(query, phase, context = {}) {
  const db = getShaderKnowledgeDB();
  let result = CRITICAL_RULES[phase] || "";
  const expandedQuery = expandQueryWithSynonyms(query);
  let searchQuery = expandedQuery;
  if (context.technique) searchQuery += ` ${context.technique}`;
  if (context.error) searchQuery += ` fix ${context.error}`;
  const categoryBoosts = phase === "generate" ? { effect: 1.5, glsl: 1.3, technique: 1.2 } : { errors: 1.5, documentation: 1.2, glsl: 1.1 };
  const rawResults = db.search(searchQuery, { limit: 8, minScore: 0.03 });
  const boostedResults = rawResults.map((r) => ({ ...r, boostedScore: r.score * (categoryBoosts[r.category] || 1) })).sort((a, b) => b.boostedScore - a.boostedScore).slice(0, 4);
  if (boostedResults.length === 0) return result;
  result += "\n## RELEVANT EXAMPLES & PATTERNS\n\n";
  for (const r of boostedResults) {
    result += `### ${r.title || r.id} (${r.category})
`;
    const uniforms = extractUniformsSummary(r.content);
    if (uniforms) result += `${uniforms}
`;
    const dslMatch = r.content.match(/## Usage in DSL\s*```\s*([\s\S]*?)```/i);
    if (dslMatch) result += `DSL: \`${dslMatch[1].trim().replace(/\n/g, " \u2192 ")}\`
`;
    const codeBlocks = extractCodeBlocks(r.content);
    if (codeBlocks.length > 0) {
      result += `\`\`\`glsl
${codeBlocks.slice(0, 2).join("\n\n")}
\`\`\`
`;
    } else {
      const paragraphs = r.content.split(/\n\n+/).filter(
        (p) => p.length > 30 && !p.startsWith("#") && !p.startsWith("```")
      );
      if (paragraphs.length > 0) result += `${paragraphs[0].substring(0, 400)}
`;
    }
    result += "\n";
  }
  return result;
}

// src/knowledge/loop-safe-examples.ts
var LOOPING_EXAMPLES = [
  {
    name: "Animated Pulse Ring",
    technique: "basic",
    description: "Expanding ring with sin(time*TAU) animation",
    code: `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
out vec4 fragColor;

#define TAU 6.283185307179586

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 center = uv - 0.5;
    float dist = length(center);

    // Animation: sin(time * TAU) loops perfectly [0->1->0]
    float t = time * TAU;
    float pulse = 0.5 + 0.5 * sin(t);  // 0->1->0 smoothly

    // Ring expands/contracts with pulse
    float ring = smoothstep(0.02, 0.0, abs(dist - pulse * 0.4));

    vec3 color = vec3(0.2, 0.8, 1.0) * ring;
    fragColor = vec4(color, 1.0);
}`
  },
  {
    name: "Rotating Gradient",
    technique: "rotation",
    description: "Full rotation using integer turn count",
    code: `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
uniform float speed;
out vec4 fragColor;

#define TAU 6.283185307179586

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 center = uv - 0.5;

    // Get angle and rotate it
    float angle = atan(center.y, center.x);

    // CORRECT: Integer rotations (1 full turn per loop)
    // speed should be 1, 2, 3, etc for seamless loop
    float rotation = time * TAU * floor(speed);
    angle += rotation;

    // Create gradient based on rotated angle
    float gradient = 0.5 + 0.5 * sin(angle * 3.0);

    vec3 color = mix(vec3(1.0, 0.3, 0.5), vec3(0.3, 0.5, 1.0), gradient);
    fragColor = vec4(color, 1.0);
}`
  },
  {
    name: "Oscillating Noise",
    technique: "noise",
    description: "Noise with time-circle sampling (Bleuje method)",
    code: `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
uniform float scale;
out vec4 fragColor;

#define TAU 6.283185307179586

// Simple hash for noise
float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
        f.z
    );
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * TAU;

    // TIME-CIRCLE: Map time to a circle for looping noise
    // This is the Bleuje tutorial 3 technique
    float timeX = cos(t);  // x on unit circle
    float timeY = sin(t);  // y on unit circle

    // Sample 3D noise: xy = spatial, z = time-circle
    float n = noise3D(vec3(uv * scale, timeX * 0.5));
    n += 0.5 * noise3D(vec3(uv * scale * 2.0, timeY * 0.5));
    n = n * 0.5 + 0.5;

    vec3 color = vec3(n * 0.8, n * 0.5, n);
    fragColor = vec4(color, 1.0);
}`
  },
  {
    name: "Plasma Wave",
    technique: "wave",
    description: "Classic plasma with proper sin/cos animation",
    code: `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
uniform float scale;
out vec4 fragColor;

#define TAU 6.283185307179586

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * TAU;

    // All wave components use sin/cos with time*TAU
    float v = 0.0;
    v += sin(uv.x * scale + t);
    v += sin(uv.y * scale + t);  // One full time cycle per loop
    v += sin((uv.x + uv.y) * scale * 0.5 + t);
    v += sin(length(uv - 0.5) * scale * 2.0 - t);

    v = v * 0.25 + 0.5;  // Normalize to 0-1

    // Color palette using cos (also loops perfectly)
    vec3 color = 0.5 + 0.5 * cos(TAU * (v + vec3(0.0, 0.33, 0.67)));

    fragColor = vec4(color, 1.0);
}`
  },
  {
    name: "Breathing Circle",
    technique: "scale",
    description: "Pulsing scale with periodicValue helper",
    code: `#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
out vec4 fragColor;

#define TAU 6.283185307179586

// Bleuje periodicValue: returns 0->1->0 smoothly over one loop
float periodicValue(float t, float offset) {
    return 0.5 + 0.5 * sin((t - offset) * TAU);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 center = uv - 0.5;
    float dist = length(center);

    // Three circles with offset phases (Bleuje pattern)
    float c1 = smoothstep(0.02, 0.0, abs(dist - 0.1 - periodicValue(time, 0.0) * 0.2));
    float c2 = smoothstep(0.02, 0.0, abs(dist - 0.15 - periodicValue(time, 0.33) * 0.15));
    float c3 = smoothstep(0.02, 0.0, abs(dist - 0.2 - periodicValue(time, 0.66) * 0.1));

    vec3 color = vec3(c1, c2, c3);
    fragColor = vec4(color, 1.0);
}`
  }
];
function retrieveLoopSafeExamples(technique = "", limit = 2) {
  let examples = LOOPING_EXAMPLES;
  if (technique) {
    const techLower = technique.toLowerCase();
    examples = LOOPING_EXAMPLES.filter(
      (e) => e.technique.includes(techLower) || e.description.toLowerCase().includes(techLower) || e.code.toLowerCase().includes(techLower)
    );
    if (examples.length === 0) {
      examples = LOOPING_EXAMPLES;
    }
  }
  examples = examples.slice(0, limit);
  if (examples.length === 0) {
    return "";
  }
  let result = "## COMPLETE LOOPING SHADER EXAMPLES\n\n";
  result += "Copy these patterns exactly. They loop seamlessly.\n\n";
  for (const ex of examples) {
    result += `### ${ex.name}
`;
    result += `${ex.description}
`;
    result += "```glsl\n" + ex.code + "\n```\n\n";
  }
  return result;
}
function searchByLoopPattern(pattern, limit = 10, getDocuments) {
  const results = [];
  for (const doc of getDocuments()) {
    const tags = doc.tags || [];
    let matches = false;
    if (pattern === "loop-safe") {
      matches = tags.includes("loop-safe");
    } else if (pattern === "loop-unsafe") {
      matches = tags.includes("loop-unsafe");
    } else {
      matches = true;
    }
    if (matches) results.push(doc);
    if (results.length >= limit) break;
  }
  return results;
}

// src/knowledge/dsl-knowledge.ts
var DSL_CRITICAL_RULES = `## MANDATORY WORKFLOW - DO NOT SKIP STEPS

### STEP 1: create_effect (MUST DO FIRST)

Call create_effect with your shader code:
\`\`\`javascript
create_effect({
  name: "myEffectName",  // remember this name!
  glsl: "#version 300 es\\nprecision highp float;\\n...",
  uniforms: { speed: {type: "float", default: 1.0} }
})
\`\`\`

### STEP 2: compile_dsl (ONLY AFTER STEP 1 SUCCEEDS)

Use the EXACT SAME NAME from Step 1:
\`\`\`javascript
compile_dsl({
  dsl: "search user\\nmyEffectName().write(o0)\\nrender(o0)"
})
\`\`\`

"search user" is MANDATORY. Your effect belongs to the USER namespace.
The effect name must EXACTLY match the name you used in create_effect.

### STEP 3: validate_effect

Check if the output looks correct.

## \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

### IF YOU SEE "Unknown effect" ERROR

This error means one of these conditions applies:
1. You called compile_dsl BEFORE create_effect.
2. create_effect FAILED. Check for GLSL errors.
3. The effect name in the DSL does not match the create_effect name.
4. The DSL does not include "search user".

### CORRECT DSL PATTERN FOR YOUR EFFECTS

\`\`\`
search user
yourEffectName().write(o0)
render(o0)
\`\`\`

### WRONG - USING WRONG NAMESPACE

\`\`\`
search synth
yourEffectName().write(o0)  <-- WRONG! Your effect isn't in synth!
render(o0)
\`\`\`

### WRONG - PUTTING GLSL IN DSL

DSL is NOT GLSL. Never put shader code in compile_dsl:
\`\`\`
vec2 uv = gl_FragCoord.xy / resolution;  <-- WRONG! This is GLSL, not DSL!
\`\`\`

### VALID BUILT-IN DSL FUNCTIONS (these exist in synth/filter/etc)

**GENERATORS (synth) - start chains:**
noise, fractal, voronoi, cell, polygon, solid, shape, curl, ca

**FILTERS (filter) - extend chains:**
blur, warp, bloom, posterize, edge, vignette, grain, rotate, scale

**YOUR EFFECTS (user) - ONLY after create_effect:**
yourCustomEffect (whatever name you gave it)

### DSL ERROR CODES AND FIXES

| Error Code | Meaning | Fix |
|------------|---------|-----|
| **S001** | Unknown effect | Check that create_effect succeeded first. Check the exact name. Check for "search user". |
| **S005** | Illegal chain | A generator is in the middle of a chain. Generators must be first. |
| **S006** | Missing write() | Add \`.write(o0)\` at end of chain |

### PARAMETER NAMES - USE analyze_effect TO DISCOVER

**Problem: "Starter chain missing write()"**
Fix: Add .write(o0): \`noise().write(o0)\`

**Problem: Using effect path instead of function name**
Fix: Use \`noise()\` not \`synth/noise()\`

**Problem: Using GLSL in DSL**
Fix: DSL is high-level: \`noise().write(o0)\` not \`vec2 uv = ...\`

### Parameter Syntax in DSL

**Named parameters:** \`noise(xScale: 50, ridges: true, seed: 42)\`
**Surface references:** \`read(o0)\`, \`read3d(vol0)\`, \`read3d(geo0)\`
**Enum values (unquoted):** \`colorMode: rgb\`, \`blendMode: multiply\`
`;
var DSL_SCAFFOLDING_PATTERNS = `## DSL Scaffolding Patterns

The DSL program structure depends on the effect type.

### Effect Type Detection

1. **STARTER (synth/*):** The effect needs no input.
2. **Has a tex: parameter:** The effect is a mixer and needs two inputs.
3. **3D effect:** The chain needs render3d() at the end.
4. **POINTS effect:** You MUST wrap the effect with pointsEmit/pointsRender.

### SCAFFOLDING: Starter (synth/)
\`\`\`
search synth
myEffect(param1: value).write(o0)
render(o0)
\`\`\`

### SCAFFOLDING: Filter (filter/)
\`\`\`
search synth, filter
noise(ridges: true).myFilter(param1: value).write(o0)
render(o0)
\`\`\`

### SCAFFOLDING: Mixer (mixer/)
\`\`\`
search synth, mixer
noise(seed: 1, ridges: true).write(o0)
gradient().myMixer(tex: read(o0), blend: 0.5).write(o1)
render(o1)
\`\`\`

### SCAFFOLDING: Points (points/) - CRITICAL
\`\`\`
search points, synth, render
noise().pointsEmit().myPointsEffect(param: 1.0).pointsRender().write(o0)
render(o0)
\`\`\`

### SCAFFOLDING: Loop (feedback)
\`\`\`
search synth, filter
noise(ridges: true).loopBegin(alpha: 95).warp().loopEnd().write(o0)
render(o0)
\`\`\`

### SCAFFOLDING: 3D Generator (synth3d/)
\`\`\`
search synth3d, filter3d, render
myEffect3d(volumeSize: x32).render3d().write(o0)
render(o0)
\`\`\`

### SCAFFOLDING: User-Created Effect (user/) - MOST COMMON
\`\`\`
search user
myCustomEffect().write(o0)
render(o0)
\`\`\`

ALL effects created with create_effect belong to the 'user' namespace.
The DSL MUST use 'search user' to find these effects.

### Search Directive by Namespace

| Namespace | Search Directive |
|-----------|------------------|
| **user** | **\`search user\`** (YOUR created effects!) |
| synth | \`search synth\` |
| filter | \`search synth, filter\` |
| mixer | \`search synth, mixer\` |
| points | \`search points, synth, render\` |
| synth3d | \`search synth3d, filter3d, render\` |

### CRITICAL RULES

1. ALWAYS wrap points effects with pointsEmit/pointsRender.
2. ALWAYS end 3D effect chains with render3d().
3. ALWAYS chain filters from a generator. Never use filters alone.
4. ALWAYS supply a tex: read(surface) parameter to mixers.
5. Always use noise() with ridges: true as the default starter.`;
var DSL_REFERENCE = `## Polymorphic DSL Grammar

Structure: \`SearchDirective Statement* RenderDirective\`

### Required Components

1. **SearchDirective** (first line): \`search <namespace1>, <namespace2>, ...\`
2. **Statements**: Effect chains ending with \`.write(surface)\`
3. **RenderDirective** (last line): \`render(o0)\`

### Namespaces

| Namespace | Type | Purpose |
|-----------|------|---------|
| synth | Starter | 2D generators |
| filter | Processor | 2D transforms |
| mixer | Combiner | Blend two sources |
| points | Simulation | Agent/particle behaviors |
| render | Utility | pointsEmit, pointsRender, loops |
| synth3d | Starter | 3D volumetric generators |
| filter3d | Processor | 3D volumetric transforms |

### Parameter Syntax

- Numbers: \`4.0\`, \`10\`, \`-0.5\`
- Texture reads: \`read(o0)\`, \`read3d(vol0)\`
- Enums: \`rainbow\`, \`multiply\`, \`circle\`

### Surface References

- \`o0\`-\`o7\`: 2D surfaces
- \`vol0\`-\`vol7\`: 3D volumes
- \`geo0\`-\`geo7\`: 3D geometry
- \`read(surface)\`: Read previous frame
- \`write(surface)\`: Write to surface

### CRITICAL RULES

1. Namespaces are NOT functions. NEVER call \`synth()\` or \`filter()\`
2. Every chain MUST end with \`.write(surface)\`
3. The search directive is MANDATORY on the first line.
4. render() is MANDATORY on the last line.
5. Use YOUR effect name from create_effect instead of a library name.`;

// src/knowledge/effect-catalog.ts
var EFFECT_CATALOG = `## Effect Catalog

**Do NOT guess parameter names.** Copy parameter names exactly from the example programs below or from the exemplar programs.
If no example shows parameters for an effect, use that effect with NO parameters. The effect then uses its defaults.

### SYNTH (Generators) - Start chains, create images from nothing
noise, fractal, julia, mandelbrot, newton, cell, perlin, curl, gabor, gradient,
media, mnca, modPattern, osc2d, pattern, polygon, rd, roll, ca, scope, shape,
solid, spectrum, subdivide, testPattern

### SYNTH3D (3D Volume Generators) - Use with render3d()
noise3d, fractal3d, cell3d, flythrough3d, shape3d, rd3d, ca3d

### FILTER (Processors) - Chain after generators
adjust, bloom, blur, bulge, celShading, cf, channel, chroma, chromaticAberration,
clouds, corrupt, crt, degauss, deriv, dither, edge, emboss, feedback,
fibers, flipMirror, fxaa, glowingEdge, glyphMap, grade, grain, grime, historicPalette,
inv, lens, lensWarp, lightLeak, lighting, lowPoly, motionBlur, normalMap,
normalize, octaveWarp, osd, outline, palette, pinch, pixelSort, pixels, polar,
posterize, prismaticAberration, reindex, repeat, reverb, ridge, rot, scale,
scanlineError, scratches, scroll, seamless, sharpen, simpleAberration, sine, skew,
smooth, smoothstep, snow, sobel, spatter, spiral, spookyTicker, step, strayHair,
tetraColorArray, tetraCosine, text, texture, thresh, tile, tint, translate, tunnel,
vaseline, vignette, warp, waves, wobble, wormhole, zoomBlur

### FILTER3D (3D Volume Processors)
flow3d

### POINTS (Particle Systems) - Use with pointsEmit()/pointsRender()
flow, physical, flock, attractor, life, hydraulic, dla, physarum, lenia

### RENDER (Pipeline Utilities)
render3d, renderLit3d, pointsEmit, pointsRender, pointsBillboardRender,
loopBegin, loopEnd, meshLoader, meshRender

### MIXER (Two-input blending) - Require tex: read(oN) parameter
blendMode, alphaMask, applyMode, cellSplit, centerMask, distortion, focusBlur,
patternMix, shadow, shapeMask, split, thresholdMix, uvRemap

### CLASSIC EFFECTS (classicNoisedeck namespace)
background, bitEffects, caustic, cellNoise, cellRefract, coalesce, colorLab,
composite, depthOfField, displaceMixer, effects, fractal, glitch, kaleido,
lensDistortion, moodscape, noise, noise3d, palette, pattern, quadTap, refract,
shapeMixer, shapes, shapes3d, splat, tunnel, warp

### CLASSIC EFFECTS (classicNoisemaker namespace)
kaleido, refract

### Parameter Examples (REAL, VERIFIED from working programs)
\`\`\`
noise(noiseType: 10, octaves: 2, xScale: 75, yScale: 75, ridges: true, colorMode: 6, hueRotation: 45, hueRange: 25, kaleido: 1, palette: afterimage)
shapes(loopAAmp: 50, loopAOffset: 60, loopAScale: 21, loopBAmp: 42, loopBOffset: 120, loopBScale: 54, palette: netOfGems, wrap: true)
cellNoise(scale: 75, cellScale: 87, cellSmooth: 11, cellVariation: 50, colorMode: 0, palette: royal)
fractal(fractalType: 0, zoomAmt: 0, rotation: 0, speed: 30, offsetX: 70, offsetY: 50, iterations: 50, colorMode: 4, palette: dealerHat)
pattern(patternType: 1, scale: 80, rotation: 0, lineWidth: 100, animation: 0, speed: 1, color1: #ffea31, color2: #000000)
solid(color: #000)
polygon(radius: 0.7, fgAlpha: 0.1, bgAlpha: 0)
text(text: "hello", font: "Audiowide", size: 0.09, posX: 0.375, color: #ffffff)
pointsEmit(stateSize: x64, attrition: 2.63)
physical(gravity: 0, energy: 0.98, drag: 0.125)
pointsRender(density: 100, inputIntensity: 20)
pointsBillboardRender(tex: read(o0), pointSize: 40, sizeVariation: 50, rotationVariation: 50)
loopBegin(alpha: 95, intensity: 95)
warp()
bloom(taps: 15)
blur(radiusX: 5)
vignette()
lens(displacement: -0.5)
chromaticAberration(aberrationAmt: 25)
coalesce(tex: read(o0), blendMode: 8, mixAmt: -51, refractAAmt: 0, refractBAmt: 71)
blendMode(tex: read(o0), mode: multiply)
lensDistortion(aberrationAmt: 100, distortion: -48, opacity: 12, shape: 0, tint: #b42f2d, vignetteAmt: -46)
colorLab(colorMode: 2, dither: 0, hueRange: 100, hueRotation: 0, levels: 2, palette: seventiesShirt)
effects(effect: 4, effectAmt: 2, flip: 0, offsetX: 0, offsetY: 0, rotation: 0, scaleAmt: 100)
posterize(levels: 6)
outline()
adjust(mode: hsv)
adjust(rotation: 120, hueRange: 40)
adjust()
\`\`\`
`;

// src/knowledge/effect-definition.ts
var EFFECT_DEFINITION_REFERENCE = `## Effect Definition Specification

An effect is a JavaScript module that exports an Effect instance.

### Minimal Structure

\`\`\`javascript
import { Effect } from '../../../src/runtime/effect.js'

export default new Effect({
  name: "MyEffect",           // Human-readable name
  namespace: "synth",         // Pipeline namespace
  func: "myEffect",           // DSL function name
  tags: ["noise"],            // Searchable tags
  description: "...",

  globals: {
    myParam: {
      type: "float",
      default: 1.0,
      uniform: "myParam",
      min: 0.0, max: 10.0,
      ui: { label: "My Parameter", control: "slider" }
    }
  },

  passes: [{
    name: "main",
    program: "myShader",      // Maps to glsl/myShader.glsl
    inputs: {},               // For starters: empty
    outputs: { fragColor: "outputTex" }
  }]
})
\`\`\`

### Uniform Types

| Type | GLSL | Default Format |
|------|------|----------------|
| float | float | Number: \`1.0\` |
| int | int | Number: \`4\` |
| boolean | bool | Boolean: \`false\` |
| vec2 | vec2 | **Array**: \`[0.5, 0.5]\` |
| vec3 | vec3 | **Array**: \`[1.0, 0.0, 0.5]\` |
| vec4 | vec4 | **Array**: \`[1.0, 0.0, 0.5, 1.0]\` |

**CRITICAL: vec defaults MUST be arrays, NOT objects!**

### Uniform Properties

\`\`\`javascript
myUniform: {
  type: "float",
  default: 1.0,
  uniform: "myUniform",       // GLSL uniform name
  min: 0.0, max: 10.0,
  step: 0.1,
  choices: { opt1: 0, opt2: 1 },  // For dropdowns
  ui: {
    label: "Display Name",
    control: "slider",        // slider, checkbox, dropdown, button, color
    category: "transform",    // Group controls (camelCase only!)
    enabledBy: "otherUniform"
  }
}
\`\`\`

### Multi-Pass Effects

\`\`\`javascript
textures: {
  _temp: { width: "input", height: "input", format: "rgba8unorm" }
},
passes: [
  { name: "pass1", program: "blur1", inputs: { inputTex: "inputTex" }, outputs: { fragColor: "_temp" } },
  { name: "pass2", program: "blur2", inputs: { inputTex: "_temp" }, outputs: { fragColor: "outputTex" } }
]
\`\`\``;
var EFFECT_DEFINITION_DEEP = `## Effect Definition Details

### The Three Data Flows

1. **Uniform Flow** (CPU \u2192 GPU): globals \u2192 GLSL uniforms
2. **Texture Flow** (GPU \u2192 GPU): passes inputs/outputs
3. **Pass Execution**: Sequential shader programs

### Reserved Texture Names

| Name | Direction | Purpose |
|------|-----------|---------|
| inputTex | Read | Input from chain |
| outputTex | Write | Output to chain |
| inputTex3d | Read | 3D volume input |
| outputTex3d | Write | 3D volume output |
| inputGeo | Read | Geometry buffer |

### Effect Types by I/O Pattern

**STARTER (synth/):** passes[].inputs = {} (empty)
**FILTER (filter/):** passes[].inputs = { inputTex: "inputTex" }
**MIXER (mixer/):** Has tex: { type: "surface" } in globals

### Special Pass Properties

- \`repeat: "iterations"\` - Run pass N times
- \`pingpong: ["_a", "_b"]\` - Swap textures each iteration
- \`drawBuffers: 2\` - Multiple render targets
- \`drawMode: "points"\` - Particle rendering
- \`blend: true\` - Additive blending`;
var EFFECT_ANATOMY_KNOWLEDGE = `## Effect Anatomy - Deep Knowledge

### Namespace Roles (300+ Library Effects)

| Namespace | Role | DSL Pattern |
|-----------|------|-------------|
| synth/ | Starters | \`noise().write(o0)\` |
| filter/ | Processors | \`noise().blur().write(o0)\` |
| mixer/ | Blenders | \`a.write(o0)\\nb.mixer(tex:read(o0)).write(o1)\` |
| points/ | Agents | \`noise().pointsEmit().flow().pointsRender().write(o0)\` |
| render/ | Pipeline | Wrappers: pointsEmit, render3d, loops |
| synth3d/ | 3D volumes | \`noise3d().render3d().write(o0)\` |

### Common Uniform Patterns

**Animation:** \`speed: { type: "int", default: 0, min: -5, max: 5 }\`
**Scale:** \`xScale: { type: "float", default: 75, min: 1, max: 100 }\`
**Seed:** \`seed: { type: "int", default: 1, min: 1, max: 100 }\`
**Toggle:** \`ridges: { type: "boolean", default: false }\`
**Color:** \`tint: { type: "vec3", default: [1.0, 1.0, 1.0], ui: { control: "color" } }\`

### Multi-Pass Pattern (bloom)

\`\`\`javascript
textures: {
  _bright: { width: "input", height: "input", format: "rgba16float" },
  _bloom: { width: "input", height: "input", format: "rgba16float" }
},
passes: [
  { name: "bright", program: "bright", inputs: { inputTex: "inputTex" }, outputs: { fragColor: "_bright" } },
  { name: "blur", program: "blur", inputs: { inputTex: "_bright" }, outputs: { fragColor: "_bloom" } },
  { name: "final", program: "composite", inputs: { inputTex: "inputTex", bloomTex: "_bloom" }, outputs: { fragColor: "outputTex" } }
]
\`\`\`

### Points/Agents State Textures

- \`global_xyz\`: [x, y, heading, alive]
- \`global_vel\`: [vx, vy, age, seed]
- \`global_rgba\`: [r, g, b, a]

### What Makes a "Good" Effect

1. 2-6 meaningful uniforms
2. Smooth animation (sin/cos of time*TAU)
3. Wrap/seed controls
4. Proper min/max ranges
5. Visible uniform changes`;
var REQUIRED_PATTERNS = `## REQUIRED Patterns

### GLSL Requirements

| Requirement | Correct Pattern |
|-------------|-----------------|
| Aspect ratio | \`#define aspectRatio (resolution.x / resolution.y)\` |
| Animated UV offset | \`uv + vec2(sin(time * TAU), cos(time * TAU))\` |
| Animated noise | \`noise(pos + vec2(sin(time * TAU), cos(time * TAU)) * 0.5)\` |
| Uniform declaration | Declare all uniforms from definition.js in GLSL |

### DSL Requirements

| Requirement | Correct Pattern |
|-------------|-----------------|
| Generator call | \`noise().write(o0)\` |
| Search directive | First line: \`search synth\` |
| Render call | Last line: \`render(o0)\` |

### Definition Requirements

| Requirement | Correct Pattern |
|-------------|-----------------|
| Vec2 defaults | \`default: [0.5, 0.5]\` (array format) |
| Custom uniforms | Always add 2-6 uniforms |
| Category format | \`category: "colorGrading"\` (camelCase) |`;

// src/knowledge/glsl-reference.ts
var GLSL_REFERENCE = `## GLSL Shader Format

### Required Structure

\`\`\`glsl
#version 300 es
precision highp float;
precision highp int;

uniform float time;           // 0\u21921 looping! Use sin(time * TAU)
uniform vec2 resolution;

uniform float myParam;        // Your custom uniforms

out vec4 fragColor;

#define PI 3.14159265359
#define TAU 6.28318530718
#define aspectRatio (resolution.x / resolution.y)

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * TAU;     // Convert to radians
    vec3 color = vec3(uv, 0.5 + 0.5 * sin(t));
    fragColor = vec4(color, 1.0);
}
\`\`\`

##  WILL IT LOOP - SEAMLESS ANIMATION RULES

**This section has the highest priority for animation. You must understand all its rules.**

### Core Definition

Treat \`time\` as **1-periodic** on **[0, 1]**: \`t=1\` must be IDENTICAL to \`t=0\`.
All time-driven values must be continuous across the boundary with NO visible "pop" at the seam.

The approved method comes from \xC9tienne Jacob / Bleuje:
1. Use a periodic function with an offset or delay.
2. Use the same looping time basis for everything.
3. Vary each element through an offset.

Reference: [bleuje.com/tutorial2](https://bleuje.com/tutorial2/) and [bleuje.com/tutorial3](https://bleuje.com/tutorial3/)

### THE DERIVATIVE RULE (Why Loops Fail)

**Matching value(0) == value(1) is NOT ENOUGH!**
The **velocity/derivative** must ALSO match, or you get a "hard reset" at t\u22480.999.

**Use sin(), cos(), or periodicValue() as the time basis for generated animation.**
Use integer cycle counts when these functions receive raw time. Both values and derivatives must match at the loop endpoints.
Do not use raw nonperiodic time as the animation signal. Do not substitute ramps from fract(), mod(), smoothstep(), or custom easing.
Spatial uses of fract(), mod(), and smoothstep() are permitted. Compositions with periodic signals must preserve both endpoint values and derivatives.
Check the final animated result. A function name alone does not guarantee a loop.

### HARD REQUIREMENTS (Check ALL Before Shipping)

1. **SEAM EQUALITY + DERIVATIVE CONTINUITY**
   - For EVERY animated value: value(0) == value(1) AND value'(0) == value'(1)
   - sin/cos with integer cycles of raw time satisfy BOTH conditions. Check both conditions after composition.
   - If the value controls motion, the seam must not create a visible kink

2. **ROTATION = INTEGER TURNS**
   - Canonical form: \`angle(t) = angle0 + (offset * TAU) + (N * TAU * time)\`
   - N MUST be INTEGER (1, 2, 3). Non-integer N = incomplete turn = seam!
   -  \`angle = TAU * time\` (1 turn)  \`angle = 2.0 * TAU * time\` (2 turns)
   -  \`angle = 1.5 * TAU * time\` (BROKEN - 1.5 turns = incomplete!)

3. **TRANSLATION = CLOSED LOOP**
   - Must return to EXACT starting point at t=1
   - Circle: \`start + radius * vec2(cos(TAU * phase), sin(TAU * phase))\`
   - Oscillation: \`start + dir * (amplitude * sin(TAU * phase))\`
   - Pattern: \`pos = start + radius * vec2(cos(TAU*time), sin(TAU*time))\`

4. **NOISE = TIMECIRCLE PATTERN** (Bleuje Tutorial 3)
   - Map time to a circle.
   - Sample noise at that point:
   - \`vec2 tc = vec2(cos(TAU*time), sin(TAU*time)); noise(uv + tc*0.5);\`

### THE BLEUJE PATTERN - Periodic Function + Offset

The "Bleuje pattern" (from shader artist \xC9tienne Jacob) is the approved method:
**periodicValue(time, offset)** = a periodic function evaluated at (time - offset)

\`\`\`glsl
// THE BLEUJE PATTERN - copy this exactly:
#define TAU 6.28318530717958647692

float normalizedSine(float x) {
    return 0.5 + 0.5 * sin(x);
}

float periodicValue(float time, float offset) {
    return normalizedSine((time - offset) * TAU);  // Returns 0\u21921\u21920 smoothly
}

// With offset, different objects animate at different phases:
float wave1 = periodicValue(time, 0.0);   // Starts at 0.5, rises
float wave2 = periodicValue(time, 0.25);  // Starts at 1.0, falls
float wave3 = periodicValue(time, 0.5);   // Starts at 0.5, falls
float wave4 = periodicValue(time, 0.75);  // Starts at 0.0, rises
\`\`\`

###  CORRECT Animation Examples

\`\`\`glsl
float t = time * TAU;
float wave = sin(t);                              // Smooth loop
float pulse = 0.5 + 0.5 * sin(t);                // Normalized 0\u21921\u21920
float oscillate = amplitude * sin(t);            // Oscillation
vec2 circular = radius * vec2(cos(t), sin(t));   // Circle motion

// Multiple speeds - ALL MUST BE INTEGERS!
float slow = sin(t);           // 1 cycle
float fast = sin(t * 2.0);     // 2 cycles
float faster = sin(t * 3.0);   // 3 cycles

// Integer rotation
float angle = TAU * time;        // 1 full turn
float angle = 2.0 * TAU * time;  // 2 full turns

// Looping noise - time on a circle:
vec2 tc = vec2(cos(t), sin(t));
float n = noise4D(vec4(uv * scale, tc));
\`\`\`

### Animation Primitives (use these for all animation)

\`\`\`glsl
float t = time * TAU;                    // Convert to radians first
float pulse = 0.5 + 0.5 * sin(t);       // Smooth 0\u21921\u21920
float wave = sin(t);                     // Smooth -1\u21921\u2192-1
float angle = t * 2.0;                   // 2 full rotations
vec2 circular = vec2(cos(t), sin(t));   // Circular motion
vec2 timeCircle = vec2(cos(t), sin(t)); // For noise animation
float n = noise(uv * scale + timeCircle * 0.5);  // Animated noise
\`\`\`

### Looping Helpers (copy exactly)

\`\`\`glsl
// Rotation: N MUST be integer
float loopedAngle(float time, float offsetTurns, int N, float angle0) {
    return angle0 + TAU * (offsetTurns + float(N) * time);
}

// Translation on circle: cyclesN MUST be integer
vec2 loopedCircle(vec2 start, float time, float radius, float offsetTurns, int cyclesN) {
    float phase = offsetTurns + float(cyclesN) * time;
    return start + radius * vec2(cos(TAU * phase), sin(TAU * phase));
}

// Linear-looking oscillation: cyclesN MUST be integer
vec2 loopedOscillate(vec2 start, vec2 dir, float time, float amp, float offsetTurns, int cyclesN) {
    float phase = offsetTurns + float(cyclesN) * time;
    return start + dir * (amp * sin(TAU * phase));
}

// Looping noise via time-circle (4D noise required for spatial variation)
float loopedNoise(vec2 p, float time, float scale, float offset, float speed) {
    float phase = (time * speed) + offset;
    vec2 tc = vec2(cos(TAU * phase), sin(TAU * phase));
    return noise4D(vec4(p * scale, tc));  // or simplex4D
}

// Looped scalar (brightness, scale, alpha, etc.)
float loopedScalar(float base, float time, float offset, float amp, int cyclesN) {
    float phase = offset + float(cyclesN) * time;
    return base + amp * sin(TAU * phase);
}
\`\`\`

### Animation Checklist

**Check that your shader uses these patterns:**

- [ ] Animation uses sin(time * TAU) or cos(time * TAU)
- [ ] Cycle multipliers are integers (1, 2, 3...)
- [ ] Rotation completes full turns: angle = N * TAU * time
- [ ] Noise uses timeCircle: vec2(cos(t), sin(t)) in coordinates

### Stable Hash (for seeded loops)
\`\`\`glsl
uint hash_u32(uint x) {
    x ^= x >> 16u;
    x *= 0x7FEB352Du;
    x ^= x >> 15u;
    x *= 0x846CA68Bu;
    x ^= x >> 16u;
    return x;
}

float hash01(uint x) {
    return float(hash_u32(x) & 0x00FFFFFFu) / float(0x01000000u);
}
\`\`\`

### Filter Shader (with input)

\`\`\`glsl
uniform sampler2D inputTex;

void main() {
    ivec2 texSize = textureSize(inputTex, 0);
    vec2 uv = gl_FragCoord.xy / vec2(texSize);
    vec4 color = texture(inputTex, uv);
    fragColor = color;
}
\`\`\`

### Hash/Random
\`\`\`glsl
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
\`\`\`

### Value Noise
\`\`\`glsl
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i), b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
\`\`\`

### FBM
\`\`\`glsl
float fbm(vec2 p, int octaves) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < octaves; i++) {
        v += a * noise(p); p *= 2.0; a *= 0.5;
    }
    return v;
}
\`\`\`

### Color Palette
\`\`\`glsl
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(TAU * (c * t + d));
}
\`\`\`

### HSV to RGB
\`\`\`glsl
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
\`\`\`

### Distance Field Shapes

\`\`\`glsl
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
\`\`\`

### Rotation
\`\`\`glsl
vec2 rotate2D(vec2 st, float a) {
    st -= 0.5;
    st = mat2(cos(a), -sin(a), sin(a), cos(a)) * st;
    return st + 0.5;
}
\`\`\`

### Wrap Modes
\`\`\`glsl
if(wrap==0) uv = abs(mod(uv+1.,2.)-1.);  // mirror
else if(wrap==1) uv = fract(uv);          // repeat
else uv = clamp(uv, 0., 1.);              // clamp
\`\`\`

### PCG Random (high quality)
\`\`\`glsl
uvec3 pcg(uvec3 v) {
    v = v*1664525u+1013904223u;
    v.x+=v.y*v.z; v.y+=v.z*v.x; v.z+=v.x*v.y;
    v^=v>>16u;
    v.x+=v.y*v.z; v.y+=v.z*v.x; v.z+=v.x*v.y;
    return v;
}
\`\`\`

### Luminance
\`\`\`glsl
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
\`\`\``;
var GLSL_RECIPES = `## GLSL Recipes

### Animated Plasma
\`\`\`glsl
float t = time * TAU * speed;
float v = sin(uv.x * scale + t) + sin(uv.y * scale + t);
v += sin((uv.x + uv.y) * scale + t) + sin(length(uv - 0.5) * scale * 2.0 + t);
vec3 col = 0.5 + 0.5 * cos(TAU * (v * 0.25 + vec3(0.0, 0.33, 0.67)));
\`\`\`

### Raymarched Sphere
\`\`\`glsl
float sdSphere(vec3 p, float r) { return length(p) - r; }
vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        sdSphere(p+e.xyy,1.0)-sdSphere(p-e.xyy,1.0),
        sdSphere(p+e.yxy,1.0)-sdSphere(p-e.yxy,1.0),
        sdSphere(p+e.yyx,1.0)-sdSphere(p-e.yyx,1.0)
    ));
}
\`\`\`

### Kaleidoscope
\`\`\`glsl
vec2 c = (gl_FragCoord.xy - resolution * 0.5) / min(resolution.x, resolution.y);
float a = atan(c.y, c.x);
float r = length(c);
float seg = TAU / float(segments);
a = mod(a, seg);
if (mod(floor(atan(c.y, c.x) / seg), 2.0) > 0.5) a = seg - a;
vec2 transformed = vec2(cos(a), sin(a)) * r;
\`\`\`

### Voronoi
\`\`\`glsl
vec2 cell = floor(uv * cellCount);
float minDist = 10.0;
for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
        vec2 n = cell + vec2(x, y);
        vec2 pt = n + hash(n) * jitter;
        minDist = min(minDist, distance(uv * cellCount, pt));
    }
}
\`\`\`

### Domain Warping
\`\`\`glsl
vec2 warp = uv + 0.1 * vec2(
    noise(uv * 4.0 + seed),
    noise(uv * 4.0 + seed + 100.0)
);
float n = noise(warp * 8.0);
\`\`\`

### 3D Perspective Grid (Synthwave/Vaporwave Flyover)
Classic 80s aesthetic with perspective grid floor and gradient sky.
\`\`\`glsl
// Horizon line splits screen
float horizon = 0.4;
float t = time * TAU;

// Sky gradient (top portion)
if (uv.y > horizon) {
    float skyT = (uv.y - horizon) / (1.0 - horizon);
    vec3 skyBot = vec3(0.8, 0.2, 0.6);  // Hot pink
    vec3 skyTop = vec3(0.1, 0.0, 0.2);  // Deep purple
    color = mix(skyBot, skyTop, skyT);
} else {
    // Perspective grid (bottom portion)
    float z = horizon / (horizon - uv.y);  // Perspective depth
    float x = (uv.x - 0.5) * z;            // Perspective X
    z += t * speed;                        // Animation

    // Grid lines
    float gridX = abs(fract(x * gridScale) - 0.5);
    float gridZ = abs(fract(z * gridScale) - 0.5);
    float grid = min(gridX, gridZ);
    grid = smoothstep(0.02, 0.05, grid);

    // Grid color with depth fade
    vec3 gridColor = vec3(0.0, 1.0, 1.0);  // Cyan
    float fade = 1.0 / (1.0 + z * 0.1);    // Fade with depth
    color = mix(gridColor, vec3(0.0), grid) * fade;
}
\`\`\`

### Sun/Circle with Glow
\`\`\`glsl
vec2 center = vec2(0.5, horizon);
float dist = length(uv - center);
float sun = smoothstep(sunRadius + 0.02, sunRadius, dist);
float glow = exp(-dist * 3.0) * 0.5;
vec3 sunColor = vec3(1.0, 0.3, 0.5);
color += sunColor * (sun + glow);
\`\`\`

### Scanlines Effect
\`\`\`glsl
float scanline = sin(uv.y * resolution.y * 0.5) * 0.5 + 0.5;
color *= 0.8 + 0.2 * scanline;
\`\`\`

## PROVEN LOOPING IMPLEMENTATIONS FROM NOISEMAKER

These are **real, working implementations** from the Noisemaker effect library.
**Study these patterns. They show exactly how to create loops without visible seams.**

### EXAMPLE 1: synth/noise - Periodic Function with Time Blend

**Technique:** Use a periodic function to blend noise values over time.
The noise lattice does not animate. \`periodicFunction(time)\` modulates the blend parameter to create smooth cyclic variation.

\`\`\`glsl
// From synth/noise - the periodicFunction approach
float periodicFunction(float p) {
    // Maps p (0..1) to a cosine wave (0..1), creating smooth looping
    return (cos(p * TAU) + 1.0) * 0.5;  // 0\u21921\u21920 as p goes 0\u21921
}

// In main():
float t = time + spatialOffset(st);  // time plus spatial variation
float blend = periodicFunction(t) * amplitude;  // Smoothly loops!

// Use blend as parameter in noise evaluation
vec3 color = multires(st, freq, octaves, seed, blend);
\`\`\`

The noise function is stationary. Only the \`blend\` parameter oscillates through \`periodicFunction(time)\`. The noise coordinates stay fixed.

### EXAMPLE 2: synth/perlin - Two Approaches for Different Dimensions

**2D Mode: Rotating Gradient Angles**
The gradient vectors at each lattice point rotate with time. This rotation keeps the noise structure coherent and creates smooth animation.

\`\`\`glsl
// From synth/perlin (2D mode) - gradients rotate with time
float grid2D(vec2 st, vec2 cell, float timeAngle, float channelOffset) {
    // Base gradient angle from hash
    float angle = prng(vec3(cell + float(seed), 1.0)).r * TAU;

    // KEY: Add time as rotation - completes INTEGER turns over time 0\u21921
    angle += timeAngle + channelOffset * TAU;  // timeAngle = time * TAU

    vec2 gradient = vec2(cos(angle), sin(angle));
    vec2 dist = st - cell;
    return dot(gradient, dist);
}

// Usage: timeAngle = time * TAU
float n = noise2D(st, time * TAU, 0.0);  // Loops perfectly
\`\`\`

**3D Mode: Periodic Z-Axis**
Sample a 3D noise volume where the Z-axis wraps at a defined period.
Time maps linearly to Z, which wraps seamlessly.

\`\`\`glsl
// From synth/perlin (3D mode) - periodic z-axis
const float Z_PERIOD = 4.0;  // Period length in z-axis lattice units

float wrapZ(float z) {
    return mod(z, Z_PERIOD);  // Z coordinates wrap for seamless tiling
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    // Wrap z indices for periodicity
    float iz0 = wrapZ(i.z);
    float iz1 = wrapZ(i.z + 1.0);

    // Sample corners with wrapped z
    float n000 = dot(grad3(vec3(i.xy, iz0) + vec3(0,0,0)), f - vec3(0,0,0));
    // ... etc for all 8 corners
}

// Usage: time 0\u21921 maps to z 0\u2192Z_PERIOD, which wraps seamlessly
float z = time * Z_PERIOD;  // or time / TAU * Z_PERIOD
float n = noise3D(vec3(uv * scale, z));
\`\`\`

The noise volume is periodic in the Z dimension.
When time reaches 1.0, z wraps to 0.0 identically.

### EXAMPLE 3: filter/tunnel - Integer Speed for Perfect Loops

**Technique:** When speed is an INTEGER, the tunnel advances by exactly N cells. It ends at its starting position. Non-integer speed creates seams.

\`\`\`glsl
// From filter/tunnel - integer speed requirement
void main() {
    vec2 centered = uv - 0.5;
    float a = atan(centered.y, centered.x);
    float r = length(centered);

    // Tunnel coordinates
    vec2 tunnelCoords = smod(vec2(
        0.3 / r + time * speed,           // speed MUST BE INTEGER for loop!
        a / PI + time * -tunnelRotation   // tunnelRotation MUST BE INTEGER!
    ), 1.0);

    fragColor = texture(inputTex, tunnelCoords);
}
\`\`\`

**Why it works:**
- If \`speed = 1\`, the tunnel advances by exactly 1.0 in UV space
- \`smod(x, 1.0)\` wraps, so position at t=1 equals position at t=0
- If \`speed = 1.5\`, it advances by 1.5 - the remainder creates a visible seam!

**The rule:** Any uniform that multiplies time in a modular space MUST be INTEGER.

### EXAMPLE 4: synth/osc2d - The Bleuje periodicValue Pattern

**Technique:** Two-stage periodic evaluation from \xC9tienne Jacob's tutorials.
This creates complex-looking motion that loops perfectly.

\`\`\`glsl
// From synth/osc2d - the periodicValue pattern
float periodicValue(float t, float v) {
    // Bleuje pattern: periodic function evaluated at (time - offset)
    return (sin((t - v) * TAU) + 1.0) * 0.5;  // Returns 0\u21921\u21920 smoothly
}

// Two-stage periodic for complex motion:
// 1. Sample noise to get per-pixel offset values
float timeNoise = tilingNoise1D(spatialPos, freq, float(seed) + 12345.0);
float valueNoise = tilingNoise1D(spatialPos, freq, float(seed));

// 2. First periodic: time with timeNoise offset, scaled by speed
float scaledTime = periodicValue(time, timeNoise) * speed;

// 3. Second periodic: scaledTime with valueNoise offset
float val = periodicValue(scaledTime, valueNoise);
\`\`\`

**Why it works:**
- \`periodicValue(time, offset)\` is periodic in \`time\` for any fixed \`offset\`
- Nesting two periodic functions is still periodic
- Each pixel has different offsets, so motion appears complex but loops perfectly

##  SUMMARY: Three Proven Looping Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **periodicFunction(time) as blend** | Animating noise smoothly | synth/noise |
| **Rotating gradients with time*TAU** | 2D periodic noise | synth/perlin 2D |
| **Periodic Z-axis with mod wrapping** | 3D periodic noise | synth/perlin 3D |
| **Integer multiplier for modular coords** | Tunnels, scrolling grids | filter/tunnel |
| **periodicValue(time, offset)** | Complex motion with offsets | synth/osc2d, Bleuje tutorials |

**Use one of these proven looping patterns.**`;

// src/knowledge/workflow-knowledge.ts
var AGENT_WORKFLOW_KNOWLEDGE = `## SHADER AGENT MINDSET

You create visual art within a rendering pipeline.

### MANDATORY TOOL SEQUENCE

1. Call **create_effect** to create your shader in the USER namespace.
2. Call **compile_dsl** to use your effect. You MUST include "search user".
3. Call **validate_effect** to check the visual output.

NEVER call compile_dsl before create_effect.
ALWAYS use "search user" in DSL for your effects.

### THE PIPELINE PHILOSOPHY

**Composition surfaces**: \`o0\`-\`o7\` belong to the USER's composition graph.
Effects requiring internal buffers MUST use private textures (prefix with \`_\` or \`global_\`).

**Syntax consistency**: Never add alternative syntax or aliases.

### VALIDATION DECISION TREE

\`\`\`
1. compile_dsl (verify it compiles)  \u2500\u2500error\u2500\u2500\u25B6 Fix DSL syntax
       \u2502 ok
       \u25BC
2. validate_effect (check metrics)   \u2500\u2500fails\u2500\u2500\u25B6 Fix shader logic
       \u2502 pass
       \u25BC
3. Visual check with user
\`\`\`

### METRICS THAT MATTER

| Metric | Good | Bad | Meaning |
|--------|------|-----|---------|
| isBlank | false | true | Outputs nothing |
| isMonochrome | false | true | All pixels same hue |
| isAnimated | true | false | No movement |
| uniqueColors | > 50 | < 10 | Color variety |

### THE THREE LANGUAGES (NEVER CONFUSE)

| Context | Language | Example |
|---------|----------|---------|
| load_effect | Effect Path | \`"synth/noise"\` |
| compile_dsl | DSL | \`noise().blur().write(o0)\` |
| create_effect glsl | GLSL | \`vec2 uv = gl_FragCoord.xy / resolution;\` |

**DSL is NOT GLSL. GLSL is NOT DSL. Never mix them.**

### EFFECT TYPE SCAFFOLDING

ALL your effects belong to the USER namespace. Always use "search user":

| Type | DSL Pattern |
|------|-------------|
| STARTER | \`search user\\nmyEffect().write(o0)\\nrender(o0)\` |
| FILTER | \`search user, synth\\nnoise().myFilter().write(o0)\\nrender(o0)\` |
| MIXER | \`search user, synth\\nnoise().write(o0)\\ngradient().myMixer(tex: read(o0)).write(o1)\\nrender(o1)\` |

### COMMON FAILURES AND FIXES

| Symptom | Cause | Fix |
|---------|-------|-----|
| Unknown effect | Missing "search user" | Add "search user" to DSL |
| Unknown effect | create_effect not called | Call create_effect first |
| All black | No output | Check fragColor assignment |
| No animation | Using time directly | Use sin(time * TAU) |
| Controls don't work | Missing uniform | Add to globals |

### Required checks and conduct

- Never claim success without validation
- Never disable tests to hide problems
- Trust metrics over intuition
- Ask the user when uncertain`;
var COMPACT_SHADER_KNOWLEDGE = `## Shader Quick Reference

### DSL IS NOT GLSL

**DSL (compile_dsl):**
\`\`\`
search user
myEffect().write(o0)
render(o0)
\`\`\`

**GLSL (create_effect glsl param):**
\`\`\`glsl
#version 300 es
precision highp float;
void main() { fragColor = vec4(1.0); }
\`\`\`

### Search tools

- **search_shader_knowledge** - Search documentation, patterns, and errors
- search_effects - Find by name/tags
- search_shader_source - Find GLSL patterns
- analyze_effect - Get full shader code

**When uncertain, use search_shader_knowledge first.**
Query: "how to animate", "effect definition format", "common errors"

### DSL Scaffolding

**STARTER:** \`search user\\nmyEffect().write(o0)\\nrender(o0)\`
**FILTER:** \`search user, synth\\nnoise().myFilter().write(o0)\\nrender(o0)\`
**MIXER:** \`search user, synth\\nnoise().write(o0)\\ngradient().myMixer(tex: read(o0)).write(o1)\\nrender(o1)\`
**POINTS:** \`search user, points, synth, render\\nnoise().pointsEmit().myBehavior().pointsRender().write(o0)\\nrender(o0)\`

### GLSL Template

\`\`\`glsl
#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
out vec4 fragColor;
#define TAU 6.28318530718
#define aspectRatio (resolution.x / resolution.y)

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * TAU;
    fragColor = vec4(uv, 0.5 + 0.5 * sin(t), 1.0);
}
\`\`\`

### Animation (CRITICAL - WILL IT LOOP?)
**ONLY use sin()/cos()/periodicValue().** These are the ONLY functions where both value and derivative loop.

**APPROVED:**
- \`sin(time * TAU)\`, \`cos(time * TAU)\`
- \`periodicValue(time, offset)\` = \`0.5 + 0.5 * sin((time - offset) * TAU)\`
- Integer rotation: \`N * TAU * time\` where N is INTEGER
- Animated noise: \`vec2 tc = vec2(cos(TAU*time), sin(TAU*time)); noise(uv + tc*0.5)\`

### Key Patterns

**PCG Random:** \`uvec3 pcg(uvec3 v) {...}\`
**Rotation:** \`mat2(cos(a),-sin(a),sin(a),cos(a))\`
**Wrap:** \`mirror: abs(mod(uv+1,2)-1)\`, \`repeat: fract(uv)\``;

// src/knowledge/dsl-exemplars.ts
var DSL_EXEMPLAR_PATTERNS = `
## Canonical DSL Scaffolding Patterns

These patterns are MANDATORY. Always use the pattern for the given effect type.

### Points (particle systems)
\`\`\`
search points, synth, render
noise().pointsEmit().physical().pointsRender().write(o0)
render(o0)
\`\`\`

### Billboard Particles (textured particles)
\`\`\`
search points, synth, render
polygon(radius: 0.7, fgAlpha: 0.1, bgAlpha: 0).write(o0)
noise(ridges: true)
  .pointsEmit(stateSize: x64)
  .physical()
  .pointsBillboardRender(tex: read(o0), pointSize: 40, sizeVariation: 50, rotationVariation: 50)
  .write(o1)
render(o1)
\`\`\`

### Feedback Loop
\`\`\`
search synth, filter, render
noise(ridges: true)
  .loopBegin(alpha: 95, intensity: 95)
  .warp()
  .loopEnd()
  .write(o0)
render(o0)
\`\`\`

### 3D Volumetric
\`\`\`
search synth3d, filter3d, render
noise3d(volumeSize: x32).write3d(vol0, geo0)
read3d(vol0, geo0).render3d().write(o0)
render(o0)
\`\`\`

### Mixer (two-source blend)
\`\`\`
search synth, mixer
noise(seed: 1).write(o0)
gradient().blendMode(tex: read(o0), mode: multiply).write(o1)
render(o1)
\`\`\`

### Simple Starter
\`\`\`
search synth
noise(octaves: 4, ridges: true).write(o0)
render(o0)
\`\`\`

### Filter Chain
\`\`\`
search synth, filter
noise(ridges: true).blur(radiusX: 5).bloom(taps: 15).vignette().write(o0)
render(o0)
\`\`\`

### RULES
1. ALWAYS wrap points effects with pointsEmit()/pointsRender().
2. Put the sprite for billboard particles on a SEPARATE surface.
3. ALWAYS end 3D effect chains with render3d().
4. ALWAYS chain filters from a generator. Never use filters alone.
5. ALWAYS supply a tex: read(surface) parameter to mixers.
6. Put filter effects between loopBegin()/loopEnd() in feedback loops.
7. Always use noise() as the default starter. Set ridges: true for visual interest.
`;
var DSL_EXEMPLAR_PROGRAMS = [
  // ── Basics (all 8) ──────────────────────────────────────────────────────
  {
    name: "background",
    dsl: "search classicNoisedeck\n\nbackground(backgroundType: 10, rotation: 0, opacity: 100, color1: #000000, color2: #ffffff).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "background", "simple"],
    description: "Simple background generator with two-color gradient"
  },
  {
    name: "bit effects",
    dsl: "search classicNoisedeck\n\nbitEffects(loopAmp: 50, formula: 0, n: 1, colorScheme: 20, interp: 0, scale: 75, rotation: 0, maskFormula: 10, tiles: 5, complexity: 57, maskColorScheme: 1, baseHueRange: 50, hueRotation: 180, hueRange: 25).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "bitEffects", "simple", "math-art"],
    description: "Bit manipulation math art with masked formula patterns and custom color scheme"
  },
  {
    name: "cell noise",
    dsl: "search classicNoisedeck\n\ncellNoise(scale: 75, cellScale: 87, cellSmooth: 11, cellVariation: 50, loopAmp: 1, colorMode: 0, palette: 0, cyclePalette: 1, rotatePalette: 0, repeatPalette: 1, paletteMode: 4).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "cellNoise", "simple", "voronoi"],
    description: "Voronoi cell noise with smoothed cell boundaries and cycling palette"
  },
  {
    name: "fractal",
    dsl: "search classicNoisedeck\n\nfractal(fractalType: 0, zoomAmt: 0, rotation: 0, speed: 30, offsetX: 70, offsetY: 50, centerX: 0, centerY: 0, iterations: 50, colorMode: 4, palette: dealerHat, cyclePalette: 0, rotatePalette: 0, hueRange: 100, levels: 0, backgroundColor: #000000, backgroundOpacity: 100, cutoff: 0).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "fractal", "simple", "mandelbrot"],
    description: "Mandelbrot fractal with dealerHat palette and animated zoom"
  },
  {
    name: "noise",
    dsl: "search classicNoisedeck\n\nnoise(noiseType: 10, octaves: 2, xScale: 75, yScale: 75, ridges: false, wrap: true, refractMode: 2, refractAmt: 0, loopOffset: 300, loopScale: 75, loopAmp: 25, kaleido: 1, metric: 0, colorMode: 6, hueRotation: 179, hueRange: 25, palette: afterimage, cyclePalette: 1, rotatePalette: 0, repeatPalette: 1, paletteMode: 3).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "noise", "simple"],
    description: "Multi-octave noise with wrapping, afterimage palette, and HSV color rotation"
  },
  {
    name: "noise 3d",
    dsl: "search classicNoisedeck\n\nnoise3d(noiseType: 12, ridges: false, colorMode: 6).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "noise3d", "simple", "3d"],
    description: "3D noise generator with HSV color mode"
  },
  {
    name: "pattern",
    dsl: "search classicNoisedeck\n\npattern(patternType: 1, scale: 80, skewAmt: 0, rotation: 0, lineWidth: 100, animation: 0, speed: 1, sharpness: 100, color1: #ffea31, color2: #000000).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "pattern", "simple", "geometric"],
    description: "Dot pattern generator with yellow-black color scheme"
  },
  {
    name: "shapes",
    dsl: "search classicNoisedeck\n\nshapes(loopAOffset: 40, loopBOffset: 30, loopAScale: 1, loopBScale: 1, loopAAmp: 50, loopBAmp: 50, wrap: true, palette: sulphur, cyclePalette: 1, rotatePalette: 0, repeatPalette: 1).write(o0)\nrender(o0)",
    tags: ["classic", "basics", "shapes", "simple", "lissajous"],
    description: "Lissajous shapes with dual loop oscillators and sulphur palette"
  },
  // ── Classic (curated ~35) ───────────────────────────────────────────────
  {
    name: "1980s shmoos",
    dsl: "search classicNoisedeck\n\nshapes(loopAAmp: -32, loopAOffset: 200, loopAScale: 69, loopBAmp: -19, loopBOffset: 330, loopBScale: 47, palette: netOfGems, wrap: true, cyclePalette: 0, rotatePalette: 0).write(o0)\nshapes(loopAAmp: 32, loopAOffset: 200, loopAScale: 86, loopBAmp: -24, loopBOffset: 210, loopBScale: 18, palette: seventiesShirt, wrap: true, cyclePalette: 0, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 6, mixAmt: 2, refractAAmt: 0, refractBAmt: 0).colorLab(colorMode: 2, dither: 0, hueRange: 100, hueRotation: 0, levels: 2, palette: seventiesShirt).palette(ampB: 43, ampG: 35, ampR: 91, freq: 4, offsetB: 17, offsetG: 66, offsetR: 90, phaseB: 100, phaseG: 33, phaseR: 58, paletteType: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "shapes", "coalesce", "colorLab", "palette"],
    description: "Two shapes generators blended with coalesce, posterized with colorLab and custom palette remap"
  },
  {
    name: "acid rinse",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 75, hueRotation: 59, loopAmp: 29, octaves: 6, refractAmt: 35, ridges: true, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 81, yScale: 81).write(o0)\nnoise(hueRange: 12, hueRotation: 28, loopAmp: 85, refractAmt: 33, ridges: false, wrap: false, xScale: 89, yScale: 92, noiseType: 2, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 8, mixAmt: 100, refractAAmt: 0, refractBAmt: 42).effects(effect: 4, effectAmt: 2, flip: 0, offsetX: 0, offsetY: 0, rotation: 0, scaleAmt: 100).lensDistortion(aberrationAmt: 100, blendMode: 0, hueRange: 100, hueRotation: 0, blendMode: 1, modulate: true, passthru: 57, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "lens", "chromatic-aberration", "effects"],
    description: "Two noise generators coalesced with mirror effects and full chromatic aberration"
  },
  {
    name: "alien snowflake",
    dsl: "search classicNoisedeck\n\nnoise(hueRotation: 45, kaleido: 7, metric: 0, palette: solaris, wrap: true, noiseType: 2, colorMode: 4, xScale: 89, yScale: 89, octaves: 1).write(o0)\nnoise(hueRotation: 45, kaleido: 7, metric: 0, palette: solaris, wrap: true, noiseType: 2, colorMode: 4, xScale: 51, yScale: 51, octaves: 1).coalesce(tex: read(o0), blendMode: 5, mixAmt: -27, refractAAmt: 0, refractBAmt: 0).lensDistortion(aberrationAmt: 48, blendMode: 0, hueRange: 0, hueRotation: 0, blendMode: 1, modulate: true, passthru: 71, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "kaleido", "lens", "coalesce"],
    description: "Two kaleido noise layers at different scales blended with lens distortion modulation"
  },
  {
    name: "and it burns, burns, burns",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 35, hueRotation: 80, loopAmp: 33, octaves: 6, refractAmt: 63, ridges: true, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 97, yScale: 97).write(o0)\ncellNoise(colorMode: 0, loopAmp: 5, palette: royal, scale: 21, cellScale: 75, cellSmooth: 0, cellVariation: 0, cyclePalette: 1, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 7, mixAmt: -15, refractAAmt: 0, refractBAmt: 39).lensDistortion(aberrationAmt: 0, distortion: -48, loopAmp: 54, loopScale: 94, opacity: 12, shape: 0, tint: #b42f2d, vignetteAmt: -46).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "cellNoise", "coalesce", "lens", "vignette"],
    description: "Ridged noise blended with cell noise, barrel distortion and warm-tinted vignette"
  },
  {
    name: "bitmaskception",
    dsl: "search classicNoisedeck\n\nbitEffects(baseHueRange: 30, colorScheme: 2, complexity: 34, formula: 20, hueRange: 0, hueRotation: 82, loopAmp: 79, tiles: 4, maskFormula: 20, maskColorScheme: 2).write(o0)\nbitEffects(baseHueRange: 95, colorScheme: 2, complexity: 50, formula: 11, hueRange: 12, hueRotation: 92, loopAmp: 31, tiles: 30, maskFormula: 11, maskColorScheme: 2).coalesce(tex: read(o0), blendMode: 11, mixAmt: 19, refractAAmt: 7, refractBAmt: 0).effects(effect: 100, effectAmt: 9, flip: 0, offsetX: 0, offsetY: 0, rotation: 0, scaleAmt: 100).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "bitEffects", "coalesce", "effects", "math-art"],
    description: "Two bit manipulation formulas coalesced with pixelation effects"
  },
  {
    name: "beautiful garbage",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 17, hueRotation: 52, loopAmp: 30, refractAmt: 43, ridges: false, wrap: true, xScale: 92, yScale: 90, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).write(o0)\nnoise(hueRange: 27, hueRotation: 55, loopAmp: 34, refractAmt: 36, ridges: false, wrap: false, xScale: 94, yScale: 88, noiseType: 10, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 15, mixAmt: -60, refractAAmt: 67, refractBAmt: 21).lensDistortion(aberrationAmt: 28, distortion: -45, loopAmp: -100, loopScale: 73, opacity: 33, shape: 2, tint: #b39c4d, vignetteAmt: -100).lensDistortion(aberrationAmt: 80, blendMode: 0, hueRange: 77, hueRotation: 36, blendMode: 1, modulate: true, passthru: 91, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "lens", "refraction", "vignette", "dual-lens"],
    description: "Two noise generators with heavy refraction, dual lens distortion with vignette and chromatic aberration"
  },
  {
    name: "blue kaleido",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 6, hueRotation: 62, loopAmp: -60, loopOffset: 80, loopScale: 17, refractAmt: 23, wrap: true, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 30, yScale: 30, octaves: 1).kaleido(direction: 2, effectWidth: 5, kaleido: 5, kernel: 0, loopAmp: 4, loopOffset: 30, loopScale: 11, metric: 0, wrap: true).write(o1)\nrender(o1)",
    tags: ["classic", "noise", "kaleido", "filter"],
    description: "Noise generator piped through kaleido filter for five-fold symmetry pattern"
  },
  {
    name: "candy crystal cloud",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 98, hueRotation: 48, loopAmp: 9, loopOffset: 300, loopScale: 71, refractAmt: 37, wrap: true, noiseType: 3, colorMode: 6, kaleido: 1, xScale: 89, yScale: 89, octaves: 1).write(o0)\nnoise(hueRange: 49, hueRotation: 75, loopAmp: -2, loopOffset: 300, loopScale: 100, refractAmt: 71, wrap: true, noiseType: 0, colorMode: 6, kaleido: 1, xScale: 86, yScale: 86, octaves: 1).coalesce(tex: read(o0), blendMode: 12, mixAmt: 8, refractAAmt: 57, refractBAmt: 40).lensDistortion(aberrationAmt: 0, distortion: 0, loopAmp: 0, loopScale: 100, opacity: 30, shape: 0, tint: #c038ff, vignetteAmt: 0).refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "lens", "refraction"],
    description: "Two noise types coalesced with mutual refraction, purple tint overlay and refract filter"
  },
  {
    name: "chromatic liquid",
    dsl: "search classicNoisedeck\n\ncellNoise(colorMode: 1, loopAmp: 4, palette: justGreen, scale: 75, cellScale: 75, cellSmooth: 50, cellVariation: 0, cyclePalette: 1, rotatePalette: 0).write(o0)\nnoise(hueRange: 33, hueRotation: 82, loopAmp: 98, octaves: 1, refractAmt: 0, ridges: false, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 74, yScale: 74).coalesce(tex: read(o0), blendMode: 15, mixAmt: 13, refractAAmt: 100, refractBAmt: 0).lensDistortion(aberrationAmt: 0, distortion: -35, loopAmp: 10, loopScale: 71, opacity: 34, shape: 0, tint: #ae5647, vignetteAmt: -60).lensDistortion(aberrationAmt: 69, blendMode: 0, hueRange: 100, hueRotation: 0, blendMode: 1, modulate: true, passthru: 52, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "cellNoise", "noise", "coalesce", "lens", "dual-lens", "chromatic-aberration"],
    description: "Cell noise and smooth noise coalesced with full refraction, barrel distortion and chromatic aberration"
  },
  {
    name: "circuits of time",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 23, hueRotation: 26, loopAmp: 19, refractAmt: 100, ridges: true, wrap: false, xScale: 95, yScale: 92, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).write(o0)\nnoise(hueRange: 46, hueRotation: 65, loopAmp: 21, refractAmt: 100, ridges: true, wrap: false, xScale: 99, yScale: 95, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 11, mixAmt: 49, refractAAmt: 100, refractBAmt: 100).lensDistortion(aberrationAmt: 16, distortion: -20, loopAmp: 0, loopScale: 60, opacity: 17, shape: 0, tint: #4986bc, vignetteAmt: -100).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "refraction", "lens", "vignette"],
    description: "Two ridged noise generators with max refraction coalesced, blue-tinted vignette with barrel distortion"
  },
  {
    name: "cool crystals",
    dsl: "search classicNoisedeck\n\ncellNoise(colorMode: 1, loopAmp: 20, palette: santaCruz, scale: 90, cellScale: 75, cellSmooth: 0, cellVariation: 0, cyclePalette: 1, rotatePalette: 0).write(o0)\ncellNoise(colorMode: 2, loopAmp: 20, palette: tungsten, scale: 90, cellScale: 75, cellSmooth: 0, cellVariation: 0, cyclePalette: 1, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 7, mixAmt: -61, refractAAmt: 46, refractBAmt: 25).lensDistortion(aberrationAmt: 30, distortion: -40, loopAmp: 10, loopScale: 71, opacity: 61, shape: 0, tint: #4052ba, vignetteAmt: -100).lensDistortion(aberrationAmt: 100, blendMode: 0, hueRange: 39, hueRotation: 16, blendMode: 1, modulate: true, passthru: 60, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "cellNoise", "coalesce", "lens", "dual-lens", "vignette"],
    description: "Two cell noise layers with different palettes coalesced with refraction, dual lens distortion and blue vignette"
  },
  {
    name: "cutout hearts",
    dsl: "search classicNoisedeck\n\npattern(color1: #000000, color2: #ff00f7, rotation: 25, scale: 97, skewAmt: 2, patternType: 3, speed: 1, animation: 0).write(o0)\nnoise(hueRange: 24, hueRotation: 60, loopAmp: 18, refractAmt: 77, ridges: false, wrap: true, xScale: 93, yScale: 67, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).composite(tex: read(o0), blendMode: 1, inputColor: #000000, mixAmt: 0, range: 80).palette(ampB: 47, ampG: 2, ampR: 79, freq: 2, offsetB: 89, offsetG: 44, offsetR: 72, phaseB: 43, phaseG: 59, phaseR: 29, paletteType: 0).lensDistortion(aberrationAmt: 73, blendMode: 0, hueRange: 0, hueRotation: 77, blendMode: 1, modulate: false, passthru: 50, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "pattern", "noise", "composite", "palette", "lens"],
    description: "Heart pattern composited with refracted noise, custom RGB palette remap and chromatic aberration"
  },
  {
    name: "cyber soup",
    dsl: "search classicNoisedeck\n\npattern(color1: #4a88fb, color2: #000000, rotation: 111, scale: 61, skewAmt: 0, patternType: 2, speed: 1, animation: 4).write(o0)\nnoise(hueRange: 20, hueRotation: 58, loopAmp: 78, loopOffset: 300, loopScale: 100, refractAmt: 68, wrap: true, noiseType: 3, colorMode: 6, kaleido: 1, xScale: 81, yScale: 81, octaves: 1).composite(tex: read(o0), blendMode: 2, inputColor: #000000, mixAmt: 4, range: 71).colorLab(colorMode: 2, dither: 0, hueRange: 154, hueRotation: 0, levels: 0, palette: eventHorizon).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "pattern", "noise", "composite", "colorLab"],
    description: "Grid pattern composited with refracted noise, remapped through eventHorizon palette"
  },
  {
    name: "double chess",
    dsl: "search classicNoisedeck\n\npattern(color1: #6272e7, color2: #f98a35, rotation: 45, scale: 96, skewAmt: 0, patternType: 0, speed: 1, animation: 2).write(o0)\npattern(color1: #da8b56, color2: #520e28, rotation: 180, scale: 86, skewAmt: 0, patternType: 0, speed: 1, animation: 2).coalesce(tex: read(o0), blendMode: 8, mixAmt: -52).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "pattern", "coalesce", "mixer"],
    description: "Two animated checkerboard patterns at different rotations blended together"
  },
  {
    name: "double mask",
    dsl: "search classicNoisedeck\n\nbitEffects(baseHueRange: 76, colorScheme: 0, complexity: 100, formula: 10, hueRange: 55, hueRotation: 94, loopAmp: 45, tiles: 10, maskFormula: 10, maskColorScheme: 0).write(o0)\nbitEffects(baseHueRange: 99, colorScheme: 2, complexity: 1, formula: 10, hueRange: 100, hueRotation: 7, loopAmp: 100, tiles: 1, maskFormula: 10, maskColorScheme: 2).coalesce(tex: read(o0), blendMode: 11, mixAmt: 1, refractAAmt: 0, refractBAmt: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "bitEffects", "coalesce", "math-art"],
    description: "Two bit effect formulas with different tile scales blended for layered mathematical patterns"
  },
  {
    name: "dramatic pattern",
    dsl: "search classicNoisedeck\n\npattern(color1: #ffffff, color2: #000000, rotation: 142, scale: 98, skewAmt: 12, patternType: 8, speed: 1, animation: 0).write(o0)\ncellNoise(loopAmp: 7, palette: brushedMetal, scale: 79, cellScale: 75, cellSmooth: 50, cellVariation: 0, cyclePalette: 0, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 13, mixAmt: 60, refractAAmt: 1, refractBAmt: 100).lensDistortion(aberrationAmt: 27, distortion: -31, loopAmp: -59, loopScale: 60, opacity: 34, shape: 0, tint: #5849bc, vignetteAmt: -37).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "pattern", "cellNoise", "coalesce", "lens", "refraction"],
    description: "Skewed geometric pattern blended with cell noise using heavy refraction and purple vignette"
  },
  {
    name: "entranced",
    dsl: "search classicNoisedeck\n\nshapes(loopAAmp: -21, loopAOffset: 410, loopAScale: 21, loopBAmp: 38, loopBOffset: 80, loopBScale: 78, palette: solaris, wrap: true, cyclePalette: 0, rotatePalette: 0).write(o0)\nshapes(loopAAmp: -67, loopAOffset: 410, loopAScale: 57, loopBAmp: 92, loopBOffset: 80, loopBScale: 1, palette: solaris, wrap: true, cyclePalette: 0, rotatePalette: 0).composite(tex: read(o0), blendMode: 3).colorLab(colorMode: 2, dither: 0, hueRange: 90, hueRotation: 0, levels: 0, palette: sulphur).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "shapes", "composite", "colorLab"],
    description: "Two shapes generators composited and remapped through sulphur palette for warm tones"
  },
  {
    name: "flashy fractal",
    dsl: "search classicNoisedeck\n\nfractal(centerX: 12, centerY: -57, fractalType: 0, offsetX: 35, offsetY: 59, palette: royal, rotation: 0, speed: 2, zoomAmt: 33, cyclePalette: 0, rotatePalette: 0).write(o0)\nfractal(centerX: 0, centerY: -4, fractalType: 1, offsetX: 31, offsetY: 0, palette: royal, rotation: 0, speed: 81, symmetry: 5, zoomAmt: 0, cyclePalette: 0, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 13, mixAmt: 2, refractAAmt: 47, refractBAmt: 61).lensDistortion(aberrationAmt: 0, distortion: 6, loopAmp: -14, loopScale: 88, opacity: 81, shape: 0, tint: #487b9d, vignetteAmt: 72).effects(effect: 4, effectAmt: 0, flip: 15, offsetX: 0, offsetY: 0, rotation: 0, scaleAmt: 100).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "fractal", "coalesce", "lens", "effects"],
    description: "Two fractal types (Mandelbrot + symmetry) coalesced with refraction, tinted vignette and mirror"
  },
  {
    name: "fractal wave wash",
    dsl: "search classicNoisedeck\n\nfractal(centerX: 21, centerY: -37, fractalType: 0, offsetX: 73, offsetY: 52, palette: blueSkies, rotation: 127, speed: 75, zoomAmt: 91, cyclePalette: 0, rotatePalette: 0).write(o0)\nfractal(centerX: 21, centerY: 0, fractalType: 0, offsetX: 13, offsetY: 69, palette: blueSkies, rotation: 0, speed: 75, zoomAmt: 83, cyclePalette: 1, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 100, mixAmt: -13, refractAAmt: 0, refractBAmt: 15).lensDistortion(aberrationAmt: 91, blendMode: 0, hueRange: 100, hueRotation: 0, blendMode: 1, modulate: true, passthru: 42, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "fractal", "coalesce", "lens", "chromatic-aberration"],
    description: "Two deep-zoom Mandelbrot fractals blended with high chromatic aberration modulation"
  },
  {
    name: "glitched grid",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 0, hueRotation: 45, loopAmp: 79, refractAmt: 100, ridges: false, wrap: true, xScale: 100, yScale: 99, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).write(o0)\npattern(color1: #8480ff, color2: #000000, rotation: 104, scale: 71, skewAmt: 1, patternType: 2, speed: 1, animation: 4).coalesce(tex: read(o0), blendMode: 17, mixAmt: 100, refractAAmt: 0, refractBAmt: 100).lensDistortion(aberrationAmt: 22, distortion: 56, loopAmp: -20, loopScale: 60, opacity: 4, shape: 6, tint: #494abc, vignetteAmt: -69).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "pattern", "coalesce", "lens", "refraction"],
    description: "Refracted noise blended with animated grid pattern, pincushion distortion and purple vignette"
  },
  {
    name: "glitchy melted candy",
    dsl: "search classicNoisedeck\n\nnoise(palette: cottonCandy, refractAmt: 34, ridges: false, noiseType: 10, colorMode: 4, kaleido: 1, xScale: 2, yScale: 2, octaves: 1).write(o0)\nnoise(palette: cottonCandy, refractAmt: 62, ridges: false, noiseType: 10, colorMode: 4, kaleido: 1, xScale: 3, yScale: 3, octaves: 1).composite(tex: read(o0), blendMode: 113).glitch(aberrationAmt: 32, distortion: 96, glitchiness: 6, scanlinesAmt: 69, vignetteAmt: 49, xChonk: 88, yChonk: 8).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "composite", "glitch"],
    description: "Two low-scale noise layers composited with heavy glitch effect including scanlines and distortion"
  },
  {
    name: "golden rings",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 15, hueRotation: 47, loopAmp: 61, refractAmt: 8, ridges: true, wrap: true, xScale: 100, yScale: 89, noiseType: 0, colorMode: 6, kaleido: 1, octaves: 1).write(o0)\nshapes(loopAAmp: 100, loopAOffset: 10, loopAScale: 81, loopBAmp: -38, loopBOffset: 400, loopBScale: 75, palette: tungsten, wrap: true, cyclePalette: 0, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 15, mixAmt: 19, refractAAmt: 45, refractBAmt: 0).lensDistortion(aberrationAmt: 60, distortion: -57, loopAmp: -8, loopScale: 55, opacity: 0, shape: 0, tint: #5ad2f2, vignetteAmt: 100).refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "shapes", "coalesce", "lens", "refraction"],
    description: "Noise and shapes generators coalesced with refraction, barrel distortion and refract filter"
  },
  {
    name: "hallucinogrid",
    dsl: "search classicNoisedeck\n\npattern(color1: #00ffd5, color2: #000000, rotation: 130, scale: 75, skewAmt: 0, patternType: 2, speed: 1, animation: 4).write(o0)\nnoise(hueRange: 21, hueRotation: 43, loopAmp: 100, refractAmt: 100, ridges: true, wrap: true, xScale: 99, yScale: 97, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 9, mixAmt: -56, refractAAmt: 27, refractBAmt: 29).lensDistortion(aberrationAmt: 100, distortion: -64, loopAmp: -10, loopScale: 62, opacity: 11, shape: 0, tint: #75c5c7, vignetteAmt: -100).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "pattern", "noise", "coalesce", "lens", "chromatic-aberration", "vignette"],
    description: "Cyan animated grid blended with ridged refracted noise, full chromatic aberration and barrel distortion"
  },
  {
    name: "holo-transmission",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 9, hueRotation: 15, loopAmp: 73, loopOffset: 300, loopScale: 29, refractAmt: 71, wrap: true, noiseType: 3, colorMode: 6, kaleido: 1, xScale: 74, yScale: 74, octaves: 1).write(o0)\nbitEffects(colorScheme: 5, formula: 0, interp: 0, loopAmp: 34, n: 1, rotation: 0, scale: 88).glitch(aberrationAmt: 14).effects(effectAmt: 84, effect: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "bitEffects", "glitch", "effects"],
    description: "Noise and bit effects on separate chains with glitch filter and zoom effects"
  },
  {
    name: "holographic noodles",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 9, hueRotation: 32, loopAmp: 17, refractAmt: 22, ridges: true, wrap: true, xScale: 90, yScale: 90, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).write(o0)\nnoise(hueRange: 9, hueRotation: 67, loopAmp: 25, refractAmt: 0, ridges: true, wrap: true, xScale: 60, yScale: 60, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 9, mixAmt: 48, refractAAmt: 14, refractBAmt: 3).lensDistortion(aberrationAmt: 70, blendMode: 0, hueRange: 50, hueRotation: 34, blendMode: 1, modulate: false, passthru: 44, opacity: 0, loopAmp: 0, distortion: 0).refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "lens", "refraction", "chromatic-aberration"],
    description: "Two ridged noise generators at different scales coalesced with chromatic aberration and refract filter"
  },
  {
    name: "illuminatus",
    dsl: "search classicNoisedeck\n\nshapes(loopAAmp: -22, loopAOffset: 410, loopAScale: 100, loopBAmp: 63, loopBOffset: 20, loopBScale: 61, palette: solaris, wrap: true, cyclePalette: 0, rotatePalette: 0).write(o0)\nshapes(loopAAmp: 50, loopAOffset: 410, loopAScale: 20, loopBAmp: 98, loopBOffset: 20, loopBScale: 1, palette: solaris, wrap: true, cyclePalette: 0, rotatePalette: 0).composite(tex: read(o0), blendMode: 3).colorLab(brightness: 4, colorMode: 2, dither: 0, hueRange: 200, hueRotation: 0, levels: 0, palette: sulphur, saturation: -6).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "shapes", "composite", "colorLab"],
    description: "Two shapes oscillators composited with wide hue range colorLab remap and desaturation"
  },
  {
    name: "kaleido-singularity",
    dsl: "search classicNoisedeck\n\nnoise(hueRotation: 81, kaleido: 3, metric: 4, palette: eventHorizon, wrap: true, noiseType: 3, colorMode: 4, xScale: 81, yScale: 81, octaves: 1).coalesce(tex: read(o0), blendMode: 9, mixAmt: -100, refractAAmt: 100, refractBAmt: 0).glitch(aberrationAmt: 33, distortion: -62, glitchiness: 6, scanlinesAmt: 46, vignetteAmt: -57, xChonk: 100, yChonk: 75).write(o1)\nrender(o1)",
    tags: ["classic", "noise", "kaleido", "coalesce", "glitch"],
    description: "Kaleido noise with self-refraction coalesce and heavy glitch scanline effects"
  },
  {
    name: "kaleidopalooze",
    dsl: "search classicNoisedeck\n\nnoise(hueRotation: 0, kaleido: 7, metric: 0, wrap: true, palette: royal, noiseType: 2, colorMode: 4, xScale: 52, yScale: 52, octaves: 1).write(o0)\nnoise(hueRange: 66, hueRotation: 36, loopAmp: 46, refractAmt: 68, ridges: true, wrap: false, xScale: 88, yScale: 94, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 12, mixAmt: -19, refractAAmt: 0, refractBAmt: 40).kaleido(direction: 2, effectWidth: 3, kaleido: 7, kernel: 0, loopAmp: -10, loopOffset: 10, loopScale: 100, metric: 0, wrap: true).kaleido(direction: 2, effectWidth: 3, kaleido: 7, kernel: 0, loopAmp: 10, loopOffset: 10, loopScale: 86, metric: 0, wrap: true).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "kaleido", "dual-kaleido"],
    description: "Two noise generators coalesced through dual kaleido filters for seven-fold nested symmetry"
  },
  {
    name: "liquid flame",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 23, hueRotation: 76, loopAmp: 11, loopOffset: 210, loopScale: 50, refractAmt: 34, wrap: true, noiseType: 3, colorMode: 6, kaleido: 1, xScale: 92, yScale: 92, octaves: 1).write(o0)\nnoise(hueRange: 11, hueRotation: 76, loopAmp: 58, loopOffset: 210, loopScale: 100, refractAmt: 51, wrap: true, noiseType: 3, colorMode: 6, kaleido: 1, xScale: 78, yScale: 78, octaves: 1).coalesce(tex: read(o0), blendMode: 17, mixAmt: -4, refractAAmt: 57, refractBAmt: 40).lensDistortion(aberrationAmt: 0, distortion: 21, loopAmp: -3, loopScale: 99, opacity: 39, shape: 0, tint: #ca7907, vignetteAmt: -21).refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "lens", "refraction"],
    description: "Two warm-hued noise generators coalesced with mutual refraction, amber tint and refract filter"
  },
  {
    name: "liquid ice",
    dsl: "search classicNoisedeck\n\ncellNoise(colorMode: 1, loopAmp: 19, palette: jester, scale: 88, cellScale: 75, cellSmooth: 50, cellVariation: 0, cyclePalette: 1, rotatePalette: 0).write(o0)\ncellNoise(colorMode: 2, loopAmp: 8, palette: neptune, scale: 92, cellScale: 75, cellSmooth: 0, cellVariation: 0, cyclePalette: 1, rotatePalette: 0).coalesce(tex: read(o0), blendMode: 0, mixAmt: -50, refractAAmt: 61, refractBAmt: 34).lensDistortion(aberrationAmt: 30, distortion: -32, loopAmp: 15, loopScale: 73, opacity: 59, shape: 0, tint: #5e9e96, vignetteAmt: -100).refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "cellNoise", "coalesce", "lens", "refraction", "vignette"],
    description: "Two cell noise generators with jester and neptune palettes, refraction blend with teal vignette"
  },
  {
    name: "liquid infinity",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 67, hueRotation: 9, loopAmp: 89, refractAmt: 100, ridges: true, wrap: true, xScale: 94, yScale: 97, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).write(o0)\nnoise(hueRange: 66, hueRotation: 20, loopAmp: 82, refractAmt: 100, ridges: true, wrap: true, xScale: 94, yScale: 97, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 11, mixAmt: 55, refractAAmt: 100, refractBAmt: 100).lensDistortion(aberrationAmt: 20, distortion: -41, loopAmp: -10, loopScale: 60, opacity: 18, shape: 0, tint: #4950bc, vignetteAmt: -61).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "refraction", "lens", "vignette"],
    description: "Two max-refraction ridged noise generators coalesced with full mutual refraction and blue vignette"
  },
  {
    name: "maelstrom",
    dsl: "search classicNoisedeck\n\nfractal(centerX: 0, centerY: 0, fractalType: 0, offsetX: 40, offsetY: 58, palette: grayscale, rotation: 183, speed: 33, zoomAmt: 0, cyclePalette: 0, rotatePalette: 0).write(o0)\nnoise(hueRange: 26, hueRotation: 81, loopAmp: 100, refractAmt: 73, ridges: true, wrap: true, xScale: 95, yScale: 96, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 10, mixAmt: 100, refractAAmt: 0, refractBAmt: 51).lensDistortion(aberrationAmt: 41, distortion: 23, loopAmp: 48, loopScale: 24, opacity: 14, shape: 0, tint: #935343, vignetteAmt: -47).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "fractal", "noise", "coalesce", "lens"],
    description: "Grayscale Mandelbrot fractal blended with ridged refracted noise, warm-tinted lens distortion"
  },
  {
    name: "melt",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 17, hueRotation: 21, loopAmp: -27, loopOffset: 210, loopScale: 84, refractAmt: 88, wrap: true, noiseType: 3, colorMode: 6, kaleido: 1, xScale: 85, yScale: 85, octaves: 1).write(o0)\ncellNoise(colorMode: 1, loopAmp: 5, palette: blueSkies, scale: 69, cellScale: 75, cellSmooth: 0, cellVariation: 0, cyclePalette: 0, rotatePalette: 0).composite(tex: read(o0), blendMode: 1, inputColor: #000000, mixAmt: 46, range: 44).lensDistortion(aberrationAmt: 65, blendMode: 0, hueRange: 38, hueRotation: 0, blendMode: 0, modulate: false, passthru: 61, opacity: 0, loopAmp: 0, distortion: 0).refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "cellNoise", "composite", "lens", "refraction"],
    description: "Refracted noise composited with blue cell noise, chromatic aberration and refract filter"
  },
  {
    name: "oil cloud",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 100, hueRotation: 25, loopAmp: 100, octaves: 4, refractAmt: 5, ridges: true, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 81, yScale: 81).write(o0)\nnoise(hueRange: 93, hueRotation: 25, loopAmp: 100, octaves: 1, refractAmt: 5, ridges: false, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 81, yScale: 81).coalesce(tex: read(o0), blendMode: 5, mixAmt: 32, refractAAmt: 0, refractBAmt: 0).refract().refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "refraction", "double-refract"],
    description: "Two full-spectrum noise generators coalesced and double-refracted for iridescent oil effect"
  },
  {
    name: "prismatic cloud",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 37, hueRotation: 0, loopAmp: 26, octaves: 5, refractAmt: 100, ridges: false, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 98, yScale: 98).write(o0)\nnoise(hueRange: 100, hueRotation: 28, loopAmp: 98, refractAmt: 0, ridges: false, wrap: false, xScale: 98, yScale: 98, noiseType: 2, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 8, mixAmt: -72, refractAAmt: 0, refractBAmt: 100).lensDistortion(aberrationAmt: 0, distortion: -22, loopAmp: 10, loopScale: 71, opacity: 0, shape: 2, tint: #8a47ae, vignetteAmt: -73).lensDistortion(aberrationAmt: 100, blendMode: 0, hueRange: 12, hueRotation: 15, blendMode: 1, modulate: false, passthru: 76, opacity: 0, loopAmp: 0, distortion: 0).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "lens", "dual-lens", "chromatic-aberration", "vignette"],
    description: "Multi-octave noise with full refraction coalesced, dual lens distortion with vignette and chromatic aberration"
  },
  {
    name: "prismatic goop",
    dsl: "search classicNoisedeck\n\npattern(color1: #ffffff, color2: #000000, rotation: 0, scale: 95, skewAmt: 8, patternType: 0, speed: 1, animation: 2).write(o0)\nnoise(hueRange: 25, hueRotation: 52, loopAmp: 53, refractAmt: 76, ridges: true, wrap: true, xScale: 95, yScale: 82, noiseType: 3, colorMode: 6, kaleido: 1, octaves: 1).coalesce(tex: read(o0), blendMode: 10, mixAmt: 43, refractAAmt: 10, refractBAmt: 0).lensDistortion(aberrationAmt: 100, blendMode: 0, hueRange: 71, hueRotation: 0, blendMode: 1, modulate: true, passthru: 47, opacity: 0, loopAmp: 0, distortion: 0).effects(effect: 4, effectAmt: 0, flip: 2, offsetX: 0, offsetY: 0, rotation: 59, scaleAmt: 146).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "pattern", "noise", "coalesce", "lens", "effects", "chromatic-aberration"],
    description: "Animated checkerboard coalesced with refracted noise, full chromatic aberration and rotated mirror"
  },
  {
    name: "pure reflection",
    dsl: "search classicNoisedeck\n\nshapes(loopAAmp: -28, loopAOffset: 30, loopAScale: 97, loopBAmp: 82, loopBOffset: 30, loopBScale: 7, wrap: true, palette: columbia, cyclePalette: 0, rotatePalette: 0).write(o0)\nshapes(loopAAmp: 43, loopAOffset: 210, loopAScale: 63, loopBAmp: -53, loopBOffset: 30, loopBScale: 71, wrap: true, palette: vibrant, cyclePalette: 0, rotatePalette: 0).composite(tex: read(o0), blendMode: 1, inputColor: #341cd4, mixAmt: 43, range: 30).refract().colorLab(colorMode: 2, dither: 0, hueRange: 200, hueRotation: 0, levels: 0, palette: sulphur).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "shapes", "composite", "refraction", "colorLab"],
    description: "Two shapes generators with different palettes composited with blue tint, refracted and color-remapped"
  },
  {
    name: "satin touch",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 7, hueRotation: 73, loopAmp: 52, refractAmt: 80, ridges: false, wrap: true, xScale: 89, yScale: 93, noiseType: 10, colorMode: 6, kaleido: 1, octaves: 1).write(o0)\nnoise(hueRange: 38, hueRotation: 63, loopAmp: 46, octaves: 5, refractAmt: 83, ridges: true, noiseType: 10, colorMode: 6, kaleido: 1, xScale: 100, yScale: 100).coalesce(tex: read(o0), blendMode: 10, mixAmt: 100, refractAAmt: 24, refractBAmt: 10).colorLab(colorMode: 3, dither: 0, hueRange: 105, hueRotation: 55, levels: 0, palette: sulphur).colorLab(colorMode: 2, dither: 0, hueRange: 100, hueRotation: 88, levels: 0, palette: toxic).write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "coalesce", "colorLab", "dual-colorLab"],
    description: "Two refracted noise generators coalesced with dual colorLab remapping through sulphur and toxic palettes"
  },
  {
    name: "see you in prism",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 18, hueRotation: 20, loopAmp: -30, loopOffset: 20, loopScale: 81, refractAmt: 94, wrap: true, noiseType: 3, colorMode: 6, kaleido: 1, xScale: 100, yScale: 100, octaves: 1).write(o0)\ncellNoise(colorMode: 2, loopAmp: 0, palette: royal, scale: 84, cellScale: 75, cellSmooth: 0, cellVariation: 0, cyclePalette: 1, rotatePalette: 0).composite(tex: read(o0), blendMode: 1, inputColor: #8f8f8f, mixAmt: 0, range: 54).lensDistortion(aberrationAmt: 100, distortion: -67, loopAmp: 83, loopScale: 39, opacity: 33, shape: 6, tint: #412036, vignetteAmt: -46).refract().write(o1)\nrender(o1)",
    tags: ["classic", "multi-chain", "noise", "cellNoise", "composite", "lens", "refraction"],
    description: "Refracted noise composited with royal cell noise, strong barrel distortion with diamond vignette and refract"
  },
  {
    name: "digital camo",
    dsl: "search classicNoisedeck\n\nnoise(hueRange: 3, hueRotation: 59, loopAmp: 22, loopOffset: 210, loopScale: 52, refractAmt: 35, wrap: true, noiseType: 0, colorMode: 6, kaleido: 1, xScale: 22, yScale: 22, octaves: 1).effects(effect: 100, effectAmt: 9, flip: 0, offsetX: 0, offsetY: 0, rotation: 0, scaleAmt: 100).write(o1)\nrender(o1)",
    tags: ["classic", "noise", "effects", "pixelate", "filter"],
    description: "Low-scale noise with refraction pixelated into digital camouflage pattern"
  },
  {
    name: "edgy fractal",
    dsl: "search classicNoisedeck\n\nfractal(centerX: 0, centerY: 0, fractalType: 1, offsetX: 0, offsetY: 0, palette: vibrant, rotation: 0, speed: 51, symmetry: 4, zoomAmt: 0, cyclePalette: 0, rotatePalette: 0).write(o0)\nrender(o0)",
    tags: ["classic", "fractal", "simple", "symmetry"],
    description: "Symmetry fractal with four-fold rotation and vibrant palette"
  },
  {
    name: "cyberfall",
    dsl: "search classicNoisedeck\n\nbitEffects(colorScheme: 11, formula: 0, interp: 0, loopAmp: 100, n: 1, rotation: 45, scale: 84).write(o0)\nrender(o0)",
    tags: ["classic", "bitEffects", "simple", "math-art"],
    description: "Rotated bit manipulation formula with high animation speed"
  },
  // ── Modern Synth (generators) ─────────────────────────────────────────
  {
    name: "simple noise",
    dsl: "search synth\n\nnoise(octaves: 4, ridges: true).write(o0)\nrender(o0)",
    tags: ["synth", "noise", "simple", "starter"],
    description: "Basic ridged multi-octave noise \u2014 the default go-to starter"
  },
  {
    name: "perlin landscape",
    dsl: "search synth\n\nperlin(scale: 50, octaves: 3, ridges: true).write(o0)\nrender(o0)",
    tags: ["synth", "perlin", "simple", "noise"],
    description: "Perlin noise with ridges and moderate scale for organic landscapes"
  },
  {
    name: "warped perlin",
    dsl: "search synth\n\nperlin(scale: 40, octaves: 2, warpIterations: 3, warpScale: 60, warpIntensity: 70).write(o0)\nrender(o0)",
    tags: ["synth", "perlin", "warp", "domain-warping"],
    description: "Domain-warped perlin noise creating fluid organic distortions"
  },
  {
    name: "cell noise mono",
    dsl: "search synth\n\ncell(scale: 50, cellScale: 80, cellSmooth: 30).write(o0)\nrender(o0)",
    tags: ["synth", "cell", "voronoi", "simple"],
    description: "Smooth voronoi cell noise at medium scale"
  },
  {
    name: "curl flow",
    dsl: "search synth\n\ncurl(scale: 20, octaves: 3, ridges: true, intensity: 0.8).write(o0)\nrender(o0)",
    tags: ["synth", "curl", "flow", "vector-field"],
    description: "Curl noise with ridges for flowing vector field patterns"
  },
  {
    name: "julia set",
    dsl: "search synth\n\njulia(poi: douadyRabbit, iterations: 300, outputMode: smoothIteration).write(o0)\nrender(o0)",
    tags: ["synth", "julia", "fractal", "complex"],
    description: "Julia set fractal at the Douady rabbit point of interest"
  },
  {
    name: "animated julia",
    dsl: "search synth\n\njulia(poi: manual, cReal: -0.7, cImag: 0.4, cPath: cardioid, cSpeed: 0.3).write(o0)\nrender(o0)",
    tags: ["synth", "julia", "fractal", "animated"],
    description: "Julia set with c-parameter animating along cardioid path"
  },
  {
    name: "mandelbrot deep zoom",
    dsl: "search synth\n\nmandelbrot(poi: seahorseValley, iterations: 500, zoomSpeed: 0.5, outputMode: smoothIteration).write(o0)\nrender(o0)",
    tags: ["synth", "mandelbrot", "fractal", "zoom"],
    description: "Deep-zooming Mandelbrot at Seahorse Valley with smooth coloring"
  },
  {
    name: "fractal explorer",
    dsl: "search synth\n\nfractal(type: burningShip, power: 2, iterations: 200, zoom: 1.5).write(o0)\nrender(o0)",
    tags: ["synth", "fractal", "burningShip", "explorer"],
    description: "Burning ship fractal variant"
  },
  {
    name: "gabor texture",
    dsl: "search synth\n\ngabor(scale: 50, orientation: 45, bandwidth: 50, density: 5).write(o0)\nrender(o0)",
    tags: ["synth", "gabor", "texture", "oriented"],
    description: "Gabor noise with oriented bandwidth for directional textures"
  },
  {
    name: "color gradient",
    dsl: "search synth\n\ngradient(gradientType: radial, color1: #ff0044, color2: #4400ff, color3: #00ff88, color4: #ffaa00).write(o0)\nrender(o0)",
    tags: ["synth", "gradient", "color", "simple"],
    description: "Radial four-color gradient generator"
  },
  {
    name: "oscillator stripes",
    dsl: "search synth\n\nosc2d(oscType: sine, freq: 8, speed: 2, rotation: 30).write(o0)\nrender(o0)",
    tags: ["synth", "osc2d", "geometric", "oscillator"],
    description: "2D sine wave oscillator with angled rotation"
  },
  {
    name: "polygon sprite",
    dsl: "search synth\n\npolygon(sides: 6, radius: 0.6, smooth: 0.02, fgColor: #ffffff, bgColor: #000000, bgAlpha: 0).write(o0)\nrender(o0)",
    tags: ["synth", "polygon", "geometric", "shape"],
    description: "Hexagonal polygon with transparent background for compositing"
  },
  {
    name: "shape morphing",
    dsl: "search synth\n\nshape(loopAOffset: dodecahedron, loopBOffset: icosahedron, loopAScale: 50, loopBScale: 30, wrap: true).write(o0)\nrender(o0)",
    tags: ["synth", "shape", "morphing", "lissajous"],
    description: "Animated shape morph between dodecahedron and icosahedron projections"
  },
  {
    name: "reaction diffusion",
    dsl: "search synth\n\nrd(iterations: 16, colorMode: gradient).write(o0)\nrender(o0)",
    tags: ["synth", "rd", "reaction-diffusion", "simulation"],
    description: "Reaction-diffusion simulation with gradient coloring"
  },
  {
    name: "cellular automaton",
    dsl: "search synth\n\nca(ruleIndex: 4, stateSize: x64, speed: 2).write(o0)\nrender(o0)",
    tags: ["synth", "ca", "cellular-automata", "simulation"],
    description: "2D cellular automaton with larger state buffer"
  },
  {
    name: "multi-neighborhood ca",
    dsl: "search synth\n\nmnca(ruleIndex: 4, stateSize: x16, speed: 2).write(o0)\nrender(o0)",
    tags: ["synth", "mnca", "cellular-automata", "simulation"],
    description: "Multi-neighborhood cellular automaton \u2014 complex emergent patterns"
  },
  {
    name: "mod pattern grid",
    dsl: "search synth\n\nmodPattern(shape1: circle, scale1: 12, shape2: square, scale2: 8, blend: 0.5, speed: 1).write(o0)\nrender(o0)",
    tags: ["synth", "modPattern", "geometric", "pattern"],
    description: "Modular arithmetic pattern with blended circle and square grids"
  },
  {
    name: "pattern stripes",
    dsl: "search synth\n\npattern(type: stripes, scale: 80, rotation: 45, smoothness: 0.05, speed: 1).write(o0)\nrender(o0)",
    tags: ["synth", "pattern", "geometric", "stripes"],
    description: "Angled stripe pattern with smooth edges"
  },
  {
    name: "subdivide tiles",
    dsl: "search synth\n\nsubdivide(depth: 6, density: 80, fill: quad, outline: 2).write(o0)\nrender(o0)",
    tags: ["synth", "subdivide", "geometric", "tiling"],
    description: "Recursive subdivision tiling with outlined quads"
  },
  {
    name: "solid color",
    dsl: "search synth\n\nsolid(color: #1a1a2e).write(o0)\nrender(o0)",
    tags: ["synth", "solid", "simple", "color"],
    description: "Solid color \u2014 useful as a base for filter chains"
  },
  // ── Filter Chains ─────────────────────────────────────────────────────
  {
    name: "noise with bloom",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 3)\n  .bloom(taps: 15)\n  .vignette()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "bloom", "vignette", "post-processing"],
    description: "Ridged noise with bloom glow and vignette darkening"
  },
  {
    name: "chromatic noise",
    dsl: "search synth, filter\n\nnoise(colorMode: mono, ridges: true)\n  .chromaticAberration()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "chromaticAberration", "color-split"],
    description: "Monochrome noise with RGB channel separation"
  },
  {
    name: "prismatic noise",
    dsl: "search synth, filter\n\nnoise(ridges: true, colorMode: mono)\n  .prismaticAberration(modulate: true)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "prismaticAberration", "rainbow"],
    description: "Monochrome noise with prismatic rainbow aberration"
  },
  {
    name: "lit terrain",
    dsl: "search synth, filter\n\nnoise(ridges: true)\n  .lighting(normalStrength: 2)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "lighting", "normals", "3d-look"],
    description: "Noise as a heightmap with dynamic lighting for 3D terrain look"
  },
  {
    name: "cloud layer",
    dsl: "search synth, filter\n\nsolid(color: #2d78f0)\n  .clouds(scale: 0.55)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "clouds", "sky", "atmosphere"],
    description: "Procedural cloud layer over solid blue sky"
  },
  {
    name: "fiber texture",
    dsl: "search synth, filter\n\nsolid(color: #000000)\n  .fibers(density: 1)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "fibers", "texture", "overlay"],
    description: "Fiber texture overlay on black background"
  },
  {
    name: "scratched surface",
    dsl: "search synth, filter\n\nsolid(color: #2b2b2b)\n  .scratches()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "scratches", "texture", "grunge"],
    description: "Dark surface with scratch texture overlay"
  },
  {
    name: "grime layer",
    dsl: "search synth, filter\n\nsolid(color: #ffffff)\n  .grime(strength: 1)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "grime", "texture", "grunge"],
    description: "Grime texture on white for aging/weathering effects"
  },
  {
    name: "spattered ink",
    dsl: "search synth, filter\n\nsolid(color: #d4d4d4)\n  .spatter(density: 1)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "spatter", "texture", "ink"],
    description: "Ink spatter effect on light background"
  },
  {
    name: "historic palette remap",
    dsl: "search synth, filter\n\nnoise(ridges: true, colorMode: mono)\n  .historicPalette()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "historicPalette", "color", "remap"],
    description: "Monochrome noise remapped through a historic color palette"
  },
  {
    name: "tinted noise",
    dsl: "search synth, filter\n\nnoise(ridges: true, colorMode: mono)\n  .tint(color: #ff0000, alpha: 0.5, mode: overlay)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "tint", "color", "overlay"],
    description: "Monochrome noise with red tint overlay"
  },
  {
    name: "oklab color",
    dsl: "search synth, filter\n\nnoise(ridges: true)\n  .adjust(mode: oklab)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "colorspace", "oklab", "color"],
    description: "Noise processed in perceptual oklab color space"
  },
  {
    name: "hsv adjust",
    dsl: "search synth, filter\n\nperlin(scale: 75, octaves: 2)\n  .adjust(mode: hsv, rotation: 120, hueRange: 40)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "adjust", "hsv", "color"],
    description: "Perlin noise with HSV hue rotation and range adjustment"
  },
  {
    name: "tetra color array",
    dsl: "search synth, filter\n\nnoise()\n  .tetraColorArray(smoothness: 0)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "tetraColorArray", "color", "quantize"],
    description: "Noise quantized to tetrahedral color array"
  },
  {
    name: "tetra cosine",
    dsl: "search synth, filter\n\nnoise()\n  .tetraCosine()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "tetraCosine", "color", "palette"],
    description: "Noise remapped through cosine-based tetrahedral palette"
  },
  {
    name: "cell smoothstep",
    dsl: "search synth, filter\n\ncell()\n  .smoothstep(edge1: 0.51)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "smoothstep", "threshold", "cell"],
    description: "Cell noise with smoothstep threshold for clean contours"
  },
  {
    name: "sharpened pattern",
    dsl: "search synth, filter\n\npattern(type: dots, smoothness: 0.04)\n  .sharpen(amount: 5)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "sharpen", "pattern", "crisp"],
    description: "Dot pattern with heavy sharpening for crisp edges"
  },
  {
    name: "smooth blur",
    dsl: "search synth, filter\n\nmodPattern()\n  .smooth(type: blur, radius: 4)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "smooth", "blur", "modPattern"],
    description: "Mod pattern with smoothing blur applied"
  },
  {
    name: "spooky ticker",
    dsl: "search synth, filter\n\nperlin()\n  .spookyTicker()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "spookyTicker", "text", "overlay"],
    description: "Perlin noise with scrolling spooky ticker text overlay"
  },
  {
    name: "text overlay",
    dsl: "search synth, filter\n\nperlin(scale: 100)\n  .text()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "text", "overlay", "typography"],
    description: "Perlin noise with text overlay"
  },
  {
    name: "hair strands",
    dsl: "search synth, filter\n\nperlin(scale: 100)\n  .strayHair()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "strayHair", "texture", "overlay"],
    description: "Perlin texture with stray hair overlay for analog feel"
  },
  {
    name: "paper texture",
    dsl: "search synth, filter\n\nsolid(color: #d1d1d1)\n  .texture(alpha: 0.75)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "texture", "paper", "material"],
    description: "Light gray with paper texture overlay"
  },
  {
    name: "simple aberration",
    dsl: "search synth, filter\n\nnoise(ridges: true, colorMode: mono)\n  .simpleAberration()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "simpleAberration", "color-split", "analog"],
    description: "Monochrome noise with simple chromatic aberration"
  },
  {
    name: "barrel distort",
    dsl: "search synth, filter\n\nperlin(scale: 40, octaves: 2)\n  .lens(displacement: 0.5)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "lens", "distortion", "barrel"],
    description: "Perlin noise with barrel lens distortion"
  },
  {
    name: "bulge warp",
    dsl: "search synth, filter\n\ncurl(scale: 20)\n  .bulge()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "bulge", "distortion", "warp"],
    description: "Curl noise with center bulge distortion"
  },
  {
    name: "degaussed signal",
    dsl: "search synth, filter\n\nosc2d(freq: 12, speed: 3)\n  .degauss()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "degauss", "analog", "crt"],
    description: "Oscillator signal with degauss magnetic distortion"
  },
  {
    name: "heavy filter chain",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 3)\n  .blur(radiusX: 3)\n  .bloom(taps: 10)\n  .chromaticAberration()\n  .vignette()\n  .grain()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "chain", "post-processing", "cinematic"],
    description: "Noise through a cinematic post-processing chain: blur, bloom, aberration, vignette, grain"
  },
  {
    name: "scrolling noise",
    dsl: "search synth, filter\n\nnoise(ridges: true)\n  .scroll(speedX: 1, speedY: 0.5)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "scroll", "motion", "translate"],
    description: "Ridged noise with continuous scrolling motion"
  },
  {
    name: "skewed curl",
    dsl: "search synth, filter\n\ncurl(scale: 15, octaves: 2)\n  .skew(wrap: repeat)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "skew", "distortion", "curl"],
    description: "Curl noise with perspective skew transformation"
  },
  {
    name: "cinematic grade",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 3)\n  .grade(preset: cinematic)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "grade", "lut", "cinematic", "color-grading"],
    description: "Noise with cinematic LUT color grading applied"
  },
  {
    name: "noir grade",
    dsl: "search synth, filter\n\nperlin(scale: 40, octaves: 2, ridges: true)\n  .grade(preset: noir)\n  .vignette()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "grade", "noir", "lut", "moody"],
    description: "Perlin noise with noir LUT grading and vignette"
  },
  {
    name: "retro dither",
    dsl: "search synth, filter\n\nnoise(ridges: true)\n  .dither(type: bayer4x4, palette: commodore64)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "dither", "retro", "commodore64", "pixel-art"],
    description: "Noise dithered with Bayer matrix into Commodore 64 palette"
  },
  {
    name: "pico8 dither",
    dsl: "search synth, filter\n\ncell(scale: 60)\n  .dither(type: bayer8x8, palette: pico8, matrixScale: 3)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "dither", "retro", "pico8"],
    description: "Cell noise dithered into PICO-8 palette for retro game look"
  },
  {
    name: "cel shaded",
    dsl: "search synth, filter\n\nperlin(scale: 40, octaves: 2)\n  .celShading(levels: 4, edgeWidth: 2, edgeThreshold: 0.15)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "celShading", "cartoon", "toon", "edge"],
    description: "Perlin noise with cel-shading: quantized levels and edge outlines"
  },
  {
    name: "data corruption",
    dsl: "search synth, filter\n\nnoise(ridges: true)\n  .corrupt(intensity: 60, bandHeight: 15, sort: 40, channelShift: 30)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "corrupt", "glitch", "databend"],
    description: "Noise with data corruption glitch: banding, sorting, channel shift"
  },
  {
    name: "crt monitor",
    dsl: "search synth, filter\n\nosc2d(freq: 6, speed: 2)\n  .crt(speed: 1)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "crt", "retro", "monitor", "scanlines"],
    description: "Oscillator output through CRT monitor simulation"
  },
  {
    name: "octave warp",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 2)\n  .octaveWarp(freq: 3, octaves: 4, displacement: 0.3)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "octaveWarp", "domain-warping", "organic"],
    description: "Noise domain-warped through multi-octave displacement"
  },
  {
    name: "tiled noise",
    dsl: "search synth, filter\n\nnoise(ridges: true)\n  .tile(symmetry: rotate4, scale: 0.5, repeat: 3)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "tile", "symmetry", "repeat", "pattern"],
    description: "Noise tiled with 4-fold rotational symmetry"
  },
  {
    name: "seamless tile",
    dsl: "search synth, filter\n\nperlin(scale: 30, octaves: 3)\n  .seamless(blend: 0.2, repeat: 2)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "seamless", "tiling", "repeatable"],
    description: "Perlin noise made seamlessly tileable"
  },
  {
    name: "repeated grid",
    dsl: "search synth, filter\n\npolygon(sides: 5, radius: 0.3, bgAlpha: 0)\n  .repeat(x: 4, y: 4)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "repeat", "grid", "polygon"],
    description: "Pentagon polygon repeated in a 4x4 grid"
  },
  {
    name: "polar vortex",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 2)\n  .polar(mode: vortex, scale: 1.5, speed: 1)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "polar", "vortex", "distortion"],
    description: "Noise transformed through spinning polar vortex"
  },
  {
    name: "pixel mosaic",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 3)\n  .pixels(size: 16)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "pixels", "mosaic", "pixelate"],
    description: "Noise pixelated into 16px mosaic blocks"
  },
  {
    name: "edge detection",
    dsl: "search synth, filter\n\ncell(scale: 50)\n  .edge(kernel: bold, amount: 200, invert: on)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "edge", "detection", "outline"],
    description: "Cell noise with bold inverted edge detection"
  },
  {
    name: "posterized steps",
    dsl: "search synth, filter\n\nperlin(scale: 50, octaves: 3)\n  .posterize(levels: 6)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "posterize", "quantize", "levels"],
    description: "Perlin noise posterized to 6 discrete levels"
  },
  {
    name: "feedback self-refract",
    dsl: "search synth, filter\n\nnoise(ridges: true)\n  .feedback(blendMode: overlay, mix: 50, refractAAmt: 30, aberration: 20)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "feedback", "self-refract", "chromatic"],
    description: "Noise with overlay feedback, self-refraction and aberration"
  },
  {
    name: "warp distortion",
    dsl: "search synth, filter\n\ncell(scale: 40, cellSmooth: 50)\n  .warp(strength: 60, scale: 2)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "warp", "distortion", "organic"],
    description: "Cell noise warped with noise-based distortion"
  },
  {
    name: "pixel sort glitch",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 2)\n  .pixelSort()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "pixelSort", "glitch", "sort"],
    description: "Noise with pixel sorting glitch effect"
  },
  {
    name: "ukiyo-e palette",
    dsl: "search synth, filter\n\nperlin(scale: 30, octaves: 2, colorMode: mono)\n  .historicPalette(index: ukiyoe)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "historicPalette", "ukiyoe", "japanese"],
    description: "Perlin noise through ukiyo-e woodblock print palette"
  },
  {
    name: "pop art palette",
    dsl: "search synth, filter\n\nnoise(ridges: true, colorMode: mono)\n  .historicPalette(index: popArt, repeat: 2)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "historicPalette", "popArt", "bold"],
    description: "Ridged noise through pop art palette with double repeat"
  },
  {
    name: "cosine palette remap",
    dsl: "search synth, filter\n\nnoise(ridges: true, colorMode: mono)\n  .palette(index: brushedMetal)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "palette", "cosine", "color-remap"],
    description: "Monochrome noise remapped through brushedMetal cosine palette"
  },
  {
    name: "embossed noise",
    dsl: "search synth, filter\n\nnoise(ridges: true, octaves: 3)\n  .emboss()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "emboss", "relief", "3d-look"],
    description: "Noise with emboss filter for raised relief appearance"
  },
  {
    name: "sobel outlines",
    dsl: "search synth, filter\n\ncell(scale: 50)\n  .sobel()\n  .write(o0)\nrender(o0)",
    tags: ["filter", "sobel", "edge", "outline"],
    description: "Cell noise with Sobel edge detection for clean outlines"
  },
  {
    name: "grainy film",
    dsl: "search synth, filter\n\nperlin(scale: 40, octaves: 2)\n  .grade(preset: warmFilm)\n  .grain(alpha: 0.3)\n  .write(o0)\nrender(o0)",
    tags: ["filter", "grain", "film", "grade", "analog"],
    description: "Perlin with warm film grading and grain for analog feel"
  },
  // ── Mixer Programs ────────────────────────────────────────────────────
  {
    name: "blend multiply",
    dsl: "search synth, mixer\n\nnoise(ridges: true, colorMode: mono)\n  .write(o0)\n\nperlin()\n  .blendMode(tex: read(o0), mode: phoenix)\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "blendMode", "phoenix", "two-source"],
    description: "Perlin blended with monochrome noise using phoenix blend mode"
  },
  {
    name: "apply brightness",
    dsl: "search synth, mixer\n\nnoise(seed: 1, ridges: true)\n  .write(o0)\n\nperlin()\n  .applyMode(tex: read(o0))\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "applyMode", "brightness", "two-source"],
    description: "Apply brightness from ridged noise onto perlin noise"
  },
  {
    name: "alpha masked polygon",
    dsl: "search synth, mixer\n\npolygon(smooth: 0, bgAlpha: 0)\n  .write(o0)\n\nnoise(xScale: 100, yScale: 100)\n  .alphaMask(tex: read(o0))\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "alphaMask", "polygon", "masking"],
    description: "Noise masked by polygon alpha channel for shaped cutout"
  },
  {
    name: "center vignette blend",
    dsl: "search synth, mixer\n\nnoise(ridges: true, colorMode: mono)\n  .write(o0)\n\nnoise(ridges: true)\n  .centerMask(tex: read(o0), mix: -75)\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "centerMask", "vignette", "blend"],
    description: "Color noise centered with monochrome noise at edges via distance mask"
  },
  {
    name: "cell split noise",
    dsl: "search synth, mixer\n\nsolid(color: #000000)\n  .write(o0)\n\nnoise()\n  .cellSplit(tex: read(o0), invert: sourceB)\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "cellSplit", "voronoi", "masking"],
    description: "Noise split into voronoi cell regions against black"
  },
  {
    name: "distortion refract",
    dsl: "search synth, mixer\n\ncell()\n  .write(o0)\n\nnoise(ridges: true)\n  .distortion(tex: read(o0))\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "distortion", "refract", "displacement"],
    description: "Noise refracted through cell noise displacement map"
  },
  {
    name: "pattern stripe mix",
    dsl: "search synth, mixer\n\nnoise(ridges: true, colorMode: mono)\n  .write(o0)\n\nnoise(ridges: true)\n  .patternMix(tex: read(o0))\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "patternMix", "stripes", "geometric-blend"],
    description: "Two noise sources mixed through geometric stripe pattern"
  },
  {
    name: "drop shadow",
    dsl: "search synth, mixer\n\nnoise(xScale: 100, yScale: 100)\n  .write(o0)\n\nnoise(ridges: true, colorMode: mono)\n  .shadow(tex: read(o0))\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "shadow", "drop-shadow", "compositing"],
    description: "Monochrome noise casting shadow onto colored noise background"
  },
  {
    name: "shape masked noise",
    dsl: "search synth, mixer\n\nnoise(ridges: true, colorMode: mono)\n  .write(o0)\n\nnoise(ridges: true)\n  .shapeMask(tex: read(o0))\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "shapeMask", "circle", "masking"],
    description: "Noise composited inside and outside a circular shape mask"
  },
  {
    name: "soft split wipe",
    dsl: "search synth, mixer\n\nnoise(ridges: true, colorMode: mono)\n  .write(o0)\n\nnoise(seed: 2, ridges: true)\n  .split(tex: read(o0), softness: 1)\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "split", "wipe", "transition"],
    description: "Soft split wipe between two noise sources"
  },
  {
    name: "threshold mask",
    dsl: "search synth, mixer\n\nnoise()\n  .write(o0)\n\nsolid(color: #000000)\n  .thresholdMix(tex: read(o0))\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "thresholdMix", "threshold", "masking"],
    description: "Noise thresholded against solid black for binary mask effect"
  },
  {
    name: "uv remap",
    dsl: "search synth, mixer\n\npattern()\n  .write(o0)\n\nnoise(ridges: true)\n  .uvRemap(tex: read(o0), scale: 25)\n  .write(o1)\nrender(o1)",
    tags: ["mixer", "uvRemap", "displacement", "distortion"],
    description: "Noise UV coordinates remapped using pattern color channels"
  },
  // ── Points / Particle Systems ─────────────────────────────────────────
  {
    name: "basic flow field",
    dsl: "search points, synth, render\n\nnoise(ridges: true)\n  .pointsEmit(stateSize: x256)\n  .flow(behavior: obedient, stride: 10)\n  .pointsRender(density: 50, intensity: 75)\n  .write(o0)\nrender(o0)",
    tags: ["points", "flow", "field", "agents"],
    description: "Agent-based flow field following noise luminosity gradients"
  },
  {
    name: "crosshatch flow",
    dsl: "search points, synth, render\n\nperlin(scale: 50, octaves: 2)\n  .pointsEmit(stateSize: x512)\n  .flow(behavior: crosshatch, stride: 15)\n  .pointsRender(density: 60, intensity: 80)\n  .write(o0)\nrender(o0)",
    tags: ["points", "flow", "crosshatch", "drawing"],
    description: "Crosshatch drawing style flow field from perlin noise"
  },
  {
    name: "physical particles",
    dsl: "search points, synth, render\n\nnoise(ridges: true)\n  .pointsEmit(stateSize: x256)\n  .physical(gravity: 0.05, energy: 0.5, drag: 0.15)\n  .pointsRender(density: 50)\n  .write(o0)\nrender(o0)",
    tags: ["points", "physical", "gravity", "particles"],
    description: "Physics-based particles with gravity and drag"
  },
  {
    name: "zero-g particles",
    dsl: "search points, synth, render\n\nnoise(ridges: true)\n  .pointsEmit(stateSize: x512, attrition: 2)\n  .physical(gravity: 0, energy: 0.98, drag: 0.05, wander: 0.5)\n  .pointsRender(density: 80, intensity: 90)\n  .write(o0)\nrender(o0)",
    tags: ["points", "physical", "zero-gravity", "drift"],
    description: "Drifting zero-gravity particles with high energy and wandering"
  },
  {
    name: "flocking boids",
    dsl: "search points, synth, render\n\ncell()\n  .pointsEmit(stateSize: x256)\n  .flock(separation: 2, alignment: 1, cohesion: 1)\n  .pointsRender(density: 40)\n  .write(o0)\nrender(o0)",
    tags: ["points", "flock", "boids", "swarm"],
    description: "Boids flocking simulation with cell noise input"
  },
  {
    name: "lorenz attractor",
    dsl: "search points, synth, render\n\nnoise()\n  .pointsEmit(stateSize: x1024)\n  .attractor(attractor: lorenz, speed: 0.5)\n  .pointsRender(viewMode: ortho, density: 80, intensity: 95)\n  .write(o0)\nrender(o0)",
    tags: ["points", "attractor", "lorenz", "chaos", "3d-view"],
    description: "Lorenz strange attractor with 3D orthographic view"
  },
  {
    name: "physarum slime",
    dsl: "search points, synth, render\n\nnoise()\n  .pointsEmit(stateSize: x512)\n  .physarum(moveSpeed: 1.5, turnSpeed: 1, deposit: 0.5, decay: 0.1)\n  .pointsRender(density: 60, intensity: 85)\n  .write(o0)\nrender(o0)",
    tags: ["points", "physarum", "slime-mold", "simulation"],
    description: "Physarum slime mold agent simulation with trail deposits"
  },
  {
    name: "particle life",
    dsl: "search points, synth, render\n\nnoise()\n  .pointsEmit(stateSize: x512)\n  .life(typeCount: 6, attractionScale: 1, friction: 0.1)\n  .pointsRender(density: 50)\n  .write(o0)\nrender(o0)",
    tags: ["points", "life", "attraction", "emergent"],
    description: "Particle life with 6 types attracting and repelling each other"
  },
  {
    name: "dla crystal growth",
    dsl: "search points, synth, render\n\nnoise()\n  .pointsEmit(stateSize: x256)\n  .dla(stride: 15, deposit: 10, decay: 0.25)\n  .pointsRender(density: 50, intensity: 90)\n  .write(o0)\nrender(o0)",
    tags: ["points", "dla", "crystal", "aggregation"],
    description: "Diffusion-limited aggregation for crystal-like growth patterns"
  },
  {
    name: "hydraulic erosion",
    dsl: "search points, synth, render\n\nperlin(scale: 30, octaves: 3)\n  .pointsEmit(stateSize: x512)\n  .hydraulic(stride: 10)\n  .pointsRender(density: 60, intensity: 85)\n  .write(o0)\nrender(o0)",
    tags: ["points", "hydraulic", "erosion", "terrain"],
    description: "Hydraulic erosion flow on perlin terrain heightmap"
  },
  {
    name: "lenia artificial life",
    dsl: "search points, synth, render\n\nnoise()\n  .pointsEmit(stateSize: x512)\n  .lenia(muK: 25, sigmaK: 5, muG: 0.25, sigmaG: 0.15)\n  .pointsRender(density: 60, intensity: 85)\n  .write(o0)\nrender(o0)",
    tags: ["points", "lenia", "artificial-life", "continuous-ca"],
    description: "Particle Lenia continuous artificial life simulation"
  },
  {
    name: "billboard sprites",
    dsl: "search points, synth, render\n\npolygon(radius: 0.7, fgAlpha: 0.1, bgAlpha: 0)\n  .write(o0)\n\nnoise(ridges: true)\n  .pointsEmit(stateSize: x64)\n  .physical(gravity: 0, energy: 0.98, drag: 0.125)\n  .pointsBillboardRender(tex: read(o0), shapeMode: texture, pointSize: 40, sizeVariation: 50)\n  .write(o1)\nrender(o1)",
    tags: ["points", "billboard", "sprites", "textured-particles"],
    description: "Textured billboard particles using polygon as sprite source"
  },
  {
    name: "star particles",
    dsl: "search points, synth, render\n\nnoise(ridges: true)\n  .pointsEmit(stateSize: x256, layout: ring)\n  .physical(gravity: 0, energy: 0.9, wander: 0.5)\n  .pointsBillboardRender(shapeMode: star, pointSize: 12, sizeVariation: 80)\n  .write(o0)\nrender(o0)",
    tags: ["points", "billboard", "star", "ring-layout"],
    description: "Star-shaped billboard particles emitted in a ring layout"
  },
  // ── Feedback Loops ────────────────────────────────────────────────────
  {
    name: "warp feedback",
    dsl: "search synth, filter, render\n\nnoise(ridges: true)\n  .loopBegin(alpha: 95, intensity: 95)\n  .warp()\n  .loopEnd()\n  .write(o0)\nrender(o0)",
    tags: ["feedback", "loop", "warp", "accumulator"],
    description: "Classic warp feedback loop \u2014 noise warps its own previous frame"
  },
  {
    name: "blur feedback",
    dsl: "search synth, filter, render\n\ncurl(scale: 20, ridges: true)\n  .loopBegin(alpha: 90, intensity: 90)\n  .blur(radiusX: 2)\n  .warp()\n  .loopEnd()\n  .write(o0)\nrender(o0)",
    tags: ["feedback", "loop", "blur", "warp", "dreamy"],
    description: "Curl noise with blur and warp feedback for dreamy smearing effect"
  },
  {
    name: "edge feedback",
    dsl: "search synth, filter, render\n\nperlin(scale: 40, octaves: 2)\n  .loopBegin(alpha: 92, intensity: 88)\n  .edge()\n  .bloom(taps: 8)\n  .loopEnd()\n  .write(o0)\nrender(o0)",
    tags: ["feedback", "loop", "edge", "bloom", "glow"],
    description: "Perlin noise with edge detection and bloom in feedback loop"
  },
  // ── 3D Volumetric ─────────────────────────────────────────────────────
  {
    name: "3d noise volume",
    dsl: "search synth3d, filter3d, render\n\nnoise3d(volumeSize: x64, octaves: 2, ridges: true)\n  .render3d()\n  .write(o0)\nrender(o0)",
    tags: ["3d", "noise3d", "volume", "raymarching"],
    description: "3D ridged noise volume rendered with raymarching"
  },
  {
    name: "3d lit noise",
    dsl: "search synth3d, filter3d, render\n\nnoise3d()\n  .renderLit3d(specularIntensity: 2, shininess: 256)\n  .write(o0)\nrender(o0)",
    tags: ["3d", "noise3d", "lit", "phong"],
    description: "3D noise volume with specular Phong lighting"
  },
  {
    name: "3d fractal",
    dsl: "search synth3d, filter3d, render\n\nfractal3d(volumeSize: x64, type: mandelbulb, power: 8, iterations: 10)\n  .render3d()\n  .write(o0)\nrender(o0)",
    tags: ["3d", "fractal3d", "mandelbulb", "fractal"],
    description: "3D Mandelbulb fractal volume raymarched at 64^3 resolution"
  },
  {
    name: "3d flythrough",
    dsl: "search synth3d, filter3d, render\n\nflythrough3d(type: mandelbulb, power: 8, speed: 0.2)\n  .render3d()\n  .write(o0)\nrender(o0)",
    tags: ["3d", "flythrough3d", "mandelbulb", "camera"],
    description: "Mandelbulb fractal flythrough with camera-relative volume"
  },
  {
    name: "3d cell noise",
    dsl: "search synth3d, filter3d, render\n\ncell3d(volumeSize: x64, metric: sphere, scale: 10, colorMode: rgb)\n  .render3d()\n  .write(o0)\nrender(o0)",
    tags: ["3d", "cell3d", "voronoi", "volume"],
    description: "3D voronoi cell noise volume in RGB color mode"
  },
  {
    name: "3d shape morph",
    dsl: "search synth3d, filter3d, render\n\nshape3d(loopAOffset: dodecahedron, loopBOffset: sphere, speedA: -2, speedB: 2)\n  .render3d(threshold: 0.75)\n  .write(o0)\nrender(o0)",
    tags: ["3d", "shape3d", "morph", "polyhedra"],
    description: "3D shape morph between dodecahedron and sphere"
  },
  {
    name: "3d cellular automata",
    dsl: "search synth3d, filter3d, render\n\nca3d(ruleIndex: diamoeba, volumeSize: x32)\n  .render3d()\n  .write(o0)\nrender(o0)",
    tags: ["3d", "ca3d", "cellular-automata", "simulation"],
    description: "3D diamoeba cellular automaton rendered as volume"
  },
  {
    name: "3d reaction diffusion",
    dsl: "search synth3d, filter3d, render\n\nrd3d(volumeSize: x32, iterations: 16, colorMode: gradient)\n  .render3d()\n  .write(o0)\nrender(o0)",
    tags: ["3d", "rd3d", "reaction-diffusion", "simulation"],
    description: "3D reaction-diffusion with gradient coloring"
  },
  {
    name: "3d flow field",
    dsl: "search synth3d, filter3d, render\n\nnoise3d(volumeSize: x32)\n  .flow3d(behavior: obedient, stride: 1, density: 20)\n  .render3d()\n  .write(o0)\nrender(o0)",
    tags: ["3d", "flow3d", "filter3d", "agents"],
    description: "3D agent-based flow field inside a noise volume"
  },
  // ── Combined / Multi-Chain (Modern Namespace) ─────────────────────────
  {
    name: "noise + filter + mixer",
    dsl: "search synth, filter, mixer\n\nnoise(ridges: true, octaves: 3)\n  .bloom(taps: 10)\n  .write(o0)\n\nperlin(scale: 40, octaves: 2)\n  .blendMode(tex: read(o0), mode: screen)\n  .vignette()\n  .write(o1)\nrender(o1)",
    tags: ["combined", "mixer", "filter", "blendMode", "screen"],
    description: "Bloomed noise and perlin screen-blended with vignette"
  },
  {
    name: "flow on cell noise",
    dsl: "search points, synth, render\n\ncell(scale: 60, cellSmooth: 20)\n  .pointsEmit(stateSize: x512)\n  .flow(behavior: meandering, stride: 12)\n  .pointsRender(density: 70, intensity: 85)\n  .write(o0)\nrender(o0)",
    tags: ["combined", "points", "flow", "cell", "meandering"],
    description: "Meandering flow agents tracing cell noise gradients"
  },
  {
    name: "feedback into mixer",
    dsl: "search synth, filter, mixer, render\n\nnoise(ridges: true)\n  .loopBegin(alpha: 90, intensity: 90)\n  .warp()\n  .loopEnd()\n  .write(o0)\n\nperlin(scale: 30)\n  .blendMode(tex: read(o0), mode: overlay)\n  .write(o1)\nrender(o1)",
    tags: ["combined", "feedback", "mixer", "overlay"],
    description: "Warp feedback loop blended with perlin via overlay"
  },
  {
    name: "distorted shapes",
    dsl: "search synth, mixer\n\nshape(loopAOffset: icosahedron, loopBOffset: torus, wrap: true)\n  .write(o0)\n\nnoise(ridges: true)\n  .distortion(tex: read(o0), mode: refract, intensity: 70)\n  .write(o1)\nrender(o1)",
    tags: ["combined", "mixer", "distortion", "shape", "refract"],
    description: "Noise refracted through shape morph displacement"
  },
  {
    name: "lit 3d with bloom",
    dsl: "search synth3d, filter3d, filter, render\n\nnoise3d(octaves: 2, ridges: true)\n  .renderLit3d(specularIntensity: 1.5, shininess: 128)\n  .bloom(taps: 12)\n  .vignette()\n  .write(o0)\nrender(o0)",
    tags: ["combined", "3d", "lighting", "bloom", "post-processing"],
    description: "3D lit noise volume with bloom and vignette post-processing"
  }
];
function searchExemplars(query, maxResults = 5) {
  const tokens = query.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 1);
  if (tokens.length === 0) return DSL_EXEMPLAR_PROGRAMS.slice(0, maxResults);
  const scored = DSL_EXEMPLAR_PROGRAMS.map((program) => {
    const searchText = [
      program.name,
      ...program.tags,
      program.description
    ].join(" ").toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (program.tags.some((tag) => tag === token)) {
        score += 3;
      }
      if (program.name.toLowerCase().includes(token)) {
        score += 2;
      }
      if (searchText.includes(token)) {
        score += 1;
      }
    }
    return { program, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, maxResults).map((s) => s.program);
}

// src/knowledge/state-bundles.ts
var RESEARCH_KNOWLEDGE = `
## RESEARCH PHASE EXPERTISE
Find templates. Determine what the effects can do.

**USE search_shader_knowledge** when you need to understand DSL syntax, effect patterns, or GLSL techniques.
Query: "how to structure a filter effect", "noise function patterns", etc.

${EFFECT_CATALOG}

${COMPACT_SHADER_KNOWLEDGE}
`;
var PLAN_KNOWLEDGE = `
## PLAN PHASE EXPERTISE
You create the effect specification. You are an expert in DSL and Effect Definition format.
Do NOT write GLSL shader code. Specify what the GENERATE phase should implement.

${DSL_CRITICAL_RULES}

${DSL_SCAFFOLDING_PATTERNS}

${DSL_REFERENCE}

${EFFECT_DEFINITION_REFERENCE}

${EFFECT_DEFINITION_DEEP}

### Your Output: Effect Specification JSON
{
  "effectName": "camelCaseName",
  "namespace": "synth|filter|points|render|mixer",
  "templateEffectId": "namespace/effectName or null",
  "definitionSpec": {
    "globals": { /* uniform definitions */ }
  },
  "shaderDirectives": {
    "technique": "noise|fractal|voronoi|geometric|flow",
    "colorStrategy": "palette|hsv-rotation|grayscale",
    "animationApproach": "What moves and how",
    "uniformUsage": { "uniformName": "How to use in shader" }
  },
  "dslProgram": "search namespace\\neffectName().write(o0)\\nrender(o0)"
}
`;
var GENERATE_KNOWLEDGE = `
## GENERATE PHASE EXPERTISE
You implement the shader code. You are an expert in GLSL and uniform wiring.
You follow the specification from the PLAN phase exactly.

${GLSL_REFERENCE}

${GLSL_RECIPES}

${REQUIRED_PATTERNS}

### Uniform Wiring Rules
1. You MUST declare every uniform from definition.js in GLSL.
2. Types must match: float\u2192float, int\u2192int, boolean\u2192bool, vec2\u2192vec2, vec3\u2192vec3, vec4\u2192vec4
3. Standard uniforms (always available): time, resolution
4. For filters, declare \`uniform sampler2D inputTex;\`.

## \u{1F6D1}\u{1F6D1}\u{1F6D1} NOISE LOOPING - READ BEFORE CODING \u{1F6D1}\u{1F6D1}\u{1F6D1}

**For animated noise, ALWAYS use the timeCircle pattern.**

### ANIMATED NOISE PATTERN (use this exactly):
\`\`\`glsl
float t = time * TAU;
vec2 timeCircle = vec2(cos(t), sin(t));
float n = noise(uv * scale + timeCircle * 0.5);
\`\`\`

Use this prescribed pattern for animated noise in generated shaders.

###  SEAMLESS LOOPING - HARD REQUIREMENTS

**Time is 1-periodic on [0,1]. The loop must have no visible pop, stutter, or hard reset.**

**THE DERIVATIVE RULE (WHY LOOPS FAIL):**
Matching value(0) == value(1) is NOT ENOUGH! The **velocity/derivative** must ALSO match:
- value(0) == value(1)  \u2190 position matches
- value'(0) == value'(1) \u2190 velocity matches (smooth motion through boundary)

If the velocities do not match, a "hard reset" occurs at t\u22480.999, even if the values match.
**Use sin(), cos(), or periodicValue() as the time basis for generated animation.**
Use integer cycle counts when these functions receive raw time. Both values and derivatives must match at the loop endpoints.
Do not use raw nonperiodic time as the animation signal. Do not substitute ramps from fract(), mod(), smoothstep(), or custom easing.
Spatial uses of fract(), mod(), and smoothstep() are permitted. Compositions with periodic signals must preserve both endpoint values and derivatives.
Check the final animated result. A function name alone does not guarantee a loop.

**THE BLEUJE PATTERN (Approved Looping Method):**
Use a periodic function with an offset. Everything uses the same looping time basis. Each element varies through an offset.

\`\`\`glsl
// Core looping helpers - COPY THESE EXACTLY
const float TAU = 6.28318530717958647692;

float normalizedSine(float x) {
    return 0.5 + 0.5 * sin(x);
}

// The Bleuje periodic value pattern: normalized_sine((time - offset) * TAU)
float periodicValue(float time, float offset) {
    return normalizedSine((time - offset) * TAU);
}
\`\`\`

**HARD REQUIREMENTS - VERIFY BEFORE SHIPPING:**

1. **SEAM EQUALITY + DERIVATIVE CONTINUITY**
   - value(0) == value(1) AND value'(0) == value'(1)
   - sin() and cos() with integer cycles of raw time satisfy BOTH conditions. Check both conditions after composition.

2. **ROTATION**: \`angle = float(N) * TAU * time\` where N is integer (1, 2, 3...)

3. **TRANSLATION**: Use circular or oscillating motion
   - Circular: \`pos = start + radius * vec2(cos(TAU * time), sin(TAU * time))\`
   - Oscillation: \`pos = start + dir * (amplitude * sin(TAU * time))\`

4. **NOISE**: Use timeCircle pattern
   - \`vec2 tc = vec2(cos(TAU*time), sin(TAU*time)); noise(uv + tc*0.5);\`

**APPROVED HELPER FUNCTIONS (copy exactly):**
\`\`\`glsl
// Rotation: N MUST be integer
float loopedAngle(float time, float offsetTurns, int rotationsN, float angle0) {
    return angle0 + TAU * (offsetTurns + float(rotationsN) * time);
}

// Translation on circle: cyclesN MUST be integer
vec2 loopedTranslateCircle(vec2 start, float time, float radius, float offsetTurns, int cyclesN) {
    float phase = offsetTurns + float(cyclesN) * time;
    return start + radius * vec2(cos(TAU * phase), sin(TAU * phase));
}

// Linear-looking motion that loops (sine oscillation): cyclesN MUST be integer
vec2 loopedTranslateLine(vec2 start, vec2 dirUnit, float time, float amplitude, float offsetTurns, int cyclesN) {
    float phase = offsetTurns + float(cyclesN) * time;
    float d = sin(TAU * phase);  // smooth, returns to 0 at t=0 and t=1
    return start + dirUnit * (amplitude * d);
}

// Looping noise via time-circle (4D simplex)
float loopedNoise4D(vec2 p, float time, float spatialScale, float offsetTurns, float speedTurns) {
    float phase = (time * speedTurns) + offsetTurns;
    vec2 tc = vec2(cos(TAU * phase), sin(TAU * phase));
    return simplexNoise4D(vec4(p * spatialScale, tc));
}

// Stable hash for seeded offsets
uint hash_u32(uint x) {
    x ^= x >> 16u; x *= 0x7FEB352Du;
    x ^= x >> 15u; x *= 0x846CA68Bu;
    x ^= x >> 16u; return x;
}
float hash01(uint x) { return float(hash_u32(x) & 0x00FFFFFFu) / float(0x01000000u); }

// Looped scalar with noise-driven offset (full Bleuje pattern)
float loopedScalar(float time, float speed, uint baseSeed, float valueNoise) {
    uint timeSeed = baseSeed + 0x9E3779B1u;
    float timeNoise = hash01(timeSeed);
    float scaledTime = periodicValue(time, timeNoise) * speed;
    return periodicValue(scaledTime, valueNoise);
}
\`\`\`

**Animation primitives (use these for all animation):**
\`\`\`glsl
float t = time * TAU;
float pulse = 0.5 + 0.5 * sin(t);        // Smooth 0\u21921\u21920
float wave = sin(t);                      // Smooth -1\u21921\u2192-1
float angle = t * 2.0;                    // 2 full rotations
vec2 timeCircle = vec2(cos(t), sin(t));  // For noise animation
float n = noise(uv * scale + timeCircle * 0.5);  // Animated noise
\`\`\`

##  WILL IT LOOP - MANDATORY VERIFICATION

**Treat time as 1-periodic on [0,1]: t=1 must be IDENTICAL to t=0**
**All time-driven values must be continuous across the boundary with no visible "pop" at the seam.**

### Core Principle: Periodic Function + Offset
The approved mental model (from \xC9tienne Jacob aka Bleuje):
- Use a periodic function with an offset or delay.
- Everything uses the same looping time basis.
- Each element varies through an offset.

### Hard Requirements (VERIFY ALL BEFORE SHIPPING):

1. **SEAM EQUALITY + DERIVATIVE CONTINUITY**
   - For EVERY animated scalar/vector: value(0) == value(1)
   - The seam must be smooth: use periodic functions (sin/cos families)
   - Use sin() or cos() for all time-based animation

2. **ROTATION = INTEGER TURNS**
   - Canonical form: \`angle(t) = angle0 + (offset * TAU) + (N * TAU * time)\`
   - N MUST be an INTEGER (1, 2, 3). Complete turns only.

3. **TRANSLATION = CLOSED LOOP**
   - Must return to EXACT starting point at t=1
   - Circle path: \`pos = start + radius * vec2(cos(TAU * phase), sin(TAU * phase))\`
   - Oscillation: \`pos = start + dir * (amplitude * sin(TAU * phase))\`

4. **NOISE = CIRCLE-SAMPLED (Bleuje Tutorial 3)**
   - Map time to a circle.
   - Sample noise at that point:
   \`\`\`glsl
   vec2 tc = vec2(cos(TAU * time), sin(TAU * time));
   float n = noise4D(vec4(uv * scale, tc));
   \`\`\`
   - For spatially-varying looping noise, use 4D noise (2 dims for time-circle, 2 for space)

### PRE-SHIP CHECKLIST (MANDATORY):
- [ ] Is ALL time-based animation using sin(), cos(), or periodicValue()?
- [ ] Are ALL cycle/rotation counts INTEGERS? (1, 2, 3)
- [ ] Is noise sampled on a time-circle?
- [ ] Does the derivative (velocity) also loop in the final animated result?
- [ ] Have you verified value(0) == value(1) for EVERY animated channel?
`;
var VALIDATE_KNOWLEDGE = `
## VALIDATE PHASE EXPERTISE
Check that the effect package is complete and correct.

### Validation Checklist
1. Check that GLSL declares all uniforms from definition.js.
2. Check that definition.js globals include all GLSL uniforms.
3. Check that the DSL program uses the correct scaffolding pattern for the effect type.
4. Check that animation uses sin(time*TAU) or cos(time*TAU), never raw time.
5. Check that filter effects chain from a generator.
6. Check that mixer effects have a tex: read(surface) parameter.
`;
var FIX_KNOWLEDGE = `
## FIX PHASE EXPERTISE
You diagnose and fix specific issues. Focus on the problem. Do not rebuild the effect from the beginning.

### CRITICAL: "Unknown effect" Error

If compile_dsl returns "Unknown effect: '<name>'":

1. **Did create_effect succeed?** Check the previous tool result.
2. **Does the DSL include 'search user'?** Your effect belongs to the USER namespace.
3. **Does the name match EXACTLY?** Check every character, including letter case.

Use this DSL structure:
\`\`\`
search user
yourEffectName().write(o0)
render(o0)
\`\`\`

### Common Issues and Fixes
- **Unknown effect**: Check DSL has "search user" and name matches create_effect
- isMonochrome: Add color with mix(color1, color2, value) or HSV rotation
- isStatic: Add animation with sin(time * TAU) or cos(time * TAU)
- uniformMismatch: Ensure GLSL declares all definition.js uniforms
- compilationError: Fix GLSL syntax errors

${REQUIRED_PATTERNS}

### Fix Guidelines
- Modify ONLY what's broken
- Don't restructure working code
- Test after each fix with validate_effect
`;
var DSL_RESEARCH_KNOWLEDGE = `
## DSL RESEARCH PHASE
Find effects and example programs to compose a DSL program.

${EFFECT_CATALOG}

${DSL_REFERENCE}
`;
var DSL_PLAN_KNOWLEDGE = `
## DSL PLAN PHASE
You design the chain architecture for a DSL program.

${DSL_REFERENCE}

${DSL_SCAFFOLDING_PATTERNS}

${DSL_EXEMPLAR_PATTERNS}
`;
var DSL_GENERATE_KNOWLEDGE = `
## DSL GENERATE PHASE
You emit a DSL program string from the plan.

${DSL_CRITICAL_RULES}

${DSL_SCAFFOLDING_PATTERNS}

${DSL_EXEMPLAR_PATTERNS}
`;
var DSL_FIX_KNOWLEDGE = `
## DSL FIX PHASE
You fix issues with a DSL program.

${DSL_CRITICAL_RULES}

${DSL_SCAFFOLDING_PATTERNS}
`;
var FULL_SHADER_KNOWLEDGE = `
${AGENT_WORKFLOW_KNOWLEDGE}

${DSL_CRITICAL_RULES}

${DSL_SCAFFOLDING_PATTERNS}

${DSL_REFERENCE}

${EFFECT_CATALOG}

${EFFECT_DEFINITION_REFERENCE}

${EFFECT_DEFINITION_DEEP}

${GLSL_REFERENCE}

${GLSL_RECIPES}

${EFFECT_ANATOMY_KNOWLEDGE}

${REQUIRED_PATTERNS}
`;
export {
  AGENT_WORKFLOW_KNOWLEDGE,
  COMPACT_SHADER_KNOWLEDGE,
  CRITICAL_RULES,
  CURATED_KNOWLEDGE,
  DSL_CRITICAL_RULES,
  DSL_EXEMPLAR_PATTERNS,
  DSL_EXEMPLAR_PROGRAMS,
  DSL_FIX_KNOWLEDGE,
  DSL_GENERATE_KNOWLEDGE,
  DSL_PLAN_KNOWLEDGE,
  DSL_REFERENCE,
  DSL_RESEARCH_KNOWLEDGE,
  DSL_SCAFFOLDING_PATTERNS,
  EFFECT_ANATOMY_KNOWLEDGE,
  EFFECT_CATALOG,
  EFFECT_DEFINITION_DEEP,
  EFFECT_DEFINITION_REFERENCE,
  EffectIndex,
  FIX_KNOWLEDGE,
  FULL_SHADER_KNOWLEDGE,
  GENERATE_KNOWLEDGE,
  GLSL_RECIPES,
  GLSL_REFERENCE,
  GlslIndex,
  INNATE_SHADER_KNOWLEDGE,
  PLAN_KNOWLEDGE,
  REQUIRED_PATTERNS,
  RESEARCH_KNOWLEDGE,
  ShaderKnowledgeDB,
  TECHNIQUE_SYNONYMS,
  VALIDATE_KNOWLEDGE,
  expandQueryWithSynonyms,
  getKnowledgeByTopic,
  getShaderKnowledgeDB,
  getSharedEffectIndex,
  invalidateSharedEffectIndex,
  retrieveForAgent,
  retrieveLoopSafeExamples,
  searchByLoopPattern,
  searchExemplars,
  searchShaderKnowledge
};
//# sourceMappingURL=index.js.map