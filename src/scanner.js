import { Errors } from "./components/error.js";
import { $ } from "./util.js";

export class Scanner {
  constructor(text) {
    const tokenize = (word) => {
      switch (word) {
        case "#":
          return $("FUNCDEF", word);
        case "[":
          return $("SQ_PARENTHES_OPEN", word);
        case "]":
          return $("SQ_PARENTHES_CLOSE", word);
        case "(":
          return $("PARENTHES_OPEN", word);
        case ")":
          return $("PARENTHES_CLOSE", word);
        case "{":
          return $("BEGIN", word);
        case "}":
          return $("END", word);
        case ".while":
          return $("WHILE", word);
        case ".if":
          return $("IF", word);
        case ".else":
          return $("ELSE", word);
        case "break":
          return $("BREAK", word);
        case "return":
          return $("RETURN", word);
        case "==":
        case ">":
        case "<":
        case ">=":
        case "<=":
        case "!=":
          return $("OP_REL", word);
        case "+":
        case "-":
          return $("OP_ADD", word);
        case "*":
        case "/":
        case "%":
          return $("OP_MUL", word);
        case "=":
          return $("ASSIGN", word);
        case ":":
          return $("COLON", word);
        case ";":
          return $("SEMICOLON", word);
        case ",":
          return $("COMMA", word);
        case "true":
          return $("BOOL", true);
        case "false":
          return $("BOOL", false);
        default:
          if ((/^(\-\-)/).test(word))
            return $("VARIABLE", word);

          if ((/^\d+/).test(word))
            return $("INT", parseInt(word));

          else if ((/"(.*)"/).test(word))
            return $("STRING", word.match(/"(.*)"/)[1]);

          else
            return $("IDENT", word);
      }
    };
    const split = (text) => {
      const tokens = [];
      let idx = 0;
      while (idx < text.length) {
        const x = text[idx];

        if ((/["']/).test(x)) {
          const quotation = x;
          let str = '"';
          idx += 1;
          for (; (text[idx]) != quotation; idx++) {
            str += text[idx];
          }
          str += '"';
          idx += 1;
          tokens.push(tokenize(str));
        } else if ((/[=<>!]/).test(x)) {
          let op = text[idx];
          idx += 1;
          if (text[idx] === "=") {
            op += text[idx];
            idx += 1;
          }

          tokens.push(tokenize(op));
        } else if ((/\d/).test(x)) {
          let num = "";
          for (; (/\d/).test(text[idx]); idx++) {
            num += text[idx];
          }
          tokens.push(tokenize(num));
        } else if ((/[a-zA-Z\.]/).test(x)) {
          let latter = text[idx];
          idx += 1;
          for (; (/[a-zA-Z0-9_\-]/).test(text[idx]); idx++) {
            latter += text[idx];
          }
          tokens.push(tokenize(latter));
        } else if (x === " " || x === "\n") {
          idx += 1;
        } else if (x === "-") {
          idx += 1;
          if (text[idx] === "-") {
            let latter = "--";
            idx += 1;
            for (; (/[a-zA-Z0-9_\-]/).test(text[idx]); idx++) {
              latter += text[idx];
            }
            tokens.push(tokenize(latter));
          } else {
            tokens.push(tokenize(x));
          }
        } else if (x === "/") {
          idx += 1;

          if (text[idx] === "*") {
            idx += 1;
            while (text[idx - 1] !== "*" || text[idx] !== "/") {
              idx += 1;
              if (text.length <= idx) throw new Error(Errors.syntax.comment_is_not_closed());
            }
            idx += 1;
          } else {
            tokens.push(tokenize(x));
          }

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
