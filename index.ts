import fs from 'fs';
import { evaluate } from './src/interpriter';

const fileName = process.argv.length > 2 ? process.argv[2] : 'main.ncss';
fs.readFile(fileName, "utf-8", (err, data) => {
    if (err) throw console.log(err.message);
    console.log(evaluate(data));
});