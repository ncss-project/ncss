import { Errors } from "./components/error";

export function is_exist(env: any, name: any, output_error = true) {
  if (name in env.var_table) {
    return true
  } else if (!output_error) {
    return false;
  } else {
    throw new Error(Errors.variable.undefined(name));
  }
}

export function is_same_type(env: any, name: any, value: any) {
  const _value = get_value(env, name);
  const vartype_list = [_value, value].map((v) => { return type(v) });

  if (vartype_list[0] === vartype_list[1]) {
    set_value(env, name, value);
  } else {
    throw new Error(Errors.variable.type_mismatch(name, vartype_list[1], vartype_list[0]));
  }
}

export function type(value: any) {
  if (Array.isArray(value))
    return "ARRAY";

  else if ((((/^[-]?\d+\.[\d]+$/))).test(value))
    return "INT";

  else if ((((/^[-]?\d+$/))).test(value))
    return "INT";

  else if ((((/"(.*)"/))).test(value))
    return "STRING";

  else
    throw new Error(Errors.ncss.unknown(`Could not determine the type. ${value}`));
}

export function type_match(env: any, name: any, req_type: any, output_error = true) {
  const actual_type = type(get_value(env, name));
  if (req_type === actual_type) return true;
  else if (!output_error) return false;
  else throw new Error(Errors.variable.type_mismatch(name, actual_type, req_type));
}

export function type_match_excep(env: any, name: any, req_type: any, output_error = true) {
  const actual_type = type(get_value(env, name));
  if (req_type !== actual_type) return true;
  else if (!output_error) return false;
  else throw new Error(Errors.variable.type_mismatch(name, actual_type, req_type));
}

export function arg_length_check(args: any, length: any) {
  if (args.length === length) {
    return true;
  } else {
    throw new Error(Errors.syntax.arg_length_mismatch(length, args.length));
  }
}

export function arg_length_check_less(args: any, length: any) {
  if (args.length < length) {
    return true;
  } else {
    throw new Error(Errors.syntax.insufficient_arg_length(length - 1, args.length));
  }
}

export function arg_length_check_more(args: any, length: any) {
  if (args.length > length) {
    return true;
  } else {
    throw new Error(Errors.syntax.excessive_arg_length(length + 1, args.length));
  }
}

export function get_value(env: any, name: any) {
  is_exist(env, name);
  return env.var_table[name];
}

export function set_value(env: any, name: any, value: any, force = false) {
  const isExist = is_exist(env, name, !force);
  if (!force && isExist) {
    type_match(env, name, type(value));
  }
  env.var_table[name] = value;
}

export function $(type: any, value = null) {
  return { type: type, value: value };
}

export function deep_copy(xs: any) {
  return JSON.parse(JSON.stringify(xs));
}
