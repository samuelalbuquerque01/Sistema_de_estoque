import { db } from "./db";

const typedTables = [
  {
    itemType: "produto",
    tableName: "general_products",
  },
  {
    itemType: "equipamento",
    tableName: "equipment_products",
  },
  {
    itemType: "insumo",
    tableName: "supply_products",
  },
  {
    itemType: "ferramenta",
    tableName: "tool_products",
  },
  {
    itemType: "limpeza",
    tableName: "cleaning_products",
  },
] as const;

async function run(sql: string) {
  await db.execute(sql);
}

async function createTypedTable(tableName: string) {
  await run(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      product_id TEXT PRIMARY KEY REFERENCES products(id),
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id),
      location_id TEXT REFERENCES locations(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      min_quantity INTEGER NOT NULL DEFAULT 0,
      unit_price TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function syncTypedTable(tableName: string, itemType: string) {
  await run(`
    INSERT INTO ${tableName} (
      product_id,
      code,
      name,
      category_id,
      location_id,
      quantity,
      min_quantity,
      unit_price,
      description,
      created_at
    )
    SELECT
      id,
      code,
      name,
      category_id,
      location_id,
      quantity,
      min_quantity,
      unit_price,
      description,
      created_at
    FROM products
    WHERE item_type = '${itemType}'
    ON CONFLICT (product_id) DO UPDATE SET
      code = EXCLUDED.code,
      name = EXCLUDED.name,
      category_id = EXCLUDED.category_id,
      location_id = EXCLUDED.location_id,
      quantity = EXCLUDED.quantity,
      min_quantity = EXCLUDED.min_quantity,
      unit_price = EXCLUDED.unit_price,
      description = EXCLUDED.description,
      created_at = EXCLUDED.created_at
  `);
}

export async function migrate() {
  console.log("Verificando/Criando tabelas do banco de dados...");

  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )`,
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
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        item_type TEXT NOT NULL DEFAULT 'produto',
        category_id TEXT REFERENCES categories(id),
        location_id TEXT REFERENCES locations(id),
        quantity INTEGER NOT NULL DEFAULT 0,
        min_quantity INTEGER NOT NULL DEFAULT 0,
        unit_price TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        product_id TEXT REFERENCES products(id),
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        user_id TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS inventories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'em_andamento',
        user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS inventory_counts (
        id TEXT PRIMARY KEY,
        inventory_id TEXT NOT NULL REFERENCES inventories(id),
        product_id TEXT NOT NULL REFERENCES products(id),
        counted_quantity INTEGER NOT NULL,
        difference INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
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
      `CREATE TABLE IF NOT EXISTS email_verificacoes (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        email TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        tipo TEXT NOT NULL,
        utilizado BOOLEAN DEFAULT FALSE,
        expira_em TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
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
      )`,
    ];

    for (const statement of tables) {
      await run(statement);
    }

    await run(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT`);
    await run(`ALTER TABLE products ADD COLUMN IF NOT EXISTS item_type TEXT`);
    await run(`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

    await run(`
      UPDATE products AS p
      SET item_type = c.type
      FROM categories AS c
      WHERE p.category_id = c.id
        AND (p.item_type IS NULL OR p.item_type = '')
    `);
    await run(`UPDATE products SET item_type = 'produto' WHERE item_type IS NULL OR item_type = ''`);

    for (const typedTable of typedTables) {
      await createTypedTable(typedTable.tableName);
    }

    const categoriesData = [
      ["produto-geral", "Produtos Gerais", "produto", "Categoria padrao para produtos"],
      ["equipamento-geral", "Equipamentos Gerais", "equipamento", "Categoria padrao para equipamentos"],
      ["insumo-geral", "Insumos Gerais", "insumo", "Categoria padrao para insumos"],
      ["ferramenta-geral", "Ferramentas Gerais", "ferramenta", "Categoria padrao para ferramentas"],
      ["limpeza-geral", "Materiais de Limpeza", "limpeza", "Categoria padrao para limpeza"],
    ];

    for (const [id, name, type, description] of categoriesData) {
      await run(`
        INSERT INTO categories (id, name, type, description)
        VALUES ('${id}', '${name}', '${type}', '${description}')
        ON CONFLICT (id) DO NOTHING
      `);
    }

    for (const typedTable of typedTables) {
      await syncTypedTable(typedTable.tableName, typedTable.itemType);
    }

    await run(`
      INSERT INTO users (
        id,
        username,
        password,
        name,
        email,
        tipo,
        role,
        email_verificado
      )
      VALUES (
        'admin-123',
        'admin',
        'admin123',
        'Administrador',
        'admin@neuropsicocentro.com',
        'individual',
        'super_admin',
        TRUE
      )
      ON CONFLICT (email) DO NOTHING
    `);

    console.log("Migracao concluida com sucesso!");
  } catch (error) {
    console.error("Erro na migracao:", error);
  }
}
