const express = require('express');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Cria a tabela na primeira execução, caso ainda não exista.
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recados (
      id SERIAL PRIMARY KEY,
      autor VARCHAR(100) NOT NULL,
      mensagem TEXT NOT NULL,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

function layout(conteudo) {
  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mural de Recados</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 16px; background: #f5f5f7; color: #1d1d1f; }
    h1 { font-size: 1.6rem; }
    form { display: flex; flex-direction: column; gap: 8px; background: #fff; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.1); margin-bottom: 24px; }
    input, textarea { font: inherit; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    button { font: inherit; padding: 10px; border: none; border-radius: 4px; background: #0071e3; color: #fff; cursor: pointer; }
    button:hover { background: #0060c2; }
    .recado { background: #fff; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .recado .autor { font-weight: 600; }
    .recado .data { font-size: .8rem; color: #6e6e73; }
    .vazio { color: #6e6e73; text-align: center; }
    footer { margin-top: 32px; font-size: .75rem; color: #999; text-align: center; }
  </style>
</head>
<body>
  <h1>📌 Mural de Recados</h1>
  ${conteudo}
  <footer>Trabalho avaliativo — Docker e GitHub — Computação em Nuvem</footer>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, autor, mensagem, criado_em FROM recados ORDER BY criado_em DESC'
    );

    const lista = rows.length
      ? rows.map((r) => `
        <div class="recado">
          <div class="autor">${escapeHtml(r.autor)}</div>
          <div>${escapeHtml(r.mensagem)}</div>
          <div class="data">${new Date(r.criado_em).toLocaleString('pt-BR')}</div>
        </div>`).join('\n')
      : '<p class="vazio">Nenhum recado ainda. Seja o primeiro a deixar um!</p>';

    res.send(layout(`
      <form method="POST" action="/recados">
        <input type="text" name="autor" placeholder="Seu nome" maxlength="100" required>
        <textarea name="mensagem" placeholder="Escreva seu recado..." rows="3" required></textarea>
        <button type="submit">Publicar recado</button>
      </form>
      ${lista}
    `));
  } catch (err) {
    next(err);
  }
});

app.post('/recados', async (req, res, next) => {
  try {
    const { autor, mensagem } = req.body;
    if (!autor || !mensagem) {
      return res.status(400).send('Nome e mensagem são obrigatórios.');
    }
    await pool.query(
      'INSERT INTO recados (autor, mensagem) VALUES ($1, $2)',
      [autor, mensagem]
    );
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Usado pelo healthcheck do próprio container, se necessário.
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Mural de recados rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao inicializar o banco de dados:', err);
    process.exit(1);
  });
