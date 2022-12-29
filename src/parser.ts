import { $ } from "./components/util";
import { Errors } from "./components/error";
import { SCTypeName, Token } from "./components/types";
import { Scanner } from "./scanner";

export function parse(sc: Scanner) {
  const match = (...type: SCTypeName[]): boolean => {
    const token = sc.peek();
    return token !== undefined && type.indexOf(token.type) !== -1;
  }

  const take = (...type: SCTypeName[]): Token => {
    const token = sc.peek();
    if (token.value === null)
      throw new Error(Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
    else if (!(token !== undefined && type.indexOf(token.type) !== -1))
      throw new Error(Errors.syntax.syntax_is_wrong(type, token.type, token.value));

    sc.next();
    return token;
  }

  const program = (): any[] => {
    const _program = [];
    while (match("FUNCDEF")) {
      _program.push(funcdef());
    }
    return _program;
  }

  const funcdef = (): any[] => {
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

  const funcargs = (): any[] => {
    const _funcargs = [];
    while (match("VARIABLE")) {
      _funcargs.push([take("VARIABLE")]);
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _funcargs;
  }

  const statlist = (): any[] => {
    const _statlist = [];
    for (let smt = statement(); 0 < smt.length; smt = statement()) {
      _statlist.push(smt);
    }
    return _statlist;
  }

  const statement = (): any[] => {
    const _statement = [];
    if (match("WHILE")) {
      _statement.push(call_while());
    } else if (match("IF")) {
      _statement.push(call_if());
    } else if (match("GROUP")) {
      _statement.push(call_group());
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

  const call_cmd = (name: Token) => {
    const _funcall = [];
    _funcall.push($("call_cmd"));
    _funcall.push(name);
    take("COLON");
    _funcall.push(call_cmd_args());

    return _funcall;
  }

  const call_cmd_args = (): any[] => {
    const _args = [];
    while (match("INT", "FLOAT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _args.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _args;
  }

  const call_func = (name: Token): any[] => {
    const _funcall = [];
    _funcall.push($("call_func"));
    _funcall.push(name);
    take("PARENTHES_OPEN");
    _funcall.push(call_func_args());
    take("PARENTHES_CLOSE");

    return _funcall;
  }

  const call_func_args = (): any[] => {
    const _args = [];
    while (match("INT", "FLOAT", "STRING", "BOOL", "IDENT", "VARIABLE")) {
      _args.push(expr());
      if (match("COMMA")) {
        take("COMMA");
      }
    }

    return _args;
  }

  const assign = (name: Token): any[] => {
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

  const call_while = (): any[] => {
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

  const call_if = (): any[] => {
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

  const call_group = (): any[] => {
    const _group = [];
    _group.push(take("GROUP"));
    take("BEGIN");
    _group.push(statlist());
    take("END");
    return _group;
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

  const expr = (): any[] => {
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

  const term = (): any[] => {
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

  const factor = (): any[] => {
    if (match("PARENTHES_OPEN")) {
      take("PARENTHES_OPEN");
      const _factor = expr();
      take("PARENTHES_CLOSE");

      return _factor;
    }
    return literal();
  }

  const literal = (): any[] => {
    const _literal = take("INT", "FLOAT", "STRING", "BOOL", "IDENT", "VARIABLE");
    if (_literal.type == "IDENT" && match("PARENTHES_OPEN")) {
      return call_func(_literal);
    }
    return [_literal];
  }

  const ast = program();
  return ast;
}
