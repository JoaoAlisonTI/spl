# =============================================================
#  routes/triagem.py — Rotas da Triagem
# =============================================================
#
#  Endpoints disponíveis:
#    POST /api/triagem       → salva a triagem e classifica (RF-11 a RF-14)
#    GET  /api/triagem       → retorna a triagem do usuário logado
# =============================================================

import json

from flask import Blueprint, request, jsonify
from database import get_db
from linhas_cuidado import calcular_imc, classificar_imc, classificar_linhas
from routes.auth import obter_usuario_pelo_token

triagem_bp = Blueprint("triagem", __name__)


def _autenticar():
    """
    Extrai e valida o token do header Authorization.
    Retorna o usuario_id se válido, ou None se inválido.
    """
    header = request.headers.get("Authorization", "")
    partes = header.split(" ")
    if len(partes) != 2 or partes[0] != "Bearer":
        return None
    return obter_usuario_pelo_token(partes[1])


# ── POST /api/triagem ─────────────────────────────────────────

@triagem_bp.route("", methods=["POST"])
def salvar_triagem():
    """
    Recebe os dados da triagem, calcula o IMC, classifica o
    usuário em linhas de cuidado e salva tudo no banco.

    Corpo esperado (JSON):
    {
        "data_nascimento": "1975-03-12",
        "sexo":            "masculino",
        "peso_kg":         82.0,
        "altura_cm":       175.0,
        "condicoes":       ["diabetes"],
        "usa_medicamentos": true,
        "nivel_atividade": "Levemente ativo"
    }

    Respostas:
        201 → triagem salva, retorna IMC e linhas de cuidado
        400 → dados ausentes ou inválidos
        401 → não autenticado
        409 → triagem já realizada (RF-15)
    """
    usuario_id = _autenticar()
    if not usuario_id:
        return jsonify({"erro": "Não autenticado. Faça login primeiro."}), 401

    dados = request.get_json()

    # ── Validações básicas ─────────────────────────────────
    campos_obrigatorios = [
        "data_nascimento", "sexo", "peso_kg",
        "altura_cm", "condicoes", "usa_medicamentos", "nivel_atividade"
    ]
    ausentes = [c for c in campos_obrigatorios if dados.get(c) is None]
    if ausentes:
        return jsonify({
            "erro":    "Campos obrigatórios ausentes.",
            "campos":  ausentes,
        }), 400

    peso    = float(dados["peso_kg"])
    altura  = float(dados["altura_cm"])
    condicoes = dados["condicoes"]  # lista de strings

    if peso <= 0 or altura <= 0:
        return jsonify({"erro": "Peso e altura devem ser maiores que zero."}), 400

    # ── Cálculo do IMC e classificação ────────────────────
    imc              = calcular_imc(peso, altura)
    class_imc        = classificar_imc(imc)
    linhas           = classificar_linhas(condicoes, imc, dados["nivel_atividade"])

    # ── Persistência ──────────────────────────────────────
    conn = get_db()

    # Verifica se já existe triagem para este usuário (RF-15)
    existente = conn.execute(
        "SELECT id FROM triagens WHERE usuario_id = ?", (usuario_id,)
    ).fetchone()

    if existente:
        conn.close()
        return jsonify({"erro": "Triagem já realizada. Use PUT para atualizar."}), 409

    # Salva a triagem
    conn.execute(
        """
        INSERT INTO triagens (
            usuario_id, data_nascimento, sexo, peso_kg, altura_cm,
            imc, classificacao_imc, condicoes, usa_medicamentos, nivel_atividade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            usuario_id,
            dados["data_nascimento"],
            dados["sexo"],
            peso,
            altura,
            imc,
            class_imc,
            json.dumps(condicoes),           # lista salva como string JSON
            int(dados["usa_medicamentos"]),
            dados["nivel_atividade"],
        ),
    )

    # Salva cada linha de cuidado como registro separado
    for linha in linhas:
        conn.execute(
            "INSERT INTO linhas_cuidado (usuario_id, linha) VALUES (?, ?)",
            (usuario_id, linha),
        )

    # Marca a triagem como concluída no usuário (RF-15)
    conn.execute(
        "UPDATE usuarios SET triagem_concluida = 1 WHERE id = ?",
        (usuario_id,),
    )

    conn.commit()
    conn.close()

    return jsonify({
        "mensagem":        "Triagem salva com sucesso.",
        "imc":             imc,
        "classificacao":   class_imc,
        "linhas_cuidado":  linhas,
    }), 201


# ── GET /api/triagem ──────────────────────────────────────────

@triagem_bp.route("", methods=["GET"])
def obter_triagem():
    """
    Retorna os dados de triagem do usuário autenticado.

    Respostas:
        200 → dados da triagem
        401 → não autenticado
        404 → triagem ainda não realizada
    """
    usuario_id = _autenticar()
    if not usuario_id:
        return jsonify({"erro": "Não autenticado."}), 401

    conn = get_db()
    triagem = conn.execute(
        "SELECT * FROM triagens WHERE usuario_id = ?", (usuario_id,)
    ).fetchone()

    if not triagem:
        conn.close()
        return jsonify({"erro": "Triagem não encontrada."}), 404

    linhas = conn.execute(
        "SELECT linha FROM linhas_cuidado WHERE usuario_id = ? AND ativa = 1",
        (usuario_id,),
    ).fetchall()
    conn.close()

    return jsonify({
        "data_nascimento":  triagem["data_nascimento"],
        "sexo":             triagem["sexo"],
        "peso_kg":          triagem["peso_kg"],
        "altura_cm":        triagem["altura_cm"],
        "imc":              triagem["imc"],
        "classificacao_imc": triagem["classificacao_imc"],
        "condicoes":        json.loads(triagem["condicoes"]),
        "usa_medicamentos": bool(triagem["usa_medicamentos"]),
        "nivel_atividade":  triagem["nivel_atividade"],
        "linhas_cuidado":   [l["linha"] for l in linhas],
    }), 200
