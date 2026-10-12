"""Serve the game for parallel browser QA: python scripts/qa-http-server.py."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys


class QAServer(ThreadingHTTPServer):
    request_queue_size = 128


public = Path(__file__).resolve().parents[1] / "public"
port = int(sys.argv[1]) if len(sys.argv) > 1 else 4332
QAServer(("127.0.0.1", port), partial(SimpleHTTPRequestHandler, directory=public)).serve_forever()
