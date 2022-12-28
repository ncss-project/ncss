import * as Util from "../util.js";
import { Errors } from "./error.js";

class Commands {
    content(global: any, text: any) {
        global.stdout.push(text);
    }

    transform(env: any, args: any) {
        Util.arg_length_check_more(args, 1);

        const name = args.shift();
        if (Util.type_match(env, name, "ARRAY", false)) {
            Util.set_value(env, name, args);
        } else {
            if (args.length !== 1) {
                const type_ = Util.type(Util.get_value(env, name));
                throw new Error(Errors.variable.type_mismatch(name, "ARRAY", type_));
            }

            Util.set_value(env, name, args[0])
        }

    }

    result(env: any, args: any) {
        Util.arg_length_check(args, env.result.length);
        if (args.length === 1) {
            Util.set_value(env, args[0], env.result[0], true);

        } else {
            args.map((arg: any, i: any) => {
                if (!(arg in env.var_table)) {
                    Util.set_value(env, arg, env.result[i], true);
                }
            })
        }
    }
}

export default new Commands();