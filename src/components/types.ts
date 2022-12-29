export type Type = string | number | boolean;
export type AllType = Type | AllType[];
export type TypeName = "BOOL" | "INT" | "FLOAT" | "STRING" | "ARRAY";
export type SCTypeName =
    TypeName
    | "FUNCDEF" | "SQ_PARENTHES_OPEN" | "SQ_PARENTHES_CLOSE" | "PARENTHES_OPEN" | "PARENTHES_CLOSE" | "BEGIN" | "END" | "WHILE" | "IF" | "ELSE"
    | "GROUP" | "BREAK" | "RETURN" | "OP_REL" | "OP_ADD" | "OP_MUL" | "ASSIGN" | "COLON" | "SEMICOLON" | "COMMA"
    | "VARIABLE" | "IDENT" | "call_cmd" | "call_func" | "add" | "sub" | "mul" | "div" | "mod";

interface Ok {
    code: 0;
    type: "ok";
}
interface Break {
    code: 1;
    type: "break";
}
interface Return {
    code: 2;
    type: "return";
    result: AllType[];
}
export type Ret = Ok | Break | Return;

export interface Global {
    main?: () => void;
    cmd_table: {
        [key: string]: (env: Env, args: Type[]) => Ret;
    };
    func_table: {
        [key: string]: (env: Env, args: Type[]) => AllType;
    };
    var_table: {
        [key: string]: AllType;
    };
    stdout: AllType[];
    go_out_func: boolean;
}

export interface Env {
    var_table: {
        [key: string]: AllType;
    };
    result: AllType[];
}

export interface Token {
    type: SCTypeName;
    value: string | number | null;
}
