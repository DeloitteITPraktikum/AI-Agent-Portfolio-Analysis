import io
import os
import re
from typing import List, Dict

from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from databricks.sdk import WorkspaceClient
from databricks.sdk.service import sql as sql_svc
from databricks.sdk.service.serving import ChatMessage, ChatMessageRole
from pydantic import BaseModel


# ----------------------------------------------------
# Grundkonfiguration
# ----------------------------------------------------

app = FastAPI()

# Workspace-Client der App (kümmert sich intern um Auth)
w = WorkspaceClient()

# Volumes / Tabellen
CATALOG = "tud_25"
SCHEMA = "delovest_data"
VOLUME = "uploads"

# Gold-Tabelle mit Kursdaten
GOLD_TABLE = "tud_25.gold.alpha_vantage_marketdata_final"

# Feste Warehouse-ID (aus der SQL-Warehouse-UI: Serverless, ID: a52c432f9fe67576)
WAREHOUSE_ID = "a52c432f9fe67576"


# ----------------------------------------------------
# Helper: SQL über Statement Execution ausführen
# ----------------------------------------------------
def run_sql_inline(query: str, row_limit: int = 5000) -> Dict:
    """
    Führt ein SQL-Statement auf dem angegebenen Warehouse aus und liefert
    das StatementResponse-Objekt zurück (INLINE + JSON_ARRAY).
    """
    try:
        resp = w.statement_execution.execute_statement(
            statement=query,
            warehouse_id=WAREHOUSE_ID,
            catalog=CATALOG,
            # schema hier optional, wir nutzen vollqualifizierte Tabelle
            disposition=sql_svc.Disposition.INLINE,
            format=sql_svc.Format.JSON_ARRAY,
            row_limit=row_limit,
            wait_timeout="30s",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Ausführen des SQL-Statements: {e}",
        )

    # Prüfen, ob die Ausführung wirklich erfolgreich war
    if not resp.status or resp.status.state != sql_svc.StatementState.SUCCEEDED:
        msg = getattr(resp.status, "error", None)
        raise HTTPException(
            status_code=500,
            detail=f"SQL-Ausführung fehlgeschlagen: {msg}",
        )

    if not resp.result or not resp.manifest:
        # Kein Ergebnis (z.B. kein Treffer)
        return {"columns": [], "rows": []}

    cols = [c.name for c in resp.manifest.schema.columns]
    data = resp.result.data_array or []

    return {"columns": cols, "rows": data}


# ----------------------------------------------------
# Endpoint: Kursdaten aus der Gold-Tabelle
# ----------------------------------------------------

@app.get("/api/v1/gold/ticker/{symbol}")
def get_ticker_timeseries(
    symbol: str,
    limit: int = Query(500, ge=1, le=5000),
):
    """
    Liefert NUR date + close aus tud_25.gold.alpha_vantage_marketdata_final
    für einen Ticker, geordnet nach Datum.
    Ideal für einfache Kurs-Charts.
    """

    # einfache Validierung gegen SQL-Injection
    if not re.match(r"^[A-Za-z0-9_.-]{1,20}$", symbol):
        raise HTTPException(status_code=400, detail="Ungültiger Ticker.")

    query = f"""
      SELECT
        date,
        close
      FROM {GOLD_TABLE}
      WHERE symbol = '{symbol}'
      ORDER BY date
      LIMIT {limit}
    """

    try:
        result = run_sql_inline(query, row_limit=limit)
    except HTTPException:
        # direkt weiterwerfen, damit detail nach außen geht
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Fehler beim Lesen der Gold-Tabelle: {e}",
        )

    cols = result["columns"]
    rows = result["rows"]

    if not cols or not rows:
        # Kein Treffer ist kein Fehler, nur leere Liste
        return {"symbol": symbol, "rows": []}

    # Indexe für date/close suchen
    try:
        date_idx = cols.index("date")
        close_idx = cols.index("close")
    except ValueError:
        raise HTTPException(
            status_code=500,
            detail="Erwartete Spalten 'date' und 'close' nicht im Ergebnis gefunden.",
        )

    # JSON-freundliches Format bauen
    parsed_rows: List[Dict] = []
    for r in rows:
        # Werte kommen als Strings oder None zurück
        date_val = r[date_idx]
        close_raw = r[close_idx]

        try:
            close_val = float(close_raw) if close_raw is not None else None
        except Exception:
            close_val = None

        parsed_rows.append(
            {
                "date": date_val,
                "close": close_val,
            }
        )

    return {"symbol": symbol, "rows": parsed_rows}

