import * as Util from "./util";
import { Errors } from "./error";
import { Ret, Global, Env, Type } from "./types";

class Commands {
    content(global: Global, args: Type[]): Ret {
        console.log(args.join(" "));
        global.stdout.push(args.join(" "));
        return { code: 0, type: "ok" };
    }

    transform(env: Env, args: Type[]): Ret {
        Util.arg_length_check_more(args, 1);

        const name = String(args.shift());
        if (Util.type_match(env, name, "ARRAY", false)) {
            if (args.length === 1) {
                Util.set_value(env, name, args);
            } else {
                Util.set_value(env, name, args[0]);
            }
        } else {
            if (args.length === 1) {
                Util.set_value(env, name, args[0]);
            } else {
                const type_ = Util.type(Util.get_value(env, name));
                throw new Error(Errors.variable.type_mismatch(name, "ARRAY", type_));
            }
        }

        return { code: 0, type: "ok" };
    }

    result(env: Env, args: Type[]): Ret {
        Util.arg_length_check(args, env.result.length);
        if (typeof args[0] !== "string")
            throw new Error(Errors.variable.type_mismatch(args[0], "STRING", Util.type(args[0])));

        if (args.length === 1) {
            Util.set_value(env, String(args[0]), env.result[0], true);

        } else {
            args.map((arg, i: number) => {
                const name = String(arg);
                if (!(name in env.var_table)) {
                    Util.set_value(env, name, env.result[i], true);
                }
            })
        }
        return { code: 0, type: "ok" };
    }
}

export default new Commands();