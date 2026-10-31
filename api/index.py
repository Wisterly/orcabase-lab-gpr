import json
from http.server import BaseHTTPRequestHandler
import openpyxl

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "online",
            "module": "OrcaEng_Lab_AI_Matching",
            "backend": "Python Serverless (Vercel)",
            "excel_engine": "openpyxl (Strict Mode)",
            "openpyxl_version": getattr(openpyxl, "__version__", "active"),
            "ai_engine": "Vector Embeddings & Semantic Matching ready"
        }
        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            body = {}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        response = {
            "status": "success",
            "received": body,
            "processed_by": "OrcaEng Python Serverless Engine"
        }
        self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
