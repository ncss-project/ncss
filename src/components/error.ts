const syntaxError = {
    function_is_defined: (func_name: any) => {
        return `Syntax Error: '${func_name}' function is not defined.`
    },
    function_must_have_paren: (func_name: any) => {
        return `Syntax Error: '${func_name}' function must have parentheses.`;
    },
    syntax_is_wrong: (expect: any, actual: any, value: any) => {
        return `Syntax Error: '${value}' is wrong.\nexpect='${expect}, actual='${actual}'`;
    },
    comment_is_not_closed: () => {
        return "Syntax Error: Comment is not closed.";
    },
    arg_length_mismatch: (length: any, req_length: any) => {
        return `Syntax Error: Expected ${length} arguments, but got ${req_length}.`;
    },
    insufficient_arg_length: (length: any, req_length: any) => {
        return `Syntax Error: Expected ${length} or less arguments, but got ${req_length}.`;
    },
    excessive_arg_length: (length: any, req_length: any) => {
        return `Syntax Error: Expected ${length} or more arguments, but got ${req_length}.`;
    },
}

const variableError = {
    undefined: (var_name: any) => {
        return `Variable Error: '${var_name}' is undefined.`;
    },
    cannot_redeclare: (var_name: any) => {
        return `Variable Error: '${var_name}' cannot redeclare.`;
    },
    type_mismatch: (var_name: any, actual_type: any, req_type: any) => {
        return `Type Error: '${var_name}' ${req_type} cannot be assigned to ${actual_type}.`;
    },
    index_out_of_range: (var_name: any, req_index: any, max_index: any) => {
        return `Array Error: '${var_name}' Index out of range. req: ${req_index}, max: ${max_index}`;
    }
}

const comparisonError = {
    cannnot_compared: (var_name: any, type_: any) => {
        return `Comparison Error: '${var_name}' ${type_} cannot be compared.`;
    }
}

const ncssError = {
    unknown: (text: any) => {
        return `ncss Error: ncss program is wrong.\n${text}\nReport here => https://github.com/SatooRu65536/ncss/issues`;
    }
}

export const Errors = {
    syntax: syntaxError,
    variable: variableError,
    comparison: comparisonError,
    ncss: ncssError,
}