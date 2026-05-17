const CLIENT_ID = process.env.GH_CLIENT_ID;
const CLIENT_SECRET = process.env.GH_CLIENT_SECRET;

module.exports = async (req, res) => {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const siteUrl = proto + '://' + host;
    const redirectUri = siteUrl + '/api/oauth/callback';
    const url = new URL(req.url, siteUrl);
    const code = url.searchParams.get('code');

    if (!code) {
        res.statusCode = 400;
        return res.end('Missing authorization code');
    }

    try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: redirectUri,
            }),
        });

        const data = await tokenRes.json();
        const token = data.access_token;

        if (!token) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/plain');
            return res.end('Token exchange failed: ' + JSON.stringify(data));
        }

        const tokenJson = JSON.stringify(token);

        res.setHeader('Content-Type', 'text/html;charset=utf-8');
        res.end(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Logging in via GitHub...</title></head><body>' +
            '<script>' +
            '(function(){' +
            'var opener=window.opener;' +
            'if(!opener)return;' +
            'var token=' + tokenJson + ';' +
            'var provider="github";' +
            'var content=JSON.stringify({token:token,provider:provider});' +
            'function onMsg(e){' +
            'var o=e.origin==="null"?false:e.origin;' +
            'if(!o)return;' +
            'window.removeEventListener("message",onMsg,false);' +
            'opener.postMessage("authorization:"+provider+":success:"+content,o);' +
            '}' +
            'window.addEventListener("message",onMsg,false);' +
            'opener.postMessage("authorizing:"+provider,"*");' +
            '})();' +
            '</script>' +
            '</body></html>'
        );
    } catch (err) {
        res.statusCode = 500;
        return res.end('OAuth error: ' + err.message);
    }
};
