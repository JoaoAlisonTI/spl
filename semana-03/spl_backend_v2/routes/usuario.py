# =============================================================
#  routes/usuario.py — Rotas do Usuário e Dashboard
# =============================================================
#
#  Endpoints disponíveis:
#    GET /api/usuario/perfil     → dados básicos do usuário logado
#    GET /api/usuario/dashboard  → conteúdo personalizado do dashboard
# =============================================================

from flask import Blueprint, request, jsonify
from database import get_db
from linhas_cuidado import montar_recomendacoes
from routes.auth import obter_usuario_pelo_token
import json

usuario_bp = Blueprint("usuario", __name__)


def _autenticar():
    """Extrai e valida o token. Retorna usuario_id ou None."""
    header = request.headers.get("Authorization", "")
    partes = header.split(" ")
    if len(partes) != 2 or partes[0] != "Bearer":
        return None
    return obter_usuario_pelo_token(partes[1])


# ── GET /api/usuario/perfil ───────────────────────────────────

@usuario_bp.route("/perfil", methods=["GET"])
def perfil():
    """
    Retorna os dados básicos do usuário autenticado.

    Respostas:
        200 → dados do perfil
        401 → não autenticado
    """
    usuario_id = _autenticar()
    if not usuario_id:
        return jsonify({"erro": "Não autenticado."}), 401

    conn = get_db()
    usuario = conn.execute(
        "SELECT id, nome, email, cpf, telefone, triagem_concluida, criado_em "
        "FROM usuarios WHERE id = ?",
        (usuario_id,),
    ).fetchone()
    conn.close()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado."}), 404

    return jsonify({
        "id":                usuario["id"],
        "nome":              usuario["nome"],
        "email":             usuario["email"],
        "cpf":               usuario["cpf"],
        "telefone":          usuario["telefone"],
        "triagem_concluida": bool(usuario["triagem_concluida"]),
        "criado_em":         usuario["criado_em"],
    }), 200


# ── GET /api/usuario/dashboard ────────────────────────────────

@usuario_bp.route("/dashboard", methods=["GET"])
def dashboard():
    """
    Monta e retorna o conteúdo personalizado do dashboard (RF-18
    a RF-23), incluindo:
      - Dados básicos do usuário
      - Resumo de saúde (IMC, classificação, linhas ativas)
      - Recomendações deduplicadas de todas as linhas ativas

    Respostas:
        200 → conteúdo do dashboard
        401 → não autenticado
        404 → triagem não encontrada (redirecionar para /triagem)
    """
    usuario_id = _autenticar()
    if not usuario_id:
        return jsonify({"erro": "Não autenticado."}), 401

    conn = get_db()

    # Busca dados do usuário
    usuario = conn.execute(
        "SELECT id, nome, email, triagem_concluida FROM usuarios WHERE id = ?",
        (usuario_id,),
    ).fetchone()

    if not usuario:
        conn.close()
        return jsonify({"erro": "Usuário não encontrado."}), 404

    # Se a triagem não foi concluída, o frontend deve redirecionar (RF-15)
    if not usuario["triagem_concluida"]:
        conn.close()
        return jsonify({
            "erro":              "Triagem pendente.",
            "redirecionar_para": "/triagem",
        }), 404

    # Busca dados da triagem
    triagem = conn.execute(
        "SELECT * FROM triagens WHERE usuario_id = ?", (usuario_id,)
    ).fetchone()

    # Busca linhas de cuidado ativas
    linhas_rows = conn.execute(
        "SELECT linha FROM linhas_cuidado WHERE usuario_id = ? AND ativa = 1",
        (usuario_id,),
    ).fetchall()
    conn.close()

    linhas_ativas = [row["linha"] for row in linhas_rows]

    # Monta recomendações com deduplication (Regra de Negócio 5.2)
    recomendacoes = montar_recomendacoes(linhas_ativas)

    # Metas semanais simples (RF-24) — fixas por linha no mock
    metas = _gerar_metas(linhas_ativas)

    return jsonify({
        # RF-18: saudação personalizada
        "saudacao": f"Olá, {usuario['nome'].split()[0]}!",

        # RF-19: resumo do perfil de saúde
        "perfil_saude": {
            "imc":             triagem["imc"],
            "classificacao":   triagem["classificacao_imc"],
            "peso_kg":         triagem["peso_kg"],
            "altura_cm":       triagem["altura_cm"],
            "linhas_ativas":   linhas_ativas,
            "nivel_atividade": triagem["nivel_atividade"],
            "condicoes":       json.loads(triagem["condicoes"]),
        },

        # RF-20, RF-21, RF-22, RF-23: recomendações personalizadas e deduplicadas
        "recomendacoes": recomendacoes,

        # RF-24: metas semanais
        "metas": metas,
    }), 200


# ── Função auxiliar: metas semanais ──────────────────────────

def _gerar_metas(linhas_ativas: list) -> list:
    """
    Gera metas semanais simples com base nas linhas de cuidado.
    No mock, as metas são fixas por linha. Em produção, seriam
    dinâmicas e acompanhadas ao longo do tempo.
    """
    todas_metas = {
        "diabetica": [
            {"titulo": "Medir glicemia",    "meta": "7 medições esta semana",  "unidade": "medições"},
            {"titulo": "Caminhada leve",    "meta": "5 dias de 30 minutos",    "unidade": "dias"},
        ],
        "obesidade": [
            {"titulo": "Controle calórico", "meta": "Registrar refeições 5x",  "unidade": "dias"},
            {"titulo": "Hidratação",        "meta": "2L de água por dia",      "unidade": "litros/dia"},
        ],
        "hipertensos": [
            {"titulo": "Sem sal extra",     "meta": "7 dias sem saleiro",      "unidade": "dias"},
            {"titulo": "Relaxamento",       "meta": "10 min de meditação/dia", "unidade": "min/dia"},
        ],
        "ativa": [
            {"titulo": "Atividade física",  "meta": "150 min esta semana",     "unidade": "minutos"},
            {"titulo": "Sono",              "meta": "7-9h por noite",          "unidade": "horas/noite"},
        ],
    }

    slugs_vistos = set()
    metas_finais = []

    for linha in linhas_ativas:
        for meta in todas_metas.get(linha, []):
            chave = meta["titulo"]
            if chave not in slugs_vistos:
                slugs_vistos.add(chave)
                metas_finais.append(meta)

    return metas_finais
