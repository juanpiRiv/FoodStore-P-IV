from datetime import datetime


def now() -> datetime:
    """Naive local datetime used for every timestamp in the app."""
    return datetime.now()
