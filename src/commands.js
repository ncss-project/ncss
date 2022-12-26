class Commands {
    syscall_stdout(global, text) {
        global.stdout.push(text);
    }
}

export default new Commands();