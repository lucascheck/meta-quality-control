
# Project TODO

- [x] Configuração de credenciais da Meta por usuário, com token, WABA ID e Phone Number IDs isolados e protegidos
- [x] Integração server-side com a API oficial do WhatsApp Business para consultar números, qualidade, limites e templates em tempo real
- [x] Listagem de números com status, nome de exibição e qualidade atual
- [x] Painel de qualidade com ratings High/Medium/Low, histórico de variações e alertas de degradação
- [x] Visualização de tiers exatos 1k, 10k e 100k mensagens/dia, uso e percentual consumido
- [x] Listagem de templates com status exato APPROVED, PENDING e REJECTED, categoria e idioma
- [x] Formulário de disparo com remetente, template, variáveis e destinatários
- [x] Histórico de disparos com status de entrega, timestamp, template e destino
- [x] Dashboard com métricas de números ativos, qualidade geral, templates aprovados e disparos do dia
- [x] Interface elegante, sofisticada, responsiva, acessível e com estados de loading/erro/vazio
- [x] Testes Vitest para isolamento de credenciais, regras de tier, normalização de status e disparo
- [x] Verificação visual e funcional antes do checkpoint final

- [x] Criptografar WABA ID e Phone Number IDs em repouso e validar isolamento por usuário
- [x] Registrar mudanças de qualidade e exibir alerta de degradação
- [x] Automatizar sincronização e exibir último sync/estado de erro
- [x] Calcular uso e percentual consumido com dados reais quando disponíveis
- [x] Permitir múltiplos destinatários com resultado individual
- [x] Atualizar status real de entrega por webhook ou sincronização de status
- [x] Adicionar estados explícitos de loading e erro nas áreas principais
- [x] Criar testes de isolamento, disparo e restrição dos tiers suportados
- [x] Validar fluxos críticos de sucesso e erro no navegador

- [x] Criar rotas próprias para Visão geral, Qualidade, Limites, Templates, Disparos e Configuração
- [x] Fazer cada item do sidebar navegar para sua página e destacar a seção ativa
- [x] Validar navegação, rotas, responsividade e testes após a alteração

- [x] Adicionar efeito de cor e destaque ao passar o mouse sobre os itens do sidebar
- [x] Adicionar transição suave entre páginas/rotas com suporte a redução de movimento
- [x] Validar microinterações em desktop e mobile e atualizar testes/checkpoint

- [x] Fazer Qualidade, Limites, Templates e Disparos apontarem para a dashboard principal
- [x] Selecionar automaticamente a aba correspondente ao clicar no sidebar ou acessar a âncora
- [x] Manter Configuração como rota própria e validar a navegação corrigida

- [x] Mover o formulário de primeira conexão para a página Configuração do sidebar
- [x] Ocultar o painel de primeiro passo da dashboard quando existir conexão cadastrada
- [x] Adicionar atalho de engrenagem ao lado do status para abrir Configuração e adicionar nova conexão
- [x] Validar estados sem conexão, conectado e criação de nova conexão
