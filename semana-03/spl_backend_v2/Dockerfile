# =============================================================
#  Dockerfile — SPL Backend Mock
# =============================================================
#
#  Imagem base: Python 3.12 "slim" (menor tamanho possível,
#  sem ferramentas desnecessárias de compilação).
#
#  Para construir e rodar manualmente (sem Compose):
#    docker build -t spl-backend .
#    docker run -p 5000:5000 spl-backend
#
#  Mas o recomendado é usar o docker-compose.yml.
# =============================================================

FROM python:3.12-slim

# ── Diretório de trabalho dentro do container ─────────────────
# Todos os comandos seguintes serão executados a partir daqui.
WORKDIR /app

# ── Instala dependências primeiro (aproveita cache do Docker) ─
# Copiamos só o requirements.txt antes do restante do código.
# Assim, se você alterar apenas o código Python e não as
# dependências, o Docker reutiliza a camada de cache do pip
# e o build fica muito mais rápido.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copia o restante do código ────────────────────────────────
COPY . .

# ── Cria o diretório para o banco de dados ───────────────────
# O SQLite será salvo em /app/data/spl.db.
# Este diretório é montado como volume no docker-compose.yml
# para que os dados persistam entre reinicializações.
RUN mkdir -p /app/data

# ── Porta exposta pelo container ──────────────────────────────
EXPOSE 5000

# ── Variáveis de ambiente padrão ──────────────────────────────
ENV FLASK_ENV=development
ENV DB_PATH=/app/data/spl.db

# ── Comando de inicialização ──────────────────────────────────
CMD ["python", "app.py"]
