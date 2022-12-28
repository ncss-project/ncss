import * as Util from "./util.js";

class Commands {
    syscall_stdout(global, text) {
        global.stdout.push(text);
    }

    transform(env, args) {
        if (args.length <= 1)
            throw new Error(`Command Error: Expected 2 or more arguments, but got 1.`);

        const name = args.shift();
        if (!(name in env.var_table))
            throw new Error(`Variable Error: '${name}' Variable is undefined.`);

        if (Array.isArray(env.var_table[name])) {
            env.var_table[name] = args;
        } else {
            if (args.length !== 1)
                throw new Error(`Array Error: '${name}' Array Cannot assign to Variable.`);

            env.var_table[name] = args[0];
        }

    }

    result(env, args) {
        if (args.length === 1 && env.result.length === 1) {
            env.var_table[args[0]] = env.result[0];

        } else if (args.length > env.result.length) {
            throw new Error(`Command Error: Expected ${env.result.length} or less arguments, but got ${args.length}.`);

        } else {
            args.map((arg, i) => {
                if (!(arg in env.var_table)) {
                    env.var_table[arg] = env.result[i];
                }
            })
        }
    }
}

export default new Commands();