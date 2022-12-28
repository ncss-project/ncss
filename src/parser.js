import { $ } from "./util.js";
import { Errors } from "./components/error.js";

export function parse(sc) {
  const match = (...type) => {
    let r = false;
    const token = sc.peek();
    for (let i = 0; i < type.length; i++) {
      r |= token != undefined && token.type === type[i];
    }

    return r;
  }

  const take = (...type) => {
    let r = false;
    const token = sc.peek();
    for (let i = 0; i < type.length; i++) {
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

  const statlist = () => {
    const _statlist = [];
    for (let smt = statement(); 0 < smt.length; smt = statement()) {
      _statlist.push(smt);
    }
    return _statlist;
  }

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

  const call_cmd = (name) => {
    const _funcall = [];
    _funcall.push($("call_cmd"));
    _funcall.push(name);
    take("COLON");
    _funcall.push(call_cmd_args());

    return _funcall;
  }

  const call_cmd_args = () => {
    const _args = [];
    while (match("INT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _args.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _args;
  }

  const call_func = (name) => {
    const _funcall = [];
    _funcall.push($("call_func"));
    _funcall.push(name);
    take("PARENTHES_OPEN");
    _funcall.push(call_func_args());
    take("PARENTHES_CLOSE");

    return _funcall;
  }

  const call_func_args = () => {
    const _args = [];
    while (match("INT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _args.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _args;
  }

  const assign = (name) => {
    const _assign = [];
    const _colon = take("COLON");
    _colon.type = "ASSIGN";
    _assign.push(_colon);
    _assign.push([name]);

    while (match("INT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _assign.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _assign;
  }

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
      return [$("OP_REL", "direct"), arg1];
    }
  }

  const expr = () => {
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

  const term = () => {
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

  const factor = () => {
    if (match("PARENTHES_OPEN")) {
      take("PARENTHES_OPEN");
      const _factor = expr();
      take("PARENTHES_CLOSE");

      return _factor;
    }
    return literal();
  }

  const literal = () => {
    const _literal = take("INT", "STRING", "BOOL", "IDENT", "VARIABLE");
    if (_literal.type == "IDENT" && match("PARENTHES_OPEN")) {
      return call_func(_literal);
    }
    return [_literal];
  }

  const ast = program();
  return ast;
}
