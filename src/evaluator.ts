import * as Util from "./components/util";
import Commands from "./components/commands";
import Functions from "./components/functions";
import { Errors } from "./components/error";
import { Ret, Global, Env, AllType, Token } from "./components/types";

export class Evaluator {
  apply(ast: any) {
    const global: Global = {
      cmd_table: {
        content: (env, args) => Commands.content(global, args),
        transform: (env, args) => Commands.transform(env, args),
        result: (env, args) => Commands.result(env, args),
      },
      func_table: {
        var: (env, args) => Functions.var(env, args),
        arr: (env, args) => Functions.arr(env, args),
        push: (env, args) => Functions.push(env, args),
      },
      var_table: {},
      stdout: [],
      go_out_func: false,
    };

    eval_program(global, ast);

    if (!global.main)
      throw new Error(Errors.syntax.function_is_defined("main"));

    global.main();
    return global;
  }
}

function eval_program(global: Global, ast: any) {
  for (let i = 0; i < ast.length; i++) {
    eval_cmddef(global, ast[i]);
  }
}

function eval_cmddef(global: Global, ast: any) {
  ast.shift();
  const name = ast.shift()[0].value;
  const args = ast.shift();

  if (name === "main") {
    global.main = (): void => {
      const env: Env = {
        var_table: {},
        result: [],
      };

      eval_statementlist(global, env, Util.deep_copy(ast).shift(), true);
    };
  } else {
    global.cmd_table[name] = (_: Env, args_values: AllType[]): Ret => {
      const env: Env = {
        var_table: {},
        result: [],
      };
      for (let i = 0; i < args.length; i++) {
        Util.set_value(env, args[i][0].value, args_values[i], true);
      }

      return eval_statementlist(global, env, Util.deep_copy(ast).shift(), true);
    };
  }
}

function eval_statementlist(global: Global, env: Env, ast: any, called_global_func = false): Ret {
  let ret: Ret = { code: 0, type: "ok" };
  for (let i = 0; i < ast.length; i++) {
    ret = eval_statement(global, env, ast[i].shift());
    if (global.go_out_func && ret.code === 2) {
      env.result = ret.result;
      global.go_out_func = false;
    }
    else if (ret.code !== 0) break;
  }

  if (called_global_func) global.go_out_func = true;
  return ret;
}

function eval_statement(global: Global, env: Env, ast: any): Ret {
  const token: Token = ast.shift();

  switch (token.type) {
    case "call_cmd": {
      return eval_call_cmd(global, env, ast);
    }
    case "IF": {
      return eval_if(global, env, ast);
    }
    case "WHILE": {
      return eval_while(global, env, ast);
    }
    case "GROUP": {
      return eval_statementlist(global, env, ast.shift());
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
      return { code: 0, type: "ok" };
    }
    case "BREAK": {
      return { code: 1, type: "break" };
    }
    case "RETURN": {
      env.result = eval_call_return(global, env, ast);
      return { code: 2, type: "return", result: env.result };
    }
    default: {
      throw new Error(Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
    }
  }
}

function eval_call_cmd(global: Global, env: Env, ast: any): Ret {
  const name = ast.shift().value;
  const args = ast.shift();
  const mapped_args = args.map((arg: AllType) => eval_expr(global, env, arg));

  if (!(name in global.cmd_table))
    throw new Error(Errors.syntax.function_is_defined(name));

  return global.cmd_table[name](env, mapped_args);
}

function eval_call_return(global: Global, env: Env, ast: any): AllType[] {
  const args = ast.shift();
  const mapped_args = args.map((arg: AllType) => eval_expr(global, env, arg));

  return mapped_args;
}

function eval_call_func(global: Global, env: Env, ast: any): AllType {
  const name = ast.shift().value;
  const args = ast.shift();
  const mapped_args = args.map((arg: AllType) => eval_expr(global, Util.deep_copy(env), arg));

  return global.func_table[name](env, mapped_args);
}

function eval_if(global: Global, env: Env, ast: any): Ret {
  const guard = eval_relation(global, env, ast.shift());
  const block1 = ast.shift();
  const else_directive = ast.shift();
  const block2 = ast.shift();
  if (guard) {
    return eval_statementlist(global, env, block1);
  } else if (else_directive) {
    if (block2[0].type == "IF") {
      block2.shift();
      eval_if(global, env, block2);
    } else {
      return eval_statementlist(global, env, block2);
    }
  }
  return { code: 0, type: "ok" };
}

function eval_while(global: Global, env: Env, ast: any): Ret {
  let ret: Ret = { code: 0, type: "ok" };
  while (true) {
    const cloned_ast = Util.deep_copy(ast);
    const guard = eval_relation(global, env, cloned_ast.shift());
    if (!guard) {
      break;
    }
    const block = cloned_ast.shift();
    ret = eval_statementlist(global, env, block);
    if (ret.code !== 0) break;
  }

  if (ret.code === 1) ret = { code: 0, type: "ok" };

  return ret;
}

function eval_relation(global: Global, env: Env, ast: any): AllType {
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
  throw new Error(Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
}

function eval_expr(global: Global, env: Env, ast: any): AllType {
  const token = (Array.isArray(ast)) ? ast.shift() : ast;

  switch (token.type) {
    case "add": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left + right;
      else
        return JSON.stringify(left) + JSON.stringify(right);
    }
    case "sub": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left - right;
      else
        throw new Error(Errors.operator.cannnot_calculated("-", left, right));
    }
    case "mul": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left * right;
      else if (typeof right === "number")
        return String(left).repeat(right);
      else
        throw new Error(Errors.operator.cannnot_calculated("*", left, right));
    }
    case "div": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left / right;
      else
        throw new Error(Errors.operator.cannnot_calculated("/", left, right));
    }
    case "mod": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left % right;
      else
        throw new Error(Errors.operator.cannnot_calculated("%", left, right));
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

function eval_expr_relation(global: Global, env: Env, ast: any): AllType {
  const token = (Array.isArray(ast)) ? ast.shift() : ast;

  switch (token.type) {
    case "add": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left + right;
      else
        return String(left) + String(right);
    }
    case "sub": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left - right;
      else
        throw new Error(Errors.operator.cannnot_calculated("-", left, right));
    }
    case "mul": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left * right;
      else if (typeof right === "number")
        return String(left).repeat(right);
      else
        throw new Error(Errors.operator.cannnot_calculated("*", left, right));
    }
    case "div": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left / right;
      else
        throw new Error(Errors.operator.cannnot_calculated("/", left, right));
    }
    case "mod": {
      const left = eval_expr(global, env, ast.shift());
      const right = eval_expr(global, env, ast.shift());
      if (typeof left === "number" && typeof right === "number")
        return left % right;
      else
        throw new Error(Errors.operator.cannnot_calculated("%", left, right));
    }
    case "call_func": {
      return eval_call_func(global, env, ast);
    }
    case "VARIABLE": {
      const name = token.value;
      const value = Util.get_value(env, name);
      const type_ = Util.type(value);
      if (type_ === "ARRAY")
        throw new Error(Errors.operator.cannnot_compared(name, type_));

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
