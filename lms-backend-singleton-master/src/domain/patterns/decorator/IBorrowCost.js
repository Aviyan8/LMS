// interface-like: any cost calculator must implement calculate()
export default class IBorrowCost {
  calculate() {
    throw new Error("calculate() must be implemented");
  }
}

