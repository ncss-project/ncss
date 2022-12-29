import { Errors } from "./components/error";
import { $ } from "./util";

export class Scanner {
  pos: any;
  tokens: any;
  constructor(text: any) {
    const tokenize = (word: any) => {
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
          // @ts-expect-error TS(2345): Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
          return $("BOOL", true);
        case "false":
          // @ts-expect-error TS(2345): Argument of type 'false' is not assignable to para... Remove this comment to see the full error message
          return $("BOOL", false);
        default:
          if ((((/^(\-\-)/))).test(word))
            return $("VARIABLE", word);

          else if ((((/^[-]?\d+\.[\d]+$/))).test(word))
            // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
            return $("FLOAT", parseFloat(word));

          else if ((((/^[-]?\d+$/))).test(word))
            // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
            return $("INT", parseInt(word));

          else if ((((/"(.*)"/))).test(word))
            return $("STRING", word.match(/"(.*)"/)[1]);

          else
            return $("IDENT", word);
      }
    };
    const split = (text: any) => {
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
        } else if ((((/[=<>!]/))).test(x)) {
          let op = text[idx];
          idx += 1;
          if (text[idx] === "=") {
            op += text[idx];
            idx += 1;
          }

          tokens.push(tokenize(op));
        } else if ((((/\d/))).test(x)) {
          let num = "";
          for (; (((/[.\d]/))).test(text[idx]); idx++) {
            num += text[idx];
          }
          tokens.push(tokenize(num));
        } else if ((((/[a-zA-Z\.]/))).test(x)) {
          let latter = text[idx];
          idx += 1;
          for (; (((/[a-zA-Z0-9_\-]/))).test(text[idx]); idx++) {
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
            for (; (((/[a-zA-Z0-9_\-]/))).test(text[idx]); idx++) {
              latter += text[idx];
            }
            tokens.push(tokenize(latter));
          } else if ((((/[\d]/))).test(text[idx])) {
            let latter = `-${text[idx]}`;
            idx += 1;
            for (; (((/[.\d]/))).test(text[idx]); idx++) {
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
