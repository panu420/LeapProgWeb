# Leap 

Versione semplificata di Leap per esame di Programmazione Web.
Prodotto e Documentato da Panunzio Nicoló (MAT. 801503) 
CdS ITPS M-Z 2025/2026 - Programmazione per il Web

## Stack Tecnologico

- **Frontend**: React  + Next.js + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Autenticazione**: JWT con cookie httpOnly
- **Password Hashing**: bcryptjs


## Database

Il database SQLite viene creato automaticamente alla prima esecuzione nel file `database.db` nella root del progetto.

Lo schema è definito in `lib/db.ts`


Le credenziali degli account più importanti sono disponibili in `CREDENZIALI_TEST.txt`.

## Dashboard Amministratore

La dashboard admin (`/admin`) è accessibile solo agli utenti con `isAdmin = 1`.


**Account Admin di test:**
- Email: `admin@leapweb.com`
- Password: `password123`

## Note

- Il database è locale (SQLite) - perfetto per sviluppo e demo
- Le password sono hashate con bcrypt
- I token JWT durano 7 giorni
- Il progetto è responsive e mobile-friendly
- Le varie chiavi sono definite nel file .env
- Per utilizzare il progetto con le proprie chiavi é necessario creare un file .env con le seguenti variaibli:
# Variabili d'ambiente
OPENROUTER_API_KEY

STRIPE_SECRET_KEY

JWT_SECRET


