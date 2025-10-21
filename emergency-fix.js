// emergency-fix.js - CRIA TABELAS MANUALMENTE
import postgres from 'postgres';

const databaseUrl = "postgresql://stockmaster_db_0z0s_user:oGpLhnVlcOfnVI38QTNsYFl73xyqnwBr@dpg-d3r6i949c44c73d82c70-a.oregon-postgres.render.com:5432/stockmaster_db_0z0s";

const sql = postgres(databaseUrl, {
  ssl: { rejectUnauthorized: false },
  idle_timeout: 20
});

async function createTables() {
  try {
    console.log('Conectando ao banco...');
    
    // 1. Cria tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        tipo TEXT DEFAULT 'individual',
        role TEXT DEFAULT 'user',
        empresa_id TEXT,
        email_verificado BOOLEAN DEFAULT false,
        token_verificacao TEXT,
        data_verificacao TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('Tabela users criada!');
    
    // 2. Cria tabela de categorias
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT
      )
    `;
    console.log('Tabela categories criada!');
    
    // 3. Cria usuário admin
    await sql`
      INSERT INTO users (id, username, password, name, email, role, email_verificado)
      VALUES ('admin-123', 'admin', 'admin123', 'Administrador', 'admin@neuropsicocentro.com', 'super_admin', true)
      ON CONFLICT (email) DO NOTHING
    `;
    console.log('Usuário admin criado!');
    
    // 4. Cria categorias padrão
    const defaultCategories = [
      ['limpeza', 'Produtos de Limpeza', 'limpeza', 'Produtos para limpeza e higienização'],
      ['ferramenta', 'Ferramentas', 'ferramenta', 'Ferramentas manuais e elétricas'],
      ['insumo', 'Insumos', 'insumo', 'Matérias-primas e insumos para produção'],
      ['equipamento', 'Equipamentos', 'equipamento', 'Máquinas e equipamentos'],
      ['material', 'Materiais', 'material', 'Materiais diversos'],
      ['outros', 'Outros', 'outros', 'Outros tipos de produtos']
    ];
    
    for (const [id, name, type, description] of defaultCategories) {
      await sql`
        INSERT INTO categories (id, name, type, description)
        VALUES (${id}, ${name}, ${type}, ${description})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log('Categorias padrão criadas!');
    
    console.log('BANCO CONFIGURADO COM SUCESSO!');
    console.log('Login: admin@neuropsicocentro.com');
    console.log('Senha: admin123');
    
  } catch (error) {
    console.error('ERRO:', error);
  } finally {
    await sql.end();
  }
}

createTables();