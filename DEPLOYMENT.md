# IONOS Deployment Guide

This guide covers deploying the Beat the Backlog Quiz application to IONOS hosting.

## Prerequisites

- IONOS web hosting account with MySQL database
- VPS or hosting plan that supports Python applications (shared hosting may not support FastAPI)
- Domain name configured in IONOS

## Database Setup

1. **Create MySQL Database in IONOS Control Panel**
   - Go to Hosting > Databases
   - Create a new MySQL database
   - Note down: hostname, database name, username, password, port (usually 3306)

2. **Configure Database Connection**
   - Copy `.env.example` to `.env`
   - Set `DATABASE_URL=mysql+pymysql://username:password@hostname:port/database_name`

## Backend Deployment (FastAPI)

### Option 1: IONOS VPS/Cloud Server

1. **Provision VPS**
   - Choose Ubuntu or CentOS
   - Ensure Python 3.10+ is available

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv
   ```

3. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd programming_quiz_api
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your database details
   ```

4. **Run Migrations and Start Server**
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   # Or use gunicorn for production:
   # pip install gunicorn
   # gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

5. **Configure Reverse Proxy**
   - Use nginx/apache to proxy to your FastAPI app
   - Example nginx config:
   ```
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Option 2: IONOS Shared Hosting (Limited)

Shared hosting typically only supports PHP. You may need to upgrade to VPS for Python support.

## Frontend Deployment

1. **Build Production Frontend**
   ```bash
   cd frontend
   npm install
   # Set VITE_API_URL in frontend/.env.production
   npm run build:deploy
   ```

2. **Upload Static Files**
   - Upload `dist-deploy.zip` from the repository root to your IONOS web space
   - Extract it so files land under your `/public/quiz` directory
   - If your host cannot extract zip files, run `npm run build` and upload the `dist/` contents manually
   - Ensure the base path is set correctly (currently `/quiz/`)

3. **Configure Domain**
   - Point your domain to the IONOS hosting
   - The frontend will be served from the root, API from `/api` or subdomain

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://user:pass@host:3306/db
LOG_LEVEL=INFO
RATE_LIMIT_REQUESTS_PER_MINUTE=120
```

### Frontend Build
```bash
VITE_API_URL=https://api.yourdomain.com
```

## Database Migration

The application automatically runs migrations and seeds data on startup. The JSON questions will be imported into the MySQL database.

## Testing Deployment

1. **Test Database Connection**
   ```bash
   python -c "from app.database import initialize_database; initialize_database()"
   ```

2. **Test API Endpoints**
   - Visit `https://your-api-domain.com/question-sets`
   - Should return JSON list of question sets

3. **Test Frontend**
   - Visit `https://yourdomain.com/quiz/`
   - Should load the quiz interface

## IONOS Specific Notes

- **MySQL Limits**: Check your plan's database size and connection limits
- **SSL**: IONOS provides free SSL certificates
- **Backups**: Enable automatic database backups
- **Performance**: Monitor MySQL query performance and consider indexing
- **Support**: Contact IONOS support for Python deployment assistance on VPS plans

## Troubleshooting

- **Database Connection Issues**: Verify credentials and firewall settings
- **CORS Errors**: Ensure API allows requests from your frontend domain
- **Static File Issues**: Check file permissions and base path configuration
- **Migration Errors**: Ensure MySQL user has CREATE/ALTER permissions