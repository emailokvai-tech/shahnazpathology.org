# pos_service.py — Financial Gate

import uuid
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("POSService")

class POSService:
    """
    Handles payment processing, invoice generation, and updates the payment-status ledger.
    Crucial for unlocking the Hardware Lock Controller.
    """
    def __init__(self, db, event_bus):
        self.db = db
        self.event_bus = event_bus

    async def process_payment(self, order_id: str, amount: float, method: str, transaction_ref: str, cashier_id: str) -> dict:
        try:
            payment_id = str(uuid.uuid4())
            
            # Record payment in database
            await self.db.execute(
                """
                INSERT INTO payment (payment_id, order_id, amount_paid, currency, payment_method, payment_status, transaction_ref, paid_at, cashier_user_id)
                VALUES ($1, $2, $3, 'BDT', $4, 'PAID', $5, NOW(), $6)
                """,
                payment_id, order_id, amount, method, transaction_ref, cashier_id
            )

            # Audit Trail
            await self._log_audit("PAYMENT_RECEIVED", cashier_id, order_id, {"amount": amount, "ref": transaction_ref})

            # Fire Event to trigger Hardware Unlock
            await self.event_bus.publish(
                "payment.confirmed",
                payload={"order_id": order_id, "payment_status": "PAID", "timestamp": datetime.utcnow().isoformat()}
            )
            
            logger.info(f"Payment of {amount} BDT confirmed for order {order_id}")
            return {"status": "success", "payment_id": payment_id}

        except Exception as e:
            logger.error(f"Payment failed: {str(e)}")
            await self._log_error("POSService", str(e), {"order_id": order_id})
            return {"status": "error", "message": "Transaction Failed"}

    async def _log_audit(self, event_type: str, user_id: str, order_id: str, details: dict):
        await self.db.execute(
            "INSERT INTO audit_logs (event_type, user_id, details) VALUES ($1, $2, $3)",
            event_type, user_id, json.dumps({"order_id": order_id, **details})
        )

    async def _log_error(self, service_name: str, error_message: str, payload: dict):
        await self.db.execute(
            "INSERT INTO error_logs (service_name, error_message, payload) VALUES ($1, $2, $3)",
            service_name, error_message, json.dumps(payload)
        )

if __name__ == "__main__":
    logger.info("POS / Financial Gate Initialized.")
