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
Object.defineProperty(exports, "__esModule", { value: true });
const Util = __importStar(require("./util"));
const error_1 = require("./error");
class Commands {
    content(global, args) {
        console.log(args.join(" "));
        global.stdout.push(args.join(" "));
        return { code: 0, type: "ok" };
    }
    transform(env, args) {
        Util.arg_length_check_more(args, 1);
        const name = String(args.shift());
        if (Util.type_match(env, name, "ARRAY", false)) {
            if (args.length === 1) {
                Util.set_value(env, name, args);
            }
            else {
                Util.set_value(env, name, args[0]);
            }
        }
        else {
            if (args.length === 1) {
                Util.set_value(env, name, args[0]);
            }
            else {
                const type_ = Util.type(Util.get_value(env, name));
                throw new Error(error_1.Errors.variable.type_mismatch(name, "ARRAY", type_));
            }
        }
        return { code: 0, type: "ok" };
    }
    result(env, args) {
        Util.arg_length_check(args, env.result.length);
        if (typeof args[0] !== "string")
            throw new Error(error_1.Errors.variable.type_mismatch(args[0], "STRING", Util.type(args[0])));
        if (args.length === 1) {
            Util.set_value(env, String(args[0]), env.result[0], true);
        }
        else {
            args.map((arg, i) => {
                const name = String(arg);
                if (!(name in env.var_table)) {
                    Util.set_value(env, name, env.result[i], true);
                }
            });
        }
        return { code: 0, type: "ok" };
    }
}
exports.default = new Commands();
