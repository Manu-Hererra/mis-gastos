export default async function handler(req, res) {
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,currency`;

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
    });
    if (!r.ok) {
      // Intentar con query2 como fallback
      const r2 = await fetch(url.replace("query1", "query2"), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
      });
      if (!r2.ok) return res.status(502).json({ error: "Yahoo Finance unavailable" });
      const d = await r2.json();
      return res.status(200).json(d);
    }
    const d = await r.json();
    res.status(200).json(d);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
