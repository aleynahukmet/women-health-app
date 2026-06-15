from app.db.session import engine, Base
from app.models.user import User
from app.models.health import HealthProfile, CycleLog, SymptomLog

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized.")
