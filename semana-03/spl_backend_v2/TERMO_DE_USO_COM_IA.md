# Termo de Uso de Inteligência Artificial Generativa

Para construir este mock, foi utilizado o Claude.ai, modelo Sonnet 4.6. Apesar de revisado, analisado e testado pelo responsável pela trilha, nem todos os elementos puderam ser verificados em detalhe. Devido a complexidade das interações para chegar ao resultado atual, não é didático fornecer todo o histórico de interações, além deste histórico conter elementos que, por questões didáticas, não devem ser expostos aos alunos.

## Saída da IA Generativa.

Perfeito, tudo junto. Vou construir na seguinte ordem: Docker → OpenAPI YAML → Swagger UI no Flask → README.Criou 2 arquivos, executou um comandoCriou 2 arquivos, executou um comandoAgora atualizo o database.py para usar a variável de ambiente DB_PATH do Docker:Editou 2 arquivos, executou um comandoEditou 2 arquivos, executou um comandoAgora o OpenAPI YAML completo:OpenAPI 3.0 specification YAMLOpenAPI 3.0 specification YAMLAgora integro o Swagger UI diretamente no Flask e atualizo o app.py:Executou 2 comandos, criou um arquivoExecutou 2 comandos, criou um arquivoAgora o README completo e definitivo:Write the final READMEWrite the final READMEValida tudo e empacota:Executou 3 comandos, leu um arquivoExecutou 3 comandos, leu um arquivoPronto. Aqui está o que foi adicionado nesta versão:
Dockerfile — imagem baseada em python:3.12-slim, com a estratégia de copiar o requirements.txt antes do código para aproveitar o cache de layers do Docker. O banco SQLite fica em /app/data/ separado do código.
docker-compose.yml — um único docker compose up sobe tudo. O diretório ./data é montado como volume, então o banco persiste entre reinicializações. docker compose down -v apaga tudo e começa do zero.
openapi.yaml — especificação OpenAPI 3.0 completa com todos os endpoints, schemas de entrada e saída, exemplos dos três cenários de UC (03, 04, 05), códigos de erro documentados e o securityScheme BearerAuth configurado. Este é o arquivo que o frontend consome como contrato.
Swagger UI embutida — acessível em http://localhost:5000/docs logo após subir o servidor. Os monitores podem testar todos os endpoints diretamente no browser, inclusive autenticando com o token e executando os cenários de uso sem precisar de curl ou Postman.
Para os monitores começarem, o fluxo é literalmente:
bash> docker compose up
# abrir http://localhost:5000/docs no browser