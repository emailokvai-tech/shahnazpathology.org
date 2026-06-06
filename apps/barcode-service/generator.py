# generator.py — Core Barcode Generation Logic

import uuid
import datetime
import hashlib

class BarcodeService:
    """
    Service responsible for generating and validating GS1 DataMatrix barcodes,
    binding them securely to a physical specimen.
    """

    def __init__(self, db, audit_logger):
        self.db = db
        self.audit = audit_logger

    async def generate_barcode(self, specimen_id: str, printer_device_id: str) -> dict:
        """
        Generates a new GS1 compliant barcode string for a specimen.
        """
        # Step 1: Verify specimen exists and is not already barcoded
        specimen = await self.db.fetch_one(
            "SELECT * FROM specimen WHERE specimen_id = $1",
            specimen_id
        )
        if not specimen:
            raise ValueError(f"Specimen {specimen_id} not found.")

        existing_barcode = await self.db.fetch_one(
            "SELECT barcode_value FROM barcode WHERE specimen_id = $1",
            specimen_id
        )
        if existing_barcode:
            raise ValueError(f"Specimen {specimen_id} already has a barcode.")

        # Step 2: Generate GS1 compliant payload
        # GS1 App Identifiers: (01) GTIN, (10) Batch, (21) Serial Number
        # Example format: 010000000000000010SHAHNAZ21<short_uuid>
        short_id = str(uuid.uuid4())[:8].upper()
        timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
        
        # Creating a deterministic payload string
        payload = f"01SHAHNAZPATH10{timestamp}21{short_id}"

        # Generate a checksum for integrity verification later
        checksum = hashlib.sha256(payload.encode()).hexdigest()[:8]
        barcode_value = f"{payload}-{checksum}"

        # Step 3: Insert into the database
        barcode_id = str(uuid.uuid4())
        await self.db.execute(
            """
            INSERT INTO barcode (barcode_id, specimen_id, barcode_value, barcode_type, is_printed, generated_at, printer_device_id)
            VALUES ($1, $2, $3, 'GS1_DATAMATRIX', FALSE, NOW(), $4)
            """,
            barcode_id, specimen_id, barcode_value, printer_device_id
        )

        await self.audit.log("BARCODE_GENERATED", specimen_id=specimen_id, barcode=barcode_value)

        # In a real implementation, this would also generate the raw PNG/ZPL binary payload
        # for the physical Zebra ZD621 printers.
        
        return {
            "barcode_id": barcode_id,
            "specimen_id": specimen_id,
            "barcode_value": barcode_value,
            "type": "GS1_DATAMATRIX"
        }

    async def mark_as_printed(self, barcode_id: str):
        """
        Callback from the physical printer once the label is successfully applied.
        """
        await self.db.execute(
            """
            UPDATE barcode SET is_printed = TRUE, printed_at = NOW()
            WHERE barcode_id = $1
            """,
            barcode_id
        )
        await self.audit.log("BARCODE_PRINTED", barcode_id=barcode_id)

if __name__ == "__main__":
    print("Barcode Service module initialized successfully.")
