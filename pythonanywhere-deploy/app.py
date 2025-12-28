"""
Flask server to serve the React application on PythonAnywhere.
"""
from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='static', static_url_path='')

@app.route('/')
@app.route('/<path:path>')
def serve(path=''):
    """
    Serve the React SPA. All routes return index.html for client-side routing.
    """
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
