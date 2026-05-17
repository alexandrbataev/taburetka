const CLIENT_ID = process.env.GH_CLIENT_ID;
const CLIENT_SECRET = process.env.GH_CLIENT_SECRET;
const SITE_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
const REDIRECT_URI = `${SITE_URL}/api/oauth/callback`;

module.exports = async (req, res) => {
    const url = new URL(req.url, SITE_URL);
    const path = url.pathname;

    if (path.endsWith('/auth')) {
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            scope: 'repo,user',
        });
        res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
        return res.end();
    }

    if (path.endsWith('/callback')) {
        const code = url.searchParams.get('code');
        if (!code) {
            res.statusCode = 400;
            return res.end('Missing code');
        }

        try {
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code,
                }),
            });

            const data = await tokenRes.json();
            const token = data.access_token;

            if (!token) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(data));
            }

            res.setHeader('Content-Type', 'text/html');
            return res.end(`
                <html><body><script>
                    (function() {
                        var authResult = ${JSON.stringify({ token })};
                        if (window.opener) {
                            window.opener.postMessage(authResult, '*');
                            window.close();
                        }
                    })();
                </script></body></html>
            `);
        } catch (err) {
            res.statusCode = 500;
            return res.end('OAuth error: ' + err.message);
        }
    }

    res.statusCode = 404;
    res.end('Not found');
};
