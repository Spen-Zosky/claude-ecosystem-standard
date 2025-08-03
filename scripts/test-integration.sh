#!/bin/bash
# test-integration.sh - Test suite per integrazione CES

set -e

echo "🧪 Test Suite Integrazione CES"
echo "=============================="

# Test 1: Verifica struttura
echo -n "Test 1 - Struttura directory... "
if [ -L "../.claude" ] && [ -d ".claude" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 2: Wrapper script
echo -n "Test 2 - Wrapper script... "
if [ -x "../ces-cli" ]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 3: Configurazione ambiente
echo -n "Test 3 - File .env.local... "
if [ -f ".env.local" ] && grep -q "CES_OPERATION_MODE=integrated" .env.local; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 4: Comando version
echo -n "Test 4 - Comando version... "
if ../ces-cli --version > /dev/null 2>&1; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

# Test 5: Percorsi configurazione
echo -n "Test 5 - Percorsi config... "
OUTPUT=$(../ces-cli config show --section paths 2>/dev/null || true)
if echo "$OUTPUT" | grep -q "projectRoot"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    exit 1
fi

echo ""
echo "✅ Tutti i test passati!"