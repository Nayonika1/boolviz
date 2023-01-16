type Operators =
  | "and"
  | "or"
  | "xor"
  | "nand"
  | "nor"
  | "not";

interface GenerateRandomCircuitArg {
  depth: number;
  operands: [string, ...string[]]; // non empty array of strings
  operators: Partial<Record<Operators, number>>;
}

export function generateRandomCircuit({
  depth,
  operands,
  operators,
}: GenerateRandomCircuitArg): string {
  const root = generateTree(depth, operands.length)

  populateTree(root, operators, operands)

  return treeToString(root)
}

export interface Node {
  value: string;
  left: Node | null;
  right: Node | null;
}

export function generateTree(depth: number, operatorCount: number): Node {
  throw new Error("Not implemented yet");
}

export function populateTree(
  root: Node,
  operators: GenerateRandomCircuitArg["operators"],
  operands: GenerateRandomCircuitArg["operands"]
) {
  throw new Error("Not implemented yet")
}

export function treeToString(root: Node): string {
  throw new Error("Not implemented yet")
}
