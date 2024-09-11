import { respData, respErr, respJson } from "@/utils/response";
import { headers } from "next/headers";
import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'js-cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('传入数据');
    // const headersList = headers();
    // const userAgent = headersList.get("User-Agent");
    const { description, user_input, model, API_KEY } = req.body;
    console.log('model', model)
    console.log('API_KEY', API_KEY)
    console.log('description', description)
    console.log('user_input', user_input)
    if (!description || !user_input) {
      return res.status(400).json({ code: 1, message: 'Please input both description and user input' });
    }

    const chatml = [
      {
        role: 'system',
        content: description,
      },
      {
        role: 'user',
        content: user_input,
      },
    ];

    const payload = {
      model: model,
      messages: chatml,
      temperature: 0,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch("https://gateway.ai.cloudflare.com/v1/8c0e66e5d3b14f0974120ff9638e8fc5/price-wise/openai/chat/completions", requestOptions);
      const result = await response.json();
      console.log('result', result);
      return res.status(200).json({ code: 0, data: result.choices[0].message.content.trim() });
    } catch (e: any) {
      if (e?.detail === 'Unauthorized') {
        return res.status(401).json({ code: 2, message: 'Unauthorized' });
      }

      if (e?.detail === "Insufficient credits." || e?.detail === "Service Unavailable") {
        return res.status(503).json({ code: 3, message: "Service Unavailable" });
      }

      return res.status(500).json({ code: 4, message: "Generate music failed", error: e.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



