# =============================================================
#  linhas_cuidado.py — Lógica de classificação e recomendações
# =============================================================
#
#  Este módulo implementa as Regras de Negócio da Seção 5 do
#  documento de requisitos:
#    - Cálculo e classificação do IMC (RN-5.1)
#    - Classificação em linhas de cuidado (RF-13)
#    - Recomendações por linha com deduplication (RN-5.2)
# =============================================================

import json


# ── 1. Cálculo do IMC ─────────────────────────────────────────

def calcular_imc(peso_kg: float, altura_cm: float) -> float:
    """IMC = peso (kg) / altura² (m)"""
    altura_m = altura_cm / 100
    return round(peso_kg / (altura_m ** 2), 1)


def classificar_imc(imc: float) -> str:
    """Retorna a classificação textual do IMC (tabela RN-5.1)."""
    if imc < 18.5:
        return "Abaixo do peso"
    elif imc < 25.0:
        return "Normal"
    elif imc < 30.0:
        return "Sobrepeso"
    elif imc < 35.0:
        return "Obesidade Grau I"
    elif imc < 40.0:
        return "Obesidade Grau II"
    else:
        return "Obesidade Grau III"


# ── 2. Classificação em linhas de cuidado ─────────────────────

def classificar_linhas(condicoes: list, imc: float, nivel_atividade: str) -> list:
    """
    Recebe os dados da triagem e retorna a lista de linhas
    de cuidado que devem ser ativadas para o usuário.

    Regras (RF-13, Seção 1.2 do documento de requisitos):
      - Linha Diabética  : "diabetes" está nas condições
      - Linha Obesidade  : IMC >= 30
      - Linha Hipertensos: "hipertensao" está nas condições
      - Linha Ativa      : sem condições e IMC < 30 e atividade >= moderada

    Um usuário pode ter múltiplas linhas simultaneamente (RF-23).
    """
    linhas = []

    condicoes_lower = [c.lower() for c in condicoes]

    if "diabetes" in condicoes_lower:
        linhas.append("diabetica")

    if imc >= 30.0:
        linhas.append("obesidade")

    if "hipertensao" in condicoes_lower or "hipertensão" in condicoes_lower:
        linhas.append("hipertensos")

    niveis_ativos = ["moderadamente ativo", "muito ativo"]
    sem_condicoes = not any(
        c in condicoes_lower for c in ["diabetes", "hipertensao", "hipertensão", "obesidade"]
    )
    if sem_condicoes and imc < 30.0 and nivel_atividade.lower() in niveis_ativos:
        linhas.append("ativa")

    # Garante pelo menos uma linha mesmo para casos não cobertos
    if not linhas:
        linhas.append("ativa")

    return linhas


# ── 3. Recomendações por linha ────────────────────────────────
#
#  Cada recomendação tem um "slug" único.
#  O slug é usado na deduplication: se duas linhas tiverem a
#  mesma recomendação (mesmo slug), ela aparece só uma vez.

