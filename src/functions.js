class Functions {
    var(global, env, args) {
        if (args.length === 0 || args.length > 1)
        throw new Error(`Syntax Error: Expected 1 arguments, but got ${args.length}.`);
        
        return env.var_table[args[0]];
    }
}

export default new Functions();