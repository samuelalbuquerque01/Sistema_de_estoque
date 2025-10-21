// server/utils/EmailService.ts - VERSÃO TEMPORÁRIA
import { Resend } from 'resend';

export class EmailService {
  private static resend = new Resend('re_WzzvDZ3x_8fWjhkgnTwpvbHRYfYZF629m');

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      console.log(`📨 ========== ENVIANDO EMAIL ==========`);
      console.log(`📨 Para: ${email}`);
      
      const verificationUrl = `https://npc-6rcx.onrender.com/verificar-email?token=${token}`;

      // TENTAR COM DOMÍNIO DO RESEND (funciona sempre)
      const { error } = await this.resend.emails.send({
        from: 'Neuropsicocentro <onboarding@resend.dev>',
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
              Ou copie este link:<br>
              ${verificationUrl}
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Erro ao enviar email:', error);
        return false;
      }

      console.log('✅ EMAIL ENVIADO COM SUCESSO!');
      console.log('✅ Usando: onboarding@resend.dev');
      return true;

    } catch (error) {
      console.error('❌ Erro crítico:', error);
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
      domain: 'neuropsicocentro.com (aguardando DNS)',
      fallback: 'onboarding@resend.dev (ativo)'
    };
  }
}