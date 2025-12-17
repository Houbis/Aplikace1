import { GoogleGenAI } from "@google/genai";
import { Client, DailyActivity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = 'gemini-2.5-flash';

export const analyzeClientPortfolio = async (client: Client): Promise<string> => {
  try {
    // Prepare a structured summary of the client for the AI
    const clientSummary = {
      name: `${client.firstName} ${client.lastName}`,
      age: client.age,
      income: client.income,
      occupation: client.occupation,
      portfolio: client.portfolio.map(p => ({
        type: p.type,
        name: p.name,
        value: p.value,
        details: p.details,
        expiry: p.expiryDate,
        isExisting: p.isExisting ? "Sjednáno jinde/dříve" : "Aktivní správa"
      })),
      notes: client.notes // Explicitly passing notes
    };

    const prompt = `
      Jsi expertní AI asistent pro finančního poradce v ČSOB. Analyzuj následující data klienta a poskytni strukturovanou zprávu v češtině.
      
      DŮLEŽITÉ: Vezmi v úvahu "Poznámky", které napsal poradce, a zahrň je do kontextu analýzy.
      
      Data Klienta (JSON):
      ${JSON.stringify(clientSummary, null, 2)}

      Tvůj úkol:
      1. Identifikuj hlavní finanční rizika.
      2. Navrhni 3 konkrétní kroky pro optimalizaci portfolia na základě věku, příjmu a poznámek.
      3. Navrhni téma pro příští schůzku.
      
      Formátuj výstup pomocí Markdown (použij nadpisy, odrážky). Buď stručný, profesionální a věcný.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Nepodařilo se vygenerovat analýzu.";
  } catch (error) {
    console.error("Chyba při volání Gemini API:", error);
    return "Omlouváme se, AI asistent je momentálně nedostupný. Zkontrolujte API klíč nebo připojení.";
  }
};

export const generateMeetingReport = async (client: Client, meetingNotes: string): Promise<string> => {
    try {
        const prompt = `
            Jsi asistent finančního poradce ČSOB. Na základě poznámek ze schůzky vytvoř profesionální shrnutí pro klienta (email/PDF) v češtině.
            
            Klient: ${client.firstName} ${client.lastName}
            Poznámky ze schůzky: "${meetingNotes}"

            Výstup by měl obsahovat:
            - Poděkování za schůzku
            - Shrnutí probraných témat
            - Dohodnuté další kroky
            - Formální rozloučení
        `;

        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || "Nepodařilo se vygenerovat report.";

    } catch (error) {
        console.error("Gemini Error:", error);
        return "Chyba při generování reportu.";
    }
}

export const generateDailyPlan = async (clients: Client[]): Promise<DailyActivity[]> => {
  try {
    const clientsData = clients.map(c => ({
      name: `${c.firstName} ${c.lastName}`,
      age: c.age,
      lastContact: c.lastContact,
      portfolioSummary: c.portfolio.map(p => `${p.type} (Exp: ${p.expiryDate || 'N/A'})`).join(', '),
      notes: c.notes
    }));

    const prompt = `
      Jsi AI manažer klientského kmene pro ČSOB. Tvým úkolem je vygenerovat 3-5 klíčových prodejních nebo servisních aktivit pro dnešní den na základě dat klientů.
      
      Hledej příležitosti jako:
      - Dlouhá doba od posledního kontaktu (> 3 měsíce)
      - Expirující produkty (fixace hypoték)
      - Cross-sell příležitosti (např. má hypotéku ale nemá pojištění)
      - Klíčová slova v poznámkách (např. "chtěl řešit investice")

      Data klientů:
      ${JSON.stringify(clientsData)}

      Vrať POUZE validní JSON pole (bez markdownu, bez textu okolo) v tomto formátu:
      [
        {
          "type": "CALL" | "EMAIL" | "MEETING",
          "clientName": "Jméno Klienta",
          "reason": "Stručný důvod aktivity (česky)",
          "priority": "HIGH" | "MEDIUM" | "LOW"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Clean up markdown if present just in case
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as DailyActivity[];

  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return [];
  }
};