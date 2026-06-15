export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, html, commit_message, table, limit } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const owner = 'rjfelizardo';
  const repo  = 'bridge-site';
  const file  = 'index.html';

  const ghHeaders = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  try {
    // ── Ver código atual ──────────────────────────────────────────
    if (action === 'ver_codigo') {
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, { headers: ghHeaders });
      if (!r.ok) throw new Error(`GitHub HTTP ${r.status}`);
      const data = await r.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return res.json({ success: true, sha: data.sha, size: data.size, content });
    }

    // ── Editar site (commit direto) ───────────────────────────────
    if (action === 'editar_site') {
      // 1. Busca SHA atual
      const getR = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, { headers: ghHeaders });
      if (!getR.ok) throw new Error(`GitHub HTTP ${getR.status}`);
      const current = await getR.json();

      // 2. Faz commit com novo conteúdo
      const encoded = Buffer.from(html, 'utf-8').toString('base64');
      const putR = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({
          message: commit_message || 'Atualização via Bridge Agent',
          content: encoded,
          sha: current.sha,
        }),
      });
      if (!putR.ok) {
        const err = await putR.json();
        throw new Error(err.message || `GitHub HTTP ${putR.status}`);
      }
      return res.json({ success: true, message: '✅ Site atualizado! Vercel publicará em ~30 segundos.' });
    }

    return res.status(400).json({ error: 'Ação não reconhecida' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