'''
# ----------------------------------------------------
# Endpoint: Chat mit Databricks Serving (GPT-5.1)
# ----------------------------------------------------

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    temperature: float = 0.7
    max_tokens: int = 500

@app.post("/api/v1/chat")
def chat_with_agent(req: ChatRequest):
    """
    Sendet die Chat-History an den Databricks Serving Endpoint 'databricks-gpt-5-1'.
    Die Authentifizierung übernimmt die Databricks App (Service Principal) automatisch,
    sofern in app.yaml die Ressource (serving-endpoint) definiert ist.
    """
    
    # Konvertieren der eingehenden Messages in das Format, das das SDK erwartet
    # (Liste von ChatMessage Objekten)
    chat_messages = []
    for m in req.messages:
        role_str = m.get("role", "user").lower()
        content = m.get("content", "")
        
        if role_str == "system":
            role_enum = ChatMessageRole.SYSTEM
        elif role_str == "assistant":
            role_enum = ChatMessageRole.ASSISTANT
        else:
            role_enum = ChatMessageRole.USER
            
        chat_messages.append(ChatMessage(role=role_enum, content=content))
    
    try:
        # Aufruf des Serving Endpoints
        # Name "databricks-gpt-5-1" muss exakt mit app.yaml + Serving Endpoint UI übereinstimmen
        response = w.serving_endpoints.query(
            name="databricks-gpt-5-1",
            messages=chat_messages,
            temperature=req.temperature,
            max_tokens=req.max_tokens
        )
        
        # Extrahieren der Antwort
        # response.choices ist eine Liste von ChatChoice
        if not response.choices:
            return {"role": "assistant", "content": "Keine Antwort vom Modell erhalten."}
            
        first_choice = response.choices[0]
        # first_choice.message ist ein ChatMessage Objekt
        return {
            "role": "assistant", 
            "content": first_choice.message.content
        }

    except Exception as e:
        print(f"Fehler beim Aufruf des Serving Endpoints: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Fehler bei der Kommunikation mit dem KI-Modell: {str(e)}"
        )

'''

# ----------------------------------------------------
# Endpoint: CSV-Upload ins Volume (wie vorher, funktioniert schon)
# ----------------------------------------------------

