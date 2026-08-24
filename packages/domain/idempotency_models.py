from sqlalchemy import JSON, Column, DateTime, Integer, String

from packages.domain.database import Base
from packages.domain.models import generate_uuid, utc_now


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    key = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    # response details
    status_code = Column(Integer, nullable=True)
    response_body = Column(JSON, nullable=True)
