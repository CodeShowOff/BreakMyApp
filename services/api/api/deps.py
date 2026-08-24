from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from packages.domain.database import get_db
from packages.domain.idempotency_models import IdempotencyKey
from packages.domain.models import User
from packages.security.authentication import get_current_user_id


class IdempotentResponseExists(Exception):
    def __init__(self, key: IdempotencyKey):
        self.key = key

async def get_current_user(
    request: Request,
    user_id: Annotated[str, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        user = User(id=user_id, email=f"{user_id}@example.com")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

async def check_idempotency_key(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> IdempotencyKey | None:
    if not idempotency_key:
        return None
        
    result = await db.execute(select(IdempotencyKey).filter(IdempotencyKey.key == idempotency_key))
    existing_key = result.scalars().first()
    
    if existing_key:
        # If it has a status code, it was already completed - return cached response
        if existing_key.status_code is not None:
            raise IdempotentResponseExists(existing_key)
        else:
            raise HTTPException(status_code=409, detail="Idempotency key currently processing")
            
    # Create new idempotency tracking record
    new_key = IdempotencyKey(key=idempotency_key)
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    return new_key

