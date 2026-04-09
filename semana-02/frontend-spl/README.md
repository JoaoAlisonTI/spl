# SPL - Saúde em Primeiro Lugar (React + Backend)

Projeto React integrado ao backend Flask via API REST.

## Estrutura

```
spl-react/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                  # Roteamento com react-router-dom
    ├── services/
    │   └── api.js               # Instância axios + interceptor de token
    ├── components/
    │   └── Header.jsx
    ├── pages/
    │   ├── Login.jsx            # Conectado ao POST /api/auth/login
    │   ├── Cadastro.jsx         # Conectado ao POST /api/auth/cadastro
    │   ├── Triagem.jsx          # Placeholder
    │   └── Dashboard.jsx        # Placeholder
    └── styles/
        ├── global.css
        ├── login.css
        └── cadastro.css
```

## Como rodar

### 1. Backend
```bash
cd spl_backend_v2
python app.py
# Ou via Docker:
docker compose up
```
Verifique: http://localhost:5000/api/health

### 2. Frontend
```bash
npm install
npm run dev
```
Acesse: http://localhost:5173

## Rotas

| Rota        | Descrição                          |
|-------------|-------------------------------------|
| `/`         | Login                               |
| `/cadastro` | Cadastro de novo usuário            |
| `/triagem`  | Triagem (placeholder)               |
| `/dashboard`| Dashboard (placeholder)             |

## Fluxo após login/cadastro

- **Cadastro** → sempre redireciona para `/triagem`
- **Login** com `triagem_concluida: false` → `/triagem`
- **Login** com `triagem_concluida: true` → `/dashboard`
