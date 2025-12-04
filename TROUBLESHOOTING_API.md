# API Connection Troubleshooting

If you're unable to connect to the Company API, here are common issues and solutions:

## Common Issues

### 1. CORS (Cross-Origin Resource Sharing) Error
**Symptom:** Browser console shows "CORS policy" error

**Solution:** Configure your backend API to allow requests from your frontend origin.

For ASP.NET Core, add to your `Program.cs` or `Startup.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001") // Add your Next.js port
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

### 2. SSL Certificate Error
**Symptom:** "Failed to fetch" or certificate errors in console

**Solutions:**
- **Option A:** Visit `https://localhost:7298` in your browser first and accept the certificate
- **Option B:** Switch to HTTP for local development (change API_BASE_URL in `lib/companies.ts`)
- **Option C:** Configure your backend to use a trusted certificate

### 3. API Server Not Running
**Symptom:** Connection refused or network error

**Solution:** Make sure your API server is running on port 7298

### 4. Using HTTP Instead of HTTPS
If your API supports HTTP, you can:

1. **Option 1:** Set environment variable
   Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:7298/api/Company
   ```

2. **Option 2:** Edit `lib/companies.ts` directly
   Change line 5:
   ```typescript
   const API_BASE_URL = 'http://localhost:7298/api/Company';
   ```

## Testing the API Connection

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to load companies - you'll see detailed error messages
4. Check Network tab to see the actual HTTP request/response

## Backend Configuration Checklist

- [ ] API server is running on port 7298
- [ ] CORS is configured to allow your frontend origin
- [ ] API endpoints are accessible (test with Postman or browser)
- [ ] SSL certificate is accepted (if using HTTPS)
- [ ] API returns data in expected format: `{ success: true, message: "...", data: [...] }`

