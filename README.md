# Khonodds

[Open app ↗](https://market-watch-khonsu.vercel.app/)

Independent, read-only Polymarket research desk. Vanilla JavaScript, zero runtime packages, Node 20+. No wallet connection, transactions, account, paid API or model calls.

## Run and deploy

```
npm test
npm run build
npm start
```

Open http://localhost:3000. `PORT` overrides the local port. Vercel auto-detects the configuration: static `dist` plus `api/data.js`. No environment variables needed. Hosting provider quotas still apply. Do not configure this as a static-only site: the same-origin API is required.

## Included

- 50-row leaderboard with period, category, PnL/volume ordering and local name, volume and positive-PnL filters.
- Up to 20 watched public proxy wallets, notes, import/export and light/dark themes.
- Position, closed-position and activity inspection with separate value, concentration and partial closed realized PnL metrics.
- Open-page wallet trade alerts, threshold, device-local quiet hours and optional browser notifications. Two-minute checks only while visible. Initial results establish a baseline. Quiet-hours trades are skipped. No closed-app monitoring or notification provider is configured.
- AI company source notebook for OpenAI, Anthropic, Databricks and Cohere. Official company links and SEC search. Manual source verification, no asserted IPO status or automated filing alerts.

## Data and limitations

Official documentation inspected 2026-09-20:

- https://docs.polymarket.com/api-reference/core/get-trader-leaderboard-rankings
- https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user
- https://docs.polymarket.com/api-reference/core/get-user-activity
- https://www.sec.gov/search-filings
- https://www.sec.gov/edgar/search/

The allowlist uses documented legacy `/v1/leaderboard`, `/positions`, `/closed-positions`, `/activity` endpoints on `https://data-api.polymarket.com`. Current docs also advertise v2. This small initial release intentionally keeps the documented array schemas. Removal or schema changes produce explicit errors, never fabricated data.

Requests have 10-second upstream and 15-second client timeouts, reject redirects, restrict the upstream host, reject unexpected or repeated query parameters, validate and normalize each endpoint’s records, and cap streamed response bytes at 2 MB (cancelling oversized bodies) and rows at 100, and cache 45 seconds with at most 200 keys per warm function. Hosting cache adds up to 45 seconds. Alert polling is sequential and bounded by 20 wallets; browser suspension, high-volume wallets, API failure and 100-row snapshots can cause missed activity. Alerts track event identities at the timestamp boundary, so distinct trades in the same second are not discarded. Identical reported rows cannot be distinguished, and late-arriving events older than the boundary may be missed. There is no pagination or complete accounting reconciliation. Source timestamps indicate fetch time, not exchange execution freshness. Browser local storage is not encrypted and does not sync.

Leaderboard PnL is reported by Polymarket, not independently verified realized profit. Closed realized PnL is the sum of up to 100 returned closed positions, not lifetime gains. Concentration uses only loaded current position value. None of these metrics establishes trader quality, risk-adjusted performance, or an investment recommendation.

Production smoke checks on 2026-09-20 returned live leaderboard, current positions, closed positions and activity data through the deployed API. The wallet watch add/remove flow, alert preference saving and 390px mobile layout were checked in the browser. Actual future trade delivery is not guaranteed by these checks.

## License

Original project code is available under the [MIT License](LICENSE), copyright © 2026 Patrick Obrtal. Third-party components retain their own licenses.
