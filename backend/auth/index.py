"""
Аутентификация и безопасность Volna: регистрация, вход, сессии, премиум-аккаунты.
Использует bcrypt для хэширования паролей и криптографически стойкие токены сессий.
"""
import json
import os
import secrets
import hashlib
import hmac
import re
from datetime import datetime, timedelta

import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p8885754_chat_app_creation_5"
SESSION_TTL_DAYS = 30
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token, X-User-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data, status=200):
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps(data, default=str),
    }


def err(msg, status=400):
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"error": msg}),
    }


def generate_token() -> str:
    return secrets.token_urlsafe(64)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def validate_email(email: str) -> bool:
    return bool(re.match(r'^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$', email))


def validate_password(password: str) -> str | None:
    if len(password) < 8:
        return "Пароль должен быть не менее 8 символов"
    if not re.search(r'[A-Z]', password):
        return "Пароль должен содержать хотя бы одну заглавную букву"
    if not re.search(r'[0-9]', password):
        return "Пароль должен содержать хотя бы одну цифру"
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', password):
        return "Пароль должен содержать хотя бы один спецсимвол"
    return None


def log_security_event(cur, user_id, event_type, ip, device, status="success", details=None):
    cur.execute(
        f"""INSERT INTO {SCHEMA}.security_log 
        (user_id, event_type, ip_address, device_info, status, details)
        VALUES (%s, %s, %s, %s, %s, %s)""",
        (user_id, event_type, ip, device, status, json.dumps(details or {}))
    )


def get_user_from_token(cur, token: str):
    cur.execute(
        f"""SELECT u.*, s.expires_at as session_expires
        FROM {SCHEMA}.users u
        JOIN {SCHEMA}.sessions s ON s.user_id = u.id
        WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE""",
        (token,)
    )
    return cur.fetchone()


