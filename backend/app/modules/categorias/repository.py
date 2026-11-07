from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def list_activas(self) -> list[Categoria]:
        statement = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.id)
        return list(self.session.exec(statement).all())
