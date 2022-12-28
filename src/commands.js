import * as Util from "./util.js";

class Commands {
    syscall_stdout(global, text) {
        global.stdout.push(text);
    }

    transform(env, args) {
        Util.arg_length_check_more(args, 1);

        const name = args.shift();
        if (Util.type_match(env, name, "Array", false)) {
            Util.set_value(env, name, args);
        } else {
            if (args.length !== 1)
                throw new Error(`Type Error: '${name}' Array Cannot assign to Variable.`);

            Util.set_value(env, name, args[0])
        }

    }

    result(env, args) {
        Util.arg_length_check(args, env.result.length);
        if (args.length === 1) {
            Util.set_value(env, args[0], env.result[0], true);

        } else {
            args.map((arg, i) => {
                if (!(arg in env.var_table)) {
                    Util.set_value(env, arg, env.result[i], true);
                }
            })
        }
    }
}

export default new Commands();