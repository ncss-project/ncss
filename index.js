import fs from 'fs';
import { evaluate } from './src/interpriter.js';

const fileName = process.argv.length > 2 ? process.argv[2] : 'main.scss';
fs.readFile(fileName, "utf-8", (err, data) => {
    if (err) throw console.log(err.message);
    console.log(evaluate(data));
});