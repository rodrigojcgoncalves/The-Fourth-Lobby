#!/usr/bin/env python3
"""
Simple HTTP Server for Project in HTML
Serves the HTML files locally for development and Figma Make import
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add caching headers to prevent issues
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # Default to HTML/index.html for root
        if self.path == '/':
            self.path = '/HTML/index.html'
        return super().do_GET()

def run_server(port=8000):
    """Run the HTTP server"""
    # Change to script directory
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    
    handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"\n{'='*60}")
            print(f"🚀 The Fourth Lobby - HTML Prototype Server")
            print(f"{'='*60}")
            print(f"\n✓ Server running at: http://localhost:{port}")
            print(f"\nUsage:")
            print(f"  • Open http://localhost:{port} in your browser")
            print(f"  • Use html.to.design extension in Figma to import the prototype")
            print(f"\nPress CTRL+C to stop the server\n")
            print(f"{'='*60}\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48 or e.errno == 98:  # Address already in use
            print(f"\n❌ Port {port} is already in use")
            print(f"   Try killing the process or use a different port")
            sys.exit(1)
        raise

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
