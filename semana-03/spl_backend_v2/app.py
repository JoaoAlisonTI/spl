# =============================================================
#  SPL — Saúde em Primeiro Lugar  |  Backend Mock
#  Framework : Flask + SQLite
#  Arquivo   : app.py  (ponto de entrada — rode este arquivo)
# =============================================================
#
#  Para rodar localmente:
#    pip install -r requirements.txt
#    python app.py
#
#  Para rodar via Docker:
#    docker compose up
#
#  Após iniciar, acesse:
#    API:        http://localhost:5000/api/health
#    Swagger UI: http://localhost:5000/docs
# =============================================================

import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint

from database import init_db
from routes.auth    import auth_bp
from routes.triagem import triagem_bp
from routes.usuario import usuario_bp

# ── Criação da aplicação ──────────────────────────────────────
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "spl-mock-secret-key")

# Permite que o frontend React (localhost:5173) acesse a API
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── Swagger UI ────────────────────────────────────────────────
# A UI ficará disponível em /docs
# O YAML da especificação é servido em /openapi.yaml
SWAGGER_URL  = "/docs"
OPENAPI_URL  = "/openapi.yaml"

swagger_bp = get_swaggerui_blueprint(
    SWAGGER_URL,
    OPENAPI_URL,
    config={"app_name": "SPL — Saúde em Primeiro Lugar"},
)
app.register_blueprint(swagger_bp, url_prefix=SWAGGER_URL)

# Serve o arquivo openapi.yaml diretamente
@app.route("/openapi.yaml")
def openapi_spec():
    return send_from_directory(
        os.path.dirname(os.path.abspath(__file__)),
        "openapi.yaml",
        mimetype="application/yaml"
    )

# ── Registro dos blueprints de rotas ─────────────────────────
app.register_blueprint(auth_bp,    url_prefix="/api/auth")
app.register_blueprint(triagem_bp, url_prefix="/api/triagem")
app.register_blueprint(usuario_bp, url_prefix="/api/usuario")

# ── Rota de verificação de saúde ─────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({
        "status":  "ok",
        "sistema": "SPL Mock Backend",
        "docs":    "http://localhost:5000/docs",
    })

# ── Tratamento de erros globais ───────────────────────────────
@app.errorhandler(404)
def nao_encontrado(e):
    return jsonify({"erro": "Endpoint não encontrado."}), 404

@app.errorhandler(405)
def metodo_nao_permitido(e):
    return jsonify({"erro": "Método HTTP não permitido para este endpoint."}), 405

@app.errorhandler(500)
def erro_interno(e):
    return jsonify({"erro": "Erro interno do servidor."}), 500

# ── Inicialização ─────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    print("\n" + "="*55)
    print("  SPL Mock Backend iniciado")
    print("  API:        http://localhost:5000/api/health")
    print("  Swagger UI: http://localhost:5000/docs")
    print("="*55 + "\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
