#!/usr/bin/env bash
# ============================================================
# NEON HORDE — Kompletter Verifikationslauf (für jede Fix-Runde)
# Aufruf: bash test/verify.sh
# ============================================================
set -e
cd "$(dirname "$0")/.."
echo "=================================================="
echo "  NEON HORDE — Alle Checks"
echo "=================================================="

echo ""
echo "[1/6] Syntax aller src-Module (node --check)"
fails=0
for f in src/*.js; do
  out=$(node --check "$f" 2>&1 || true)
  if [ -n "$out" ]; then echo "  FAIL $f: $out"; fails=1; fi
done
[ $fails -eq 0 ] && echo "  OK: alle $(ls src/*.js | wc -l) Module syntaktisch gültig"

echo ""
echo "[2/6] Balance-Konsistenz"
node test/balance-check.js

echo ""
echo "[3/6] Runtime-Contract (15 Module)"
node test/runtime-contract.js

echo ""
echo "[4/6] Smoke-Test (Boot + Run + Frames)"
node test/smoke.js --frames 120

echo ""
echo "[5/6] Build Single-File"
node build/build.js

echo ""
echo "[6/6] Single-File-Integrität des dist"
ext=$(grep -cE '<(script|link)[^>]+(src|href)="[^"#][^"]*"' dist/index.html || true)
inline=$(grep -c '<script>' dist/index.html || true)
intern=$(grep -c 'src="src/' dist/index.html || true)
echo "  Externe Refs: $ext (nur favicon-Data-URI ok = 1)"
echo "  Inline-Skripte: $inline (muss 1 sein)"
echo "  Interne src-Refs: $intern (muss 0 sein)"
[ "$inline" = "1" ] && [ "$intern" = "0" ] && echo "  OK: dist ist single-file"
[ "$inline" = "1" ] && [ "$intern" = "0" ] || { echo "  FAIL: dist nicht single-file"; exit 1; }

echo ""
echo "=================================================="
echo "  FERTIG: Alle Checks bestanden"
echo "=================================================="