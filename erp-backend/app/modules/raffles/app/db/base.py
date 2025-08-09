# app/db/base.py
from sqlalchemy.orm import declarative_base

# La única responsabilidad de este archivo es crear y exportar la Base.
Base = declarative_base()
