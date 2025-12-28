# Worker Safety Monitoring System - PythonAnywhere Deployment

## Prerequisites
- A PythonAnywhere account (free tier works)
- Node.js installed locally (to build the React app)

## Step 1: Build the React App Locally

```bash
# In your project root directory
npm install
npm run build
```

This creates a `dist` folder with the production build.

## Step 2: Prepare Files for Upload

Your folder structure should look like:
```
worker-safety-monitor/
├── app.py
├── wsgi.py
├── requirements.txt
└── static/          # Rename 'dist' to 'static'
    ├── index.html
    └── assets/
        ├── index-xxx.js
        └── index-xxx.css
```

## Step 3: Upload to PythonAnywhere

1. Log into PythonAnywhere
2. Go to **Files** tab
3. Create a new directory (e.g., `worker-safety-monitor`)
4. Upload all files:
   - `app.py`
   - `wsgi.py`
   - `requirements.txt`
   - The entire `static` folder (you may need to zip and upload, then unzip using Bash console)

### Uploading the static folder via Bash Console:
```bash
cd ~/worker-safety-monitor
unzip static.zip
```

## Step 4: Set Up Virtual Environment

In a **Bash console** on PythonAnywhere:

```bash
cd ~/worker-safety-monitor
mkvirtualenv --python=/usr/bin/python3.10 worker-env
pip install -r requirements.txt
```

## Step 5: Configure Web App

1. Go to **Web** tab
2. Click **Add a new web app**
3. Choose **Manual configuration** (not Flask!)
4. Select Python 3.10

### Configure WSGI:
1. Click on the WSGI configuration file link
2. Delete all contents and paste:

```python
import sys
import os

project_home = '/home/YOUR_USERNAME/worker-safety-monitor'

if project_home not in sys.path:
    sys.path.insert(0, project_home)

os.chdir(project_home)

from app import app as application
```

3. Replace `YOUR_USERNAME` with your PythonAnywhere username

### Configure Virtual Environment:
In the **Virtualenv** section, enter:
```
/home/YOUR_USERNAME/.virtualenvs/worker-env
```

### Configure Static Files (Optional but recommended):
In the **Static files** section, add:
- URL: `/assets`
- Directory: `/home/YOUR_USERNAME/worker-safety-monitor/static/assets`

## Step 6: Reload and Test

1. Click the green **Reload** button
2. Visit your site at: `https://YOUR_USERNAME.pythonanywhere.com`

## Troubleshooting

### 502 Bad Gateway
- Check the error log in the Web tab
- Verify the WSGI file path is correct
- Ensure virtual environment is properly configured

### Static files not loading
- Verify the `static` folder exists and contains `index.html`
- Check file permissions

### API calls failing
- The Supabase backend is hosted separately and should work automatically
- Ensure the app was built with correct environment variables

## Environment Variables

If you need to set environment variables, add them in your WSGI file:
```python
os.environ['VITE_SUPABASE_URL'] = 'your-supabase-url'
os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'] = 'your-anon-key'
```

Note: For Vite apps, environment variables are embedded at build time, so you may need to rebuild if changing them.
