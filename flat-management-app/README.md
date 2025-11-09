# Flat Management Application

A comprehensive flat/building management system with multi-building support, tenant management, payment tracking, and expense monitoring.

## Features

### Building Management
- Add and manage multiple buildings
- Track total flats, occupied/vacant status
- Building-specific details and contact information
- Automatic flat creation when adding buildings

### Tenant Management
- Complete tenant information (Name, ID, Nationality, Contact)
- ID document upload and storage
- Tenant rental history
- Payment history tracking
- Active/inactive tenant status

### Flat Management
- View all flats across buildings
- Filter by building and occupancy status
- Real-time occupancy tracking
- Flat-wise rental details

### Rental Agreements
- Create new rental agreements
- Configurable rental duration (days/months)
- Flexible rental amount (per day/month)
- Advance payment tracking
- Start and end date management

### Payment Tracking
- Record all payments (rent, advance, other)
- Payment history by tenant
- Payment history by date range
- Multiple payment methods support
- Pending payment tracking

### Expense Tracking
- Record building-specific or general expenses
- Categorize expenses
- Date-wise expense filtering
- Expense analytics by category

### Dashboard & Reports
- Real-time statistics
- Today's and monthly income/expense summary
- 7-day income/expense trends
- Visual charts and graphs
- Pending payments overview
- Recent activities

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Multer (file uploads)

### Frontend
- React
- React Router
- Recharts (data visualization)
- Axios (API calls)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL and create a database:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE flat_management;
CREATE USER flat_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE flat_management TO flat_admin;
\q
```

2. Import the schema:
```bash
psql -U flat_admin -d flat_management -f backend/database/schema.sql
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flat_management
DB_USER=flat_admin
DB_PASSWORD=your_secure_password
```

5. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Production Deployment on VPS

### 1. Server Preparation

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Nginx
sudo apt-get install nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE flat_management;
CREATE USER flat_admin WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE flat_management TO flat_admin;
\q

# Import schema
psql -U flat_admin -d flat_management -f /path/to/backend/database/schema.sql
```

### 3. Deploy Backend

```bash
# Clone or upload your project to VPS
cd /var/www/flat-management-app/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add your production configuration

# Start with PM2
pm2 start server.js --name flat-management-api
pm2 save
pm2 startup
```

### 4. Build and Deploy Frontend

```bash
cd /var/www/flat-management-app/frontend

# Install dependencies
npm install

# Create production build
npm run build

# The build folder will contain your static files
```

### 5. Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/flat-management
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Frontend
    location / {
        root /var/www/flat-management-app/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads {
        alias /var/www/flat-management-app/backend/uploads;
    }

    client_max_body_size 10M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/flat-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL (Optional but Recommended)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 7. Setup Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Usage

### Initial Setup

1. Access the application at `http://your-domain.com` or `http://your-vps-ip`

2. Start by adding your buildings:
   - Go to "Buildings" page
   - Click "Add Building"
   - Enter building details and number of flats
   - Flats will be created automatically

3. Add new tenants:
   - Click "New Entry" button on dashboard
   - Fill in tenant information
   - Upload ID document (optional)
   - Select building and available flat
   - Set rental terms (duration, amount, advance)
   - Submit to create tenant and rental agreement

4. Record payments and expenses as they occur

### Daily Operations

- **Dashboard**: View overall statistics and quick actions
- **Buildings**: Manage building information
- **Flats**: View all flats and their occupancy status
- **Tenants**: View and manage tenant information
- **Payments**: Record new payments and view history
- **Expenses**: Track all expenses by category
- **Reports**: Generate financial reports and analytics

## Maintenance

### Backup Database

```bash
# Create backup
pg_dump -U flat_admin flat_management > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U flat_admin flat_management < backup_20231201.sql
```

### View Logs

```bash
# PM2 logs
pm2 logs flat-management-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Update Application

```bash
# Backend
cd /var/www/flat-management-app/backend
git pull  # or upload new files
npm install
pm2 restart flat-management-api

# Frontend
cd /var/www/flat-management-app/frontend
git pull  # or upload new files
npm install
npm run build
sudo systemctl reload nginx
```

## Security Recommendations

1. Change default database password
2. Use environment variables for sensitive data
3. Enable SSL/HTTPS
4. Set up regular database backups
5. Keep Node.js and dependencies updated
6. Use strong passwords for all accounts
7. Limit database access to localhost only
8. Set appropriate file permissions

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in `.env`
- Check logs: `pm2 logs flat-management-api`

### Frontend shows blank page
- Check if build was created: `ls frontend/build`
- Verify Nginx configuration: `sudo nginx -t`
- Check browser console for errors

### Database connection errors
- Verify PostgreSQL is running
- Check firewall settings
- Verify database credentials
- Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

## Support

For issues or questions, please check the logs and error messages for detailed information.

## License

This project is licensed for private use.
