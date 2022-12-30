# NCSS
NCSS is not CSS.

```
A. What programming languages have you used?
B. Hmm..."HTML" and "CSS".
A. (It isn't programming languages.)
```

## Install
```zsh
npm install -g @satooru65536/ncss
```

## Usage
```zsh
ncss ./main.ncss
```

## How to write ncss

### Hello World!
```css
#main {
    content: 'Hello, World!';    /*=> Hello, World!*/
    content: "Hello, World!";    /*=> Hello, World!*/
}
```

### variable
```css
#main {
    --num: 1;       /* number */
    --str: "hi";    /* string */
    --bool: true;   /* bool */

    content: "--num is " + var(--num);  /*=> --num is 1 */
    transform: --num 5;
    content: "--num is " + var(--num);  /*=> --num is 5 */
}
```

### array
```css
#main {
    --arr: 1 2 "a" "b"; /* array */

    content: "--arr is " + var(--arr);  /*=> --arr is [1,2,"a","b"] */
    transform: --arr 5;
    content: "--arr is " + var(--arr);  /*=> --arr is [5] */
    transform: --arr push(--arr 3 "c");
    content: "--arr is " + var(--arr);  /*=> --arr is [5,3,"c"] */
    content: "--arr[1] is " + arr(--arr 1);   /*=> --arr[1] is 3 */
}
```

### if / elseif / else
```css
[main.ncss]
#main {
    --n: 5;

    .if [--n > 5] {
        content: "--n > 5";
    }
    .else if [--n == 5] {
        content: "--n == 5";
    }
    .else {
        content: "--n < 5";
    }
}
```
```
[output]
--n == 5
```

### while
```css
[main.ncss]
#main {
    --n: 0;

    .while [--n < 3] {
        content: "while-1 " + var(--n);
        transform: --n var(--n) + 1;
    }

    content: "";
    transform: --n 0;

    .while [true] {
        content: "while-2 " + var(--n);
        transform: --n var(--n) + 1;

        .if [--n == 4] {
            break: "";
        }
    }
}
```
```
[output]
while-1 0
while-1 1
while-1 2

while-2 0
while-2 1
while-2 2
while-2 3
```

### group
(Used to express scss-like annoyance.)
```css
[mian.ncss]
#main {
    .en {
        content: "Hello";
    }
    .ja {
        content: "こんにちは";
    }
    .ko {
        content: "안녕하세요";
    }
}
```
```
[output]
Hello
こんにちは
안녕하세요
```

### self function
```css
[main.ncss]
#main {
    content: "main";
    sub: "arg" "ments";
    reslut: --res-1 --res2;
    content: var(--res-1);
    content: var(--res-2);
}

#sub [--arg-1 --arg-2]{
    content: var(--arg-1) + var(arg-2);
    content: "sub";
    return: "ret" "urn";
    content: "heyheyhey!";
}
```
```
[output]
main
argments
sub
ret
urn
```

## Reference
- [自作言語でFizzBuzzを動かす！](https://zenn.dev/koduki/articles/fb7e20f3719ec5)
- [プログラミング言語の作り方](https://3iz.jp/)

## 

# LICENSE
[MIT LICENSE](./LICENSE)