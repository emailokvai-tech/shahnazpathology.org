# wsi_router.py — WSI Image Router / Scanner Controller

import uuid
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("WSIRouter")

class WSIScannerController:
    """
    Orchestrates scan jobs, ingests raw .SVS/.NDPI tiles, and handles DICOMization.
    It listens to the Hardware Lock to know when scanning is permitted.
    """
    def __init__(self, db, event_bus, storage_client):
        self.db = db
        self.event_bus = event_bus
        self.storage = storage_client # e.g. MinIO/S3

    async def on_scan_complete(self, specimen_id: str, file_path: str, scanner_device_id: str):
        try:
            # Generate Metadata
            image_id = str(uuid.uuid4())
            file_size = 500000000 # Mock 500MB
            
            # Upload to Hot Tier Storage
            s3_url = await self.storage.upload(file_path, f"wsi/{specimen_id}/{image_id}.svs")

            # Register in Database
            await self.db.execute(
                """
                INSERT INTO wsi_image (image_id, specimen_id, original_format, file_size_bytes, storage_path, current_tier, scanned_at, scanner_device_id)
                VALUES ($1, $2, 'SVS', $3, $4, 'HOT', NOW(), $5)
                """,
                image_id, specimen_id, file_size, s3_url, scanner_device_id
            )

            # Fire Event for QC Engine
            await self.event_bus.publish(
                "scan.complete",
                payload={"image_id": image_id, "specimen_id": specimen_id, "storage_path": s3_url}
            )
            
            logger.info(f"Scan completed and stored at {s3_url}")

        except Exception as e:
            logger.error(f"Scan ingestion failed: {str(e)}")

if __name__ == "__main__":
    logger.info("WSI Scanner Controller Initialized.")
