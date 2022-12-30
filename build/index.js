"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const interpriter_1 = require("./src/interpriter");
const [, , ...args] = process.argv;
console.log(args);
const fileName = process.argv.length > 2 ? process.argv[2] : 'main.ncss';
fs_1.default.readFile(fileName, "utf-8", (err, data) => {
    if (err)
        throw console.log(err.message);
    (0, interpriter_1.evaluate)(data);
});
