CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verificacoes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"tipo" text NOT NULL,
	"expira_em" timestamp NOT NULL,
	"utilizado" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "email_verificacoes_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "empresas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"cnpj" text NOT NULL,
	"email" text NOT NULL,
	"telefone" text NOT NULL,
	"website" text,
	"cep" text NOT NULL,
	"logradouro" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"status" text DEFAULT 'pendente' NOT NULL,
	"data_aprovacao" timestamp,
	"plano" text DEFAULT 'starter' NOT NULL,
	"data_expiracao" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "empresas_cnpj_unique" UNIQUE("cnpj"),
	CONSTRAINT "empresas_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "import_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"status" text DEFAULT 'processando' NOT NULL,
	"products_found" integer DEFAULT 0,
	"products_created" integer DEFAULT 0,
	"products_updated" integer DEFAULT 0,
	"supplier" text,
	"supplier_cnpj" text,
	"supplier_address" text,
	"nfe_number" text,
	"nfe_key" text,
	"emission_date" timestamp,
	"total_value" numeric(10, 2) DEFAULT '0',
	"user_id" varchar,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inventories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'em_andamento' NOT NULL,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "inventory_counts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" varchar,
	"product_id" varchar,
	"expected_quantity" integer NOT NULL,
	"counted_quantity" integer NOT NULL,
	"difference" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "movements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"user_id" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nfe_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_history_id" varchar,
	"access_key" text NOT NULL,
	"document_number" text NOT NULL,
	"supplier" json NOT NULL,
	"emission_date" timestamp NOT NULL,
	"total_value" numeric(10, 2) NOT NULL,
	"xml_content" text,
	"raw_data" json,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "nfe_data_access_key_unique" UNIQUE("access_key")
);
--> statement-breakpoint
CREATE TABLE "nfe_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_history_id" varchar,
	"product_id" varchar,
	"nfe_code" text NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2),
	"unit" text,
	"total_value" numeric(10, 2),
	"nfe_data" json
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"category_id" varchar,
	"location_id" varchar,
	"quantity" integer DEFAULT 0 NOT NULL,
	"min_quantity" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric(10, 2),
	"description" text,
	"type" text NOT NULL,
	CONSTRAINT "products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"format" text NOT NULL,
	"filters" json,
	"generated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"file_path" text,
	"file_size" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"tipo" text DEFAULT 'individual' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"empresa_id" varchar,
	"email_verificado" boolean DEFAULT false,
	"token_verificacao" text,
	"data_verificacao" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "email_verificacoes" ADD CONSTRAINT "email_verificacoes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_history" ADD CONSTRAINT "import_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_counts" ADD CONSTRAINT "inventory_counts_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_counts" ADD CONSTRAINT "inventory_counts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfe_data" ADD CONSTRAINT "nfe_data_import_history_id_import_history_id_fk" FOREIGN KEY ("import_history_id") REFERENCES "public"."import_history"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfe_products" ADD CONSTRAINT "nfe_products_import_history_id_import_history_id_fk" FOREIGN KEY ("import_history_id") REFERENCES "public"."import_history"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfe_products" ADD CONSTRAINT "nfe_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;