@app.post("/api/v1/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Nimmt eine CSV-Datei entgegen und speichert sie im Volume:
      /Volumes/tud_25/delovest_data/uploads/<filename>
    """
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Nur CSV-Dateien sind erlaubt.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Datei ist leer.")

    binary_data = io.BytesIO(content)
    volume_path = f"/Volumes/{CATALOG}/{SCHEMA}/{VOLUME}/{file.filename}"

    try:
        w.files.upload(volume_path, binary_data, overwrite=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload fehlgeschlagen: {e}")

    return {"status": "ok", "path": volume_path}




#-----------------------------------------------------
# @Ali
#-----------------------------------------------------
# --- Ersetze die alte chat_with_agent Funktion hiermit ---
class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    temperature: float = 0.7
    csv_path: Optional[str] = None
    max_tokens: int = 500
# 1. Hier DEINEN Endpoint-Namen eintragen (den du gerade erstellt hast)
SERVING_ENDPOINT_NAME = "delovest_agent" 

@app.post("/api/v1/chat")
def chat_with_agent(req: ChatRequest):
    """
    Ruft deinen Custom LangChain Agent auf.
    Erfüllt die User Story: CSV-Pfad nutzen -> Agent rechnet -> Antwort.
    Fix: Chat-History wird nun korrekt übergeben, damit der Agent Kontext hat.
    """
    try:
        # 1. Die letzte Frage des Users holen
        if not req.messages:
            return {"role": "assistant", "content": "Keine Nachrichten vorhanden."}

        user_question = req.messages[-1]["content"]
        
        # 2. Chat-History aufbauen (alles VOR der letzten Nachricht)
        # Wir formatieren es als Liste von Dictionaries, wie es meistens erwartet wird.
        raw_history = req.messages[:-1]
        formatted_history = []
        for msg in raw_history:
            # Sicherheitscheck: role und content müssen da sein where key matches expected schema
            r = msg.get("role", "user")
            c = msg.get("content", "")
            if r == "user":
                formatted_history.append({"role": "user", "content": c})
            else:
                formatted_history.append({"role": "assistant", "content": c})

        # 3. Den CSV-Pfad als System-Hinweis anhängen (falls Datei hochgeladen wurde)
        if req.csv_path:
            user_question += f" (SYSTEM-INFO: Die zu analysierende Datei liegt hier: {req.csv_path})"

        # 4. Payload bauen
        # Wir übergeben nun die echte History statt []
        payload = {
            "inputs": [
                {
                    "input": user_question,
                    "chat_history": formatted_history
                }
            ]
        }

        # 5. Request an den neuen Agent-Endpoint senden
        # Wir erhöhen das Timeout etwas, falls der Agent länger denkt
        try:
            response = w.serving_endpoints.query(
                name=SERVING_ENDPOINT_NAME,
                dataframe_records=payload["inputs"]
            )
        except Exception as endpoint_err:
            print(f"Endpoint Error: {endpoint_err}")
            # Versuchen, eine detailliertere Fehlermeldung zu extrahieren
            return {
                "role": "assistant", 
                "content": f"Fehler beim Aufruf des Agents '{SERVING_ENDPOINT_NAME}': {str(endpoint_err)}"
            }
        
        # 6. Antwort auspacken
        if response.predictions:
             answer = response.predictions[0]
             
             # Manchmal ist die Antwort noch in einem Dictionary verpackt
             if isinstance(answer, dict) and "output" in answer:
                 answer = answer["output"]
             
             # In Strings konvertieren, falls es ein Objekt ist
             final_text = str(answer)

             # --- Encoding Repair Start ---
             # Fix für Mojibake (z.B. "Ã¤" statt "ä")
             # Wir versuchen, den String als Latin-1 zu encoden (um die originalen Bytes zu bekommen)
             # und dann als UTF-8 zu decoden.
             try:
                 repaired_text = final_text.encode("latin-1").decode("utf-8")
                 final_text = repaired_text
             except Exception:
                 # Falls das Encoding/Decoding fehlschlägt, behalten wir den originalen Text
                 pass
             # --- Encoding Repair End ---

             return {"role": "assistant", "content": final_text}
        
        return {"role": "assistant", "content": "Der Agent hat keine Antwort generiert (leere Rückgabe)."}

    except Exception as e:
        print(f"Agent General Error: {e}")
        return {"role": "assistant", "content": f"Interner Server-Fehler: {str(e)}"}


# ----------------------------------------------------
# React-Frontend ausliefern (Build-Ordner)
# ----------------------------------------------------

if os.path.isdir("build"):
    app.mount(
        "/static",
        StaticFiles(directory=os.path.join("build", "static")),
        name="static",
    )
    # Mount additional static folders from public
    if os.path.isdir(os.path.join("build", "img")):
        app.mount("/img", StaticFiles(directory=os.path.join("build", "img")), name="img")
    if os.path.isdir(os.path.join("build", "js")):
        app.mount("/js", StaticFiles(directory=os.path.join("build", "js")), name="js")
    if os.path.isdir(os.path.join("build", "pages")):
        app.mount("/pages", StaticFiles(directory=os.path.join("build", "pages")), name="pages")

@app.get("/manifest.json")
async def manifest():
    path = os.path.join("build", "manifest.json")
    if os.path.exists(path):
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="manifest.json nicht gefunden")

@app.get("/favicon.ico")
async def favicon():
    path = os.path.join("build", "favicon.ico")
    if os.path.exists(path):
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="favicon.ico nicht gefunden")


@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """
    Catch-all: liefert immer index.html aus dem React-Build zurück.
    """
    # Optional: Check if file exists in build root (e.g. robots.txt)
    possible_path = os.path.join("build", full_path)
    if os.path.isfile(possible_path):
         return FileResponse(possible_path)

    index_path = os.path.join("build", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="index.html nicht gefunden")