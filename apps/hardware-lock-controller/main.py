# hardware_lock_controller.py — Core Lock Logic

import hmac
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional

TOKEN_TTL_SECONDS = 300  # 5-minute window
MAX_UNLOCK_ATTEMPTS = 3

class ScanResponse:
    def __init__(self, status: str, reason: str = "", display_message: str = "", token_expires_in: int = 0):
        self.status = status
        self.reason = reason
        self.display_message = display_message
        self.token_expires_in = token_expires_in

class HardwareLockController:
    """
    Cryptographic gatekeeper between POS payment status
    and physical WSI scanner / barcode printer hardware.
    """

    def __init__(self, db, mqtt_client, audit_logger, key_store):
        self.db = db
        self.mqtt = mqtt_client
        self.audit = audit_logger
        self.key_store = key_store  # per-device rotating HMAC secrets

    async def on_scan_request(self, barcode_value: str, device_id: str) -> ScanResponse:
        """
        Entry point: technician scans a barcode, requesting permission to scan.
        """
        # ── Step 1: Validate barcode ──
        specimen = await self.db.fetch_one(
            "SELECT s.specimen_id, s.order_id "
            "FROM barcode b JOIN specimen s ON b.specimen_id = s.specimen_id "
            "WHERE b.barcode_value = $1 AND b.is_printed = TRUE",
            barcode_value
        )
        if not specimen:
            await self.audit.log("BARCODE_INVALID", barcode_value=barcode_value, device_id=device_id)
            return ScanResponse(status="REJECTED", reason="INVALID_BARCODE")

        order_id = specimen["order_id"]

        # ── Step 2: Check payment status ──
        payment = await self.db.fetch_one(
            "SELECT payment_id, payment_status FROM payment WHERE order_id = $1",
            order_id
        )

        if not payment or payment["payment_status"] not in ("PAID", "WAIVED"):
            # ── LOCK: Payment not confirmed ──
            await self._enforce_lock(order_id, device_id, reason="UNPAID")
            return ScanResponse(
                status="HARDWARE_LOCKED",
                reason="PAYMENT_REQUIRED",
                display_message="⚠ Payment required before scanning. Contact billing desk."
            )

        # ── Step 3: Rate-limit check ──
        lock_state = await self.db.fetch_one(
            "SELECT unlock_attempts FROM hardware_lock_state WHERE order_id = $1",
            order_id
        )
        if lock_state and lock_state["unlock_attempts"] >= MAX_UNLOCK_ATTEMPTS:
            await self.audit.log("UNLOCK_RATE_LIMITED", order_id=order_id, device_id=device_id)
            return ScanResponse(status="REJECTED", reason="RATE_LIMITED_SECURITY_ALERT")

        # ── Step 4: Generate cryptographic unlock token ──
        token = self._generate_unlock_token(order_id, device_id)

        # ── Step 5: Persist token (single-use, TTL-bound) ──
        await self.db.execute(
            """
            INSERT INTO hardware_lock_state
                (lock_id, payment_id, order_id, scanner_unlocked, printer_unlocked,
                 lock_token, token_issued_at, token_expires_at, unlock_attempts)
            VALUES (gen_random_uuid(), $1, $2, TRUE, TRUE, $3, NOW(),
                    NOW() + INTERVAL '300 seconds', 0)
            ON CONFLICT (order_id) DO UPDATE SET
                scanner_unlocked = TRUE,
                printer_unlocked = TRUE,
                lock_token = $3,
                token_issued_at = NOW(),
                token_expires_at = NOW() + INTERVAL '300 seconds'
            """,
            payment["payment_id"], order_id, token
        )

        # ── Step 6: Send unlock command to scanner via MQTT ──
        await self.mqtt.publish(
            topic=f"scanners/{device_id}/commands",
            payload={
                "command": "UNLOCK",
                "order_id": str(order_id),
                "token": token.hex(),
                "expires_at": (datetime.utcnow() + timedelta(seconds=TOKEN_TTL_SECONDS)).isoformat(),
                "specimen_id": str(specimen["specimen_id"]),
            },
            qos=2  # exactly-once delivery
        )

        await self.audit.log("SCANNER_UNLOCKED", order_id=order_id, device_id=device_id)
        return ScanResponse(status="UNLOCKED", token_expires_in=TOKEN_TTL_SECONDS)

    def _generate_unlock_token(self, order_id: str, device_id: str) -> bytes:
        """
        HMAC-SHA256 token binding order, device, timestamp, and nonce.
        The scanner firmware independently verifies this using its copy
        of the rotating device secret.
        """
        device_secret = self.key_store.get_current_secret(device_id)
        nonce = secrets.token_bytes(16)
        timestamp = int(time.time())

        message = f"{order_id}|{device_id}|{timestamp}|{nonce.hex()}".encode()
        tag = hmac.new(device_secret, message, hashlib.sha256).digest()

        # Token = nonce || timestamp || HMAC tag  (deterministic parse by scanner)
        return nonce + timestamp.to_bytes(8, "big") + tag

    async def _enforce_lock(self, order_id: str, device_id: str, reason: str):
        """Send LOCK command and update state."""
        await self.db.execute(
            """
            INSERT INTO hardware_lock_state
                (lock_id, order_id, scanner_unlocked, printer_unlocked,
                 lock_reason, token_issued_at, unlock_attempts)
            VALUES (gen_random_uuid(), $1, FALSE, FALSE, $2, NOW(), 0)
            ON CONFLICT (order_id) DO UPDATE SET
                scanner_unlocked = FALSE,
                printer_unlocked = FALSE,
                lock_reason = $2
            """,
            order_id, reason
        )

        await self.mqtt.publish(
            topic=f"scanners/{device_id}/commands",
            payload={"command": "LOCK", "reason": reason},
            qos=2
        )
        await self.audit.log("LOCK_ENFORCED", order_id=order_id, reason=reason, device_id=device_id)

    async def on_scan_complete(self, device_id: str, order_id: str):
        """Post-scan: consume the token and re-lock the scanner."""
        await self.db.execute(
            """
            UPDATE hardware_lock_state SET
                scanner_unlocked = FALSE,
                printer_unlocked = FALSE,
                lock_token = NULL,
                lock_reason = 'SCAN_COMPLETE_AUTO_LOCK'
            WHERE order_id = $1
            """,
            order_id
        )
        await self.mqtt.publish(
            topic=f"scanners/{device_id}/commands",
            payload={"command": "LOCK", "reason": "SCAN_COMPLETE"},
            qos=2
        )
        await self.audit.log("SCANNER_AUTO_LOCKED", order_id=order_id, device_id=device_id)

if __name__ == "__main__":
    print("Hardware Lock Controller initialized successfully.")
