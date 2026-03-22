"""
API для управления клиентами: создание, получение, обновление, удаление.
Поддерживает поиск, фильтрацию по статусу и пагинацию.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p8885754_chat_app_creation_5"
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data, status=200):
    return {"statusCode": status, "headers": {**CORS_HEADERS, "Content-Type": "application/json"}, "body": json.dumps(data, default=str)}


def err(msg, status=400):
    return {"statusCode": status, "headers": {**CORS_HEADERS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    path_parts = event.get("path", "/").strip("/").split("/")
    client_id = path_parts[1] if len(path_parts) > 1 and path_parts[1] else None

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET" and not client_id:
            search = params.get("search", "")
            status_filter = params.get("status", "")
            limit = int(params.get("limit", 50))
            offset = int(params.get("offset", 0))

            where = []
            args = []

            if search:
                where.append("(name ILIKE %s OR phone ILIKE %s OR email ILIKE %s OR company ILIKE %s)")
                args += [f"%{search}%"] * 4

            if status_filter:
                where.append("status = %s")
                args.append(status_filter)

            where_sql = ("WHERE " + " AND ".join(where)) if where else ""

            cur.execute(f"SELECT * FROM {SCHEMA}.clients {where_sql} ORDER BY created_at DESC LIMIT %s OFFSET %s", args + [limit, offset])
            clients = cur.fetchall()

            cur.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.clients {where_sql}", args)
            total = cur.fetchone()["total"]

            return ok({"clients": [dict(c) for c in clients], "total": total, "limit": limit, "offset": offset})

        if method == "GET" and client_id:
            cur.execute(f"SELECT * FROM {SCHEMA}.clients WHERE id = %s", (client_id,))
            client = cur.fetchone()
            if not client:
                return err("Клиент не найден", 404)
            return ok(dict(client))

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            name = body.get("name", "").strip()
            if not name:
                return err("Поле 'name' обязательно")

            cur.execute(
                f"""INSERT INTO {SCHEMA}.clients 
                (name, phone, email, company, birthday, status, source, notes, private_chat_id, tags, avatar_url, city, social_links, extra)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING *""",
                (
                    name,
                    body.get("phone"),
                    body.get("email"),
                    body.get("company"),
                    body.get("birthday"),
                    body.get("status", "active"),
                    body.get("source"),
                    body.get("notes"),
                    body.get("private_chat_id"),
                    body.get("tags"),
                    body.get("avatar_url"),
                    body.get("city"),
                    json.dumps(body.get("social_links", {})),
                    json.dumps(body.get("extra", {})),
                )
            )
            conn.commit()
            return ok(dict(cur.fetchone()), 201)

        if method == "PUT" and client_id:
            body = json.loads(event.get("body") or "{}")
            fields = ["name","phone","email","company","birthday","status","source","notes","private_chat_id","tags","avatar_url","city","social_links","extra"]
            updates = []
            args = []
            for f in fields:
                if f in body:
                    updates.append(f"{f} = %s")
                    val = body[f]
                    if f in ("social_links", "extra"):
                        val = json.dumps(val)
                    args.append(val)
            if not updates:
                return err("Нет данных для обновления")
            updates.append("updated_at = NOW()")
            args.append(client_id)
            cur.execute(f"UPDATE {SCHEMA}.clients SET {', '.join(updates)} WHERE id = %s RETURNING *", args)
            conn.commit()
            row = cur.fetchone()
            if not row:
                return err("Клиент не найден", 404)
            return ok(dict(row))

        if method == "DELETE" and client_id:
            cur.execute(f"DELETE FROM {SCHEMA}.clients WHERE id = %s RETURNING id", (client_id,))
            conn.commit()
            if not cur.fetchone():
                return err("Клиент не найден", 404)
            return ok({"success": True, "id": int(client_id)})

        return err("Метод не поддерживается", 405)

    finally:
        cur.close()
        conn.close()
