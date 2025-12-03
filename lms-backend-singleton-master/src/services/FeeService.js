import BasicBorrowCost from "../domain/patterns/decorator/BasicBorrowCost.js";
import LateFeeDecorator from "../domain/patterns/decorator/LateFeeDecorator.js";
import ReservationFeeDecorator from "../domain/patterns/decorator/ReservationFeeDecorator.js";
import { getCurrentDate } from "../utils/dateUtils.js";

export default class FeeService {
  calculateFees({ baseFee, isOverdue, hasReservation, lateFee = 5, reservationFee = 2 }) {
    let cost = new BasicBorrowCost(baseFee);

    if (isOverdue) {
      cost = new LateFeeDecorator(cost, lateFee);
    }

    if (hasReservation) {
      cost = new ReservationFeeDecorator(cost, reservationFee);
    }

    return {
      baseFee: baseFee,
      lateFee: isOverdue ? lateFee : 0,
      reservationFee: hasReservation ? reservationFee : 0,
      totalFee: cost.calculate(),
    };
  }

  calculateReturnFees(transaction, currentDate, hasReservation = false) {
    const isOverdue = transaction.isOverdue(currentDate);

    return this.calculateFees({
      baseFee: transaction.baseFee || 0,
      isOverdue,
      hasReservation,
    });
  }
}

