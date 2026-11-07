from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MessageResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "access_token"
COOKIE_OPTIONS = {"httponly": True, "samesite": "lax", "path": "/"}


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: ServiceDep):
    return service.register(data)


@router.post("/token", response_model=MessageResponse)
def login(response: Response, form: Annotated[OAuth2PasswordRequestForm, Depends()], service: ServiceDep):
    token = service.login(form.username, form.password)
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **COOKIE_OPTIONS,
    )
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, **COOKIE_OPTIONS)
    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: Annotated[Usuario, Depends(get_current_active_user)]):
    return UserPublic.model_validate(usuario)
