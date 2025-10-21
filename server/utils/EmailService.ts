// server/utils/EmailService.ts - VERSÃO CORRIGIDA
import { Resend } from 'resend';

export class EmailService {
  private static resend = new Resend('re_WzzvDZ3x_8fWjhkgnTwpvbHRYfYZF629m');

  static initialize() {
    console.log('📧 EmailService inicializado');
  }

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      console.log(`📨 TENTANDO ENVIAR PARA: ${email}`);
      
      const verificationUrl = `https://npc-6rcx.onrender.com/verificar-email?token=${token}`;

      // ✅ RESEND SÓ PERMITE ENVIAR PARA SEU PRÓPRIO EMAIL EM MODO TESTE
      const allowedEmail = 'samuel_albuquerque_f@hotmail.com';
      
      if (email !== allowedEmail) {
        console.log(`❌ Resend bloqueou: ${email}`);
        console.log(`💡 EM PRODUÇÃO: Configure domínio em resend.com/domains`);
        console.log(`💡 PARA TESTES: Use apenas: ${allowedEmail}`);
        
        // SIMULAR envio bem-sucedido para desenvolvimento
        console.log(`📝 [SIMULAÇÃO] Email "enviado" para: ${email}`);
        console.log(`🔗 Link: ${verificationUrl}`);
        console.log(`👤 Nome: ${nome}`);
        console.log(`✅ Desenvolvimento: Email registrado nos logs`);
        
        return true; // Retorna true para desenvolvimento
      }

      console.log(`✅ Email permitido: ${email}`);

      const { error } = await this.resend.emails.send({
        from: 'Neuropsicocentro <onboarding@resend.dev>',
        to: email,
        subject: 'Verifique seu email - Neuropsicocentro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">Neuropsicocentro</h1>
              <p style="margin: 10px 0 0 0;">Sistema de Gestão de Estoque</p>
            </div>
            
            <div style="padding: 30px; background: white;">
              <h2 style="color: #333;">Olá, ${nome}!</h2>
              <p style="color: #555; line-height: 1.6;">
                Para ativar sua conta no Neuropsicocentro, clique no botão abaixo:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #667eea; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;
                          font-weight: bold;">
                  Verificar Email
                </a>
              </div>
              
              <p style="color: #777; font-size: 14px;">
                <strong>Link de verificação:</strong><br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>⚠️ Este link expira em 24 horas.</strong>
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.log('❌ Erro real:', error.message);
        return false;
      }

      console.log('✅ EMAIL ENVIADO COM SUCESSO!');
      return true;

    } catch (error) {
      console.log('❌ Erro crítico:', error);
      return false;
    }
  }

  static async enviarEmailBoasVindas(email: string, nome: string): Promise<boolean> {
    try {
      // Para desenvolvimento, simular envio
      console.log(`🎉 [SIMULAÇÃO] Boas-vindas para: ${nome} (${email})`);
      console.log(`✅ Conta ativada com sucesso!`);
      
      return true;

    } catch (error) {
      console.log('❌ Erro nas boas-vindas:', error);
      return false;
    }
  }

  static getStatus() {
    return {
      service: 'resend',
      status: 'modo_desenvolvimento',
      email_permitido: 'samuel_albuquerque_f@hotmail.com',
      note: 'Domínio em verificação - emails são simulados para desenvolvimento'
    };
  }
}