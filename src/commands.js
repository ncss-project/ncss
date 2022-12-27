class Commands {
    syscall_stdout(global, text) {
        global.stdout.push(text);
    }

    transform(env, args) {
        if (args.length !== 2)
            throw new Error(`Command Error: Expected 2 arguments, but got ${args.length}.`);
        if (!(args[0] in env.var_table))
            throw new Error(`Variable Error: '${args[0]}' Variable is undefined.`);

        env.var_table[args[0]] = args[1];
    }
}

export default new Commands();