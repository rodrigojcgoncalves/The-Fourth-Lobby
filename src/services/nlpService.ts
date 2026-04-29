const HF_TOKEN = import.meta.env.VITE_HF_TOKEN; 
const MODEL_URL = "https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment"

export const nlpService = {
  analyzeSentiment: async (text: string) => {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      body: JSON.stringify({ inputs: text }),
    })
    const result = await response.json()
    return result // Retorna a classificação de estrelas
  }
}