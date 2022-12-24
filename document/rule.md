# NCSS rules

### 変数宣言
```css
* {
    /* グローバル変数 */
    --num-global: 200;
    --str-global: "hi";
}

#main {
    /* ローカル変数 */
    --num: 100;
    --str: "hello";
    --very-long-variable-name: "こんにちは";
}
```

### 配列
```css
#main {
    --arr: [10, 20, 30, 40, 50];
    content: var(--arr:nth-child(1));
    /*=> 20 */
}
```

### 代入/加減乗除
```css
#main {
    /* --num = 200 */
    transform: var(--num) 200;

    /* --num = --num + 50 */
    transform: var(--num) calc(var(--num) + 50);

    /* --num = --num - 50 */
    transform: var(--num) calc(var(--num) - 50);

    /* --num = --num * 50 */
    transform: var(--num) calc(var(--num) * 50);

    /* --num = --num / 50 */
    transform: var(--num) calc(var(--num) / 50);
}
```

### 命令文
```css
#main {
    /* 標準出力命令 */
    content: "Hello, World!";
    /*=> Hello, World! */

    --num: 100;
    --str: "num is ";
    transform: var(--str) calc(var(--str) + var(--num));

    content: var(--str);
    /*=> num is 100 */

    content: "num is var(--num)";
    /*=> num is var(--num) */
}
```

### if / else if / else文
```css
#main {
    --num: 10;
    .if [var(--num) < 10]{
        content: "10未満";
    }
    .else .if [--num == 10] {
        content: "10です";
    }
    .else {
        contetnt: "10以上";
    }
}
```

### while文
```css
#main {
    --num: 0;
    .while[var(--num) < 100] {
        content: var(--num);
        transform: var(--num) calc(var(--num) + 1);
    }
}
```

### 関数
```css
#main {
    function: #sum 1 2 3;
    result: --result;
    content: var(--result);
    /*=> 6 */
}

#sum [--n1 --n2 --n3]{
    contetnt: var(--n1) var(--n2) var(--n3);
    return: calc(--n1 + --n2 + --n3);
}
```
