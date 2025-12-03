import Stripe from "stripe";
import BorrowTransactionRepository from "../repositories/BorrowTransactionRepository.js";

export default class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.borrowTransactionRepository = new BorrowTransactionRepository();
  }

  async createPaymentIntent(transactionId, userId) {
    // Find the transaction
    const transaction = await this.borrowTransactionRepository.findById(
      transactionId
    );

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Verify the transaction belongs to the user
    if (transaction.user.id !== userId) {
      throw new Error("Unauthorized: Transaction does not belong to user");
    }

    // Check if already paid
    if (transaction.paymentStatus === "PAID") {
      throw new Error("Fees already paid for this transaction");
    }

    // Calculate total fee (in cents for Stripe)
    const totalFee =
      transaction.baseFee + transaction.lateFee + transaction.reservationFee;

    if (totalFee <= 0) {
      throw new Error("No fees to pay");
    }

    const amountInCents = Math.round(totalFee * 100); // Convert to cents

    // Get frontend URL with proper scheme
    let frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    // Ensure URL has a scheme
    if (
      !frontendUrl.startsWith("http://") &&
      !frontendUrl.startsWith("https://")
    ) {
      frontendUrl = `http://${frontendUrl}`;
    }

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Library Fees - ${transaction.book.title}`,
              description: `Late fees and charges for book: ${transaction.book.title}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/transactions?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/transactions?payment=cancelled`,
      metadata: {
        transactionId: transactionId,
        userId: userId,
      },
      customer_email: transaction.user.email,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(signature, body) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const transactionId = session.metadata.transactionId;

      if (transactionId) {
        // Update transaction payment status
        await this.updatePaymentStatus(
          transactionId,
          "PAID",
          session.id,
          new Date()
        );
      }
    }

    return { received: true };
  }

  async updatePaymentStatus(transactionId, status, paymentId, paidAt) {
    const transaction = await this.borrowTransactionRepository.findById(
      transactionId
    );

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    console.log(
      `Attempting to update transaction ${transactionId} with status ${status}`
    );

    // Update in database - ensure transactionId is treated as UUID
    const [updatedRows] =
      await this.borrowTransactionRepository.BorrowTransactionModel.update(
        {
          paymentStatus: status,
          paymentId: paymentId,
          paidAt: paidAt,
        },
        {
          where: { id: transactionId },
          returning: true, // Return updated rows (PostgreSQL)
        }
      );

    if (updatedRows === 0) {
      console.warn(`Warning: No rows updated for transaction ${transactionId}`);
      // Try to find the row directly to debug
      const dbRow =
        await this.borrowTransactionRepository.BorrowTransactionModel.findByPk(
          transactionId
        );
      if (dbRow) {
        console.log(
          `Found row in DB. Current paymentStatus: ${dbRow.paymentStatus}`
        );
        // Try direct assignment and save
        dbRow.paymentStatus = status;
        dbRow.paymentId = paymentId;
        dbRow.paidAt = paidAt;
        await dbRow.save();
        console.log(`Updated via direct save for transaction ${transactionId}`);
      } else {
        throw new Error(`Transaction ${transactionId} not found in database`);
      }
    } else {
      console.log(
        `Payment status updated for transaction ${transactionId}: ${status} (${updatedRows} rows)`
      );
    }
  }

  async verifyPayment(sessionId) {
    try {
      console.log(`Verifying payment for session: ${sessionId}`);
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      console.log(`Session payment status: ${session.payment_status}`);
      console.log(`Session metadata:`, session.metadata);

      if (session.payment_status === "paid") {
        const transactionId = session.metadata.transactionId;
        if (transactionId) {
          // Check if already paid to avoid duplicate updates
          const transaction = await this.borrowTransactionRepository.findById(
            transactionId
          );
          if (transaction) {
            console.log(`Current payment status: ${transaction.paymentStatus}`);
            if (transaction.paymentStatus !== "PAID") {
              await this.updatePaymentStatus(
                transactionId,
                "PAID",
                session.id,
                new Date()
              );
              console.log(
                `Payment status updated to PAID for transaction ${transactionId}`
              );

              // Re-fetch to confirm update
              const updatedTransaction =
                await this.borrowTransactionRepository.findById(transactionId);
              console.log(
                `Confirmed payment status after update: ${updatedTransaction.paymentStatus}`
              );

              return {
                paid: true,
                transactionId,
                updated: true,
                paymentStatus: updatedTransaction.paymentStatus,
              };
            } else {
              console.log(
                `Transaction ${transactionId} already marked as PAID`
              );
              return {
                paid: true,
                transactionId,
                updated: false,
                paymentStatus: "PAID",
              };
            }
          } else {
            console.error(`Transaction ${transactionId} not found`);
            return { paid: true, transactionId, updated: false };
          }
        } else {
          console.error("No transactionId in session metadata");
          return { paid: true, transactionId: null };
        }
      }

      return { paid: false };
    } catch (error) {
      console.error("Payment verification error:", error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }
}
