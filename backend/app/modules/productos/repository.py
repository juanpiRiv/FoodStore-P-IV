from sqlalchemy.orm import selectinload
from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_by_nombre(self, nombre: str) -> Producto | None:
        return self.session.exec(select(Producto).where(Producto.nombre == nombre)).first()

    def get_by_id_for_update(self, id: int) -> Producto | None:
        """Row lock (SELECT ... FOR UPDATE); SQLite ignores it."""
        statement = select(Producto).where(Producto.id == id).with_for_update()
        return self.session.exec(statement).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[list[Producto], int]:
        filters = [col(Producto.activo).is_(True)]
        if search:
            filters.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filters.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filters.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filters)).one()
        statement = (
            select(Producto)
            .where(*filters)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return list(self.session.exec(statement).all()), total
