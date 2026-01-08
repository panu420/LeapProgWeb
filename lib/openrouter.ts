/**
 * Wrapper per chiamare l'API di OpenRouter e generare contenuti AI
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * API Key di OpenRouter per generazione contenuti AI
 * Deve essere impostata nella variabile d'ambiente OPENROUTER_API_KEY
 * @throws Error se la chiave non è configurata
 */
const DEFAULT_API_KEY = process.env.OPENROUTER_API_KEY;

if (!DEFAULT_API_KEY) {
  throw new Error(
    'OPENROUTER_API_KEY non configurata. Aggiungi la variabile d\'ambiente nel file .env'
  );
}

interface GenerateNoteParams {
  subjectQuery: string;
  details?: string;
}

const NOTE_SYSTEM_PROMPT = `
Sei un assistente che genera appunti chiari e strutturati in italiano.
Regole:
1. Usa Markdown con titoli (##), elenchi puntati (-) e grassetto (**testo**)
2. Organizza il contenuto in sezioni coerenti e progressive
3. Non inserire testo prima del primo titolo
4. Mantieni un tono accademico ma accessibile
5. Evidenzia definizioni e concetti chiave
6. Chiudi sempre con una sezione "Riepilogo"
`;

export async function generateNoteWithAI({
  subjectQuery,
  details,
}: GenerateNoteParams): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEFAULT_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://leap.local',
      'X-Title': 'Leap Semplificato',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-lite-001',
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: [{ type: 'text', text: NOTE_SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Argomento: ${subjectQuery}\nDettagli aggiuntivi: ${
                details || 'non specificati'
              }`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore OpenRouter: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Risposta AI vuota');
  }

  const cleaned = Array.isArray(content)
    ? content.map((item: any) => item.text).join('\n')
    : content;

  return cleaned.trim();
}

interface GenerateQuizParams {
  subject: string;
  difficulty?: 'facile' | 'media' | 'difficile';
  numQuestions?: number;
  noteContent?: string;
}

const QUIZ_SYSTEM_PROMPT = `
Sei un generatore di quiz a scelta multipla per studenti italiani.
DEVI restituire SOLO JSON valido con questa struttura:
{
  "title": "Titolo del quiz",
  "questions": [
    {
      "question": "testo della domanda",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 1
    }
  ]
}
Regole:
- Genera 4 opzioni per ogni domanda, tutte plausibili
- correctIndex è basato su indice 0-3
- Mantieni un tono didattico coerente con la difficoltà richiesta
`;

export async function generateQuizWithAI({
  subject,
  difficulty = 'media',
  numQuestions = 5,
  noteContent,
}: GenerateQuizParams): Promise<{
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
}> {
  const userPrompt = `
Argomento del quiz: ${subject}
Difficoltà richiesta: ${difficulty}
Numero di domande: ${numQuestions}
${
  noteContent
    ? `Contenuto di riferimento (appunto):\n${noteContent.slice(0, 4000)}`
    : ''
}
`;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEFAULT_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://leap.local',
      'X-Title': 'Leap Semplificato',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-lite-001',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [{ type: 'text', text: QUIZ_SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [{ type: 'text', text: userPrompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore OpenRouter: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Risposta AI vuota');
  }

  const text = Array.isArray(content)
    ? content.map((item: any) => item.text).join('\n')
    : content;

  try {
    const jsonText = text
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(jsonText);

    if (!parsed?.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Formato quiz non valido');
    }

    return parsed;
  } catch (error) {
    console.error('Errore parsing quiz AI:', text);
    throw error;
  }
}

interface GenerateVeroFalsoParams {
  subject: string;
  difficulty?: 'facile' | 'media' | 'difficile';
  numQuestions?: number;
  noteContent?: string;
}

const VERO_FALSO_SYSTEM_PROMPT = `
Sei un generatore di esercizi Vero/Falso per studenti italiani.
DEVI restituire SOLO JSON valido con questa struttura:
{
  "title": "Titolo dell'esercizio",
  "statements": [
    {
      "statement": "affermazione da valutare",
      "correct": true
    }
  ]
}
Regole:
- correct è true se l'affermazione è VERA, false se è FALSA
- Le affermazioni devono essere chiare e non ambigue
- Crea affermazioni che richiedono conoscenza dell'argomento
- Mantieni un tono didattico coerente con la difficoltà richiesta
- Le affermazioni false devono essere plausibili ma errate
`;

export async function generateVeroFalsoWithAI({
  subject,
  difficulty = 'media',
  numQuestions = 5,
  noteContent,
}: GenerateVeroFalsoParams): Promise<{
  title: string;
  statements: Array<{
    statement: string;
    correct: boolean;
  }>;
}> {
  const userPrompt = `
Argomento dell'esercizio: ${subject}
Difficoltà richiesta: ${difficulty}
Numero di affermazioni: ${numQuestions}
${
  noteContent
    ? `Contenuto di riferimento (appunto):\n${noteContent.slice(0, 4000)}`
    : ''
}
`;

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEFAULT_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://leap.local',
      'X-Title': 'Leap Semplificato',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-lite-001',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: [{ type: 'text', text: VERO_FALSO_SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [{ type: 'text', text: userPrompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore OpenRouter: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Risposta AI vuota');
  }

  const text = Array.isArray(content)
    ? content.map((item: any) => item.text).join('\n')
    : content;

  try {
    const jsonText = text
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    const parsed = JSON.parse(jsonText);

    if (!parsed?.statements || !Array.isArray(parsed.statements)) {
      throw new Error('Formato vero/falso non valido');
    }

    return parsed;
  } catch (error) {
    console.error('Errore parsing vero/falso AI:', text);
    throw error;
  }
}

