import * as Util from "./util";
import Commands from "./components/commands";
import Functions from "./components/functions";
import { Errors } from "./components/error";

export class Evaluator {
  apply(ast: any) {
    const global = {
      cmd_table: {
        content: (env: any, args: any) => Commands.content(global, args[0]),
        transform: (env: any, args: any) => Commands.transform(env, args),
        result: (env: any, args: any) => Commands.result(env, args),
      },
      func_table: {
        var: (env: any, args: any) => Functions.var(env, args),
        arr: (env: any, args: any) => Functions.arr(env, args),
      },
      var_table: {},
      stdout: [],
    };

    eval_program(global, ast);

    // @ts-expect-error TS(2339): Property 'main' does not exist on type '{ content:... Remove this comment to see the full error message
    if (!global.cmd_table.main)
      throw new Error(Errors.syntax.function_is_defined("main"));

    // @ts-expect-error TS(2339): Property 'main' does not exist on type '{ content:... Remove this comment to see the full error message
    global.cmd_table.main();
    return global;
  }
}

class GoToError extends Error { }
class ReturnError extends GoToError { }
class BreakError extends GoToError { }

function eval_program(global: any, ast: any) {
  for (let i = 0; i < ast.length; i++) {
    eval_cmddef(global, ast[i]);
  }
}

function eval_cmddef(global: any, ast: any) {
  ast.shift();
  const name = ast.shift()[0].value;
  const args = ast.shift();

  global.cmd_table[name] = (_: any, args_values: any) => {
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

function eval_statementlist(global: any, env: any, ast: any) {
  for (let i = 0; i < ast.length; i++) {
    eval_statement(global, env, ast[i].shift());
  }
}

function eval_statement(global: any, env: any, ast: any) {
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
        throw new Error(Errors.variable.cannot_redeclare(name));

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
      throw new Error(Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
    }
  }
}

function eval_call_cmd(global: any, env: any, ast: any) {
  const name = ast.shift().value;
  const args = ast.shift();
  const mapped_args = args.map((t: any) => eval_expr(global, env, t));

  if (!(name in global.cmd_table))
    throw new Error(Errors.syntax.function_is_defined(name));

  return global.cmd_table[name](env, mapped_args);
}

function eval_call_return(global: any, env: any, ast: any) {
  const args = ast.shift();
  const mapped_args = args.map((t: any) => eval_expr(global, env, t));

  return mapped_args;
}

function eval_call_func(global: any, env: any, ast: any) {
  const name = ast.shift().value;
  const args = ast.shift();
  const mapped_args = args.map((t: any) => eval_expr(global, Util.deep_copy(env), t));

  return global.func_table[name](env, mapped_args);
}

function eval_if(global: any, env: any, ast: any) {
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

function eval_while(global: any, env: any, ast: any) {
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

function eval_relation(global: any, env: any, ast: any) {
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

// @ts-expect-error TS(7023): 'eval_expr' implicitly has return type 'any' becau... Remove this comment to see the full error message
function eval_expr(global: any, env: any, ast: any) {
  const token = (Array.isArray(ast)) ? ast.shift() : ast;

  switch (token.type) {
    case "add": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr(global, env, ast.shift());
      return x + y;
    }
    case "sub": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr(global, env, ast.shift());
      return x - y;
    }
    case "mul": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr(global, env, ast.shift());
      return x * y;
    }
    case "div": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr(global, env, ast.shift());
      return x / y;
    }
    case "mod": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr(global, env, ast.shift());
      return x % y;
    }
    case "call_func": {
      return eval_call_func(global, env, ast);
    }
    case "VARIABLE":
    case "INT":
    case "FLOAT":
    case "STRING":
    case "BOOL": {
      return token.value;
    }
    case "IDENT": {
      throw new Error(Errors.syntax.function_must_have_paren(token.value));
    }
    default: {
      throw new Error(Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
    }
  }
}

// @ts-expect-error TS(7023): 'eval_expr_relation' implicitly has return type 'a... Remove this comment to see the full error message
function eval_expr_relation(global: any, env: any, ast: any) {
  const token = (Array.isArray(ast)) ? ast.shift() : ast;

  switch (token.type) {
    case "add": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr_relation(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr_relation(global, env, ast.shift());
      return x + y;
    }
    case "sub": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr_relation(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr_relation(global, env, ast.shift());
      return x - y;
    }
    case "mul": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr_relation(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr_relation(global, env, ast.shift());
      return x * y;
    }
    case "div": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr_relation(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr_relation(global, env, ast.shift());
      return x / y;
    }
    case "mod": {
      // @ts-expect-error TS(7022): 'x' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const x = eval_expr_relation(global, env, ast.shift());
      // @ts-expect-error TS(7022): 'y' implicitly has type 'any' because it does not ... Remove this comment to see the full error message
      const y = eval_expr_relation(global, env, ast.shift());
      return x % y;
    }
    case "call_func": {
      return eval_call_func(global, env, ast);
    }
    case "VARIABLE": {
      const name = token.value;
      const value = Util.get_value(env, name);
      const type_ = Util.type(value);
      if (type_ === "ARRAY")
        throw new Error(Errors.comparison.cannnot_compared(name, type_));

      return value;
    }
    case "INT":
    case "FLOAT":
    case "STRING":
    case "BOOL": {
      return token.value;
    }
    case "IDENT": {
      throw new Error(Errors.syntax.function_must_have_paren(token.value));
    }
    default: {
      throw new Error(Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
    }
  }
}
