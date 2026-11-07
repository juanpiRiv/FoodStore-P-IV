from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Opens a session on enter; commits or rolls back on exit. The only place that commits."""

    def __init__(self, session_factory=session_factory):
        self._session_factory = session_factory
        self.session: Session

    def __enter__(self):
        self.session = self._session_factory()
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False
