const TOKEN = process.env.GH_TOKEN;

module.exports = async (req, res) => {
    const tokenJson = JSON.stringify(TOKEN);

    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    res.end(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Logging in via Token...</title></head><body>' +
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
};
