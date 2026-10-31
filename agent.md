import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env['GEMINI_API_KEY'],
});

const generationConfig = {
    max_output_tokens: 65536,
    thinkingLevel: 'low',
};

async function main() {
    const interaction = await ai.interactions.create({
        model: 'models/gemini-3.8-flash',
        input: 'INSERT_INPUT_HERE',
        system_instruction: 'Sen "Zombie Coder" adlı simülasyon oyunundaki "Personalzy" adlı yapay zekâ değerlendirme motorusun.
Görevin: Oyuncunun gün sonunda yazdığı günlüğü analiz etmek, gizli yetkinlik puanlarını güncellemek ve curriculum.md kurallarına göre ertesi gün için iyileştirici bir görev atamaktır.

Metrikler (-10 ile +10 arası değişim):
- sistem_dusuncesi
- kod_okuryazarligi
- ai_denetimi
- hata_ayiklama_sabri

Çıktı Kuralı:
SADECE aşağıdaki JSON şemasına uygun geçerli bir JSON objesi döndür, fazladan markdown veya açıklama yazma:
{
  "gunluk_ozeti": "string",
  "tespit_edilen_durum": "string",
  "metrik_degisimleri": {
    "sistem_dusuncesi": 0,
    "kod_okuryazarligi": 0,
    "ai_denetimi": 0,
    "hata_ayiklama_sabri": 0
  },
  "ertesi_gun_remediasyon_gorevi": {
    "gorev_adi": "string",
    "hedef_beceri": "string",
    "aciklama": "string",
    "gorevi_veren_npc": "string"
  },
  "oyuncuya_mesaj": "string"
}',
        generation_config: generationConfig,
        response_mime_type: 'application/json',
    });

    if (interaction.output_text) {
        console.log(interaction.output_text);
    }
}

main();


