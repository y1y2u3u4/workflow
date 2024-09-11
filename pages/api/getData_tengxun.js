const fetch = require('node-fetch');

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { keywords } = req.body;

    if (!keywords) {
        res.status(400).json({ error: 'Keywords are required' });
        return;
    }

    const url = `https://apis.map.qq.com/ws/place/v1/search?keyword=${encodeURIComponent(keywords)}&boundary=nearby(39.908491,116.374328,1000)&key=I4XBZ-RVBC4-UQBUI-FSKQD-SAJ36-HYFVS`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('response:', response);
        if (response.ok) {
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const firstPoi = data.data[0];
                const result = {
                    name: firstPoi.title,
                    address: firstPoi.address,
                    phone: firstPoi.tel
                };
                res.status(200).json(result);
            } else {
                res.status(404).json({ error: 'No POIs found' });
            }
        } else {
            const errorText = await response.text();
            res.status(response.status).json({ error: errorText });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export default handler;