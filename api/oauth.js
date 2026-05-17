const CLIENT_ID = process.env.GH_CLIENT_ID;
const CLIENT_SECRET = process.env.GH_CLIENT_SECRET;
const REDIRECT_URI = 'https://taburetka.vercel.app/api/oauth/callback';

export default async function handler(req, res) {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const path = url.pathname;

    if (path.endsWith('/auth')) {
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: 'repo,user',
        });
        return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
    }

    if (path.endsWith('/callback')) {
        const code = url.searchParams.get('code');
        if (!code) return res.status(400).send('Missing code');

        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            }),
        });

        const data = await tokenRes.json();
        const token = data.access_token;

        if (!token) return res.status(400).json(data);

        res.setHeader('Content-Type', 'text/html');
        return res.end(`
            <html><body><script>
                (function() {
                    const authResult = ${JSON.stringify({ token })};
                    if (window.opener) {
                        window.opener.postMessage(authResult, '*');
                        window.close();
                    }
                })();
            </script></body></html>
        `);
    }

    res.status(404).send('Not found');
}
