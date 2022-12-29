import { Errors } from "./error";
import { AllType, Env, SCTypeName, Token, Type, TypeName } from "./types";

export function is_exist(env: Env, name: string, output_error = true): boolean {
  if (name in env.var_table) {
    return true
  } else if (!output_error) {
    return false;
  } else {
    throw new Error(Errors.variable.undefined(name));
  }
}

export function type(value: AllType): TypeName {
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
    throw new Error(Errors.ncss.unknown(`Could not determine the type. ${value}`));
}

export function type_match(env: Env, name: string, req_type: TypeName, output_error = true): boolean {
  const actual_type = type(get_value(env, name));
  if (req_type === actual_type) return true;
  else if (!output_error) return false;
  else throw new Error(Errors.variable.type_mismatch(name, actual_type, req_type));
}

export function type_match_excep(env: Env, name: string, req_type: TypeName, output_error = true): boolean {
  const actual_type = type(get_value(env, name));
  if (req_type !== actual_type) return true;
  else if (!output_error) return false;
  else throw new Error(Errors.variable.type_mismatch(name, actual_type, req_type));
}

export function arg_length_check(args: Type[], length: number): boolean {
  if (args.length === length) {
    return true;
  } else {
    throw new Error(Errors.syntax.arg_length_mismatch(length, args.length));
  }
}

export function arg_length_check_less(args: Type[], length: number): boolean {
  if (args.length < length) {
    return true;
  } else {
    throw new Error(Errors.syntax.insufficient_arg_length(length - 1, args.length));
  }
}

export function arg_length_check_more(args: Type[], length: number): boolean {
  if (args.length > length) {
    return true;
  } else {
    throw new Error(Errors.syntax.excessive_arg_length(length + 1, args.length));
  }
}

export function get_value(env: Env, name: string): AllType {
  is_exist(env, name);
  return env.var_table[name];
}

export function set_value(env: Env, name: string, value: AllType, force = false) {
  const isExist = is_exist(env, name, !force);
  if (!force && isExist) {
    type_match(env, name, type(value));
  }
  env.var_table[name] = value;
}

export function $(type: SCTypeName, value: Token["value"] = null): Token {
  return { type: type, value: value };
}

export function deep_copy(xs: any) {
  return JSON.parse(JSON.stringify(xs));
}
