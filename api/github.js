export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, html, commit_message } = req.body;
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
    if (action === 'ver_codigo') {
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, { headers: ghHeaders });
      if (!r.ok) throw new Error(`GitHub HTTP ${r.status}`);
      const data = await r.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return res.json({ success: true, sha: data.sha, content });
    }

    if (action === 'editar_site') {
      const getR = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file}`, { headers: ghHeaders });
      if (!getR.ok) throw new Error(`GitHub HTTP ${getR.status}`);
      const current = await getR.json();
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
      if (!putR.ok) throw new Error(`GitHub HTTP ${putR.status}`);
      return res.json({ success: true, message: '✅ Site atualizado!' });
    }

    return res.status(400).json({ error: 'Ação não reconhecida' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
