const CLIENT_ID = process.env.GH_CLIENT_ID;

module.exports = async (req, res) => {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const siteUrl = proto + '://' + host;
    const redirectUri = siteUrl + '/api/oauth/callback';
    const url = new URL(req.url, siteUrl);
    const state = url.searchParams.get('state') || '';

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'repo',
    });
    if (state) params.append('state', state);

    res.writeHead(302, { Location: 'https://github.com/login/oauth/authorize?' + params });
    res.end();
};
