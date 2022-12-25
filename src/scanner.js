import { $ } from "./util.js";

export class Scanner {
  constructor(text) {
    const tokenize = (word) => {
      switch (true) {
        case word == "#":
          return $("FUNCDEF", word);
        case word == "[":
          return $("SQ_PARENTHES_OPEN", word);
        case word == "]":
          return $("SQ_PARENTHES_CLOSE", word);
        case word == "(":
          return $("PARENTHES_OPEN", word);
        case word == ")":
          return $("PARENTHES_CLOSE", word);
        case word == "{":
          return $("BEGIN", word);
        case word == "}":
          return $("END", word);
        case word == ".while":
          return $("WHILE", word);
        case word == ".if":
          return $("IF", word);
        case word == ".else":
          return $("ELSE", word);
        case word == "break":
          return $("BREAK", word);
        case word == "return":
          return $("RETURN", word);
        case word == "==":
        case word == ">":
        case word == "<":
        case word == ">=":
        case word == "<=":
        case word == "!=":
          return $("OP_REL", word);
        case word == "+":
        case word == "-":
          return $("OP_ADD", word);
        case word == "*":
        case word == "/":
        case word == "%":
          return $("OP_MUL", word);
        case word == "=":
          return $("ASSIGN", word);
        case word == ":":
          return $("COLON", word);
        case word == ";":
          return $("SEMICOLON", word);
        case word == ",":
          return $("COMMA", word);
        case word == "true":
          return $("BOOL", true);
        case word == "false":
          return $("BOOL", false);
        case (/^\d+/).test(word):
          return $("INT", parseInt(word));
        case (/"(.*)"/).test(word):
          return $("STRING", word.match(/"(.*)"/)[1]);
        default:
          return $("IDENT", word);
      }
    };
    const split = (text) => {
      const tokens = [];
      let idx = 0;
      while (idx < text.length) {
        const x = text[idx];

        if ((/["']/).test(x)) { // scan-latter
          const quotation = x;
          let str = '"';
          idx++;
          for (; (text[idx]) != quotation; idx++) {
            str += text[idx];
          }
          str += '"';
          idx++;
          tokens.push(tokenize(str));
        } else if ((/=|<|>|!/).test(x)) { // scan-eq
          let op = text[idx];
          idx++;
          if (text[idx] === "=") {
            op += text[idx];
            idx++;
          }

          tokens.push(tokenize(op));
        } else if ((/\d/).test(x)) { // scan-int
          let num = "";
          for (; (/\d/).test(text[idx]); idx++) {
            num += text[idx];
          }
          tokens.push(tokenize(num));
        } else if ((/[a-zA-Z\.]/).test(x)) { // scan-latter
          let latter = text[idx];
          idx++;
          for (; (/[a-zA-Z0-9_]/).test(text[idx]); idx++) {
            latter += text[idx];
          }
          tokens.push(tokenize(latter));
        } else if (x === " " || x === "\n") { // skip
          idx += 1;
        } else {
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
