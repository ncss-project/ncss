"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evaluator = void 0;
const Util = __importStar(require("./components/util"));
const commands_1 = __importDefault(require("./components/commands"));
const functions_1 = __importDefault(require("./components/functions"));
const error_1 = require("./components/error");
class Evaluator {
    apply(ast) {
        const global = {
            cmd_table: {
                content: (env, args) => commands_1.default.content(global, args),
                transform: (env, args) => commands_1.default.transform(env, args),
                result: (env, args) => commands_1.default.result(env, args),
            },
            func_table: {
                var: (env, args) => functions_1.default.var(env, args),
                arr: (env, args) => functions_1.default.arr(env, args),
                push: (env, args) => functions_1.default.push(env, args),
            },
            var_table: {},
            stdout: [],
            go_out_func: false,
        };
        eval_program(global, ast);
        if (!global.main)
            throw new Error(error_1.Errors.syntax.function_is_defined("main"));
        global.main();
        return global;
    }
}
exports.Evaluator = Evaluator;
function eval_program(global, ast) {
    for (let i = 0; i < ast.length; i++) {
        eval_cmddef(global, ast[i]);
    }
}
function eval_cmddef(global, ast) {
    ast.shift();
    const name = ast.shift()[0].value;
    const args = ast.shift();
    if (name === "main") {
        global.main = () => {
            const env = {
                var_table: {},
                result: [],
            };
            eval_statementlist(global, env, Util.deep_copy(ast).shift(), true);
        };
    }
    else {
        global.cmd_table[name] = (_, args_values) => {
            const env = {
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
function eval_statementlist(global, env, ast, called_global_func = false) {
    let ret = { code: 0, type: "ok" };
    for (let i = 0; i < ast.length; i++) {
        ret = eval_statement(global, env, ast[i].shift());
        if (global.go_out_func && ret.code === 2) {
            env.result = ret.result;
            global.go_out_func = false;
        }
        else if (ret.code !== 0)
            break;
    }
    if (called_global_func)
        global.go_out_func = true;
    return ret;
}
function eval_statement(global, env, ast) {
    const token = ast.shift();
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
                throw new Error(error_1.Errors.variable.cannot_redeclare(name));
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
            throw new Error(error_1.Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
        }
    }
}
function eval_call_cmd(global, env, ast) {
    const name = ast.shift().value;
    const args = ast.shift();
    const mapped_args = args.map((arg) => eval_expr(global, env, arg));
    if (!(name in global.cmd_table))
        throw new Error(error_1.Errors.syntax.function_is_defined(name));
    return global.cmd_table[name](env, mapped_args);
}
function eval_call_return(global, env, ast) {
    const args = ast.shift();
    const mapped_args = args.map((arg) => eval_expr(global, env, arg));
    return mapped_args;
}
function eval_call_func(global, env, ast) {
    const name = ast.shift().value;
    const args = ast.shift();
    const mapped_args = args.map((arg) => eval_expr(global, Util.deep_copy(env), arg));
    return global.func_table[name](env, mapped_args);
}
function eval_if(global, env, ast) {
    const guard = eval_relation(global, env, ast.shift());
    const block1 = ast.shift();
    const else_directive = ast.shift();
    const block2 = ast.shift();
    if (guard) {
        return eval_statementlist(global, env, block1);
    }
    else if (else_directive) {
        if (block2[0].type == "IF") {
            block2.shift();
            eval_if(global, env, block2);
        }
        else {
            return eval_statementlist(global, env, block2);
        }
    }
    return { code: 0, type: "ok" };
}
function eval_while(global, env, ast) {
    let ret = { code: 0, type: "ok" };
    while (true) {
        const cloned_ast = Util.deep_copy(ast);
        const guard = eval_relation(global, env, cloned_ast.shift());
        if (!guard) {
            break;
        }
        const block = cloned_ast.shift();
        ret = eval_statementlist(global, env, block);
        if (ret.code !== 0)
            break;
    }
    if (ret.code === 1)
        ret = { code: 0, type: "ok" };
    return ret;
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
    throw new Error(error_1.Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
}
function eval_expr(global, env, ast) {
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
                throw new Error(error_1.Errors.operator.cannnot_calculated("-", left, right));
        }
        case "mul": {
            const left = eval_expr(global, env, ast.shift());
            const right = eval_expr(global, env, ast.shift());
            if (typeof left === "number" && typeof right === "number")
                return left * right;
            else if (typeof right === "number")
                return String(left).repeat(right);
            else
                throw new Error(error_1.Errors.operator.cannnot_calculated("*", left, right));
        }
        case "div": {
            const left = eval_expr(global, env, ast.shift());
            const right = eval_expr(global, env, ast.shift());
            if (typeof left === "number" && typeof right === "number")
                return left / right;
            else
                throw new Error(error_1.Errors.operator.cannnot_calculated("/", left, right));
        }
        case "mod": {
            const left = eval_expr(global, env, ast.shift());
            const right = eval_expr(global, env, ast.shift());
            if (typeof left === "number" && typeof right === "number")
                return left % right;
            else
                throw new Error(error_1.Errors.operator.cannnot_calculated("%", left, right));
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
            throw new Error(error_1.Errors.syntax.function_must_have_paren(token.value));
        }
        default: {
            throw new Error(error_1.Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
        }
    }
}
function eval_expr_relation(global, env, ast) {
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
                throw new Error(error_1.Errors.operator.cannnot_calculated("-", left, right));
        }
        case "mul": {
            const left = eval_expr(global, env, ast.shift());
            const right = eval_expr(global, env, ast.shift());
            if (typeof left === "number" && typeof right === "number")
                return left * right;
            else if (typeof right === "number")
                return String(left).repeat(right);
            else
                throw new Error(error_1.Errors.operator.cannnot_calculated("*", left, right));
        }
        case "div": {
            const left = eval_expr(global, env, ast.shift());
            const right = eval_expr(global, env, ast.shift());
            if (typeof left === "number" && typeof right === "number")
                return left / right;
            else
                throw new Error(error_1.Errors.operator.cannnot_calculated("/", left, right));
        }
        case "mod": {
            const left = eval_expr(global, env, ast.shift());
            const right = eval_expr(global, env, ast.shift());
            if (typeof left === "number" && typeof right === "number")
                return left % right;
            else
                throw new Error(error_1.Errors.operator.cannnot_calculated("%", left, right));
        }
        case "call_func": {
            return eval_call_func(global, env, ast);
        }
        case "VARIABLE": {
            const name = token.value;
            const value = Util.get_value(env, name);
            const type_ = Util.type(value);
            if (type_ === "ARRAY")
                throw new Error(error_1.Errors.operator.cannnot_compared(name, type_));
            return value;
        }
        case "INT":
        case "FLOAT":
        case "STRING":
        case "BOOL": {
            return token.value;
        }
        case "IDENT": {
            throw new Error(error_1.Errors.syntax.function_must_have_paren(token.value));
        }
        default: {
            throw new Error(error_1.Errors.ncss.unknown(`token='${JSON.stringify(token)}'`));
        }
    }
}
