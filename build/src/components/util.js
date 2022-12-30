"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deep_copy = exports.$ = exports.set_value = exports.get_value = exports.arg_length_check_more = exports.arg_length_check_less = exports.arg_length_check = exports.type_match_excep = exports.type_match = exports.type = exports.is_exist = void 0;
const error_1 = require("./error");
function is_exist(env, name, output_error = true) {
    if (name in env.var_table) {
        return true;
    }
    else if (!output_error) {
        return false;
    }
    else {
        throw new Error(error_1.Errors.variable.undefined(name));
    }
}
exports.is_exist = is_exist;
function type(value) {
    if (typeof (value) === "boolean")
        return "BOOL";
    if (Array.isArray(value))
        return "ARRAY";
    else if (/^[-]?\d+\.[\d]+$/.test(String(value)))
        return "FLOAT";
    else if (/^[-]?\d+$/.test(String(value)))
        return "INT";
    else if (/(.*)/.test(String(value)))
        return "STRING";
    else
        throw new Error(error_1.Errors.ncss.unknown(`Could not determine the type. ${value}`));
}
exports.type = type;
function type_match(env, name, req_type, output_error = true) {
    const actual_type = type(get_value(env, name));
    if (req_type === actual_type)
        return true;
    else if (!output_error)
        return false;
    else
        throw new Error(error_1.Errors.variable.type_mismatch(name, actual_type, req_type));
}
exports.type_match = type_match;
function type_match_excep(env, name, req_type, output_error = true) {
    const actual_type = type(get_value(env, name));
    if (req_type !== actual_type)
        return true;
    else if (!output_error)
        return false;
    else
        throw new Error(error_1.Errors.variable.type_mismatch(name, actual_type, req_type));
}
exports.type_match_excep = type_match_excep;
function arg_length_check(args, length) {
    if (args.length === length) {
        return true;
    }
    else {
        throw new Error(error_1.Errors.syntax.arg_length_mismatch(length, args.length));
    }
}
exports.arg_length_check = arg_length_check;
function arg_length_check_less(args, length) {
    if (args.length < length) {
        return true;
    }
    else {
        throw new Error(error_1.Errors.syntax.insufficient_arg_length(length - 1, args.length));
    }
}
exports.arg_length_check_less = arg_length_check_less;
function arg_length_check_more(args, length) {
    if (args.length > length) {
        return true;
    }
    else {
        throw new Error(error_1.Errors.syntax.excessive_arg_length(length + 1, args.length));
    }
}
exports.arg_length_check_more = arg_length_check_more;
function get_value(env, name) {
    is_exist(env, name);
    return env.var_table[name];
}
exports.get_value = get_value;
function set_value(env, name, value, force = false) {
    const isExist = is_exist(env, name, !force);
    if (!force && isExist) {
        type_match(env, name, type(value));
    }
    env.var_table[name] = value;
}
exports.set_value = set_value;
function $(type, value = null) {
    return { type: type, value: value };
}
exports.$ = $;
function deep_copy(xs) {
    return JSON.parse(JSON.stringify(xs));
}
exports.deep_copy = deep_copy;