def get_premium_info(cur, user_id: int):
    cur.execute(
        f"SELECT * FROM {SCHEMA}.premium_accounts WHERE user_id = %s AND is_active = TRUE",
        (user_id,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    path = event.get("path", "/").strip("/")
    path_parts = [p for p in path.split("/") if p]
    action = params.get("action") or (path_parts[-1] if path_parts else "")

    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token")
    ip = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")
    device = headers.get("User-Agent", "unknown")[:200]

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # POST /register
        if method == "POST" and action == "register":
            body = json.loads(event.get("body") or "{}")
            username = (body.get("username") or "").strip()
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""
            display_name = (body.get("display_name") or username).strip()

            if not username or len(username) < 3:
                return err("Имя пользователя должно быть не менее 3 символов")
            if not re.match(r'^[a-zA-Z0-9_]+$', username):
                return err("Имя пользователя может содержать только латинские буквы, цифры и _")
            if not validate_email(email):
                return err("Некорректный email")
            pw_err = validate_password(password)
            if pw_err:
                return err(pw_err)

            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s OR email = %s", (username, email))
            if cur.fetchone():
                return err("Пользователь с таким именем или email уже существует", 409)

            password_hash = hash_password(password)
            cur.execute(
                f"""INSERT INTO {SCHEMA}.users (username, email, password_hash, display_name)
                VALUES (%s, %s, %s, %s) RETURNING id, username, email, display_name, created_at""",
                (username, email, password_hash, display_name)
            )
            user = cur.fetchone()

            token_val = generate_token()
            expires_at = datetime.now() + timedelta(days=SESSION_TTL_DAYS)
            cur.execute(
                f"""INSERT INTO {SCHEMA}.sessions (user_id, token, ip_address, device_info, expires_at)
                VALUES (%s, %s, %s, %s, %s)""",
                (user["id"], token_val, ip, device, expires_at)
            )
            log_security_event(cur, user["id"], "register", ip, device)
            conn.commit()

            return ok({
                "token": token_val,
                "user": dict(user),
                "is_premium": False,
                "expires_at": expires_at.isoformat(),
            }, 201)

        # POST /login
        if method == "POST" and action == "login":
            body = json.loads(event.get("body") or "{}")
            login = (body.get("login") or "").strip().lower()
            password = body.get("password") or ""

            cur.execute(
                f"SELECT * FROM {SCHEMA}.users WHERE (email = %s OR username = %s) AND is_active = TRUE",
                (login, login)
            )
            user = cur.fetchone()

            if not user or not verify_password(password, user["password_hash"]):
                if user:
                    log_security_event(cur, user["id"], "login_failed", ip, device, "failed")
                    conn.commit()
                return err("Неверный логин или пароль", 401)

            token_val = generate_token()
            expires_at = datetime.now() + timedelta(days=SESSION_TTL_DAYS)
            cur.execute(
                f"""INSERT INTO {SCHEMA}.sessions (user_id, token, ip_address, device_info, expires_at)
                VALUES (%s, %s, %s, %s, %s)""",
                (user["id"], token_val, ip, device, expires_at)
            )

            cur.execute(f"UPDATE {SCHEMA}.users SET last_seen = NOW() WHERE id = %s", (user["id"],))
            log_security_event(cur, user["id"], "login", ip, device)
            conn.commit()

            premium = get_premium_info(cur, user["id"])

            return ok({
                "token": token_val,
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                    "display_name": user["display_name"],
                    "avatar_url": user["avatar_url"],
                    "two_factor_enabled": user["two_factor_enabled"],
                },
                "is_premium": bool(premium),
                "premium": dict(premium) if premium else None,
                "expires_at": expires_at.isoformat(),
            })

        # POST /logout
        if method == "POST" and action == "logout":
            if not token:
                return err("Токен не передан", 401)
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s RETURNING user_id", (token,))
            row = cur.fetchone()
            if row:
                log_security_event(cur, row["user_id"], "logout", ip, device)
            conn.commit()
            return ok({"success": True})

        # GET /me — профиль текущего пользователя
        if method == "GET" and action == "me":
            if not token:
                return err("Требуется авторизация", 401)
            user = get_user_from_token(cur, token)
            if not user:
                return err("Сессия истекла или недействительна", 401)
            premium = get_premium_info(cur, user["id"])
            return ok({
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                    "display_name": user["display_name"],
                    "avatar_url": user["avatar_url"],
                    "two_factor_enabled": user["two_factor_enabled"],
                    "last_seen": str(user["last_seen"]),
                    "created_at": str(user["created_at"]),
                },
                "is_premium": bool(premium),
                "premium": dict(premium) if premium else None,
            })

        # POST /premium/activate — активация премиума
        if method == "POST" and action == "activate":
            if not token:
                return err("Требуется авторизация", 401)
            user = get_user_from_token(cur, token)
            if not user:
                return err("Сессия недействительна", 401)

            body = json.loads(event.get("body") or "{}")
            plan = body.get("plan", "premium")
            days = {"premium": 30, "premium_pro": 365}.get(plan, 30)
            expires_at = datetime.now() + timedelta(days=days)

            cur.execute(
                f"""INSERT INTO {SCHEMA}.premium_accounts (user_id, plan, expires_at)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id) DO UPDATE
                SET plan = EXCLUDED.plan, expires_at = EXCLUDED.expires_at,
                    is_active = TRUE, started_at = NOW()
                RETURNING *""",
                (user["id"], plan, expires_at)
            )
            premium = cur.fetchone()
            log_security_event(cur, user["id"], "premium_activated", ip, device, details={"plan": plan})
            conn.commit()
            return ok({"premium": dict(premium), "is_premium": True})

        # GET /security/log
        if method == "GET" and action == "log":
            if not token:
                return err("Требуется авторизация", 401)
            user = get_user_from_token(cur, token)
            if not user:
                return err("Сессия недействительна", 401)
            cur.execute(
                f"""SELECT event_type, ip_address, device_info, status, created_at
                FROM {SCHEMA}.security_log WHERE user_id = %s
                ORDER BY created_at DESC LIMIT 20""",
                (user["id"],)
            )
            return ok({"events": [dict(r) for r in cur.fetchall()]})

        # GET /sessions — активные сессии
        if method == "GET" and action == "sessions":
            if not token:
                return err("Требуется авторизация", 401)
            user = get_user_from_token(cur, token)
            if not user:
                return err("Сессия недействительна", 401)
            cur.execute(
                f"""SELECT id, ip_address, device_info, created_at, expires_at
                FROM {SCHEMA}.sessions WHERE user_id = %s AND expires_at > NOW()
                ORDER BY created_at DESC""",
                (user["id"],)
            )
            return ok({"sessions": [dict(r) for r in cur.fetchall()]})

        return err("Маршрут не найден", 404)

    finally:
        cur.close()
        conn.close()