from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
import os, sys, pymysql
pymysql.install_as_MySQLdb()

# backend 경로 추가
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
sys.path.append(BACKEND_DIR)

from app.models import Base
from app.db import ASYNC_URL

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_online():
    sync_url = ASYNC_URL.replace("+aiomysql", "")
    connectable = create_engine(sync_url, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

def run_migrations_offline():
    context.configure(url=ASYNC_URL, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()