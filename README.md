# 🏪 **StockMaster — Sistema Completo de Gestão de Estoque**

Sistema moderno e completo de **gestão de estoque**, com interface intuitiva, relatórios avançados e integração com **NFe**.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

---

## **Funcionalidades Principais**

### 📊 **Gestão de Estoque**
- ✅ Dashboard interativo com métricas em tempo real  
- 📦 Gestão completa de produtos (categorias, locais, estoque mínimo)  
- 📍 Controle de múltiplos locais de armazenamento  
- 🔄 Sistema de movimentações (entradas, saídas e ajustes)  
- 📑 Inventários físicos com contagem e cálculo de divergências  

### 📈 **Relatórios e Análises**
- 📊 Relatórios exportáveis (PDF, Excel, CSV)  
- 💰 Relatório financeiro (valor total, por categoria, top produtos)  
- 📉 Estoque baixo (alertas e produtos críticos)  
- 🔍 Movimentações por período (filtros por data)  
- 🗺️ Produtos por localização (distribuição espacial)  

### 🔄 **Integrações**
- 📄 Importação automática de NFe (XML)  
- 📧 Sistema de e-mail (verificação e notificações)  
- 🔐 Autenticação segura com JWT  

### 👥 **Gestão de Usuários**
- 🏢 Cadastro de múltiplas empresas (multitenant)  
- 👤 Sistema de permissões (Super Admin, Admin, User)  
- ✅ Verificação por e-mail  
- 🔒 Controle de acesso por módulo  

---

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- React 18 + TypeScript  
- Vite (build rápida)  
- Tailwind CSS  
- Shadcn/UI (componentes modernos)  
- Recharts (gráficos interativos)  
- React Router DOM  
- Axios  

### **Backend**
- Node.js + Express  
- TypeScript  
- PostgreSQL  
- Drizzle ORM (type-safe)  
- JWT (autenticação)  
- Nodemailer (envio de e-mails)  
- Zod (validação de schemas)  
- Multer (upload de arquivos)  

---

## ⚙️ **Instalação e Configuração**

### **Pré-requisitos**
- Node.js 18+  
- PostgreSQL 12+  
- npm ou yarn  

### **1️⃣ Clone o repositório**
```bash
git clone https://github.com/samuelalbuquerque01/sistema-de-estoque.git
cd sistema-de-estoque
```

### **2️⃣ Instale as dependências**
```bash
# Backend
cd server
npm install

# Frontend (em outro terminal)
cd client
npm install
```

### **3️⃣ Configure o banco de dados**
```sql
-- Crie o banco de dados
CREATE DATABASE stockmaster;

-- Ou use o Drizzle para migrações automáticas
npm run db:push
```

### **4️⃣ Configure as variáveis de ambiente**
Crie um arquivo `.env` em `server/`:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/stockmaster"

# Email
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-app"
EMAIL_FROM="StockMaster <noreply@stockmaster.com>"

# Aplicação
APP_URL="http://localhost:3000"
JWT_SECRET="seu-jwt-secret-aqui"

# Servidor
PORT=5000
NODE_ENV=development
```

### **5️⃣ Execute o sistema**
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

### **6️⃣ Acesse**
- 🌐 Frontend: http://localhost:3000  
- 🔗 API Backend: http://localhost:5000  

---

## 👤 **Primeiro Acesso**

1. Acesse o app e clique em **“Cadastrar Empresa”**  
2. Preencha os dados da empresa e do administrador  
3. Verifique o e-mail (token aparecerá no console)  
4. Faça login com as credenciais criadas  

**Usuário padrão (para testes):**
```
Email: admin@stockmaster.com
Senha: admin123
```

---

## 📁 **Estrutura do Projeto**

```
sistema-de-estoque/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários, API, auth
│   │   └── styles/        # Estilos globais
│   └── vite.config.ts
├── server/                 # Backend Node.js
│   ├── routes/            # Rotas da API
│   ├── storage.ts         # Camada de dados
│   ├── db/                # Configuração do banco
│   └── utils/             # Serviços (email, relatórios)
├── shared/                # Schemas compartilhados
│   └── schema.ts
└── README.md
```

---

## 🗄️ **Estrutura do Banco**

**Tabelas principais:**
- `users` — Usuários do sistema  
- `empresas` — Cadastro de empresas  
- `products` — Produtos e estoque  
- `categories` — Categorias  
- `locations` — Locais de armazenamento  
- `movements` — Movimentações de estoque  
- `inventories` — Controle de inventário  
- `reports` — Relatórios gerados  
- `import_history` — Histórico de importações  
- `email_verificacoes` — Tokens de verificação  

---

## 🔌 **Principais Endpoints da API**

### 🔐 **Autenticação**
- `POST /api/auth/login` — Login de usuário  
- `POST /api/auth/cadastro/empresa` — Cadastro de empresa  
- `POST /api/auth/verificar-email` — Verificação de e-mail  

### 📦 **Produtos**
- `GET /api/products` — Listar produtos  
- `POST /api/products` — Criar produto  
- `PUT /api/products/:id` — Atualizar produto  

### 📈 **Relatórios**
- `POST /api/reports/generate` — Gerar relatório  
- `GET /api/reports` — Listar relatórios  

### 👥 **Usuários**
- `GET /api/usuarios` — Listar usuários  
- `POST /api/usuarios` — Criar usuário  
- `PUT /api/usuarios/:id/role` — Atualizar permissões  

### 🧾 **Importação**
- `POST /api/import/xml` — Importar NFe XML  

---

💡 **StockMaster** foi desenvolvido para oferecer **controle total, automação e clareza na gestão de estoque** — ideal para empresas que valorizam eficiência e dados precisos.

## NF-e com SEFAZ-CE (download sem redirecionar)

O sistema agora suporta:
- importacao por arquivo XML (`POST /api/import/xml`)
- importacao por XML colado (`POST /api/import/raw-xml`)
- download local da nota (`POST /api/invoices/download`) em `xml` ou `pdf`

Fluxo do download:
1. tenta buscar o XML ja salvo no banco
2. se nao houver, tenta consultar a SEFAZ via certificado digital
3. devolve o arquivo para download direto no frontend (sem abrir portal externo)

Variaveis de ambiente para integracao SEFAZ:
- `SEFAZ_AMBIENTE` (`1` producao, `2` homologacao)
- `SEFAZ_CNPJ` ou `SEFAZ_CPF` (documento do interessado)
- `SEFAZ_CERT_PFX_PATH` + `SEFAZ_CERT_PFX_PASSPHRASE` (opcao 1)
- `SEFAZ_CERT_CRT_PATH` + `SEFAZ_CERT_KEY_PATH` (opcao 2)
- `SEFAZ_CERT_CA_PATH` (opcional)

Endpoint util de diagnostico:
- `GET /api/invoices/sefaz/config-status`
