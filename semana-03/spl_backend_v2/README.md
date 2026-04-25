# SPL — Backend Mock

Backend do sistema **Saúde em Primeiro Lugar** construído com **Flask + SQLite**.  
Inclui Swagger UI integrada, containerização com Docker e especificação OpenAPI 3.0.

---

## Início rápido

### Opção 1 — Docker (recomendado)

```bash
# Sobe o container (constrói a imagem na primeira vez)
docker compose up

# Em background:
docker compose up -d

# Ver logs:
docker compose logs -f

# Parar:
docker compose down
```

### Opção 2 — Python local

```bash
pip install -r requirements.txt
python app.py
```

Após iniciar, acesse:

| O quê | URL |
|---|---|
| Verificar se está no ar | http://localhost:5000/api/health |
| **Swagger UI (documentação interativa)** | **http://localhost:5000/docs** |
| Especificação OpenAPI (YAML bruto) | http://localhost:5000/openapi.yaml |

---

## Estrutura de arquivos

```
spl_backend/
├── app.py               # Ponto de entrada — inicia o servidor e o Swagger UI
├── database.py          # Conexão com SQLite e criação das tabelas
├── linhas_cuidado.py    # IMC, classificação de linhas e deduplication
├── openapi.yaml         # Especificação OpenAPI 3.0 completa
├── requirements.txt     # Dependências Python
├── Dockerfile           # Imagem Docker
├── docker-compose.yml   # Orquestração do container
├── data/                # Criado automaticamente — contém spl.db
└── routes/
    ├── auth.py          # POST /cadastro, POST /login, POST /logout
    ├── triagem.py       # POST /triagem, GET /triagem
    └── usuario.py       # GET /perfil, GET /dashboard
```

---

## Endpoints

### Autenticação — `/api/auth`

| Método | Endpoint   | Descrição                    | Auth |
|--------|-----------|-------------------------------|------|
| POST   | /cadastro | Cria novo usuário             | Não  |
| POST   | /login    | Autentica e retorna token     | Não  |
| POST   | /logout   | Invalida o token              | Sim  |

### Triagem — `/api/triagem`

| Método | Endpoint | Descrição                              | Auth |
|--------|---------|----------------------------------------|------|
| POST   | /       | Envia dados e classifica linhas        | Sim  |
| GET    | /       | Consulta triagem do usuário logado     | Sim  |

### Usuário — `/api/usuario`

| Método | Endpoint   | Descrição                        | Auth |
|--------|-----------|-----------------------------------|------|
| GET    | /perfil   | Dados básicos do usuário          | Sim  |
| GET    | /dashboard | Dashboard personalizado completo | Sim  |

---

## Autenticação

Rotas protegidas exigem o token no header de todas as requisições:

```
Authorization: Bearer <token>
```

O token é retornado pelos endpoints `/cadastro` e `/login`.  
No frontend React, armazene-o no `localStorage` como `spl_token`.

---

## Fluxo completo do sistema

```
1. POST /api/auth/cadastro
        ↓ retorna token + triagem_concluida: false
2. POST /api/triagem          (com Authorization: Bearer <token>)
        ↓ classifica linhas de cuidado, salva no banco
3. GET  /api/usuario/dashboard
        ↓ retorna saudação, perfil de saúde, recomendações e metas
```

Se o usuário já tem conta:
```
1. POST /api/auth/login
        ↓ retorna token + triagem_concluida: true ou false
2. Se false → redirecionar para /triagem
   Se true  → redirecionar para /dashboard
```

---

## Cenários de teste (Casos de Uso do documento de requisitos)

| Caso | Condições       | Peso  | Altura | IMC  | Linhas esperadas              |
|------|-----------------|-------|--------|------|-------------------------------|
| UC-03 | diabetes        | 82kg  | 175cm  | 26.8 | diabetica                     |
| UC-04 | diabetes + obeso | 95kg | 162cm  | 36.2 | diabetica, obesidade          |
| UC-05 | nenhuma         | 72kg  | 178cm  | 22.7 | ativa                         |
| Extra | hipertensão     | 78kg  | 170cm  | 27.0 | hipertensos                   |
| Extra | todos           | 105kg | 165cm  | 38.6 | diabetica, obesidade, hipertensos |

---

## Exemplos com curl

### Cadastro
```bash
curl -X POST http://localhost:5000/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "telefone": "(85) 99999-0000",
    "email": "joao@email.com",
    "senha": "minhasenha123"
  }'
```

### Triagem (UC-04 — duas linhas)
```bash
curl -X POST http://localhost:5000/api/triagem \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "data_nascimento": "1980-07-05",
    "sexo": "feminino",
    "peso_kg": 95.0,
    "altura_cm": 162.0,
    "condicoes": ["diabetes", "obesidade"],
    "usa_medicamentos": true,
    "nivel_atividade": "Sedentária"
  }'
```

### Dashboard
```bash
curl http://localhost:5000/api/usuario/dashboard \
  -H "Authorization: Bearer <token>"
```

---

## Deduplication de recomendações (Regra de Negócio 5.2)

Quando o usuário tem múltiplas linhas ativas, recomendações com o mesmo
`slug` aparecem **apenas uma vez**, sempre pela linha de maior prioridade:

```
Prioridade: diabetica > hipertensos > obesidade > ativa
```

Exemplo UC-04 (diabetica + obesidade): o slug `exercicios-aerobicos`
existe nas duas linhas, mas aparece uma única vez no dashboard,
com a cor verde da linha diabética (maior prioridade).

---

## Docker — comandos úteis

```bash
# Reconstruir a imagem após mudanças no código
docker compose up --build

# Acessar o container em execução
docker exec -it spl-backend bash

# Ver o banco de dados SQLite
docker exec -it spl-backend sqlite3 /app/data/spl.db ".tables"

# Apagar todos os dados (zerar o banco)
docker compose down -v
```
