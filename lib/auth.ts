/**
 * Utility per l'autenticazione
 * Verifica il token JWT e estrae i dati dello studente
 */

import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/**
 * Secret key per la firma e verifica dei token JWT
 * Deve essere impostata nella variabile d'ambiente JWT_SECRET
 * In produzione, usa una chiave sicura e casuale
 */
const JWT_SECRET_ENV = process.env.JWT_SECRET;

if (!JWT_SECRET_ENV) {
  throw new Error(
    'JWT_SECRET non configurata. Aggiungi la variabile d\'ambiente nel file .env'
  );
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_ENV);

export interface AuthUser {
  id: number;
  email: string;
  nome: string;
}

/**
 * Verifica il token JWT e ritorna i dati dello studente autenticato
 * Ritorna null se non autenticato o token non valido
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      id: payload.id as number,
      email: payload.email as string,
      nome: payload.nome as string,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Verifica se l'utente autenticato è un amministratore
 * Ritorna true se è admin, false altrimenti
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) {
    return false;
  }

  const { getDatabase } = await import('./db');
  const db = getDatabase();
  const studente = db
    .prepare('SELECT isAdmin FROM studente WHERE id = ?')
    .get(user.id) as { isAdmin: number } | undefined;

  return studente?.isAdmin === 1;
}

