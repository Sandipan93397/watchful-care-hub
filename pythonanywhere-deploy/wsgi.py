"""
WSGI configuration for PythonAnywhere.
Update the path below to match your PythonAnywhere username and project location.
"""
import sys
import os

# Update this path to your project directory on PythonAnywhere
# Example: /home/yourusername/myproject
project_home = '/home/YOUR_USERNAME/worker-safety-monitor'

if project_home not in sys.path:
    sys.path.insert(0, project_home)

os.chdir(project_home)

from app import app as application
