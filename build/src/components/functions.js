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
class Functions {
    var(env, args) {
        Util.arg_length_check(args, 1);
        return Util.get_value(env, String(args[0]));
    }
    arr(env, args) {
        Util.arg_length_check(args, 2);
        const name = String(args.shift());
        const index = Number(args.shift());
        const value = Util.get_value(env, name);
        const type_of_index = Util.type(index);
        if (type_of_index !== "INT")
            throw new Error(error_1.Errors.variable.type_mismatch(index, "INT", type_of_index));
        if (typeof index !== "number")
            throw new Error(error_1.Errors.variable.type_mismatch(index, "FLOAT", type_of_index));
        Util.type_match(env, name, "ARRAY");
        if (Array.isArray(value) && value.length <= index)
            throw new Error(error_1.Errors.variable.index_out_of_range(name, index, value.length));
        if (Array.isArray(value))
            return value[index];
        else
            throw new Error(error_1.Errors.variable.type_mismatch(name, "ARRAY", Util.type(value)));
    }
    push(env, args) {
        Util.arg_length_check_more(args, 2);
        const name = String(args.shift());
        let array = Util.get_value(env, name);
        Util.type_match(env, name, "ARRAY");
        if (Array.isArray(array)) {
            array.push(...args);
            return array;
        }
        else {
            throw new Error(error_1.Errors.variable.type_mismatch(name, "ARRAY", Util.type(array)));
        }
        ;
    }
}
exports.default = new Functions();
