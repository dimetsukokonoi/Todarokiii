import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def _headers(prefer=None):
  """Returns standard Supabase REST headers."""
  h = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
  }
  if prefer:
    h["Prefer"] = prefer
  return h


def _request(method, path, data=None, prefer=None):
  """Makes an HTTP request to the Supabase REST API."""
  url = f"{SUPABASE_URL}/rest/v1/{path}"
  body = json.dumps(data).encode() if data else None
  req = urllib.request.Request(url, data=body, headers=_headers(prefer), method=method)
  try:
    with urllib.request.urlopen(req) as resp:
      raw = resp.read().decode()
      if raw:
        return json.loads(raw)
      return None
  except urllib.error.HTTPError as e:
    error_body = e.read().decode()
    raise RuntimeError(f"Supabase API error {e.code}: {error_body}")


def init_db():
  """No-op — the table is already created in Supabase via migration."""
  if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY environment variables are required.")
  print(f"✅ Connected to Supabase: {SUPABASE_URL}")
