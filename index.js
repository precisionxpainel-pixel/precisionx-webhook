import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({
    ok: true,
    message: "Webhook PrecisionX ativo 🚀 (use POST para testes).",
  });
});

app.post("/", async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event !== "purchase_approved") {
      return res.status(200).json({ ok: true, message: "Evento ignorado." });
    }

    const customerEmail = data?.customer?.email;
    const productName = data?.product?.name || "Produto PrecisionX";

    if (!customerEmail) {
      return res.status(400).json({ error: "E-mail do cliente não encontrado." });
    }

    // Configuração do envio de e-mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"PrecisionX" <${process.env.EMAIL_FROM}>`,
      to: customerEmail,
      subject: `🎉 Acesso liberado: ${productName}`,
      html: `
        <div style="font-family: Arial; color: #333;">
          <h2>🎉 Seu acesso foi liberado!</h2>
          <p>Olá, ${data.customer.name || "aluno"}!</p>
          <p>O produto <strong>${productName}</strong> já está disponível pra você.</p>
          <p>👉 <a href="https://precisionxpainel.vercel.app" style="color:#e91e63;">Clique aqui para acessar sua área de membros.</a></p>
          <br/>
          <p>Um abraço,<br/>Equipe PrecisionX 💖</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("📩 E-mail enviado para:", customerEmail);

    return res.status(200).json({
      ok: true,
      message: "E-mail enviado com sucesso.",
      email: customerEmail,
    });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.listen(3000, () => console.log("Servidor PrecisionX rodando na Vercel 🚀"));

export default app;

