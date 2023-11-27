

NB:
questa applicazione è stata sviluppata per rispettare i requisiti obbligatori indicati nel documento di progetto e per rispettare i requisiti facoltativi numero 1 e 2.


# Progetto Test 22HBG Backend API
Questo readme ha come scopo quello di descrivere le funzionalità dell'API del backend del Progetto Test 22HBG.
Questa API è scritta in JavaScript utilizzando Node.js, Express, MySQL, Nodemon, Redis per la gestione della cache e Swagger per la documentazione.

## Requisiti

- Node.js
- Express
- MySQL
- Nodemon
- Redis
- Swagger
- Node-fetch

## Configurazione

1. Installa le dipendenze con il comando:
   ```bash
   npm install
   ```

2. Configura le variabili d'ambiente nel file `.env` o utilizza i valori di default.

3. Avvia l'applicazione con il comando:
   ```bash
   npm start
   ```

## Documentazione API

La documentazione dettagliata dell'API è disponibile attraverso Swagger. Visita [http://localhost:5000/api-docs](http://localhost:5000/api-docs) per esplorare la documentazione interattiva.

## Endpoints

### 1. Ottenere la lista di tutti i post

**Endpoint:** `GET /posts`

Questo endpoint restituisce la lista di tutti i post dal feed.

### 2. Ottenere i post filtrati

**Endpoint:** `GET /posts-filtered`

Questo endpoint restituisce una lista di post filtrati in base ai parametri di ricerca:

- `title`: stringa da cercare nei titoli dei post
- `items`: numero di post da restituire

### 3. Sincronizzare il database con i post dal feed

**Endpoint:** `GET /sync-db`

Questo endpoint legge i contenuti dal feed e li scrive nella tabella 'posts' nel database.

### 4. Ottenere i post dal database

**Endpoint:** `GET /posts-db`

Questo endpoint restituisce i contenuti della tabella 'posts' nel database in formato JSON.

### 5. Eliminare tutti i post dal database

**Endpoint:** `GET /posts-db-del`

Questo endpoint elimina tutti i record dalla tabella 'posts' nel database.

## Cache

L'API utilizza la cache Redis per migliorare le prestazioni dell'endpoint `GET /posts-filtered`.
Se un risultato è già presente nella cache, verrà restituito immediatamente senza effettuare una nuova richiesta al feed.

## Ambiente di Sviluppo

Per lo sviluppo, puoi utilizzare Nodemon per il riavvio automatico dell'applicazione in caso di modifiche al codice.
Quando si avvia l'application con `npm start`, nodemon viene eseguito automaticamente.

## Autore

- Andrea Munari ([@AndreaMunari](https://github.com/AndreaMunari))