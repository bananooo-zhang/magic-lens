export const APP_CONFIG = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://models.kapon.cloud/v1",
    model: process.env.NEXT_PUBLIC_MODEL_NAME || "gemini-3-pro-image-preview",
  },

  // System Prompt for consistent aesthetic
  systemPrompt: `你是一位专业的女性审美修图师。在处理图片时，请务必遵守以下原则：
1. 【面部保护】保持人物面部特征、五官比例、骨相结构完全不变，严禁改动五官构图。
2. 【肤质优化】默认进行皮肤细腻化处理，目标是清透、冷白皮、有光泽感，但保留皮肤自然纹理，避免由于过度磨皮导致的塑料感。
3. 【光影氛围】优化整体光影，增加照片氛围感。高光处要通透，暗部要有细节。
4. 【用户指令】在满足以上三点的前提下，精准执行用户的具体修图指令。`,

  // Preset Prompts (Chips)
  presets: [
    {
      id: "ccd",
      label: "📷 CCD复古感",
      prompt: "模拟佳能CCD拍摄质感，P成闪光灯效果。整体饱和度高、色彩浓郁。人物肤色均匀，清透冷白皮，带粉调。面部提亮但不要过曝，对比度稍高，画面自然饱和度高。",
    },
    {
      id: "snow",
      label: "❄️ 氛围感雪景",
      prompt: "模拟冬天真实下雪中的状态。人物衣服、头发、地上沾点小雪（雪不要挡住脸）。画面呈现清冷感，保持人物清晰。",
    },
    {
      id: "skin",
      label: "✨ 冷白皮磨皮",
      prompt: "人物提亮，脸部皮肤白皙有光泽感，带一点粉调。去除面部瑕疵，保留皮肤纹理，不需要改变环境色。",
    },
    {
      id: "remove",
      label: "🏃 去除路人",
      prompt: "去除画面背景中的路人和杂物，自动填充背景，保持背景自然过渡，不要改变画面主体人物。",
    },
  ],
};
