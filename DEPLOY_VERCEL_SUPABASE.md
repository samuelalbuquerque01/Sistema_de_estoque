# Deploy no Vercel com Supabase

## 1. Criar o banco no Supabase

1. Crie um projeto no Supabase.
2. Em `Connect`, copie:
   - a URL do pooler para o app (`DATABASE_URL`)
   - a URL de migracao (`DATABASE_URL_MIGRATION`)
3. No seu computador, crie um `.env` a partir do `.env.example`.
4. Rode a criacao das tabelas:

```bash
npm.cmd run db:push
```

## 2. Variaveis no Vercel

Cadastre no projeto:

- `DATABASE_URL`
- `APP_URL`
- `JWT_SECRET`
- `RESEND_API_KEY` (opcional, mas necessario para envio real de email)
- `EMAIL_FROM`
- `SEFAZ_AMBIENTE`
- `SEFAZ_CNPJ` ou `SEFAZ_CPF`
- `SEFAZ_CERT_PFX_BASE64` e `SEFAZ_CERT_PFX_PASSPHRASE`

Se usar certificado separado:

- `SEFAZ_CERT_CRT_BASE64`
- `SEFAZ_CERT_KEY_BASE64`
- `SEFAZ_CERT_CA_BASE64`

## 3. Como gerar Base64 do certificado

### PFX

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\caminho\certificado.pfx"))
```

### CRT / KEY / CA

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\caminho\arquivo.crt"))
```

## 4. Deploy

```bash
vercel
vercel --prod
```

## 5. URL publica

Depois do primeiro deploy em producao, atualize:

- `APP_URL=https://seu-projeto.vercel.app`

Se usar verificacao por email, faca um redeploy depois dessa mudanca.
