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

    const url = `https://api.map.baidu.com/place/v2/search?query=${encodeURIComponent(keywords)}&region=北京&output=json&ak=hffp6gDDnX2XL9qmETYd7pjjbPviKxVX`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const firstPoi = data.results[0];
                const result = {
                    name: firstPoi.name,
                    address: firstPoi.address,
                    phone: firstPoi.telephone
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