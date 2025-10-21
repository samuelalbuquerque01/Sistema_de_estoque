// server/utils/EmailService.ts - VERSÃO FUNCIONAL
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

      // ✅ LISTA DE EMAILS AUTORIZADOS (só esses funcionam durante testes)
      const authorizedEmails = [
        'samuel_albuquerque_f@hotmail.com',
        'ti@neuropsicocentro.com.br',
        'seuemail@gmail.com' // adicione outros se precisar
      ];

      // Verificar se o email está autorizado
      if (!authorizedEmails.includes(email)) {
        console.log(`❌ Email ${email} não autorizado para testes`);
        console.log(`💡 Use um destes: ${authorizedEmails.join(', ')}`);
        return false;
      }

      console.log(`✅ Email autorizado: ${email}`);

      // SEMPRE usar onboarding@resend.dev (único que funciona em testes)
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
                <strong>Link alternativo:</strong><br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px;">
              <p style="margin: 0;">&copy; 2024 Neuropsicocentro</p>
            </div>
          </div>
        `,
      });

      if (error) {
        console.log('❌ Erro ao enviar:', error.message);
        return false;
      }

      console.log('✅ EMAIL ENVIADO COM SUCESSO!');
      console.log('✅ Para:', email);
      return true;

    } catch (error) {
      console.log('❌ Erro crítico:', error);
      return false;
    }
  }

  static async enviarEmailBoasVindas(email: string, nome: string): Promise<boolean> {
    try {
      const authorizedEmails = [
        'samuel_albuquerque_f@hotmail.com',
        'ti@neuropsicocentro.com.br'
      ];

      if (!authorizedEmails.includes(email)) {
        console.log(`❌ Email não autorizado para boas-vindas: ${email}`);
        return false;
      }

      await this.resend.emails.send({
        from: 'Neuropsicocentro <onboarding@resend.dev>',
        to: email,
        subject: 'Bem-vindo ao Neuropsicocentro! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Bem-vindo, ${nome}!</h2>
            <p>Sua conta foi ativada com sucesso no Neuropsicocentro!</p>
            <p>🎉 Agora você pode acessar todas as funcionalidades do sistema.</p>
            <a href="https://npc-6rcx.onrender.com" 
               style="background: #667eea; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Acessar Sistema
            </a>
          </div>
        `,
      });

      console.log(`✅ Boas-vindas enviadas para: ${email}`);
      return true;

    } catch (error) {
      console.log('❌ Erro nas boas-vindas:', error);
      return false;
    }
  }

  static getStatus() {
    return {
      service: 'resend',
      status: 'ativo_em_modo_teste',
      authorized_emails: [
        'samuel_albuquerque_f@hotmail.com',
        'ti@neuropsicocentro.com.br'
      ],
      note: 'Domínio em verificação - use emails autorizados'
    };
  }
}