"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const error_1 = require("./components/error");
const util_1 = require("./components/util");
class Scanner {
    constructor(text) {
        const tokenize = (word) => {
            switch (word) {
                case "#":
                    return (0, util_1.$)("FUNCDEF", word);
                case "[":
                    return (0, util_1.$)("SQ_PARENTHES_OPEN", word);
                case "]":
                    return (0, util_1.$)("SQ_PARENTHES_CLOSE", word);
                case "(":
                    return (0, util_1.$)("PARENTHES_OPEN", word);
                case ")":
                    return (0, util_1.$)("PARENTHES_CLOSE", word);
                case "{":
                    return (0, util_1.$)("BEGIN", word);
                case "}":
                    return (0, util_1.$)("END", word);
                case ".while":
                    return (0, util_1.$)("WHILE", word);
                case ".if":
                    return (0, util_1.$)("IF", word);
                case ".else":
                    return (0, util_1.$)("ELSE", word);
                case "break":
                    return (0, util_1.$)("BREAK", word);
                case "return":
                    return (0, util_1.$)("RETURN", word);
                case "==":
                case ">":
                case "<":
                case ">=":
                case "<=":
                case "!=":
                    return (0, util_1.$)("OP_REL", word);
                case "+":
                case "-":
                    return (0, util_1.$)("OP_ADD", word);
                case "*":
                case "/":
                case "%":
                    return (0, util_1.$)("OP_MUL", word);
                case "=":
                    return (0, util_1.$)("ASSIGN", word);
                case ":":
                    return (0, util_1.$)("COLON", word);
                case ";":
                    return (0, util_1.$)("SEMICOLON", word);
                case ",":
                    return (0, util_1.$)("COMMA", word);
                case "true":
                    // @ts-expect-error TS(2345): Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
                    return (0, util_1.$)("BOOL", true);
                case "false":
                    // @ts-expect-error TS(2345): Argument of type 'false' is not assignable to para... Remove this comment to see the full error message
                    return (0, util_1.$)("BOOL", false);
                default:
                    if (word[0] === ".")
                        return (0, util_1.$)("GROUP", word);
                    else if (/^(\-\-)/.test(word))
                        return (0, util_1.$)("VARIABLE", word);
                    else if (/^[-]?\d+\.[\d]+$/.test(word))
                        return (0, util_1.$)("FLOAT", parseFloat(word));
                    else if (/^[-]?\d+$/.test(word))
                        return (0, util_1.$)("INT", parseInt(word));
                    else if (/^"(.*)"$/.test(word)) {
                        const w1 = word.slice(1);
                        const w2 = w1.slice(0, -1);
                        return (0, util_1.$)("STRING", w2);
                    }
                    else
                        return (0, util_1.$)("IDENT", word);
            }
        };
        const split = (text) => {
            const tokens = [];
            let idx = 0;
            while (idx < text.length) {
                const x = text[idx];
                if ((((/["']/))).test(x)) {
                    const quotation = x;
                    let str = '"';
                    idx += 1;
                    for (; (text[idx]) != quotation; idx++) {
                        str += text[idx];
                    }
                    str += '"';
                    idx += 1;
                    const a = tokenize(str);
                    tokens.push(a);
                }
                else if ((((/[=<>!]/))).test(x)) {
                    let op = text[idx];
                    idx += 1;
                    if (text[idx] === "=") {
                        op += text[idx];
                        idx += 1;
                    }
                    tokens.push(tokenize(op));
                }
                else if ((((/\d/))).test(x)) {
                    let num = "";
                    for (; (((/[.\d]/))).test(text[idx]); idx++) {
                        num += text[idx];
                    }
                    tokens.push(tokenize(num));
                }
                else if ((((/[a-zA-Z\.]/))).test(x)) {
                    let latter = text[idx];
                    idx += 1;
                    for (; (((/[a-zA-Z0-9_\-]/))).test(text[idx]); idx++) {
                        latter += text[idx];
                    }
                    tokens.push(tokenize(latter));
                }
                else if (x === " " || x === "\n") {
                    idx += 1;
                }
                else if (x === "-") {
                    idx += 1;
                    if (text[idx] === "-") {
                        let latter = "--";
                        idx += 1;
                        for (; (((/[a-zA-Z0-9_\-]/))).test(text[idx]); idx++) {
                            latter += text[idx];
                        }
                        tokens.push(tokenize(latter));
                    }
                    else if ((((/[\d]/))).test(text[idx])) {
                        let latter = `-${text[idx]}`;
                        idx += 1;
                        for (; (((/[.\d]/))).test(text[idx]); idx++) {
                            latter += text[idx];
                        }
                        tokens.push(tokenize(latter));
                    }
                    else {
                        tokens.push(tokenize(x));
                    }
                }
                else if (x === "/") {
                    idx += 1;
                    if (text[idx] === "*") {
                        idx += 1;
                        while (text[idx - 1] !== "*" || text[idx] !== "/") {
                            idx += 1;
                            if (text.length <= idx)
                                throw new Error(error_1.Errors.syntax.comment_is_not_closed());
                        }
                        idx += 1;
                    }
                    else {
                        tokens.push(tokenize(x));
                    }
                }
                else {
                    tokens.push(tokenize(x));
                    idx += 1;
                }
            }
            return tokens;
        };
        this.tokens = split(text);
        this.pos = 0;
    }
    is_not_end() {
        return this.pos < this.tokens.length - 1;
    }
    next() {
        this.pos += 1;
        return this.tokens[this.pos];
    }
    peek() {
        return this.tokens[this.pos];
    }
}
exports.Scanner = Scanner;
