#!/bin/bash
echo "============================================"
echo "   PRINCE EVENT'S - Network Mode"
echo '   "We Serve You Smile"'
echo "============================================"
echo ""
IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}')
echo "[*] Your computer IP: $IP"
echo ""
echo "[*] Starting server for network access..."
echo ""
echo "[✓] Open on your phone browser:"
echo "    http://$IP:3000"
echo ""
echo "[*] Make sure phone is on the SAME WiFi network"
echo "[*] Press Ctrl+C to stop"
echo ""
npx next dev -H 0.0.0.0
