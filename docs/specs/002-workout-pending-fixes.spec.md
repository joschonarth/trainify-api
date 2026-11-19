# Spec 002: correções pendentes de workout

**Status:** planejada; nenhuma implementação autorizada nesta etapa.  
**Fonte:** `../analise-pendencias-trainify-api.md`, seção 2.  
**Escopo:** contratos, agenda, preservação de histórico, integridade e listagem de treinos.

## Requisitos e critérios de aceite

- [x] **W01 / P0 — Resposta:** `GET /workouts/:workoutId` declara e retorna `{ workout: workoutSchema }`, preservando os campos existentes e 404 por recurso inexistente ou alheio.
- [ ] **W02 / P0 — Agenda:** aceitar apenas dias inteiros de 0 a 6; rejeitar repetidos com 400. Validar conflitos por usuário tanto na atribuição quanto na alteração de um dia. Dia ocupado por outro treino retorna 409; não transferir automaticamente. Informações de conflito devem pertencer ao usuário autenticado. Substituir dias em uma transação: qualquer falha mantém a agenda anterior. Mapear P2002 concorrente para `ResourceAlreadyExistsError` no use case.
- [ ] **W03 / P0 — Exclusão:** proposta de implementação: arquivar com `Workout.archivedAt`, removendo a agenda na mesma transação. Preservar sessões, logs, métricas, streaks e badges. Excluir arquivados das listagens ativas, agendas e criação de sessões; impedir alterações e adição de exercícios. Históricos continuam consultáveis pelo dono. Definir no contrato o comportamento de DELETE repetido e de sessões abertas antes do arquivamento; proposta: DELETE idempotente e sessões existentes continuam finalizáveis. Não habilitar exclusão física pela API.
- [x] **W04 / P0 — Nomes:** create/update validam duplicidade e convertem P2002 em 409, documentado nas rotas. Preservar inicialmente a unicidade atual `[name, userId]`, inclusive para arquivados; não introduzir implicitamente unicidade parcial ou comparação sem distinção de caixa.
- [x] **W05 / P1 — Atualização e schemas:** `description` omitida mantém valor; `null` limpa. Create aceita omissão. Nomes recebem trim, mínimo 1 e limite explícito proposto de 120 caracteres, aplicado também no update. Sets/reps inteiros positivos quando informados; peso finito não negativo; dias inteiros de 0 a 6. Preservar nulabilidade dos defaults onde existente.
- [ ] **W06 / P1 — Estatísticas:** treino existente sem sessões retorna zeros; treino inexistente/alheio retorna 404. Contagem de treinos concluídos considera apenas `COMPLETED`; volume usa `log.volume`, sem recomputação. Documentar o conjunto de sessões usado por cada agregado e manter coerência com a spec 001.
- [ ] **W07 / P1 — Posições:** remoção renormaliza posições em ordem estável dentro da transação. Inserções simultâneas não podem produzir posições iguais: serializar por treino ou adotar restrição e retry limitado. O schema atual possui apenas índice `[workoutId, position]`, portanto capturar P2002 sozinho não resolve essa corrida. Mapear conflitos reais de unicidade de exercício para 409.
- [ ] **W08 / P2 — Listagem:** paginação e busca por nome em `GET /workouts`, com isolamento por usuário, filtro de arquivados e ordenação estável. Proposta: `page=1`, `pageSize=20`, máximo 100, `search` opcional com trim; resposta inclui coleção e metadados. Registrar o formato final e impacto no cliente antes de mudar o envelope.

## Branches e commits propostos

Cada linha representa uma branch e commits na ordem indicada. Criar a partir de `develop` atualizado, depois que as dependências estiverem integradas. Se houver empilhamento intencional, usar a predecessora como base e alvo do PR até o merge.

| Ordem | Branch | Commits previstos | Entrega / dependência |
|---|---|---|---|
| 1 | `fix/workout-response-and-validation` | `fix(workout): align detail response and validate workout fields`; `fix(workout): handle duplicate names and nullable updates` | W01, W04, W05; testes de use case adicionados |
| 2 | `fix/workout-schedule-atomicity` | `fix(workout): reject conflicting schedule days`; `fix(workout): replace schedules atomically` | W02; interfaces transacionais conforme 006 |
| 3 | `fix/workout-preserve-history` | `feat(workout): archive workouts without deleting history`; `fix(workout): exclude archived workouts from active flows` | W03; migration gerada e repositórios alinhados, incluindo consumidores session/user |
| 4 | `fix/workout-stats-and-positions` | `fix(workout): return consistent workout statistics`; `fix(workout): serialize exercise ordering changes` | W06, W07; após arquivamento |
| 5 | `feat/workout-paginated-search` | `feat(workout): paginate and search active workouts` | W08; após definição do contrato |
| 6 | `test/workout-use-case-coverage` | `test(workout): cover remaining workout business rules` | Lacunas restantes; testes das correções devem acompanhar suas próprias branches |

## Validação

Criar `InMemoryWorkoutSchedulesRepository` e fazer detalhes in-memory refletirem a agenda real, mantendo interfaces equivalentes às implementações Prisma. Cobrir use cases de create/update/delete, assign-days, update/remove schedule day, update-defaults, add/remove-exercise, detalhes, stats e fetch com regras relevantes. Casos mínimos: propriedade, duplicidade, rollback, treino vazio, arquivado, null versus omitido, ordem após remoção e conflitos concorrentes simulados.

Somente testes unitários de use cases, junto ao código, com fixtures e repositórios in-memory. Atomicidade e concorrência PostgreSQL exigem também verificação operacional em banco descartável; testes in-memory não comprovam locking. Validar manualmente a serialização HTTP e documentação. Executar `npm run check`, `npm run test` e `npx tsc --noEmit` por branch.

## Limites e workflow

Preservar arquitetura route → controller → factory → use case → repository e erros de propriedade indistinguíveis. Gerar migrations via `npm run migrate`; não editar migrations existentes, `generated/` ou `build/`. Nenhuma branch, commit, push ou PR será criada por esta spec. Commits exigem aprovação explícita; push/PR exigem pedido explícito. Não incluir `docs/` ou `AGENTS.md` em commits futuros sem pedido explícito.


