from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from starlette.middleware.cors import CORSMiddleware
import asyncio
import os
import re
import logging
import random
import string
import bcrypt
import jwt
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Callable, List, Optional, TypeVar
import uuid
from datetime import datetime, timezone, timedelta
import storage

T = TypeVar("T")

async def db_call(operation: Callable[..., T], *args: Any) -> T:
    return await asyncio.to_thread(operation, *args)

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
VALID_STATUSES = ["recebido", "na brasa", "saiu para entrega", "entregue"]

PRODUCTS = [
    {"id": "marmita-da-casa", "name": "Marmita da Casa West", "description": "Arroz soltinho, feijão carioca, frango grelhado fatiado, batata frita crocante e farofa. Tudo junto, do jeito que a gente gosta.", "price": 22.90, "category": "marmitas", "image": "/marmitas/marmita-da-casa.jpg", "badge": "Mais pedida", "serves": "1 pessoa"},
    {"id": "marmita-brasa-dupla", "name": "Marmita Brasa Dupla", "description": "Arroz, feijão carioca, contra-filé e frango grelhados na brasa em fatias generosas, batata frita e farofa. Proteína em dobro.", "price": 27.90, "category": "marmitas", "image": "/marmitas/marmita-brasa-dupla.jpg", "badge": None, "serves": "1 pessoa"},
    {"id": "marmita-frango-supreme", "name": "Marmita Frango Supreme", "description": "Arroz, feijão preto, frango cremoso desfiado, batata frita e farofa com bacon.", "price": 24.90, "category": "marmitas", "image": "/marmitas/marmita-frango-supreme.jpg", "badge": None, "serves": "1 pessoa"},
    {"id": "marmita-costela", "name": "Marmita Costela Desfiada", "description": "Arroz, feijão de caldo grosso, costela bovina cozida por 8 horas e desfiada, batata frita e farofa.", "price": 29.90, "category": "marmitas", "image": "/marmitas/marmita-costela.jpg", "badge": "Da brasa", "serves": "1-2 pessoas"},
    {"id": "combo-west", "name": "Combo West", "description": "Marmita da casa + espetinho de carne + refrigerante lata gelado. O clássico completo.", "price": 32.90, "category": "combos", "image": "/marmitas/marmita-da-casa.jpg", "badge": "-15%", "serves": "1 pessoa"},
    {"id": "combo-casal", "name": "Combo Casal na Brasa", "description": "2 marmitas grandes + 2 espetinhos à escolha + refrigerante 2L. Para dividir sem brigar.", "price": 59.90, "category": "combos", "image": "/marmitas/marmita-brasa-dupla.jpg", "badge": None, "serves": "2 pessoas"},
    {"id": "espetinho-carne", "name": "Espetinho de Carne", "description": "Alcatra em cubos selada na brasa, tempero da casa e toque de sal grosso.", "price": 9.90, "category": "espetinhos", "image": "/espetinhos/espetinho-carne.jpg", "badge": "Clássico", "serves": "1 unidade"},
    {"id": "espetinho-frango", "name": "Espetinho de Frango", "description": "Peito de frango marinado no limão e páprica, grelhado até dourar.", "price": 8.90, "category": "espetinhos", "image": "/espetinhos/espetinho-frango.jpg", "badge": None, "serves": "1 unidade"},
    {"id": "espetinho-misto", "name": "Espetinho Misto c/ Queijo", "description": "Carne, frango e queijo coalho intercalados, gratinados na brasa.", "price": 11.90, "category": "espetinhos", "image": "/espetinhos/espetinho-misto.jpg", "badge": None, "serves": "1 unidade"},
    {"id": "espetinho-toscana", "name": "Espetinho de Linguiça Toscana", "description": "Linguiça toscana artesanal defumada, suculenta e levemente picante.", "price": 10.90, "category": "espetinhos", "image": "/espetinhos/espetinho-toscana.jpg", "badge": None, "serves": "1 unidade"},
    {"id": "refri-lata", "name": "Refrigerante Lata 350ml", "description": "Coca-Cola, Guaraná Antarctica ou Fanta. Sempre estupidamente gelada.", "price": 6.00, "category": "bebidas", "image": "https://images.pexels.com/photos/6920721/pexels-photo-6920721.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": None, "serves": "350ml"},
    {"id": "refri-2l", "name": "Refrigerante 2 Litros", "description": "Garrafa 2L para a família toda. Coca-Cola ou Guaraná.", "price": 12.00, "category": "bebidas", "image": "https://images.pexels.com/photos/4113653/pexels-photo-4113653.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": None, "serves": "2L"},
    {"id": "suco-natural", "name": "Suco Natural 500ml", "description": "Laranja, maracujá ou abacaxi com hortelã, feito na hora sem açúcar.", "price": 8.00, "category": "bebidas", "image": "https://images.pexels.com/photos/6920721/pexels-photo-6920721.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "badge": "Natural", "serves": "500ml"},
]

# ---------- models ----------

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price: float
    category: str
    image: str
    badge: Optional[str] = None
    serves: str

class ProductIn(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    badge: Optional[str] = None
    serves: str = "1 pessoa"

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    qty: int

class Customer(BaseModel):
    name: str
    phone: str
    address: str
    notes: Optional[str] = ""

class OrderCreate(BaseModel):
    customer: Customer
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float
    total: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    customer: Customer
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float
    total: float
    status: str = "recebido"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LoginIn(BaseModel):
    email: str
    password: str

class StatusUpdate(BaseModel):
    status: str

# ---------- auth helpers ----------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)

async def get_admin(authorization: str = Header(default="")):
    token = authorization[7:] if authorization.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    user = await db_call(storage.get_user_by_id, payload["sub"])
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso restrito ao dono")
    return user

# ---------- helpers ----------

def compute_status(created_iso: str) -> str:
    created = datetime.fromisoformat(created_iso)
    elapsed = (datetime.now(timezone.utc) - created).total_seconds()
    if elapsed < 30:
        return "recebido"
    if elapsed < 90:
        return "na brasa"
    if elapsed < 240:
        return "saiu para entrega"
    return "entregue"

def order_with_status(doc: dict) -> dict:
    doc["status"] = doc.get("status_override") or compute_status(doc["created_at"])
    return doc

def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or uuid.uuid4().hex[:8]

# ---------- public routes ----------

@api_router.get("/")
async def root():
    return {"message": "Espetinhos West API"}

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    return await db_call(storage.get_products, category)

@api_router.post("/orders", response_model=Order)
async def create_order(order_in: OrderCreate):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Pedido sem itens")
    code = "EW-" + "".join(random.choices(string.digits, k=4))
    order = Order(code=code, **order_in.model_dump())
    await db_call(storage.insert_order, order.model_dump())
    return order

@api_router.get("/orders/{code}", response_model=Order)
async def get_order(code: str):
    doc = await db_call(storage.get_order, code)
    if not doc:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return order_with_status(doc)

# ---------- auth routes ----------

@api_router.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower().strip()
    key = f"login:{email}"
    attempts = await db_call(storage.get_login_attempt, key)
    if attempts and attempts.get("count", 0) >= 5:
        last = attempts.get("last", datetime.now(timezone.utc))
        if (datetime.now(timezone.utc) - last).total_seconds() < 900:
            raise HTTPException(status_code=429, detail="Muitas tentativas. Tente novamente em 15 minutos.")
    user = await db_call(storage.get_user_by_email, email)
    if not user or not verify_password(body.password, user["password_hash"]):
        await db_call(storage.record_login_failure, key, datetime.now(timezone.utc))
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    await db_call(storage.clear_login_attempt, key)
    token = create_access_token(user["id"], email)
    return {"token": token, "user": {"email": email, "name": user.get("name", "Admin"), "role": user["role"]}}

@api_router.get("/auth/me")
async def me(admin=Depends(get_admin)):
    return admin

# ---------- admin routes ----------

@api_router.get("/admin/orders", response_model=List[Order])
async def admin_list_orders(admin=Depends(get_admin)):
    docs = await db_call(storage.get_orders)
    return [order_with_status(d) for d in docs]

@api_router.patch("/admin/orders/{code}/status", response_model=Order)
async def admin_update_status(code: str, body: StatusUpdate, admin=Depends(get_admin)):
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Status inválido")
    doc = await db_call(storage.update_order_status, code, body.status)
    if not doc:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    doc["status"] = body.status
    return doc

@api_router.post("/admin/products", response_model=Product)
async def admin_create_product(body: ProductIn, admin=Depends(get_admin)):
    pid = slugify(body.name)
    if await db_call(storage.product_exists, pid):
        pid = f"{pid}-{uuid.uuid4().hex[:4]}"
    doc = {"id": pid, **body.model_dump()}
    await db_call(storage.insert_product, doc)
    return doc

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def admin_update_product(product_id: str, body: ProductIn, admin=Depends(get_admin)):
    doc = await db_call(storage.update_product, product_id, body.model_dump())
    if not doc:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return doc

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, admin=Depends(get_admin)):
    if not await db_call(storage.delete_product, product_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"ok": True}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def seed_data():
    admin_email = os.environ.get("ADMIN_EMAIL", "")
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if bool(admin_email) != bool(admin_password):
        raise RuntimeError("ADMIN_EMAIL e ADMIN_PASSWORD devem ser configurados juntos")
    admin = None
    if admin_email:
        admin = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Dono",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    if admin and not os.environ.get("JWT_SECRET"):
        raise RuntimeError("JWT_SECRET é obrigatório quando o administrador está configurado")
    await db_call(storage.initialize_database, PRODUCTS, admin)
    logging.info("Banco SQLite inicializado em %s", storage.DB_PATH)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
