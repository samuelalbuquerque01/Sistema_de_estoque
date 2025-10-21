// server/utils/EmailService.ts - VERSÃO CORRIGIDA
import { Resend } from 'resend';

export class EmailService {
  private static resend = new Resend('re_WzzvDZ3x_8fWjhkgnTwpvbHRYfYZF629m');

  // REMOVA o método initialize() ou deixe vazio
  static initialize() {
    console.log('📧 EmailService inicializado');
    // Não precisa fazer nada, já está configurado
  }

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      console.log(`📨 ENVIANDO EMAIL PARA: ${email}`);
      
      const verificationUrl = `https://npc-6rcx.onrender.com/verificar-email?token=${token}`;

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
              Ou copie: ${verificationUrl}
            </p>
          </div>
        `,
      });

      if (error) {
        console.log('❌ Erro:', error.message);
        return false;
      }

      console.log('✅ EMAIL ENVIADO!');
      return true;

    } catch (error) {
      console.log('❌ Erro crítico:', error);
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
      domain: 'onboarding@resend.dev'
    };
  }
}