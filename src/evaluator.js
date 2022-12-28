import * as Util from "./util.js";
import Commands from "./commands.js";
import Functions from "./functions.js";

export class Evaluator {
  apply(ast) {
    const global = {
      cmd_table: {
        content: (env, args) => Commands.syscall_stdout(global, args[0]),
        transform: (env, args) => Commands.transform(env, args),
        result: (env, args) => Commands.result(env, args),
      },
      func_table: {
        var: (env, args) => Functions.var(env, args),
        arr: (env, args) => Functions.arr(env, args),
      },
      var_table: {},
      stdout: [],
    };

    eval_program(global, ast);

    if (!global.cmd_table.main)
      throw new Error("Syntax Error: 'main' function is not defined.");

    global.cmd_table.main();
    return global;
  }
}

class GoToError extends Error { }
class ReturnError extends GoToError { }
class BreakError extends GoToError { }

function eval_program(global, ast) {
  for (let i = 0; i < ast.length; i++) {
    eval_cmddef(global, ast[i]);
  }
}

function eval_cmddef(global, ast) {
  ast.shift();
  const name = ast.shift()[0].value;
  const args = ast.shift();

  global.cmd_table[name] = (_, args_values) => {
    const env = {
      var_table: {},
      result: [],
    };
    for (let i = 0; i < args.length; i++) {
      Util.set_value(env, args[i][0].value, args_values[i], true);
    }

    try {
      eval_statementlist(global, env, Util.deep_copy(ast).shift());
    } catch (err) {
      if (err instanceof ReturnError) {
        return env.result;
      } else {
        throw err;
      }
    }
  };
}

function eval_statementlist(global, env, ast) {
  for (let i = 0; i < ast.length; i++) {
    eval_statement(global, env, ast[i].shift());
  }
}

function eval_statement(global, env, ast) {
  const token = ast.shift();

  switch (token.type) {
    case "call_cmd": {
      env.result = eval_call_cmd(global, env, ast);
      break;
    }
    case "IF": {
      eval_if(global, env, ast);
      break;
    }
    case "WHILE": {
      eval_while(global, env, ast);
      break;
    }
    case "ASSIGN": {
      const name = ast.shift()[0].value;

      if (name in env.var_table)
        throw new Error(`Variable Error: '${name}' cannot redeclare.`)

      const _values = [];
      while (ast.length > 0) {
        _values.push(eval_expr(global, env, ast.shift()));
      }
      const value = _values.length === 1 ? _values[0] : _values;
      Util.set_value(env, name, value, true);
      break;
    }
    case "BREAK": {
      throw new BreakError();
    }
    case "RETURN": {
      env.result = eval_call_return(global, env, ast);
      throw new ReturnError();
    }
    default: {
      throw new Error("Unkown Error");
    }
  }
}

function eval_call_cmd(global, env, ast) {
  const name = ast.shift().value;
  const args = ast.shift();
  const mapped_args = args.map((t) => eval_expr(global, env, t));

  if (!(name in global.cmd_table))
    throw new Error(`Syntax Error: '${name}' function is not defined.`)

  return global.cmd_table[name](env, mapped_args);
}

function eval_call_return(global, env, ast) {
  const args = ast.shift();
  const mapped_args = args.map((t) => eval_expr(global, env, t));

  return mapped_args;
}

function eval_call_func(global, env, ast) {
  const name = ast.shift().value;
  const args = ast.shift();
  const mapped_args = args.map((t) => eval_expr(global, Util.deep_copy(env), t));

  return global.func_table[name](env, mapped_args);
}

function eval_if(global, env, ast) {
  const guard = eval_relation(global, env, ast.shift());
  const block1 = ast.shift();
  const else_directive = ast.shift();
  const block2 = ast.shift();
  if (guard) {
    eval_statementlist(global, env, block1);
  } else if (else_directive) {
    if (block2[0].type == "IF") {
      block2.shift();
      eval_if(global, env, block2);
    } else {
      eval_statementlist(global, env, block2);
    }
  }
}

function eval_while(global, env, ast) {
  try {
    while (true) {
      const cloned_ast = Util.deep_copy(ast);
      const guard = eval_relation(global, env, cloned_ast.shift());
      if (!guard) {
        break;
      }
      const block = cloned_ast.shift();
      eval_statementlist(global, env, block);
    }
  } catch (err) {
    if (!(err instanceof BreakError)) {
      throw err;
    }
  }
}

