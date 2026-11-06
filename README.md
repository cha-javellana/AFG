# Ashi's Frozen Goods — static site preview

Custom photo-and-price menu site for Ashi's Frozen Goods (Pavia, Iloilo).

## Pages

- `/` — Home
- `/menu/` — Full catalog (Tuna, Processed Tuna, Salmon, Imported Steaks)
- `/about/` — Mission, Vision, how to buy
- `/contact/` — NAP, hours, map search, WhatsApp

Legacy `menu.html`, `about.html`, and `contact.html` redirect to the folder URLs.

## Local preview

```bash
cd /workspace/ashis-frozen-goods
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/

## Hosting

Intended for free GitHub Pages (or similar static host). No checkout; orders via WhatsApp or visit / pick up at the Pavia shop.
