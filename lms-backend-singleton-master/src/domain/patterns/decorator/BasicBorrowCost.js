import IBorrowCost from "./IBorrowCost.js";

export default class BasicBorrowCost extends IBorrowCost {
  constructor(baseFee) {
    super();
    this.baseFee = baseFee;
  }

  calculate() {
    return this.baseFee;
  }
}

