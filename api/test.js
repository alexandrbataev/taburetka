module.exports = async (req, res) => {
    try {
        const r = await fetch('https://api.github.com');
        const text = await r.text();
        res.end('GitHub API: ' + r.status + ' ' + text.slice(0, 200));
    } catch (e) {
        res.end('Error: ' + e.message);
    }
};