function eval_relation(global, env, ast) {
  const token = (Array.isArray(ast)) ? ast.shift() : ast;
  switch (token.type) {
    case "OP_REL": {
      switch (token.value) {
        case "==": {
          const x = eval_expr_relation(global, env, ast.shift());
          const y = eval_expr_relation(global, env, ast.shift());
          return x == y;
        }
        case "!=": {
          const x = eval_expr_relation(global, env, ast.shift());
          const y = eval_expr_relation(global, env, ast.shift());
          return x != y;
        }
        case "<": {
          const x = eval_expr_relation(global, env, ast.shift());
          const y = eval_expr_relation(global, env, ast.shift());
          return x < y;
        }
        case ">": {
          const x = eval_expr_relation(global, env, ast.shift());
          const y = eval_expr_relation(global, env, ast.shift());
          return x > y;
        }
        case "<=": {
          const x = eval_expr_relation(global, env, ast.shift());
          const y = eval_expr_relation(global, env, ast.shift());
          return x <= y;
        }
        case ">=": {
          const x = eval_expr_relation(global, env, ast.shift());
          const y = eval_expr_relation(global, env, ast.shift());
          return x >= y;
        }
        case "direct":
          return eval_expr_relation(global, env, ast.shift());
      }
      break;
    }
  }
}

function eval_expr(global, env, ast) {
  const token = (Array.isArray(ast)) ? ast.shift() : ast;

  switch (token.type) {
    case "add": {
      const x = eval_expr(global, env, ast.shift());
      const y = eval_expr(global, env, ast.shift());
      return x + y;
    }
    case "sub": {
      const x = eval_expr(global, env, ast.shift());
      const y = eval_expr(global, env, ast.shift());
      return x - y;
    }
    case "mul": {
      const x = eval_expr(global, env, ast.shift());
      const y = eval_expr(global, env, ast.shift());
      return x * y;
    }
    case "div": {
      const x = eval_expr(global, env, ast.shift());
      const y = eval_expr(global, env, ast.shift());
      return x / y;
    }
    case "mod": {
      const x = eval_expr(global, env, ast.shift());
      const y = eval_expr(global, env, ast.shift());
      return x % y;
    }
    case "call_func": {
      return eval_call_func(global, env, ast);
    }
    case "VARIABLE":
    case "INT":
    case "STRING":
    case "BOOL": {
      return token.value;
    }
    case "IDENT": {
      throw new Error(`Syntax Error: '${token.value}' function must have parentheses.`)
    }
    default: {
      throw new Error(`ncss Error: ncss program is wrong. token=${JSON.stringify(token)}`);
    }
  }
}

function eval_expr_relation(global, env, ast) {
  const token = (Array.isArray(ast)) ? ast.shift() : ast;

  switch (token.type) {
    case "add": {
      const x = eval_expr_relation(global, env, ast.shift());
      const y = eval_expr_relation(global, env, ast.shift());
      return x + y;
    }
    case "sub": {
      const x = eval_expr_relation(global, env, ast.shift());
      const y = eval_expr_relation(global, env, ast.shift());
      return x - y;
    }
    case "mul": {
      const x = eval_expr_relation(global, env, ast.shift());
      const y = eval_expr_relation(global, env, ast.shift());
      return x * y;
    }
    case "div": {
      const x = eval_expr_relation(global, env, ast.shift());
      const y = eval_expr_relation(global, env, ast.shift());
      return x / y;
    }
    case "mod": {
      const x = eval_expr_relation(global, env, ast.shift());
      const y = eval_expr_relation(global, env, ast.shift());
      return x % y;
    }
    case "call_func": {
      return eval_call_func(global, env, ast);
    }
    case "VARIABLE": {
      const name = token.value;
      const value = Util.get_value(env, name);
      if (Array.isArray(value))
        throw new Error(`Comparison Error: '${token.value}' Array cannot be compared.`)

      return value;
    }
    case "INT":
    case "STRING":
    case "BOOL": {
      return token.value;
    }
    case "IDENT": {
      throw new Error(`Syntax Error: '${token.value}' function must have parentheses.`)
    }
    default: {
      throw new Error(`ncss Error: ncss program is wrong. token=${JSON.stringify(token)}`);
    }
  }
}
