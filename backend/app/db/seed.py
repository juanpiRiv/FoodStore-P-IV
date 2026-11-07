from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

IMG = "https://placehold.co/600x400?text="

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Pizzas", "Pizzas al horno de piedra"),
    ("Bebidas", "Gaseosas, jugos y agua"),
    ("Postres", "Dulces y helados"),
]

# (nombre, descripcion, precio, stock, categoria)
PRODUCTOS = [
    ("Hamburguesa Clásica", "Carne, lechuga, tomate y cheddar", 5500.0, 30, "Hamburguesas"),
    ("Hamburguesa Doble", "Doble carne con panceta", 7200.0, 25, "Hamburguesas"),
    ("Pizza Muzzarella", "Salsa de tomate y muzzarella", 8000.0, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate y ajo", 9000.0, 15, "Pizzas"),
    ("Coca-Cola 500ml", "Gaseosa cola", 1800.0, 60, "Bebidas"),
    ("Agua Mineral 500ml", "Agua sin gas", 1200.0, 80, "Bebidas"),
    ("Flan con Dulce de Leche", "Flan casero", 3000.0, 18, "Postres"),
    ("Helado de Vainilla", "Pote de 250g", 3500.0, 22, "Postres"),
]


def seed_admin() -> int:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username("admin"):
            return 0
        uow.usuarios.add(
            Usuario(
                username="admin",
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
            )
        )
        return 1


def seed_categorias() -> int:
    creadas = 0
    with CategoriaUnitOfWork() as uow:
        for nombre, descripcion in CATEGORIAS:
            if uow.categorias.get_by_nombre(nombre) is None:
                uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
                creadas += 1
    return creadas


def seed_productos() -> int:
    creados = 0
    with ProductoUnitOfWork() as uow:
        for nombre, descripcion, precio, stock, categoria_nombre in PRODUCTOS:
            if uow.productos.get_by_nombre(nombre) is not None:
                continue
            categoria = uow.categorias.get_by_nombre(categoria_nombre)
            uow.productos.add(
                Producto(
                    categoria_id=categoria.id,
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    imagen_url=IMG + nombre.replace(" ", "+"),
                    stock=stock,
                )
            )
            creados += 1
    return creados


def main() -> None:
    create_all_tables()
    print(
        f"Seed: {seed_admin()} admin, {seed_categorias()} categorias, {seed_productos()} productos creados"
    )


if __name__ == "__main__":
    main()
