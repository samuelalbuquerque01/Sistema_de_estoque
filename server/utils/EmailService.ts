// server/utils/EmailService.ts - VERSÃO DOMÍNIO VERIFICADO
import { Resend } from 'resend';

export class EmailService {
  private static resend = new Resend('re_WzzvDZ3x_8fWjhkgnTwpvbHRYfYZF629m');

  static initialize() {
    console.log('📧 EmailService inicializado');
  }

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      console.log(`📨 ENVIANDO EMAIL PARA: ${email}`);
      
      const verificationUrl = `https://npc-6rcx.onrender.com/verificar-email?token=${token}`;

      // VERIFICAR SE É EMAIL DE TESTE (seu hotmail)
      const isTestEmail = email === 'samuel_albuquerque_f@hotmail.com';
      
      let fromEmail = 'Neuropsicocentro <onboarding@resend.dev>';
      
      // Se NÃO for email de teste, usar domínio verificado
      if (!isTestEmail) {
        fromEmail = 'Neuropsicocentro <contato@neuropsicocentro.com.br>';
      }

      console.log(`📤 De: ${fromEmail}`);

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Verifique seu email - Neuropsicocentro',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Olá, ${nome}!</h2>
            <p>Clique no link abaixo para verificar seu email:</p>
            <a href="${verificationUrl}" 
               style="background: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verificar Email
            </a>
            <p style="margin-top: 20px; color: #666;">
              Ou copie: ${verificationUrl}
            </p>
          </div>
        `,
      });

      if (error) {
        console.log('❌ Erro:', error.message);
        
        // Se falhar com domínio verificado, tentar fallback
        if (error.message.includes('domain is not verified')) {
          console.log('🔄 Tentando fallback...');
          return await this.enviarComFallback(email, nome, token, verificationUrl);
        }
        return false;
      }

      console.log('✅ EMAIL ENVIADO!');
      return true;

    } catch (error) {
      console.log('❌ Erro crítico:', error);
      return false;
    }
  }

  static async enviarComFallback(email: string, nome: string, token: string, verificationUrl: string): Promise<boolean> {
    try {
      // Fallback: só enviar para emails autorizados
      const authorizedEmails = [
        'samuel_albuquerque_f@hotmail.com',
        'ti@neuropsicocentro.com.br'
      ];

      if (!authorizedEmails.includes(email)) {
        console.log('❌ Email não autorizado para fallback');
        return false;
      }

      const { error } = await this.resend.emails.send({
        from: 'Neuropsicocentro <onboarding@resend.dev>',
        to: email,
        subject: 'Verifique seu email - Neuropsicocentro',
        html: `<p>Olá ${nome}, <a href="${verificationUrl}">clique aqui para verificar</a></p>`,
      });

      if (error) {
        console.log('❌ Fallback também falhou:', error.message);
        return false;
      }

      console.log('✅ Email enviado via fallback!');
      return true;

    } catch (error) {
      console.log('❌ Erro no fallback:', error);
      return false;
    }
  }

  static async enviarEmailBoasVindas(email: string, nome: string): Promise<boolean> {
    try {
      await this.resend.emails.send({
        from: 'Neuropsicocentro <onboarding@resend.dev>',
        to: email,
        subject: 'Bem-vindo ao Neuropsicocentro!',
        html: `<p>Olá ${nome}, sua conta foi ativada com sucesso! 🎉</p>`,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static getStatus() {
    return {
      service: 'resend',
      configured: true,
      note: 'Use samuel_albuquerque_f@hotmail.com para testes'
    };
  }
}