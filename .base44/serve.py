"""Static file server for the sandbox preview.

Serves the bind-mounted repository with ``Cache-Control: no-store`` so that an
edited index.html / styles.css / script.js is always picked up on reload.
(``python -m http.server`` sends only ``Last-Modified``, so browsers happily
serve a stale script.js after an edit.)
"""

import functools
import http.server
import socketserver

ROOT = "/app"


class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep container logs readable
        super().log_message(fmt, *args)


Handler.extensions_map.update(
    {
        ".js": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
    }
)


if __name__ == "__main__":
    with socketserver.ThreadingTCPServer(
        ("0.0.0.0", 80), functools.partial(Handler, directory=ROOT)
    ) as httpd:
        httpd.daemon_threads = True
        httpd.serve_forever()
