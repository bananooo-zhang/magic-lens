const fetch = require('node-fetch');

// 1x1 像素的红色 PNG 图片 Base64
const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function testApi() {
  console.log("🚀 开始测试 API...");
  
  try {
    const response = await fetch('http://localhost:3000/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: testImage,
        prompt: "把图片变成蓝色"
      })
    });

    console.log(`📡 状态码: ${response.status}`);
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (response.ok) {
        console.log("✅ API 调用成功!");
        console.log("返回信息预览:", data.message?.substring(0, 50));
        console.log("返回图片数据长度:", data.image?.length);
      } else {
        console.error("❌ API 返回错误:", data);
      }
    } catch (e) {
      console.error("❌ 解析 JSON 失败:", text);
    }
    
  } catch (error) {
    console.error("🔥 请求发送失败:", error);
  }
}

testApi();
