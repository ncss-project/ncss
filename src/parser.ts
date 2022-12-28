import { $ } from "./util.js";
import { Errors } from "./components/error.js";

export function parse(sc: any) {
  const match = (...type: any[]) => {
    let r = false;
    const token = sc.peek();
    for (let i = 0; i < type.length; i++) {
      // @ts-expect-error TS(2447): The '|=' operator is not allowed for boolean types... Remove this comment to see the full error message
      r |= token != undefined && token.type === type[i];
    }

    return r;
  }

  const take = (...type: any[]) => {
    let r = false;
    const token = sc.peek();
    for (let i = 0; i < type.length; i++) {
      // @ts-expect-error TS(2447): The '|=' operator is not allowed for boolean types... Remove this comment to see the full error message
      r |= token != undefined && token.type === type[i];
    }
    if (!r) {
      throw new Error(Errors.syntax.syntax_is_wrong(type, token.type, token.value));
    }

    sc.next();
    return token;
  }

  const program = () => {
    const _program = [];
    while (match("FUNCDEF")) {
      _program.push(funcdef());
    }
    return _program;
  }

  const funcdef = () => {
    const _funcdef = [];
    _funcdef.push(take("FUNCDEF"));
    _funcdef.push([take("IDENT")]);
    if (match('SQ_PARENTHES_OPEN')) {
      take("SQ_PARENTHES_OPEN");
      _funcdef.push(funcargs());
      take("SQ_PARENTHES_CLOSE");
    } else {
      _funcdef.push([]);
    }
    take("BEGIN");
    _funcdef.push(statlist());
    take("END");
    return _funcdef;
  }

  const funcargs = () => {
    const _funcargs = [];
    while (match("VARIABLE")) {
      _funcargs.push([take("VARIABLE")]);
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _funcargs;
  }

  // @ts-expect-error TS(7023): 'statlist' implicitly has return type 'any' becaus... Remove this comment to see the full error message
  const statlist = () => {
    const _statlist = [];
    // @ts-expect-error TS(7022): 'smt' implicitly has type 'any' because it does no... Remove this comment to see the full error message
    for (let smt = statement(); 0 < smt.length; smt = statement()) {
      _statlist.push(smt);
    }
    return _statlist;
  }

  // @ts-expect-error TS(7023): 'statement' implicitly has return type 'any' becau... Remove this comment to see the full error message
  const statement = () => {
    const _statement = [];
    if (match("WHILE")) {
      _statement.push(call_while());
    } else if (match("IF")) {
      _statement.push(call_if());
    } else if (match("RETURN")) {
      const name = take("RETURN");
      take("COLON");
      _statement.push([name, call_cmd_args()]);
      take("SEMICOLON");
    } else if (match("BREAK")) {
      const name = take("BREAK");
      take("COLON");
      _statement.push([name, take("STRING")]);
      take("SEMICOLON");
    } else if (match("IDENT")) {
      const name = take("IDENT");
      _statement.push(call_cmd(name));
      take("SEMICOLON");
    } else if (match("VARIABLE")) {
      const name = take("VARIABLE");
      _statement.push(assign(name));
      take("SEMICOLON");
    }

    return _statement;
  }

  const call_cmd = (name: any) => {
    const _funcall = [];
    _funcall.push($("call_cmd"));
    _funcall.push(name);
    take("COLON");
    _funcall.push(call_cmd_args());

    return _funcall;
  }

  const call_cmd_args = () => {
    const _args = [];
    while (match("INT", "FLOAT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _args.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _args;
  }

  // @ts-expect-error TS(7023): 'call_func' implicitly has return type 'any' becau... Remove this comment to see the full error message
  const call_func = (name: any) => {
    const _funcall = [];
    _funcall.push($("call_func"));
    _funcall.push(name);
    take("PARENTHES_OPEN");
    _funcall.push(call_func_args());
    take("PARENTHES_CLOSE");

    return _funcall;
  }

  // @ts-expect-error TS(7023): 'call_func_args' implicitly has return type 'any' ... Remove this comment to see the full error message
  const call_func_args = () => {
    const _args = [];
    while (match("INT", "FLOAT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _args.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _args;
  }

  const assign = (name: any) => {
    const _assign = [];
    const _colon = take("COLON");
    _colon.type = "ASSIGN";
    _assign.push(_colon);
    _assign.push([name]);

    while (match("INT", "FLOAT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _assign.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _assign;
  }

  // @ts-expect-error TS(7023): 'call_while' implicitly has return type 'any' beca... Remove this comment to see the full error message
  const call_while = () => {
    const _while = [];
    _while.push(take("WHILE"));
    take("SQ_PARENTHES_OPEN");
    _while.push(relation());
    take("SQ_PARENTHES_CLOSE");
    take("BEGIN");
    _while.push(statlist());
    take("END");
    return _while;
  }

  // @ts-expect-error TS(7023): 'call_if' implicitly has return type 'any' because... Remove this comment to see the full error message
  const call_if = () => {
    const _if = [];
    _if.push(take("IF"));
    take("SQ_PARENTHES_OPEN");
    _if.push(relation());
    take("SQ_PARENTHES_CLOSE");
    take("BEGIN");
    _if.push(statlist());
    take("END");
    if (match("ELSE")) {
      _if.push(take("ELSE"));
      if (match("IF")) {
        _if.push(call_if());
      } else {
        take("BEGIN");
        _if.push(statlist());
        take("END");
      }
    }
    return _if;
  }

  const relation = () => {
    const arg1 = expr();
    if (match("OP_REL")) {
      const op = take("OP_REL");
      const arg2 = expr();
      return [op, arg1, arg2];
    } else {
      // @ts-expect-error TS(2345): Argument of type '"direct"' is not assignable to p... Remove this comment to see the full error message
      return [$("OP_REL", "direct"), arg1];
    }
  }

  // @ts-expect-error TS(7023): 'expr' implicitly has return type 'any' because it... Remove this comment to see the full error message
  const expr = () => {
    // @ts-expect-error TS(7022): '_expr' implicitly has type 'any' because it does ... Remove this comment to see the full error message
    let _expr = term();

    while (match("OP_ADD")) {
      switch (take("OP_ADD").value) {
        case "+":
          _expr = [$("add"), _expr, term()];
          break;
        case "-":
          _expr = [$("sub"), _expr, term()];
          break;
      }
    }
    return _expr;
  }

  // @ts-expect-error TS(7023): 'term' implicitly has return type 'any' because it... Remove this comment to see the full error message
  const term = () => {
    // @ts-expect-error TS(7022): '_term' implicitly has type 'any' because it does ... Remove this comment to see the full error message
    let _term = factor();
    while (match("OP_MUL")) {
      switch (take("OP_MUL").value) {
        case "*":
          _term = [$("mul"), _term, factor()];
          break;
        case "/":
          _term = [$("div"), _term, factor()];
          break;
        case "%":
          _term = [$("mod"), _term, factor()];
          break;
      }
    }
    return _term;
  }

  // @ts-expect-error TS(7023): 'factor' implicitly has return type 'any' because ... Remove this comment to see the full error message
  const factor = () => {
    if (match("PARENTHES_OPEN")) {
      take("PARENTHES_OPEN");
      // @ts-expect-error TS(7022): '_factor' implicitly has type 'any' because it doe... Remove this comment to see the full error message
      const _factor = expr();
      take("PARENTHES_CLOSE");

      return _factor;
    }
    return literal();
  }

  // @ts-expect-error TS(7023): 'literal' implicitly has return type 'any' because... Remove this comment to see the full error message
  const literal = () => {
    const _literal = take("INT", "FLOAT", "STRING", "BOOL", "IDENT", "VARIABLE");
    if (_literal.type == "IDENT" && match("PARENTHES_OPEN")) {
      return call_func(_literal);
    }
    return [_literal];
  }

  const ast = program();
  return ast;
}