RECOMENDACOES = {
    "diabetica": [
        {
            "slug":    "controle-glicemico",
            "titulo":  "Monitore sua glicemia",
            "texto":   "Meça sua glicemia em jejum regularmente e anote os valores para acompanhamento.",
            "cor":     "green",
        },
        {
            "slug":    "alimentacao-baixo-ig",
            "titulo":  "Prefira alimentos de baixo índice glicêmico",
            "texto":   "Opte por grãos integrais, legumes e vegetais. Evite açúcares simples e bebidas açucaradas.",
            "cor":     "green",
        },
        {
            "slug":    "exercicios-aerobicos",
            "titulo":  "Pratique exercícios aeróbicos",
            "texto":   "Caminhadas de 30 minutos, 5 vezes por semana, ajudam a controlar a glicemia.",
            "cor":     "green",
        },
        {
            "slug":    "medicacao-em-dia",
            "titulo":  "Mantenha sua medicação em dia",
            "texto":   "Não interrompa o uso de medicamentos sem orientação médica.",
            "cor":     "green",
        },
    ],

    "obesidade": [
        {
            "slug":    "deficit-calorico",
            "titulo":  "Controle o consumo calórico",
            "texto":   "Prefira porções menores e evite alimentos ultraprocessados e frituras.",
            "cor":     "amber",
        },
        {
            "slug":    "exercicios-aerobicos",   # mesmo slug que diabetica → será deduplicado
            "titulo":  "Pratique exercícios aeróbicos",
            "texto":   "Caminhadas de 30 minutos, 5 vezes por semana, ajudam a controlar a glicemia.",
            "cor":     "amber",
        },
        {
            "slug":    "hidratacao",
            "titulo":  "Hidrate-se bem",
            "texto":   "Beba pelo menos 2 litros de água por dia. Evite refrigerantes e sucos industrializados.",
            "cor":     "amber",
        },
        {
            "slug":    "sono-regular",
            "titulo":  "Durma bem",
            "texto":   "O sono inadequado aumenta a fome e dificulta a perda de peso. Busque 7 a 9 horas por noite.",
            "cor":     "amber",
        },
    ],

    "hipertensos": [
        {
            "slug":    "reducao-sal",
            "titulo":  "Reduza o consumo de sal",
            "texto":   "Limite a ingestão de sódio a 2g por dia. Evite temperos prontos e alimentos enlatados.",
            "cor":     "red",
        },
        {
            "slug":    "controle-estresse",
            "titulo":  "Gerencie o estresse",
            "texto":   "Pratique técnicas de relaxamento como meditação ou respiração profunda diariamente.",
            "cor":     "red",
        },
        {
            "slug":    "exercicios-aerobicos",   # mesmo slug → deduplicado
            "titulo":  "Pratique exercícios aeróbicos",
            "texto":   "Caminhadas de 30 minutos, 5 vezes por semana, ajudam a controlar a glicemia.",
            "cor":     "red",
        },
        {
            "slug":    "sono-regular",            # mesmo slug → deduplicado
            "titulo":  "Durma bem",
            "texto":   "O sono inadequado aumenta a fome e dificulta a perda de peso. Busque 7 a 9 horas por noite.",
            "cor":     "red",
        },
    ],

    "ativa": [
        {
            "slug":    "hidratacao",              # mesmo slug → deduplicado
            "titulo":  "Hidrate-se bem",
            "texto":   "Beba pelo menos 2 litros de água por dia. Evite refrigerantes e sucos industrializados.",
            "cor":     "blue",
        },
        {
            "slug":    "metas-atividade",
            "titulo":  "Mantenha suas metas de atividade",
            "texto":   "Continue com pelo menos 150 minutos de atividade moderada por semana.",
            "cor":     "blue",
        },
        {
            "slug":    "checkup-preventivo",
            "titulo":  "Faça check-up anual",
            "texto":   "Mesmo sem condições diagnosticadas, exames preventivos anuais são fundamentais.",
            "cor":     "blue",
        },
        {
            "slug":    "sono-regular",            # mesmo slug → deduplicado
            "titulo":  "Durma bem",
            "texto":   "O sono inadequado aumenta a fome e dificulta a perda de peso. Busque 7 a 9 horas por noite.",
            "cor":     "blue",
        },
    ],
}

# Ordem de prioridade para desempate na deduplication (RN-5.2)
PRIORIDADE_LINHAS = ["diabetica", "hipertensos", "obesidade", "ativa"]


def montar_recomendacoes(linhas_ativas: list) -> list:
    """
    Monta a lista final de recomendações para o dashboard,
    aplicando deduplication por slug (Regra de Negócio 5.2).

    Algoritmo:
      1. Para cada linha ativa (na ordem de prioridade),
         percorre suas recomendações.
      2. Se o slug ainda não foi visto, adiciona à lista final.
      3. Se o slug já existe, ignora (deduplication).

    Resultado: lista sem repetições, com a recomendação vinda
    sempre da linha de maior prioridade.
    """
    slugs_vistos = set()
    recomendacoes_finais = []

    # Ordena as linhas ativas pela prioridade definida
    linhas_ordenadas = sorted(
        linhas_ativas,
        key=lambda l: PRIORIDADE_LINHAS.index(l) if l in PRIORIDADE_LINHAS else 99
    )

    for linha in linhas_ordenadas:
        for rec in RECOMENDACOES.get(linha, []):
            if rec["slug"] not in slugs_vistos:
                slugs_vistos.add(rec["slug"])
                recomendacoes_finais.append({**rec, "linha": linha})

    return recomendacoes_finais
