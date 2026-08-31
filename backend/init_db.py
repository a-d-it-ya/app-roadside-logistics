"""Database initialization and seeder script for RoadSide Logistics."""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine
from app.models import Base, User, Organization, OrganizationType, OrganizationMember, MemberRole
from app.core.security import get_password_hash

def init_database():
    print("Creating all tables via SQLAlchemy metadata...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully.")

    db = SessionLocal()
    try:
        # Check if demo user already exists
        demo_email = "demo@roadside.in"
        existing = db.query(User).filter(User.email == demo_email).first()
        if not existing:
            print(f"Seeding default demo account ({demo_email})...")
            demo_user = User(
                full_name="Aditya Singh",
                email=demo_email,
                phone="9876543210",
                password_hash=get_password_hash("RoadSide123"),
                is_active=True,
                is_verified=True
            )
            db.add(demo_user)
            db.flush()

            # Create default organization for demo user
            demo_org = Organization(
                name="Aditya Logistics Corp.",
                organization_type=OrganizationType.SHIPPER
            )
            db.add(demo_org)
            db.flush()

            demo_member = OrganizationMember(
                user_id=demo_user.id,
                organization_id=demo_org.id,
                role=MemberRole.OWNER
            )
            db.add(demo_member)
            db.commit()
            print("✓ Default demo user & organization seeded successfully.")
        else:
            print("✓ Demo account already present in database.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
