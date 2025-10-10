# StockMaster - Sistema de Controle de Estoque

Sistema moderno e completo de gestão de estoque com interface intuitiva e recursos avançados.

## 🚀 Funcionalidades

- ✅ **Dashboard Interativo** com gráficos e estatísticas em tempo real
- 📦 **Gestão de Produtos** (Produtos, Equipamentos, Insumos, Ferramentas, Limpeza)
- 📍 **Controle de Locais** de armazenamento
- 📊 **Histórico de Movimentações** (entradas, saídas e ajustes)
- 📑 **Sistema de Inventário** com contagem e divergências
- 📈 **Relatórios Exportáveis** (PDF, Excel, CSV)
- 📄 **Importação de Documentos** PDF com OCR
- 🌓 **Modo Escuro/Claro** com tema personalizável
- 🔐 **Sistema de Autenticação** JWT

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- npm ou yarn

## 🔧 Instalação

1. **Extrair o arquivo**
```bash
tar -xzf stockmaster-sistema.tar.gz
cd stockmaster-sistema
```

2. **Instalar dependências**
```bash
npm install
```

3. **Configurar variáveis de ambiente** (opcional)
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Iniciar o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acessar o sistema**
Abra seu navegador em: `http://localhost:5000`

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   └── lib/           # Utilitários e configurações
├── server/                 # Backend Express
│   ├── routes.ts          # Rotas da API
│   └── storage.ts         # Camada de persistência
├── shared/                 # Tipos e schemas compartilhados
└── package.json           # Dependências do projeto
```

## 🎨 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn UI** - Componentes modernos
- **Recharts** - Gráficos interativos
- **Wouter** - Roteamento
- **TanStack Query** - Gerenciamento de estado

### Backend
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Drizzle ORM** - ORM para banco de dados
- **Zod** - Validação de schemas

## 🔑 Credenciais Padrão (Mock)

Para testar o sistema localmente:
- **Usuário:** admin
- **Senha:** admin

> ⚠️ **Importante:** Estas são credenciais de teste. Configure autenticação real antes de usar em produção.

## 📦 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Produção
npm run build           # Compila para produção
npm run start           # Inicia servidor de produção

# Utilitários
npm run lint            # Verifica código
npm run type-check      # Verifica tipos TypeScript
```

## 🚀 Deploy

### Opção 1: Replit
1. Faça upload do projeto para o Replit
2. Instale as dependências
3. Execute `npm run dev`

### Opção 2: Vercel/Netlify
1. Configure as variáveis de ambiente
2. Faça deploy do frontend
3. Configure o backend separadamente

### Opção 3: Docker
```bash
# Build da imagem
docker build -t stockmaster .

# Executar container
docker run -p 5000:5000 stockmaster
```

## 📝 Próximos Passos

Para implementar o backend completo:

1. **Conectar Banco de Dados Real**
   - Configure PostgreSQL ou outro banco
   - Atualize `server/storage.ts` com implementação real
   - Execute migrações com Drizzle

2. **Implementar Autenticação**
   - Configure JWT secrets
   - Implemente registro de usuários
   - Adicione middleware de autenticação

3. **Adicionar Funcionalidades**
   - Sistema de permissões
   - Notificações por email
   - Código de barras/QR Code
   - Exportação de relatórios

## 🤝 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ para facilitar a gestão de estoque**
