import * as Util from "../util.js";
import { Errors } from "./error.js";

class Functions {
    var(env, args) {
        Util.arg_length_check(args, 1);
        return Util.get_value(env, args[0]);
    }

    arr(env, args) {
        const a = [1, 2];
        Util.arg_length_check(args, 2);

        const name = args.shift();
        const index = args.shift();
        const value = Util.get_value(env, name);
        Util.type_match(env, name, "Array");

        if (value.length <= index)
            throw new Error(Errors.variable.index_out_of_range(name, index, value.length));

        return value[index];
    }
}

export default new Functions();