# Questions - Instagram Challenge

## 1. Banco de dados

### Como garantir a consistência eventual entre o MongoDB e o Redis considerando a replicação dos dados?

Redis geralmente é usado como cache, e MongoDB como banco primário. A consistência eventual pode ser garantida com estratégias de invalidação ou atualização do cache:

- Cache-aside pattern: Aplicação lê do cache; se não existe, lê do MongoDB e popula o cache.
- Invalidação do cache: Quando há atualização no MongoDB, o cache correspondente é invalidado para evitar dados obsoletos.
- Replicação e monitoração: MongoDB replica os dados para alta disponibilidade; Redis pode ter replicação e persistência para minimizar perdas.

Referências:

- https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside
- https://redis.io/glossary/cache-invalidation/

### Quais são os trade-offs entre usar um banco NoSQL como MongoDB vs um banco relacional para armazenar posts e feeds?

MongoDB (NoSQL):
- Escala horizontalmente com facilidade.
- Flexibilidade ara dados semi-estruturados.
- Bom para grandes volumes e acesso rápido (leitura).
- Consistência eventual (por padrão), não transacional.

Banco relacional:
- Forte consistência e suport a transações ACID.
- Modelagem rígida (schema definido).
- Pode ser menos eficiente para dados altamente escaláveis e não estruturados

Referências:
- https://www.mongodb.com/pt-br/resources/basics/databases/nosql-explained
- https://www.mongodb.com/pt-br/resources/basics/databases/nosql-explained/nosql-vs-sql

### Como garantir alta disponibilidade e tolerância a falhas no MongoDB em um cenário distribuído?

- Replica sets: MongoDB replica dados em múltiplos nós; se um falhar, outro assume.
- Sharding: Distribui dados em múltiplos servidores para escalabilidade.
- Backup e recuperação: Estratégias regulares para evitar perda de dados.
- Monitoramento: Ferramentas como MongoDB Ops Manager.

Referências:

- https://www.mongodb.com/docs/manual/replication/
- https://www.mongodb.com/docs/manual/sharding/

### Como o modelo de dados no MongoDB deve ser estruturado para suportar consultas eficientes em feeds sociais?

- Documentos embutidos para dados relacionados.
- Indexação adequada para consultas frequentes.
- Denormalização para evitar joins caros.
- Projetar o schema para a consulta mais frequente (query-driven design).

Refêrencia:

- https://www.mongodb.com/docs/manual/core/data-model-design/

## 2. Caching

### Quais estratégias você utilizaria para manter o cache Redis atualizado quando novos posts são criados?

- Cache-aside: Invalida ou atualiza o cache ao criar um post.
- Event-driven updates: Quando um post é criado, eventos notificam o serviço de cache para atualizar.
- TTL (Time-to-Live): Define tempo de vida para chaves no cache para evitar dados obsoletos.
- Write-through cache: Atualiza o cache junto com o banco (menos comum).

Referência:

- https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside

### Como implementar uma política de invalidação eficiente para o cache do feed?

- Invalidação seletiva com base em usuário, posts recentes, ou tags.
- Expiração temporal para garantir renovação periódica.
- Uso de versionamento para detectar mudanças.
- Atualizar cache somente quando alterações relevantes ocorrem.

### Como evitar problemas de cache stampede?

- Usar locks distribuídos para garantir que apenas uma requisição recarregue o cache.
- Implementar jitter/random delay na expiração.
- Pré-aquecer o cache antes de expirar.

Referências:

- https://www.slaknoah.com/blog/what-is-a-cache-stampede-how-to-prevent-it-using-redis

### Quando o cache pode se tornar um gargalo ou ponto único de falha? Como mitigar?

- Se o cache falhar, pode impactar a latência.
- Mitigar com clusters Redis, replicação, failover.
- Monitorar métricas e preparar fallback para ler direto do banco.

## 3. Fan out strategies

### Para um usuário com milhares de seguidores, como garantir que o "fan out" das postagens não gere sobrecarga no sistema?

- Fan-out on read: Construir feed no momento da leitura (menos carga na escrita).
- Fan-out on write: Propagar para feeds dos seguidores imediatamente (mais rápido na leitura, mais pesado na escrita).
- Hybrid: Use cache e filas para balancear.
- Usar mensageria para processar updates em lote.

Referências:

- https://martinfowler.com/articles/consumerDrivenContracts.html

### Vantagens e desvantagens fan out on write vs fan out on read

| Fan out on write          | Fan out on read           |
| ------------------------- | ------------------------- |
| Feed pré-calculado        | Feed calculado na hora    |
| Latência baixa na leitura | Latência maior na leitura |
| Custo alto na escrita     | Custo baixo na escrita    |
| Complexidade no update    | Simplicidade no update    |

### Como escalar post-created-queue para picos?

- Partitionar filas (sharding).
- Escalar consumidores horizontalmente.
- Usar brokers robustos (Kafka, RabbitMQ).
- Monitorar e balancear carga.

## 4. Necessidade de mensageria

### Critérios para escolher síncrono vs assíncrono?

- Necessidade de resposta imediata -> síncrono.
- Operações demoradas ou não críticas -> assíncrono.
- Tolerância a latência e eventual consistência.


