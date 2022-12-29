import { Scanner } from "./scanner";
import { Evaluator } from "./evaluator";
import * as Parser from "./parser";

export function evaluate(text: any) {
  const sc = new Scanner(text);
  const ast = Parser.parse(sc);
  return new Evaluator().apply(ast).stdout.join("\n");
}
