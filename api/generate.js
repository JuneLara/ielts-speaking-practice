// Mã dành cho file api/generate.js trên Vercel
export default async function handler(req, res) {
    // 1. Cấu hình CORS - Chỉ cho phép website của bạn truy cập
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://ten-website-wordpress-cua-ban.com'); // ĐỔI THÀNH TÊN MIỀN CỦA BẠN
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // ... (Phần code gọi Google Gemini giữ nguyên như cũ) ...
    const apiKey = process.env.GEMINI_API_KEY; 
    // ...
}
