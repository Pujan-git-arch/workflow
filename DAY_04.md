# Day 04: Authentication and API Security

Day 04 extended the CRUD API from Day 03 by adding authentication. Previously, the API endpoints could be called without proving who the user was. Day 04 added password hashing, login, JWT access tokens, OAuth2 bearer-token handling, protected task endpoints, and CORS support for the frontend.

## Overall request flow

```text
User registration
        |
        v
Hash password and save user
        |
        v
User login with email and password
        |
        v
Verify password and create JWT
        |
        v
Client sends Authorization: Bearer <token>
        |
        v
FastAPI validates token and finds current user
        |
        v
Protected endpoint executes
```

## 1. Authentication dependencies

The backend uses these packages from `backend/requirements.txt`:

- `pwdlib`: securely hashes and verifies passwords.
- `python-jose`: creates and decodes JWT tokens.
- `python-multipart`: allows FastAPI to read OAuth2 login form data.

## 2. Password hashing

Implemented in `backend/app/core/security.py`:

```python
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password
    )
```

Passwords must not be stored as plain text. Instead of storing `hello123`, the database stores a one-way hash. `verify_password()` checks a submitted password against that hash without needing to recover the original password.

Hashing the same password twice produces different hashes because a random salt is used. Both hashes can still verify the same password. This behavior is checked in `backend/test_password.py`.

## 3. Hashing passwords during registration

The user router hashes the password before inserting the user:

```python
new_user = User(
    name=user.name,
    email=user.email,
    password_hash=hash_password(user.password),
    department_id=user.department_id
)
```

The request can contain:

```json
{
  "name": "Pujan",
  "email": "pujan@example.com",
  "password": "hello123",
  "department_id": 1
}
```

The database stores the generated value in `password_hash`, not the original password. The model column is defined in `backend/app/models/user.py`:

```python
password_hash: Mapped[str] = mapped_column(
    String(255),
    nullable=False
)
```

## 4. Keeping passwords out of API responses

`UserCreate` accepts a password, but `UserResponse` does not expose either `password` or `password_hash`:

```python
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    department_id: int

    model_config = ConfigDict(from_attributes=True)
```

This prevents password data from being returned by user endpoints.

## 5. Creating JWT access tokens

The token utility creates a signed token:

```python
ALGORITHM = "HS256"


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )
```

The token contains the user ID, email, and expiration time:

```python
access_token = create_access_token(
    data={
        "sub": str(user.id),
        "email": user.email
    }
)
```

`SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, and the other settings are loaded from the environment by `backend/app/core/config.py`. The signature allows the server to detect altered tokens, and expiration prevents tokens from remaining valid forever.

## 6. Login endpoint

The login endpoint is in `backend/app/routers/auth.py`:

```python
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
```

The client sends form data rather than JSON:

```text
username=pujan@example.com
password=hello123
```

OAuth2 calls the field `username`, but this application uses the email address as that value. The endpoint finds the user, verifies the password, and returns a token. Incorrect credentials produce HTTP `401 Unauthorized`.

## 7. OAuth2 bearer-token support

```python
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)
```

This tells FastAPI to extract tokens from this header:

```http
Authorization: Bearer <access_token>
```

It also makes the login flow available through Swagger's Authorize button.

## 8. Finding the current user

`get_current_user()` is a reusable dependency:

```python
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")

    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if user is None:
        raise credentials_exception

    return user
```

The dependency extracts the token, validates its signature and expiration, reads the `sub` user ID, finds that user in PostgreSQL, and rejects invalid requests before the endpoint runs.

## 9. The current-user endpoint

```python
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user
```

The final endpoint is `GET /api/auth/me`. It requires a valid bearer token and returns the logged-in user's safe public information.

## 10. Protecting task endpoints

Each task endpoint now includes:

```python
current_user: User = Depends(get_current_user)
```

For example:

```python
@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Task).all()
```

The same dependency was added to create, read, update, and delete task operations. A request without a valid token is rejected with HTTP `401` before the database operation is performed.

## 11. CORS for the frontend

`backend/app/main.py` contains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

The frontend and backend commonly run on different origins, such as `localhost:3000` and `localhost:8000`. CORS tells the browser that the configured frontend is allowed to call the backend.

## 12. Registered authentication routes

The authentication router is included in `backend/app/main.py`:

```python
from app.routers.auth import router as auth_router

app.include_router(auth_router)
```

Because the router has the prefix `/api/auth`, the available authentication endpoints are:

```text
POST /api/auth/login
GET  /api/auth/me
```

## Day 04 result

By the end of Day 04, the project had:

- Secure password hashing and verification.
- JWT access-token creation and expiration.
- OAuth2 bearer-token extraction.
- Login authentication.
- Current-user lookup.
- Protected task endpoints.
- HTTP 401 authentication errors.
- CORS support for frontend requests.
- Swagger-compatible authorization.
- A password hashing test.

The frontend is still the default Next.js starter page in `frontend/app/page.tsx`; the backend authentication was implemented, but login forms and token storage have not yet been built in the frontend.

One remaining security improvement is authorization. The task routes currently check that a user is logged in, but they do not yet check whether that user owns or has permission to edit or delete a particular task. That can be implemented in a later day.
