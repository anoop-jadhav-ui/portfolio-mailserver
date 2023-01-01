import fetch from 'node-fetch';

// export default async function handler(request, response) {
//     const res = await fetch('...', {
//         method: 'POST',
//         body: JSON.stringify({
//             client_id: process.env.CLIENT_ID,
//             client_secret: process.env.CLIENT_SECRET,
//         }),
//         headers: { 'Content-Type': 'application/json' },
//     });

//     const data = await res.json();
//     return response.status(200).json({ data });
// }

export default function handler(request, response) {
    response.status(200).json({
        body: request.body,
        query: request.query,
        cookies: request.cookies,
    });
}