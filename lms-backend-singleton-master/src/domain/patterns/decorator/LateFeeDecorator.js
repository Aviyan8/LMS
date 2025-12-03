import IBorrowCost from "./IBorrowCost.js";

export default class LateFeeDecorator extends IBorrowCost {
  constructor(innerCost, lateFee) {
    super();
    this.innerCost = innerCost;
    this.lateFee = lateFee;
  }

  calculate() {
    return this.innerCost.calculate() + this.lateFee;
  }
}

