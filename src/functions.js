class Functions {
    var(env, args) {
        if (args.length !== 1)
            throw new Error(`Syntax Error: Expected 1 arguments, but got ${args.length}.`);
        if (!(args[0] in env.var_table))
            throw new Error(`Variable Error: '${args[0]}' variable is undefined.`);

        return env.var_table[args[0]];
    }

    var_from_variable(env, name) {
        if (!(name in env.var_table))
            throw new Error(`Variable Error: '${name}' variable is undefined.`);

        return env.var_table[name];
    }
}

export default new Functions();