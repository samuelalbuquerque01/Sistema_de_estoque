// server/utils/EmailService.ts - VERSÃO COMPLETA CORRIGIDA
import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static initialized: boolean = false;

  static initialize() {
    if (this.initialized) {
      return;
    }

    console.log('📧 ========== INICIALIZANDO SERVIÇO DE EMAIL ==========');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ Não configurado');
    console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configurado' : '❌ Não configurado');
    console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM || 'Usando padrão');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Variáveis de email não configuradas - usando modo simulação');
      this.transporter = null;
      this.initialized = true;
      return;
    }

    try {
      console.log('🔧 Configurando transporter com configurações otimizadas...');
      
      const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
      
      // CONFIGURAÇÃO OTIMIZADA PARA RENDER
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanPassword,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        logger: false,
        debug: false
      });

      console.log('🔍 Testando conexão com Gmail...');
      
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Falha na verificação:', error.message);
          console.log('🔄 Tentando configuração alternativa...');
          this.setupAlternativeConfig();
        } else {
          console.log('✅ Conexão com Gmail estabelecida com sucesso!');
          this.initialized = true;
        }
      });
      
    } catch (error) {
      console.error('❌ Erro na configuração principal:', error);
      this.setupAlternativeConfig();
    }
  }

  static setupAlternativeConfig() {
    try {
      console.log('🔄 Configurando com porta 465 (SSL)...');
      
      const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanPassword,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000
      });

      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Também falhou na porta 465:', error.message);
          console.log('💡 Inicializando sem verificação...');
          this.initialized = true;
        } else {
          console.log('✅ Sucesso na porta 465!');
          this.initialized = true;
        }
      });
      
    } catch (error) {
      console.error('❌ Erro na configuração alternativa:', error);
      this.initialized = true;
    }
  }

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      console.log(`\n📨 ========== TENTANDO ENVIAR EMAIL ==========`);
      console.log(`📨 Para: ${email}`);
      console.log(`👤 Nome: ${nome}`);
      
      if (!this.initialized) {
        this.initialize();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const verificationUrl = `${process.env.APP_URL || 'https://npc-6rcx.onrender.com'}/verificar-email?token=${token}`;
      
      console.log(`🔗 URL de verificação: ${verificationUrl}`);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Neuropsicocentro <yagami00034@gmail.com>',
        to: email,
        subject: 'Verifique seu email - Neuropsicocentro',
        html: this.getVerificationEmailHtml(nome, verificationUrl),
      };

      // Tentar enviar mesmo se o transporter não estiver verificado
      if (!this.transporter) {
        console.log('🔄 Criando transporter direto para envio...');
        await this.createDirectTransporter();
      }

      if (this.transporter) {
        console.log('📤 Enviando email através do Gmail...');
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`✅ EMAIL ENVIADO COM SUCESSO!`);
        console.log(`✅ Para: ${email}`);
        console.log(`✅ Message ID: ${info.messageId}`);
        return true;
      } else {
        console.log('❌ Não foi possível criar transporter para envio');
        return false;
      }
      
    } catch (error) {
      console.error('❌ ERRO AO ENVIAR EMAIL:');
      console.error(`❌ Para: ${email}`);
      
      if (error instanceof Error) {
        console.error(`❌ Mensagem: ${error.message}`);
        
        if (error.message.includes('Invalid login')) {
          console.error('🔐 PROBLEMA: Credenciais inválidas');
        } else if (error.message.includes('Connection timeout')) {
          console.error('⏰ PROBLEMA: Timeout na conexão - Render pode estar bloqueando');
          console.log('💡 DICA: Tente usar Resend ou SendGrid como alternativa');
        }
      }
      
      return false;
    }
  }

  static async createDirectTransporter(): Promise<boolean> {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return false;

      const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
      
      // Tentar configuração direta sem verificação
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: cleanPassword,
        },
        connectionTimeout: 10000,
        socketTimeout: 10000
      });

      console.log('✅ Transporter direto criado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar transporter direto:', error);
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
            <h1 style="margin: 0; font-size: 28px;">Neuropsicocentro</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Gestão de Estoque Inteligente</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Olá, ${nome}!</h2>
            
            <p style="color: #555; line-height: 1.6; font-size: 16px;">
              Obrigado por se cadastrar no <strong>Neuropsicocentro</strong>. 
              Para ativar sua conta e começar a gerenciar seu estoque, 
              clique no botão abaixo para verificar seu email:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">
                Verificar Meu Email
              </a>
            </div>
            
            <p style="color: #555; font-size: 14px;">
              <strong>Link de verificação:</strong><br>
              <div class="code">${verificationUrl}</div>
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Este link expira em 24 horas.</strong><br>
                Se você não criou esta conta, ignore este email.
              </p>
            </div>
            
            <p style="color: #777; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
              Precisa de ajuda? Entre em contato com nosso suporte.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">&copy; 2024 Neuropsicocentro. Todos os direitos reservados.</p>
            <p style="margin: 5px 0 0 0;">Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static async enviarEmailBoasVindas(email: string, nome: string): Promise<boolean> {
    try {
      console.log(`\n🎉 Enviando email de boas-vindas para: ${email}`);
      
      if (!this.initialized) {
        this.initialize();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!this.transporter) {
        await this.createDirectTransporter();
      }

      if (this.transporter) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'Neuropsicocentro <yagami00034@gmail.com>',
          to: email,
          subject: 'Bem-vindo ao Neuropsicocentro! Sua conta foi ativada',
          html: this.getWelcomeEmailHtml(nome),
        };

        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email de boas-vindas enviado para: ${email}`);
        return true;
      }
      
      return false;

    } catch (error) {
      console.error('❌ Erro ao enviar email de boas-vindas:', error);
      return false;
    }
  }

  static getWelcomeEmailHtml(nome: string): string {
    return `
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
            <h1 style="margin: 0; font-size: 28px;">Bem-vindo ao Neuropsicocentro!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sua conta foi ativada com sucesso</p>
          </div>
          <div class="content">
            <h2 style="color: #333;">Olá, ${nome}!</h2>
            <p style="color: #555; line-height: 1.6;">
              Sua conta foi verificada com sucesso e já está pronta para uso! 
              Agora você pode acessar todas as funcionalidades do Neuropsicocentro.
            </p>
            
            <h3 style="color: #333; margin-top: 30px;">O que você pode fazer agora:</h3>
            
            <div class="feature">
              <strong>📊 Dashboard Completo</strong><br>
              Acompanhe métricas importantes do seu estoque em tempo real
            </div>
            
            <div class="feature">
              <strong>📈 Relatórios Avançados</strong><br>
              Gere relatórios detalhados em PDF e Excel
            </div>
            
            <div class="feature">
              <strong>📥 Importação de NFe</strong><br>
              Importe notas fiscais automaticamente
            </div>
            
            <div class="feature">
              <strong>⚠️ Alertas Inteligentes</strong><br>
              Receba alertas de estoque baixo automaticamente
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL || 'https://npc-6rcx.onrender.com'}" class="button">
                Acessar Minha Conta
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getStatus() {
    return {
      initialized: this.initialized,
      transporterAvailable: !!this.transporter,
      emailUser: process.env.EMAIL_USER ? 'Configurado' : 'Não configurado',
      emailPass: process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado',
      emailFrom: process.env.EMAIL_FROM || 'Não configurado'
    };
  }
}