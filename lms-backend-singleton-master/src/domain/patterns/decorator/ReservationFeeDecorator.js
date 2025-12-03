import IBorrowCost from "./IBorrowCost.js";

export default class ReservationFeeDecorator extends IBorrowCost {
  constructor(innerCost, reservationFee) {
    super();
    this.innerCost = innerCost;
    this.reservationFee = reservationFee;
  }

  calculate() {
    return this.innerCost.calculate() + this.reservationFee;
  }
}

