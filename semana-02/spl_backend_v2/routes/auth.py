# =============================================================
#  routes/auth.py — Rotas de Autenticação
# =============================================================
#
#  Endpoints disponíveis:
#    POST /api/auth/cadastro  → cria um novo usuário (RF-01)
#    POST /api/auth/login     → autentica e retorna token (RF-05)
#    POST /api/auth/logout    → invalida o token (RF-26)
# =============================================================

import hashlib
import secrets
import re

from flask import Blueprint, request, jsonify
from database import get_db

auth_bp = Blueprint("auth", __name__)

# Dicionário em memória que mapeia token → usuario_id
# Em produção real, tokens ficam no banco ou em Redis.
# Para o mock, memória é suficiente.
tokens_ativos = {}


# ── Funções auxiliares ────────────────────────────────────────

def hash_senha(senha: str) -> str:
    """Gera um hash SHA-256 da senha. Simples e didático."""
    return hashlib.sha256(senha.encode()).hexdigest()


def gerar_token() -> str:
    """Gera um token aleatório seguro de 32 bytes."""
    return secrets.token_hex(32)


def validar_cpf(cpf: str) -> bool:
    """
    Valida se o CPF tem exatamente 11 dígitos numéricos.
    Remove pontuação antes de validar.
    """
    apenas_numeros = re.sub(r"\D", "", cpf)
    return len(apenas_numeros) == 11


def validar_email(email: str) -> bool:
    """Validação básica de formato de e-mail."""
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def obter_usuario_pelo_token(token: str):
    """
    Verifica se o token existe e retorna o usuario_id.
    Retorna None se o token for inválido.
    Usada pelas rotas protegidas para autenticar a requisição.
    """
    return tokens_ativos.get(token)


# ── POST /api/auth/cadastro ───────────────────────────────────

@auth_bp.route("/cadastro", methods=["POST"])
def cadastro():
    """
    Cria um novo usuário.

    Corpo esperado (JSON):
    {
        "nome":     "João Silva",
        "cpf":      "123.456.789-00",
        "telefone": "(85) 99999-0000",
        "email":    "joao@email.com",
        "senha":    "minhasenha123"
    }

    Respostas:
        201 → usuário criado, retorna token
        400 → dados inválidos
        409 → e-mail ou CPF já cadastrado
    """
    dados = request.get_json()

    # ── Validações de entrada ──────────────────────────────
    erros = {}

    nome = (dados.get("nome") or "").strip()
    if not nome:
        erros["nome"] = "Nome é obrigatório."

    cpf = dados.get("cpf", "")
    if not validar_cpf(cpf):
        erros["cpf"] = "CPF inválido. Informe 11 dígitos."

    telefone = (dados.get("telefone") or "").strip()
    if not telefone:
        erros["telefone"] = "Telefone é obrigatório."

    email = (dados.get("email") or "").strip().lower()
    if not validar_email(email):
        erros["email"] = "Formato de e-mail inválido."

    senha = dados.get("senha", "")
    if len(senha) < 8:
        erros["senha"] = "A senha deve ter pelo menos 8 caracteres."

    if erros:
        return jsonify({"erro": "Dados inválidos.", "campos": erros}), 400

    # ── Persistência ───────────────────────────────────────
    cpf_limpo = re.sub(r"\D", "", cpf)

    conn = get_db()
    try:
        conn.execute(
            """
            INSERT INTO usuarios (nome, cpf, telefone, email, senha_hash)
            VALUES (?, ?, ?, ?, ?)
            """,
            (nome, cpf_limpo, telefone, email, hash_senha(senha)),
        )
        conn.commit()

        # Busca o usuário recém-criado para retornar o ID
        usuario = conn.execute(
            "SELECT * FROM usuarios WHERE email = ?", (email,)
        ).fetchone()

    except Exception as e:
        conn.close()
        # Erros de UNIQUE CONSTRAINT indicam e-mail ou CPF duplicado
        if "UNIQUE" in str(e):
            if "email" in str(e):
                return jsonify({"erro": "Este e-mail já está em uso."}), 409
            if "cpf" in str(e):
                return jsonify({"erro": "Este CPF já está cadastrado."}), 409
        return jsonify({"erro": "Erro interno ao criar usuário."}), 500

    conn.close()

    # ── Geração do token ───────────────────────────────────
    token = gerar_token()
    tokens_ativos[token] = usuario["id"]

    return jsonify({
        "mensagem":         "Usuário criado com sucesso.",
        "token":            token,
        "triagem_concluida": False,
        "usuario": {
            "id":    usuario["id"],
            "nome":  usuario["nome"],
            "email": usuario["email"],
        },
    }), 201


# ── POST /api/auth/login ──────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Autentica o usuário com e-mail e senha.

    Corpo esperado (JSON):
    {
        "email": "joao@email.com",
        "senha": "minhasenha123"
    }

    Respostas:
        200 → autenticado, retorna token e status da triagem
        400 → campos ausentes
        401 → credenciais inválidas
    """
    dados = request.get_json()

    email = (dados.get("email") or "").strip().lower()
    senha = dados.get("senha", "")

    if not email or not senha:
        return jsonify({"erro": "E-mail e senha são obrigatórios."}), 400

    conn = get_db()
    usuario = conn.execute(
        "SELECT * FROM usuarios WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    # Verifica se o usuário existe e se a senha confere
    if not usuario or usuario["senha_hash"] != hash_senha(senha):
        return jsonify({"erro": "E-mail ou senha incorretos."}), 401

    token = gerar_token()
    tokens_ativos[token] = usuario["id"]

    return jsonify({
        "mensagem":          "Login realizado com sucesso.",
        "token":             token,
        "triagem_concluida": bool(usuario["triagem_concluida"]),
        "usuario": {
            "id":    usuario["id"],
            "nome":  usuario["nome"],
            "email": usuario["email"],
        },
    }), 200


# ── POST /api/auth/logout ─────────────────────────────────────

@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Invalida o token do usuário.

    Header esperado:
        Authorization: Bearer <token>

    Respostas:
        200 → logout realizado
        401 → token ausente ou inválido
    """
    token = _extrair_token()
    if not token or token not in tokens_ativos:
        return jsonify({"erro": "Token inválido ou ausente."}), 401

    del tokens_ativos[token]
    return jsonify({"mensagem": "Logout realizado com sucesso."}), 200


# ── Função interna ────────────────────────────────────────────

def _extrair_token():
    """
    Lê o token do header Authorization.
    Formato esperado: "Bearer abc123..."
    """
    header = request.headers.get("Authorization", "")
    partes = header.split(" ")
    if len(partes) == 2 and partes[0] == "Bearer":
        return partes[1]
    return None
