#!/usr/bin/env python3
import http.server
import socket
import socketserver
import urllib.error
import urllib.request
import webbrowser
import os

PREFERRED_PORTS = (8000, 8080, 8888, 5500, 5173, 3000)
BIND_HOST = "127.0.0.1"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()


def port_is_free(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 0)
        try:
            sock.bind((BIND_HOST, port))
            return True
        except OSError:
            return False


def is_this_app(port):
    try:
        with urllib.request.urlopen(f"http://{BIND_HOST}:{port}/", timeout=0.8) as response:
            body = response.read(4096).decode("utf-8", errors="ignore")
        return "Use sus Sesos" in body or "Usa Tus Sesos" in body
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def pick_port():
    env_port = os.environ.get("PORT")
    if env_port:
        return int(env_port)

    for port in PREFERRED_PORTS:
        if port_is_free(port):
            return port
        if is_this_app(port):
            return port

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((BIND_HOST, 0))
        return sock.getsockname()[1]


def start_server():
    port = pick_port()
    url = f"http://{BIND_HOST}:{port}"

    if not port_is_free(port) and is_this_app(port):
        print(f"🚀 El juego ya está corriendo en {url}", flush=True)
        print("🎮 Abriendo el juego en tu navegador...", flush=True)
        webbrowser.open(url)
        return

    try:
        with socketserver.TCPServer((BIND_HOST, port), Handler) as httpd:
            print(f"🚀 Servidor iniciado en {url}", flush=True)
            print(f"📂 Sirviendo archivos desde: {os.getcwd()}", flush=True)
            print("🎮 Abriendo el juego en tu navegador...", flush=True)
            print("⏹️  Para detener el servidor, presiona Ctrl+C", flush=True)

            webbrowser.open(url)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🔴 Servidor detenido")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ El puerto {port} ya está en uso por otra aplicación.")
            print("💡 Cierra ese proceso o arranca con: PORT=8080 ./server.sh")
        else:
            print(f"❌ Error al iniciar servidor: {e}")


if __name__ == "__main__":
    start_server()
