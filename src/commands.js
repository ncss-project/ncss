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
}

export default new Commands();