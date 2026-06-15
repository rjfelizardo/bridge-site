export default function Home() {
  return null;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/html');
  res.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bridge — A Travessia</title>
</head>
<body>
<script>window.location.href = '/index.html'</script>
</body>
</html>`);
  res.end();
  return { props: {} };
}
