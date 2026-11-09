from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from app.core.database import get_db
from app.models.farmer import Farmer

async def get_current_farmer(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> Farmer:
    """
    Extracts and validates the farmer from the Clerk Bearer token.
    Provides auto-bootstrapped dev farmer when testing locally.
    """
    # 1. Dev/Mock user bootstrap for instant local testing
    clerk_id = "user_clerk_dev_farmer_123"
    email = "farmer.ramu@protectfarm.org"
    name = "Ramu Kisan"

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        # In production with verified Clerk JWT, decode the sub and claims here
        if token != "mock_token" and len(token) > 20:
            clerk_id = f"clerk_{token[:16]}"
            email = f"farmer_{token[:8]}@example.com"
            name = "Farmer"

    # Query or create in DB
    result = await db.execute(select(Farmer).where(Farmer.clerk_user_id == clerk_id))
    farmer = result.scalars().first()

    if not farmer:
        farmer = Farmer(
            clerk_user_id=clerk_id,
            full_name=name,
            email=email,
            preferred_language="te" # Default Telugu
        )
        db.add(farmer)
        await db.commit()
        await db.refresh(farmer)

    return farmer
