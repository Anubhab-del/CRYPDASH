# Cryptocurrency Dashboard

A production-ready React application for tracking cryptocurrency prices, market data, and conversions.

## 🚀 Features

- Real-time cryptocurrency prices
- Interactive price charts (Line & Bar)
- Currency converter (Crypto ↔ Fiat)
- Market cap visualization
- Multi-currency support (USD, EUR, GBP, INR, etc.)
- Search functionality
- Responsive design

## ⚙️ Technologies

- React 18
- Redux + Redux Thunk
- Chart.js + react-chartjs-2
- TailwindCSS
- CoinGecko API
- Axios

## 🔧 Installation
```bash
npm install
npm start
```

## ⚠️ Important: API Rate Limiting

This app uses CoinGecko's **free API** which has strict rate limits:
- **10-30 requests per minute**
- **Rate limit errors (429) are common**

### Solutions Implemented:

1. **Request Queue**: All API calls are queued with 2-second intervals
2. **Caching**: 60-second cache prevents duplicate requests
3. **CORS Proxy**: Uses `corsproxy.io` to avoid CORS issues
4. **Mock Data Fallback**: Shows sample data when rate limited
5. **Smart Retry**: Wait 60 seconds between currency changes

### Best Practices:

- ✅ Wait 60 seconds between currency changes
- ✅ Data auto-refreshes every 60 seconds
- ✅ Use cached data when available
- ✅ Avoid rapid clicking/refreshing

## 🔑 Production Deployment

For production, consider:

1. **Get CoinGecko Pro API key** ($129/month) for higher limits
2. **Use backend proxy** instead of client-side CORS proxy
3. **Implement server-side caching** with Redis
4. **Add rate limit monitoring**

## 📦 Build
```bash
npm run build
```

## 🚢 Deploy

Deploy to:
- Vercel: `vercel`
- Netlify: `netlify deploy --prod`
- Heroku: `git push heroku main`

## 📝 License

MIT
