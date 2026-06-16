export default async function handler(req, res) {
    // 1. CẤU HÌNH CORS - BẢO MẬT CHỐNG WEBSITE KHÁC DÙNG CHÙA
    // Thay URL dưới đây bằng chính xác TÊN MIỀN WORDPRESS CỦA BẠN 
    // Ví dụ: 'https://tienganh.com' (Lưu ý: KHÔNG CÓ dấu gạch chéo / ở cuối)
    const ALLOWED_ORIGIN = '*'; // Tạm thời để '*' để cho phép tất cả các nguồn truy cập, giúp bạn dễ dàng test xem API có chạy không. Nếu nó chạy thành công, hãy thay dấu * bằng 'https://tên-miền-wordpress-của-bạn.com' để bảo mật.

    // Thiết lập các Header cho phép
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Xử lý yêu cầu HTTP OPTIONS (Yêu cầu pre-flight của trình duyệt trước khi gửi POST)
    // ĐÂY CHÍNH LÀ ĐIỂM FIX LỖI "FAILED TO FETCH"
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Chỉ cho phép phương thức POST cho chức năng tạo bài mẫu
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Chỉ chấp nhận phương thức POST' });
    }

    const { promptText } = req.body;
    
    // Lấy API Key từ biến môi trường của Vercel (Giấu kín tuyệt đối)
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel' });
    }

    const payload = {
        systemInstruction: {
            parts: [{
                text: "Bạn là một giám khảo và giáo viên IELTS Speaking bản xứ xuất sắc. Dựa vào ý tưởng của học viên, hãy dịch và nâng cấp thành 4 câu trả lời tiếng Anh ở 4 cấp độ: Band 6.0, 7.0, 8.0 và 9.0. YÊU CẦU QUAN TRỌNG:\n1. Văn phong phải LÀ VĂN NÓI TỰ NHIÊN (Spoken Language), dùng idioms, phrasal verbs, fillers phù hợp.\n2. Ở TẤT CẢ 4 BAND, hãy xác định các cụm từ (collocations/chunks) hay nhất và bọc chúng bằng thẻ <span class='highlight'>...</span>.\n3. Trích xuất các cụm từ đã highlight thành 4 mảng vocab riêng biệt.\n4. Viết bản dịch tiếng Việt hoàn chỉnh cho mỗi bài mẫu."
            }]
        },
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    band6: { type: "STRING" }, band6_vi: { type: "STRING" },
                    band7: { type: "STRING" }, band7_vi: { type: "STRING" },
                    band8: { type: "STRING" }, band8_vi: { type: "STRING" },
                    band9: { type: "STRING" }, band9_vi: { type: "STRING" },
                    vocab6: { type: "ARRAY", items: { type: "OBJECT", properties: { en: { type: "STRING" }, vi: { type: "STRING" } } } },
                    vocab7: { type: "ARRAY", items: { type: "OBJECT", properties: { en: { type: "STRING" }, vi: { type: "STRING" } } } },
                    vocab8: { type: "ARRAY", items: { type: "OBJECT", properties: { en: { type: "STRING" }, vi: { type: "STRING" } } } },
                    vocab9: { type: "ARRAY", items: { type: "OBJECT", properties: { en: { type: "STRING" }, vi: { type: "STRING" } } } }
                }
            }
        }
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Google API Lỗi ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        
        // Trả dữ liệu về cho Website WordPress của bạn
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Lỗi Backend:', error);
        res.status(500).json({ error: 'Lỗi khi kết nối với AI: ' + error.message });
    }
}
