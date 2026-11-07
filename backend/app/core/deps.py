from typing import Annotated, Callable

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(access_token: Annotated[str | None, Cookie()] = None) -> Usuario:
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    if not access_token:
        raise unauthorized
    payload = decode_access_token(access_token)
    if payload is None:
        raise unauthorized
    try:
        usuario_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise unauthorized
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_id(usuario_id)
    if usuario is None:
        raise unauthorized
    return usuario


def get_current_active_user(usuario: Annotated[Usuario, Depends(get_current_user)]) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    def checker(usuario: Annotated[Usuario, Depends(get_current_active_user)]) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tiene permisos para realizar esta acción")
        return usuario

    return checker
