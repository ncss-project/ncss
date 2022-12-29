import * as Util from "./util";
import { Errors } from "./error";
import { Ret, Global, Env, Type } from "./types";

class Functions {
    var(env: Env, args: Type[]) {
        Util.arg_length_check(args, 1);
        return Util.get_value(env, String(args[0]));
    }

    arr(env: Env, args: Type[]) {
        Util.arg_length_check(args, 2);

        const name = String(args.shift());
        const index = Number(args.shift());
        const value = Util.get_value(env, name);
        const type_of_index = Util.type(index);
        if (type_of_index !== "INT")
            throw new Error(Errors.variable.type_mismatch(index, "INT", type_of_index));

        if (typeof index !== "number")
            throw new Error(Errors.variable.type_mismatch(index, "FLOAT", type_of_index));

        Util.type_match(env, name, "ARRAY");

        if (Array.isArray(value) && value.length <= index)
            throw new Error(Errors.variable.index_out_of_range(name, index, value.length));

        if (Array.isArray(value))
            return value[index];
        else
            throw new Error(Errors.variable.type_mismatch(name, "ARRAY", Util.type(value)));
    }
}

export default new Functions();