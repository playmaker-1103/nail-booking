document.getElementById('btnHello').addEventListener('click', async () => {
    const r = await fetch('/api/hello');
    const d = await r.json();
    document.getElementById('helloOut').textContent = JSON.stringify(d, null, 2);
});

document.getElementById('echoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { name: fd.get('name'), phone: fd.get('phone'), when: new Date().toISOString() };
    const r = await fetch('/api/echo', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });
    const d = await r.json();
    document.getElementById('echoOut').textContent = JSON.stringify(d, null, 2);
});