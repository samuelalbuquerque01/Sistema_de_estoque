// server/migrate.ts - VERSÃO CORRIGIDA
import { db } from "./db";

export async function migrate() {
  console.log('Verificando/Criando tabelas do banco de dados...');
  
  try {
    // Criar tabelas essenciais primeiro
    const tables = [
      // Categories
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT
      )`,
      
      // Locations  
      `CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )`,
      
      // Users
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL DEFAULT 'individual',
        role TEXT NOT NULL DEFAULT 'user',
        empresa_id TEXT,
        email_verificado BOOLEAN DEFAULT FALSE,
        token_verificacao TEXT,
        data_verificacao TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Products
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category_id TEXT REFERENCES categories(id),
        location_id TEXT REFERENCES locations(id),
        quantity INTEGER NOT NULL DEFAULT 0,
        min_quantity INTEGER NOT NULL DEFAULT 0,
        unit_price TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Movements
      `CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        product_id TEXT REFERENCES products(id),
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        user_id TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Inventories
      `CREATE TABLE IF NOT EXISTS inventories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'em_andamento',
        user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP
      )`,
      
      // Inventory Counts
      `CREATE TABLE IF NOT EXISTS inventory_counts (
        id TEXT PRIMARY KEY,
        inventory_id TEXT NOT NULL REFERENCES inventories(id),
        product_id TEXT NOT NULL REFERENCES products(id),
        counted_quantity INTEGER NOT NULL,
        difference INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Empresas
      `CREATE TABLE IF NOT EXISTS empresas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cnpj TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        telefone TEXT,
        website TEXT,
        cep TEXT,
        logradouro TEXT,
        numero TEXT,
        complemento TEXT,
        cidade TEXT,
        estado TEXT,
        status TEXT DEFAULT 'pendente',
        data_aprovacao TIMESTAMP,
        plano TEXT DEFAULT 'starter',
        data_expiracao TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Email Verificacoes
      `CREATE TABLE IF NOT EXISTS email_verificacoes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL,
        utilizado BOOLEAN DEFAULT FALSE,
        expira_em TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Reports
      `CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        format TEXT NOT NULL,
        filters JSONB DEFAULT '{}',
        generated_by TEXT,
        file_path TEXT,
        file_size INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Import History
      `CREATE TABLE IF NOT EXISTS import_history (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        status TEXT NOT NULL,
        products_found INTEGER DEFAULT 0,
        products_created INTEGER DEFAULT 0,
        products_updated INTEGER DEFAULT 0,
        supplier TEXT,
        supplier_cnpj TEXT,
        supplier_address TEXT,
        nfe_number TEXT,
        nfe_key TEXT,
        emission_date TIMESTAMP,
        total_value TEXT,
        user_id TEXT,
        processed_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // NFE Data
      `CREATE TABLE IF NOT EXISTS nfe_data (
        id TEXT PRIMARY KEY,
        import_history_id TEXT NOT NULL REFERENCES import_history(id),
        access_key TEXT NOT NULL UNIQUE,
        document_number TEXT,
        supplier JSONB DEFAULT '{}',
        emission_date TIMESTAMP NOT NULL,
        total_value TEXT,
        xml_content TEXT,
        raw_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // NFE Products
      `CREATE TABLE IF NOT EXISTS nfe_products (
        id TEXT PRIMARY KEY,
        import_history_id TEXT NOT NULL REFERENCES import_history(id),
        product_id TEXT REFERENCES products(id),
        nfe_code TEXT,
        code TEXT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price TEXT,
        unit TEXT,
        total_value TEXT,
        nfe_data JSONB DEFAULT '{}'
      )`
    ];

    for (const sql of tables) {
      try {
        await db.execute(sql);
        console.log('Tabela criada/verificada');
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log('Tabela já existe');
        } else {
          console.log('Erro ao criar tabela:', error.message);
        }
      }
    }

    // Inserir dados iniciais
    console.log('Inserindo dados iniciais...');
    
    // Categorias padrão
    const categoriesData = [
      ['limpeza', 'Produtos de Limpeza', 'limpeza', 'Produtos para limpeza e higienização'],
      ['ferramenta', 'Ferramentas', 'ferramenta', 'Ferramentas manuais e elétricas'],
      ['insumo', 'Insumos', 'insumo', 'Matérias-primas e insumos para produção'],
      ['equipamento', 'Equipamentos', 'equipamento', 'Máquinas e equipamentos'],
      ['material', 'Materiais', 'material', 'Materiais diversos'],
      ['outros', 'Outros', 'outros', 'Outros tipos de produtos']
    ];

    for (const category of categoriesData) {
      try {
        await db.execute(
          `INSERT INTO categories (id, name, type, description) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (id) DO NOTHING`,
          category
        );
      } catch (error) {
        // Ignora erros de inserção
      }
    }

    // Usuário admin
    try {
      await db.execute(
        `INSERT INTO users (id, username, password, name, email, tipo, role, email_verificado) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT (email) DO NOTHING`,
        ['admin-123', 'admin', 'admin123', 'Administrador', 'admin@neuropsicocentro.com', 'individual', 'super_admin', true]
      );
    } catch (error) {
      // Ignora erros de inserção
    }

    console.log('Dados iniciais inseridos');
    console.log('Migração concluída com sucesso!');

  } catch (error) {
    console.error('Erro na migração:', error);
  }
}