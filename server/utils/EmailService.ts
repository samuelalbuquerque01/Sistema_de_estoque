// server/utils/EmailService.ts - VERSÃO COM RESEND
import { Resend } from 'resend';

export class EmailService {
  private static resend: Resend | null = null;
  private static initialized: boolean = false;

  static initialize() {
    if (this.initialized) return;

    console.log('📧 ========== INICIALIZANDO RESEND ==========');
    
    // Obter API key do Resend (vamos configurar depois)
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.log('❌ RESEND_API_KEY não configurada');
      console.log('💡 Configure em: https://resend.com');
      console.log('💡 Use a chave: re_123456789...');
      this.resend = null;
    } else {
      this.resend = new Resend(resendApiKey);
      console.log('✅ Resend inicializado com sucesso!');
    }
    
    this.initialized = true;
  }

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      console.log(`\n📨 ========== ENVIANDO EMAIL REAL ==========`);
      console.log(`📨 Para: ${email}`);
      console.log(`👤 Nome: ${nome}`);
      
      if (!this.initialized) {
        this.initialize();
      }

      const verificationUrl = `https://npc-6rcx.onrender.com/verificar-email?token=${token}`;

      // Se Resend não está configurado, mostrar instruções
      if (!this.resend) {
        console.log('❌ Resend não configurado');
        console.log('💡 PARA CONFIGURAR:');
        console.log('   1. Acesse: https://resend.com');
        console.log('   2. Crie uma conta gratuita');
        console.log('   3. Vá em API Keys e crie uma nova chave');
        console.log('   4. No Render, adicione: RESEND_API_KEY=sua_chave_aqui');
        console.log('   5. Adicione seu email em "Domains" no Resend');
        console.log(`🔗 Link de verificação: ${verificationUrl}`);
        return false;
      }

      console.log('📤 Enviando via Resend...');
      
      const { data, error } = await this.resend.emails.send({
        from: 'Neuropsicocentro <noreply@neuropsicocentro.com>',
        to: [email],
        subject: 'Verifique seu email - Neuropsicocentro',
        html: this.getVerificationEmailHtml(nome, verificationUrl),
      });

      if (error) {
        console.error('❌ Erro do Resend:', error);
        return false;
      }

      console.log('✅ EMAIL ENVIADO COM SUCESSO VIA RESEND!');
      console.log('✅ ID:', data?.id);
      console.log('✅ Para:', email);
      
      return true;

    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }

  static async enviarEmailBoasVindas(email: string, nome: string): Promise<boolean> {
    try {
      console.log(`\n🎉 Enviando boas-vindas para: ${email}`);
      
      if (!this.resend) {
        console.log('❌ Resend não configurado');
        return false;
      }

      const { data, error } = await this.resend.emails.send({
        from: 'Neuropsicocentro <noreply@neuropsicocentro.com>',
        to: [email],
        subject: 'Bem-vindo ao Neuropsicocentro!',
        html: this.getWelcomeEmailHtml(nome),
      });

      if (error) {
        console.error('❌ Erro ao enviar boas-vindas:', error);
        return false;
      }

      console.log('✅ Boas-vindas enviadas!');
      return true;

    } catch (error) {
      console.error('❌ Erro boas-vindas:', error);
      return false;
    }
  }

  static getVerificationEmailHtml(nome: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            background: #f6f9fc; 
            padding: 20px; 
            margin: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 40px 30px; 
            text-align: center; 
            color: white; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .button { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 15px 35px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            font-size: 16px;
            margin: 20px 0;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Neuropsicocentro</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Gestão de Estoque Inteligente</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Olá, ${nome}!</h2>
            
            <p style="color: #555; line-height: 1.6; font-size: 16px;">
              Obrigado por se cadastrar no <strong>Neuropsicocentro</strong>. 
              Para ativar sua conta, clique no botão abaixo:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">
                Verificar Meu Email
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Este link expira em 24 horas.</strong><br>
                Se você não criou esta conta, ignore este email.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">&copy; 2024 Neuropsicocentro. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getWelcomeEmailHtml(nome: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Bem-vindo ao Neuropsicocentro!</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #333;">Olá, ${nome}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Sua conta foi ativada com sucesso! 🎉<br>
            Agora você pode acessar todas as funcionalidades.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://npc-6rcx.onrender.com" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Acessar Minha Conta
            </a>
          </div>
        </div>
      </div>
    `;
  }

  static getStatus() {
    return {
      service: 'resend',
      initialized: this.initialized,
      configured: !!process.env.RESEND_API_KEY,
      timestamp: new Date().toISOString()
    };
  }
}