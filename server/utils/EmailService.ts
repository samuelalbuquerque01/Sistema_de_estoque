// server/utils/EmailService.ts - VERSÃO COMPLETA CORRIGIDA
import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter;

  static initialize() {
    console.log('🔧 Inicializando serviço de email...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '***' : 'NÃO CONFIGURADO');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Variáveis de email não configuradas no .env');
      return;
    }

    // 🔥 CORREÇÃO: createTransport (sem "er" no final)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verificar configuração
    this.transporter.verify((error) => {
      if (error) {
        console.error('❌ Erro na configuração de email:', error);
      } else {
        console.log('✅ Serviço de email configurado com sucesso!');
      }
    });
  }

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      console.log(`📧 Tentando enviar email para: ${email}`);
      
      if (!this.transporter) {
        console.error('❌ Transporter não inicializado');
        return false;
      }

      const verificationUrl = `${process.env.APP_URL}/verificar-email?token=${token}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: '✅ Verifique seu email - StockMaster',
        html: `
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
              .code { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 5px; 
                font-family: 'Courier New', monospace;
                word-break: break-all;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">StockMaster</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Controle Inteligente de Estoque</p>
              </div>
              
              <div class="content">
                <h2 style="color: #333; margin-bottom: 20px;">Olá, ${nome}!</h2>
                
                <p style="color: #555; line-height: 1.6; font-size: 16px;">
                  Obrigado por se cadastrar no <strong>StockMaster</strong>. 
                  Para ativar sua conta e começar a gerenciar seu estoque, 
                  clique no botão abaixo para verificar seu email:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" class="button">
                    ✅ Verificar Meu Email
                  </a>
                </div>
                
                <p style="color: #555; font-size: 14px;">
                  <strong>Link de verificação:</strong><br>
                  <div class="code">${verificationUrl}</div>
                </p>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #856404; font-size: 14px;">
                    ⚠️ <strong>Este link expira em 24 horas.</strong><br>
                    Se você não criou esta conta, ignore este email.
                  </p>
                </div>
                
                <p style="color: #777; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                  Precisa de ajuda? <a href="mailto:suporte@stockmaster.com" style="color: #667eea;">Entre em contato com nosso suporte</a>.
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 0;">&copy; 2025 StockMaster. Todos os direitos reservados.</p>
                <p style="margin: 5px 0 0 0;">Este é um email automático, por favor não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      console.log('📤 Enviando email...');
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado com sucesso! Message ID: ${result.messageId}`);
      console.log(`🔗 Link de verificação: ${verificationUrl}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      
      // Fallback: log do link para desenvolvimento
      const verificationUrl = `${process.env.APP_URL}/verificar-email?token=${token}`;
      console.log(`🔗 Link de verificação (fallback): ${verificationUrl}`);
      
      return false;
    }
  }

  static async enviarEmailBoasVindas(email: string, nome: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: '🎉 Bem-vindo ao StockMaster! Sua conta foi ativada',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; background: #f6f9fc; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
              .content { padding: 40px 30px; }
              .feature { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo ao StockMaster!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Sua conta foi ativada com sucesso</p>
              </div>
              <div class="content">
                <h2 style="color: #333;">Olá, ${nome}!</h2>
                <p style="color: #555; line-height: 1.6;">
                  Sua conta foi verificada com sucesso e já está pronta para uso! 
                  Agora você pode acessar todas as funcionalidades do StockMaster.
                </p>
                
                <h3 style="color: #333; margin-top: 30px;">📦 O que você pode fazer agora:</h3>
                
                <div class="feature">
                  <strong>🏠 Dashboard Completo</strong><br>
                  Acompanhe métricas importantes do seu estoque em tempo real
                </div>
                
                <div class="feature">
                  <strong>📊 Relatórios Avançados</strong><br>
                  Gere relatórios detalhados em PDF e Excel
                </div>
                
                <div class="feature">
                  <strong>📄 Importação de NFe</strong><br>
                  Importe notas fiscais automaticamente
                </div>
                
                <div class="feature">
                  <strong>🔔 Alertas Inteligentes</strong><br>
                  Receba alertas de estoque baixo automaticamente
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.APP_URL}" class="button">
                    🚀 Acessar Minha Conta
                  </a>
                </div>
                
                <p style="color: #777; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                  Precisa de ajuda? Consulte nossa <a href="${process.env.APP_URL}/ajuda" style="color: #667eea;">documentação</a> 
                  ou entre em contato com nosso suporte.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de boas-vindas enviado para: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
      return false;
    }
  }
}