
export function is_exist(env, name, output_error = true) {
  if (name in env.var_table) {
    return true
  } else if (!output_error) {
    return false;
  } else {
    throw new Error(`Variable Error: '${name}' Variable is undefined.`);
  }
}

export function is_same_type(env, name, value) {
  const _value = get_value(env, name);
  const vartype_list = [_value, value].map((v) => { return type(v) });

  if (vartype_list[0] === vartype_list[1]) {
    set_value(env, name, value);
  } else {
    throw new Error(`Type Error: '${name}' ${vartype_list[0]} cannot be assigned to ${vartype_list[1]}.`);
  }
}

export function type(value) {
  if (Array.isArray(value)) {
    return "Array";
  } else {
    return "Variable";
  }
}

export function type_match(env, name, req_type, output_error = true) {
  const actual_type = type(get_value(env, name));
  if (req_type === actual_type) return true;
  else if (!output_error) return false;
  else throw new Error(`Type Error: '${name}' ${actual_type} Cannot assign to ${req_type}.`);
}

export function arg_length_check(args, length) {
  if (args.length === length) {
    return true;
  } else {
    throw new Error(`Syntax Error: Expected ${length} arguments, but got ${args.length}.`);
  }
}

export function arg_length_check_less(args, length) {
  if (args.length < length) {
    return true;
  } else {
    throw new Error(`Syntax Error: Expected ${length - 1} or less arguments, but got ${args.length}.`);
  }
}

export function arg_length_check_more(args, length) {
  if (args.length > length) {
    return true;
  } else {
    throw new Error(`Syntax Error: Expected ${length + 1} or more arguments, but got ${args.length}.`);
  }
}

export function get_value(env, name) {
  is_exist(env, name);
  return env.var_table[name];
}

export function set_value(env, name, value, force = false) {
  is_exist(env, name, !force);
  env.var_table[name] = value;
}

export function $(type, value = null) {
  return { type: type, value: value };
}

export function deep_copy(xs) {
  return JSON.parse(JSON.stringify(xs));
}
