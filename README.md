# HRMS Philippines - Employee Management System

## Deployment Configuration

### API URL Configuration

The application needs to know where your API server is located. You can configure this in several ways:

#### Option 1: Environment Variable (Build Time)
Set the `NEXT_PUBLIC_API_BASE_URL` environment variable when building:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-api-server:9001 npm run build
```

Or in Docker:
```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://your-api-server:9001 .
```

#### Option 2: Runtime Configuration (Browser Console)
If the API URL needs to be changed after deployment, you can set it in the browser console before logging in:

```javascript
localStorage.setItem('api_base_url', 'http://your-api-server:9001');
```

Or set it on the window object:
```javascript
window.API_BASE_URL = 'http://your-api-server:9001';
```

Then refresh the page and try logging in again.

#### Option 3: Docker Compose
Update the `docker-compose.yml` file or set the environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-api-server:9001 docker-compose up --build
```

### Troubleshooting Login Issues

If you cannot login after deployment:

1. **Check the API URL**: Open browser console (F12) and look for the login attempt log. It will show the API URL being used.

2. **Verify API Server**: Make sure your API server is:
   - Running and accessible
   - Configured with proper CORS settings
   - Using the correct port

3. **Network Issues**: If you see "Failed to fetch" errors:
   - The API URL might be incorrect
   - The API server might not be accessible from the browser
   - CORS might not be properly configured on the API server

4. **Update API URL**: Use the browser console method (Option 2 above) to quickly test different API URLs without rebuilding.

### Default Configuration

The default API URL is: `http://172.20.10.168:9001`

This is typically a local development IP. Make sure to update it for production deployments.
