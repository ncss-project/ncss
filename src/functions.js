class Functions {
    var(env, args) {
        if (args.length !== 1)
            throw new Error(`Syntax Error: Expected 1 arguments, but got ${args.length}.`);
        if (!(args[0] in env.var_table))
            throw new Error(`Variable Error: '${args[0]}' variable is undefined.`);

        return env.var_table[args[0]];
    }

    var_from_name(env, name) {
        if (!(name in env.var_table))
            throw new Error(`Variable Error: '${name}' variable is undefined.`);

        return env.var_table[name];
    }

    arr(env, args) {
        const a = [1, 2];
        if (args.length !== 2)
            throw new Error(`Syntax Error: Expected 2 arguments, but got ${args.length}.`);

        const name = args.shift();
        const index = args.shift();
        const value = this.var_from_name(env, name);

        if (!Array.isArray(value))
            throw new Error(`Array Error: '${name}' is not Array.`);
        if (value.length <= index)
            throw new Error(`Array Error: '${name}' Index out of range. req: ${index}, max: ${value.length - 1}`);

        return value[index];
    }
}

export default new Functions();