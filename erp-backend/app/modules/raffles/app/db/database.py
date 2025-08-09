from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
# Se elimina la importación de declarative_base
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session_local = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Se elimina la línea 'Base = declarative_base()' de este archivo.

async def get_db():
    db = async_session_local()
    try:
        yield db
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    finally:
        await db.close()