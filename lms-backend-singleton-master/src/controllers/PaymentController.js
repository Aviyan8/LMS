import PaymentService from "../services/PaymentService.js";

const paymentService = new PaymentService();

class PaymentController {
  static async createPaymentIntent(req, res, next) {
    try {
      const { transactionId } = req.body;
      const userId = req.user.id;

      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }

      const { sessionId, url } = await paymentService.createPaymentIntent(
        transactionId,
        userId
      );

      res.json({
        sessionId,
        url,
      });
    } catch (err) {
      next(err);
    }
  }

  static async handleWebhook(req, res, next) {
    try {
      const signature = req.headers["stripe-signature"];
      // Use rawBody if available (from middleware), otherwise use body
      const body = req.rawBody || req.body;

      await paymentService.handleWebhook(signature, body);

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req, res, next) {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const result = await paymentService.verifyPayment(sessionId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default PaymentController;
