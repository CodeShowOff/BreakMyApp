import os
from abc import ABC, abstractmethod
from typing import BinaryIO

import boto3  # type: ignore[import-untyped]
from botocore.config import Config  # type: ignore[import-untyped]
from botocore.exceptions import ClientError  # type: ignore[import-untyped]


class StorageProvider(ABC):
    @abstractmethod
    def upload_evidence(
        self, object_key: str, data: bytes | BinaryIO, content_type: str = "application/octet-stream"
    ) -> str:
        """
        Uploads evidence to storage.
        Returns the object key.
        """

    @abstractmethod
    def get_signed_url(self, object_key: str, expires_in: int = 3600) -> str:
        """
        Generates a short-lived signed URL for reading an object.
        Never exposes the underlying storage credentials.
        """


class S3StorageProvider(StorageProvider):
    def __init__(
        self,
        bucket_name: str | None = None,
        region_name: str | None = None,
        endpoint_url: str | None = None,
    ):
        self.bucket_name = bucket_name or os.environ.get("EVIDENCE_BUCKET_NAME", "breakmyapp-evidence")
        
        boto_config = Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
        )
        
        self.s3_client = boto3.client(
            "s3",
            region_name=region_name or os.environ.get("AWS_REGION"),
            endpoint_url=endpoint_url or os.environ.get("S3_ENDPOINT_URL"),
            config=boto_config,
        )

    def upload_evidence(
        self, object_key: str, data: bytes | BinaryIO, content_type: str = "application/octet-stream"
    ) -> str:
        try:
            if isinstance(data, bytes):
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=object_key,
                    Body=data,
                    ContentType=content_type,
                )
            else:
                self.s3_client.upload_fileobj(
                    Fileobj=data,
                    Bucket=self.bucket_name,
                    Key=object_key,
                    ExtraArgs={"ContentType": content_type},
                )
            return object_key
        except ClientError as e:
            # Re-raise or handle domain specific exception
            raise RuntimeError(f"Failed to upload evidence to S3: {e}") from e

    def get_signed_url(self, object_key: str, expires_in: int = 3600) -> str:
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": object_key},
                ExpiresIn=expires_in,
            )
            return str(url)
        except ClientError as e:
            raise RuntimeError(f"Failed to generate signed URL: {e}") from e


class MockStorageProvider(StorageProvider):
    """Useful for local testing without AWS credentials."""
    def __init__(self) -> None:
        self.storage: dict[str, bytes | BinaryIO] = {}
        
    def upload_evidence(
        self, object_key: str, data: bytes | BinaryIO, content_type: str = "application/octet-stream"
    ) -> str:
        self.storage[object_key] = data
        return object_key

    def get_signed_url(self, object_key: str, expires_in: int = 3600) -> str:
        if object_key not in self.storage:
            raise RuntimeError("Object not found")
        # In a real app, this would return a local development server URL that serves the file
        return f"http://localhost:8000/dev/storage/{object_key}?expires={expires_in}"
