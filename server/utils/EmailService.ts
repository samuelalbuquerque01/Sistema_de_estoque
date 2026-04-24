import { Resend } from "resend";

export class EmailService {
  private static getClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    return apiKey ? new Resend(apiKey) : null;
  }

  private static getBaseUrl(): string {
    const appUrl = process.env.APP_URL?.trim();
    if (appUrl) {
      return appUrl.replace(/\/$/, "");
    }

    const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (productionUrl) {
      return `https://${productionUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
    }

    const previewUrl = process.env.VERCEL_URL?.trim();
    if (previewUrl) {
      return `https://${previewUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
    }

    return "http://localhost:5173";
  }

  static initialize() {
    console.log("EmailService inicializado");
  }

  static async enviarEmailVerificacao(email: string, nome: string, token: string): Promise<boolean> {
    try {
      const verificationUrl = `${this.getBaseUrl()}/verificar-email?token=${encodeURIComponent(token)}`;
      const resend = this.getClient();

      if (!resend) {
        console.log(`[SIMULACAO] RESEND_API_KEY nao configurada. Link de verificacao para ${email}: ${verificationUrl}`);
        return true;
      }

      const from = process.env.EMAIL_FROM || "Sistema de Estoque <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from,
        to: email,
        subject: "Verifique seu email - Sistema de Estoque",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">Sistema de Estoque</h1>
              <p style="margin: 10px 0 0 0;">Sistema de Gestao de Estoque</p>
            </div>

            <div style="padding: 30px; background: white;">
              <h2 style="color: #333;">Ola, ${nome}!</h2>
              <p style="color: #555; line-height: 1.6;">
                Para ativar sua conta, clique no botao abaixo:
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
                <strong>Link de verificacao:</strong><br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>

              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>Este link expira em 24 horas.</strong>
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (error) {
        console.log("Erro ao enviar email de verificacao:", error.message);
        return false;
      }

      console.log(`Email de verificacao enviado para ${email}`);
      return true;
    } catch (error) {
      console.log("Erro critico ao enviar email de verificacao:", error);
      return false;
    }
  }

  static async enviarEmailBoasVindas(email: string, nome: string): Promise<boolean> {
    try {
      const resend = this.getClient();
      if (!resend) {
        console.log(`[SIMULACAO] Email de boas-vindas para ${nome} (${email})`);
        return true;
      }

      const from = process.env.EMAIL_FROM || "Sistema de Estoque <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from,
        to: email,
        subject: "Conta ativada com sucesso",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #222;">Conta ativada</h1>
            <p>Ola, ${nome}.</p>
            <p>Sua conta foi verificada e ja pode ser usada normalmente.</p>
            <p><a href="${this.getBaseUrl()}">Acessar o sistema</a></p>
          </div>
        `,
      });

      if (error) {
        console.log("Erro ao enviar email de boas-vindas:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.log("Erro ao enviar email de boas-vindas:", error);
      return false;
    }
  }

  static getStatus() {
    const configured = Boolean(process.env.RESEND_API_KEY);

    return {
      service: "resend",
      status: configured ? "configurado" : "simulacao",
      from: process.env.EMAIL_FROM || "Sistema de Estoque <onboarding@resend.dev>",
      baseUrl: this.getBaseUrl(),
      note: configured
        ? "Envio real habilitado via Resend."
        : "RESEND_API_KEY nao configurada; os emails sao apenas registrados no log.",
    };
  }
}
