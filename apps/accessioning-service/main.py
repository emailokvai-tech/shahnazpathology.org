# accessioning_service.py — Core Accessioning Logic

import uuid
import json
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AccessioningService")

class AccessioningService:
    """
    Handles patient intake, specimen registration, and case creation.
    Validates barcodes, logs to the audit ledger, and triggers downstream events.
    """
    def __init__(self, db, event_bus):
        self.db = db
        self.event_bus = event_bus  # e.g., NATS or MQTT client

    async def register_specimen(self, order_id: str, barcode_scan_data: str, user_id: str) -> dict:
        """
        Registers a physical specimen and links it to a clinical order.
        """
        try:
            # 1. Input Validation
            if not barcode_scan_data.startswith("01SHAHNAZ"):
                raise ValueError("Invalid Barcode Format. Must be a valid GS1 DataMatrix.")

            # 2. Check Order
            order = await self.db.fetch_one("SELECT * FROM clinical_order WHERE order_id = $1", order_id)
            if not order:
                raise ValueError(f"Clinical Order {order_id} not found.")

            # 3. Create Specimen Record
            specimen_id = str(uuid.uuid4())
            await self.db.execute(
                """
                INSERT INTO specimen (specimen_id, order_id, status, accessioned_at)
                VALUES ($1, $2, 'ACCESSIONED', NOW())
                """,
                specimen_id, order_id
            )

            # 4. Audit Logging
            await self._log_audit("SPECIMEN_ACCESSIONED", user_id, specimen_id, {"barcode": barcode_scan_data, "order_id": order_id})

            # 5. Event-Driven Trigger (Notify Pathologist Portal)
            # In a real system, this pushes to NATS JetStream or Supabase Realtime
            await self.event_bus.publish(
                "specimen.accessioned",
                payload={"specimen_id": specimen_id, "order_id": order_id, "timestamp": datetime.utcnow().isoformat()}
            )
            
            logger.info(f"Successfully accessioned specimen {specimen_id} for order {order_id}")
            return {"status": "success", "specimen_id": specimen_id}

        except Exception as e:
            # Handle malformed scans or DB errors gracefully
            await self._log_error("AccessioningService", str(e), payload={"barcode": barcode_scan_data, "order_id": order_id})
            logger.error(f"Failed to accession specimen: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def _log_audit(self, event_type: str, user_id: str, specimen_id: str, details: dict):
        """Writes to the secure audit_logs table."""
        await self.db.execute(
            """
            INSERT INTO audit_logs (event_type, user_id, specimen_id, details)
            VALUES ($1, $2, $3, $4)
            """,
            event_type, user_id, specimen_id, json.dumps(details)
        )

    async def _log_error(self, service_name: str, error_message: str, payload: dict):
        """Writes to the error_logs table."""
        await self.db.execute(
            """
            INSERT INTO error_logs (service_name, error_message, payload)
            VALUES ($1, $2, $3)
            """,
            service_name, error_message, json.dumps(payload)
        )

if __name__ == "__main__":
    logger.info("Accessioning Service Initialized.")
