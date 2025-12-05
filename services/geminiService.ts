import { GoogleGenAI } from "@google/genai";

export const generateDescription = async (title: string, category: string, price: number, location: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not set for Gemini");
    return "Deskripsi otomatis tidak tersedia (API Key missing).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Anda adalah agen properti profesional. Buatkan deskripsi listing properti yang menarik, mewah, dan persuasif (bahasa Indonesia).
      
      Tipe: ${category}
      Lokasi: ${location}
      Judul Listing: ${title}
      Harga: Rp ${price.toLocaleString('id-ID')}
      
      Fokuskan pada:
      1. Potensi investasi atau kenyamanan hunian.
      2. Lokasi strategis.
      3. Call to action.
      
      Buat maksimal 2 paragraf pendek. Jangan pakai markdown bold/heading.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};
