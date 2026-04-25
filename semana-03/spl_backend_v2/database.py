# =============================================================
#  database.py — Configuração do banco de dados SQLite
# =============================================================
#
#  SQLite é um banco de dados que fica em um único arquivo .db
#  no disco. Não precisa de servidor separado — perfeito para
#  desenvolvimento e para fins didáticos.
#
#  Este arquivo tem duas responsabilidades:
#    1. init_db()    → cria as tabelas na primeira vez que rodar
#    2. get_db()     → abre uma conexão para usar nas rotas
# =============================================================

import sqlite3
import os

# Usa DB_PATH se definida (Docker), senão salva localmente
CAMINHO_DB = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(__file__), "spl.db")
)


def get_db():
    """
    Abre e retorna uma conexão com o banco de dados.

    row_factory = sqlite3.Row faz com que as linhas retornadas
    se comportem como dicionários Python, permitindo acesso por
    nome de coluna (ex: row["email"]) em vez de índice (row[0]).
    """
    conn = sqlite3.connect(CAMINHO_DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Cria todas as tabelas necessárias caso ainda não existam.
    Chamado uma única vez ao iniciar o servidor (em app.py).
    """
    conn = get_db()
    cursor = conn.cursor()

    # ── Tabela de usuários ────────────────────────────────────
    # Armazena credenciais e dados básicos de cada usuário.
    # "triagem_concluida" controla o fluxo de redirecionamento
    # descrito nos requisitos RF-10 e RF-15.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            nome              TEXT    NOT NULL,
            cpf               TEXT    NOT NULL UNIQUE,
            telefone          TEXT    NOT NULL,
            email             TEXT    NOT NULL UNIQUE,
            senha_hash        TEXT    NOT NULL,
            triagem_concluida INTEGER NOT NULL DEFAULT 0,
            criado_em         TEXT    NOT NULL DEFAULT (datetime('now'))
        )
    """)

    # ── Tabela de triagem ─────────────────────────────────────
    # Um registro por usuário. Armazena os dados coletados na
    # tela de triagem (RF-11) e o IMC calculado (RF-12).
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS triagens (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id          INTEGER NOT NULL UNIQUE,
            data_nascimento     TEXT    NOT NULL,
            sexo                TEXT    NOT NULL,
            peso_kg             REAL    NOT NULL,
            altura_cm           REAL    NOT NULL,
            imc                 REAL    NOT NULL,
            classificacao_imc   TEXT    NOT NULL,
            condicoes           TEXT    NOT NULL,  -- JSON: lista de condições
            usa_medicamentos    INTEGER NOT NULL,
            nivel_atividade     TEXT    NOT NULL,
            criado_em           TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    """)

    # ── Tabela de linhas de cuidado ───────────────────────────
    # Um usuário pode ter várias linhas de cuidado ativas (RF-13,
    # RF-23). Cada linha é uma linha separada nesta tabela.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS linhas_cuidado (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            linha      TEXT    NOT NULL,  -- ex: "diabetica", "obesidade"
            ativa      INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    """)

    conn.commit()
    conn.close()
    print("Banco de dados inicializado:", CAMINHO_DB)
