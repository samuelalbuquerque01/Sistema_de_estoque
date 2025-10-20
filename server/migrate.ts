// server/migrate.ts
import { db } from "./db";

async function migrate() {
  console.log('🔄 Executando migração do banco de dados...');
  
  try {
    // 1. Criar tabela de categorias
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        description TEXT
      )
    `);
    console.log('✅ Tabela categories criada');

    // 2. Criar tabela de localizações
    await db.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
      )
    `);
    console.log('✅ Tabela locations criada');

    // 3. Criar tabela de empresas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS empresas (
        id VARCHAR(255) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        website VARCHAR(255),
        cep VARCHAR(10),
        logradouro VARCHAR(255),
        numero VARCHAR(10),
        complemento VARCHAR(255),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        status VARCHAR(50) DEFAULT 'pendente',
        data_aprovacao TIMESTAMP,
        plano VARCHAR(50) DEFAULT 'starter',
        data_expiracao TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela empresas criada');

    // 4. Criar tabela de usuários
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        tipo VARCHAR(50) NOT NULL DEFAULT 'individual',
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        empresa_id VARCHAR(255),
        email_verificado BOOLEAN DEFAULT FALSE,
        token_verificacao VARCHAR(255),
        data_verificacao TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (empresa_id) REFERENCES empresas(id)
      )
    `);
    console.log('✅ Tabela users criada');

    // 5. Criar tabela de produtos
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        code VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category_id VARCHAR(255),
        location_id VARCHAR(255),
        quantity INTEGER NOT NULL DEFAULT 0,
        min_quantity INTEGER NOT NULL DEFAULT 0,
        unit_price VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (location_id) REFERENCES locations(id)
      )
    `);
    console.log('✅ Tabela products criada');

    // 6. Criar tabela de movimentações
    await db.execute(`
      CREATE TABLE IF NOT EXISTS movements (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        user_id VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    console.log('✅ Tabela movements criada');

    // 7. Criar tabela de inventários
    await db.execute(`
      CREATE TABLE IF NOT EXISTS inventories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'em_andamento',
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP
      )
    `);
    console.log('✅ Tabela inventories criada');

    // 8. Criar tabela de contagens de inventário
    await db.execute(`
      CREATE TABLE IF NOT EXISTS inventory_counts (
        id VARCHAR(255) PRIMARY KEY,
        inventory_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        counted_quantity INTEGER NOT NULL,
        difference INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inventory_id) REFERENCES inventories(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    console.log('✅ Tabela inventory_counts criada');

    // 9. Criar tabela de verificações de email
    await db.execute(`
      CREATE TABLE IF NOT EXISTS email_verificacoes (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        utilizado BOOLEAN DEFAULT FALSE,
        expira_em TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Tabela email_verificacoes criada');

    // 10. Criar tabela de relatórios
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        format VARCHAR(50) NOT NULL,
        filters JSONB,
        generated_by VARCHAR(255),
        file_path TEXT,
        file_size INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela reports criada');

    // 11. Criar tabela de histórico de importação
    await db.execute(`
      CREATE TABLE IF NOT EXISTS import_history (
        id VARCHAR(255) PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        products_found INTEGER DEFAULT 0,
        products_created INTEGER DEFAULT 0,
        products_updated INTEGER DEFAULT 0,
        supplier VARCHAR(255),
        supplier_cnpj VARCHAR(20),
        supplier_address TEXT,
        nfe_number VARCHAR(50),
        nfe_key VARCHAR(255),
        emission_date TIMESTAMP,
        total_value VARCHAR(255),
        user_id VARCHAR(255),
        processed_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela import_history criada');

    // 12. Criar tabela de dados NFe
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nfe_data (
        id VARCHAR(255) PRIMARY KEY,
        import_history_id VARCHAR(255) NOT NULL,
        access_key VARCHAR(255) NOT NULL UNIQUE,
        document_number VARCHAR(50),
        supplier JSONB,
        emission_date TIMESTAMP NOT NULL,
        total_value VARCHAR(255),
        xml_content TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (import_history_id) REFERENCES import_history(id)
      )
    `);
    console.log('✅ Tabela nfe_data criada');

    // 13. Criar tabela de produtos NFe
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nfe_products (
        id VARCHAR(255) PRIMARY KEY,
        import_history_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255),
        nfe_code VARCHAR(255),
        code VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price VARCHAR(255),
        unit VARCHAR(50),
        total_value VARCHAR(255),
        nfe_data JSONB,
        FOREIGN KEY (import_history_id) REFERENCES import_history(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    console.log('✅ Tabela nfe_products criada');

    console.log('🎉 Todas as tabelas criadas com sucesso!');

    // Inserir categorias padrão
    console.log('📦 Inserindo categorias padrão...');
    const defaultCategories = [
      { id: 'limpeza', name: 'Produtos de Limpeza', type: 'limpeza', description: 'Produtos para limpeza e higienização' },
      { id: 'ferramenta', name: 'Ferramentas', type: 'ferramenta', description: 'Ferramentas manuais e elétricas' },
      { id: 'insumo', name: 'Insumos', type: 'insumo', description: 'Matérias-primas e insumos para produção' },
      { id: 'equipamento', name: 'Equipamentos', type: 'equipamento', description: 'Máquinas e equipamentos' },
      { id: 'material', name: 'Materiais', type: 'material', description: 'Materiais diversos' },
      { id: 'outros', name: 'Outros', type: 'outros', description: 'Outros tipos de produtos' }
    ];

    for (const category of defaultCategories) {
      await db.execute(`
        INSERT INTO categories (id, name, type, description) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
      `, [category.id, category.name, category.type, category.description]);
    }
    console.log('✅ Categorias padrão inseridas');

    // Criar usuário admin padrão
    console.log('👤 Criando usuário admin padrão...');
    await db.execute(`
      INSERT INTO users (id, username, password, name, email, tipo, role, email_verificado) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
    `, ['admin-123', 'admin', 'admin123', 'Administrador', 'admin@stockmaster.com', 'individual', 'super_admin', true]);
    console.log('✅ Usuário admin criado');

    console.log('🎉 Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Executar migração se este arquivo for executado diretamente
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('🚀 Migração executada com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro ao executar migração:', error);
      process.exit(1);
    });
}

export { migrate };