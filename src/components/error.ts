import { TypeName, Type, AllType, SCTypeName, Ret } from "./types";

const syntaxError = {
    function_is_defined: (func_name: string): string => {
        return `Syntax Error: '${func_name}' function is not defined.`
    },
    function_must_have_paren: (func_name: string): string => {
        return `Syntax Error: '${func_name}' function must have parentheses.`;
    },
    syntax_is_wrong: (expect: Type | SCTypeName[], actual: string, value: AllType): string => {
        return `Syntax Error: '${value}' is wrong.\nexpect='${expect}, actual='${actual}'`;
    },
    comment_is_not_closed: (): string => {
        return "Syntax Error: Comment is not closed.";
    },
    arg_length_mismatch: (length: number, req_length: number): string => {
        return `Syntax Error: Expected ${length} arguments, but got ${req_length}.`;
    },
    insufficient_arg_length: (length: number, req_length: number): string => {
        return `Syntax Error: Expected ${length} or less arguments, but got ${req_length}.`;
    },
    excessive_arg_length: (length: number, req_length: number): string => {
        return `Syntax Error: Expected ${length} or more arguments, but got ${req_length}.`;
    },
}

const variableError = {
    undefined: (var_name: string): string => {
        return `Variable Error: '${var_name}' is undefined.`;
    },
    cannot_redeclare: (var_name: string): string => {
        return `Variable Error: '${var_name}' cannot redeclare.`;
    },
    type_mismatch: (name: AllType, actual_type: TypeName, req_type: TypeName): string => {
        return `Type Error: '${name}' Type '${req_type}' is not assignable to type '${actual_type}'.`;
    },
    index_out_of_range: (var_name: string, req_index: number, max_index: number): string => {
        return `Array Error: '${var_name}' Index out of range. req: ${req_index}, max: ${max_index}`;
    }
}

const operatorError = {
    cannnot_compared: (var_name: string, type_: TypeName): string => {
        return `Operator Error: '${var_name}' ${type_} cannot be compared.`;
    },
    cannnot_calculated: (operator: string, left: AllType, right: AllType): string => {
        return `Operator Error: '${left} ${operator} ${right}' cannot be calculated.`;
    }
}

const ncssError = {
    unknown: (text: string): string => {
        return `ncss Error: ncss program is wrong.\n${text}\nReport here: string => https://github.com/SatooRu65536/ncss/issues`;
    }
}

export const Errors = {
    syntax: syntaxError,
    variable: variableError,
    operator: operatorError,
    ncss: ncssError,
}
