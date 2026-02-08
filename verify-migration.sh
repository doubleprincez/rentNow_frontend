#!/bin/bash

# Verification script to check if migration is complete

echo "🔍 Verifying Redux Auth Migration..."
echo ""

ERRORS=0
WARNINGS=0

# Check if new files exist
echo "✓ Checking new files..."
if [ ! -f "src/redux/authSlice.ts" ]; then
    echo "  ❌ src/redux/authSlice.ts not found"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✓ authSlice.ts exists"
fi

if [ ! -f "src/lib/authUtils.ts" ]; then
    echo "  ❌ src/lib/authUtils.ts not found"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✓ authUtils.ts exists"
fi

echo ""

# Check if old files still exist
echo "⚠️  Checking for old files (should be removed)..."
if [ -f "src/redux/userSlice.ts" ]; then
    echo "  ⚠️  userSlice.ts still exists (should be removed)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "src/redux/agentSlice.ts" ]; then
    echo "  ⚠️  agentSlice.ts still exists (should be removed)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -f "src/redux/adminSlice.ts" ]; then
    echo "  ⚠️  adminSlice.ts still exists (should be removed)"
    WARNINGS=$((WARNINGS + 1))
fi

if [ $WARNINGS -eq 0 ]; then
    echo "  ✓ No old slice files found"
fi

echo ""

# Check for old state references
echo "🔎 Checking for old state references..."
OLD_USER_REFS=$(grep -r "state\.user\." src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
OLD_AGENT_REFS=$(grep -r "state\.agent\." src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
OLD_ADMIN_REFS=$(grep -r "state\.admin\." src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)

if [ $OLD_USER_REFS -gt 0 ]; then
    echo "  ⚠️  Found $OLD_USER_REFS references to 'state.user.*'"
    WARNINGS=$((WARNINGS + 1))
fi

if [ $OLD_AGENT_REFS -gt 0 ]; then
    echo "  ⚠️  Found $OLD_AGENT_REFS references to 'state.agent.*'"
    WARNINGS=$((WARNINGS + 1))
fi

if [ $OLD_ADMIN_REFS -gt 0 ]; then
    echo "  ⚠️  Found $OLD_ADMIN_REFS references to 'state.admin.*'"
    WARNINGS=$((WARNINGS + 1))
fi

if [ $OLD_USER_REFS -eq 0 ] && [ $OLD_AGENT_REFS -eq 0 ] && [ $OLD_ADMIN_REFS -eq 0 ]; then
    echo "  ✓ No old state references found"
fi

echo ""

# Check for new state references
echo "✓ Checking for new state references..."
NEW_AUTH_REFS=$(grep -r "state\.auth\." src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "  ✓ Found $NEW_AUTH_REFS references to 'state.auth.*'"

echo ""

# Check for old imports
echo "🔎 Checking for old imports..."
OLD_USER_IMPORTS=$(grep -r "from '@/redux/userSlice'" src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
OLD_AGENT_IMPORTS=$(grep -r "from '@/redux/agentSlice'" src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
OLD_ADMIN_IMPORTS=$(grep -r "from '@/redux/adminSlice'" src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)

if [ $OLD_USER_IMPORTS -gt 0 ]; then
    echo "  ⚠️  Found $OLD_USER_IMPORTS imports from userSlice"
    WARNINGS=$((WARNINGS + 1))
fi

if [ $OLD_AGENT_IMPORTS -gt 0 ]; then
    echo "  ⚠️  Found $OLD_AGENT_IMPORTS imports from agentSlice"
    WARNINGS=$((WARNINGS + 1))
fi

if [ $OLD_ADMIN_IMPORTS -gt 0 ]; then
    echo "  ⚠️  Found $OLD_ADMIN_IMPORTS imports from adminSlice"
    WARNINGS=$((WARNINGS + 1))
fi

if [ $OLD_USER_IMPORTS -eq 0 ] && [ $OLD_AGENT_IMPORTS -eq 0 ] && [ $OLD_ADMIN_IMPORTS -eq 0 ]; then
    echo "  ✓ No old imports found"
fi

echo ""

# Check for new imports
echo "✓ Checking for new imports..."
NEW_AUTH_IMPORTS=$(grep -r "from '@/redux/authSlice'" src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "  ✓ Found $NEW_AUTH_IMPORTS imports from authSlice"

echo ""

# Check package.json
echo "📦 Checking package.json..."
if grep -q "redux-persist" package.json 2>/dev/null; then
    echo "  ⚠️  redux-persist still in package.json (should be removed)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "  ✓ redux-persist not found in package.json"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VERIFICATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Migration appears complete!"
    echo ""
    echo "Next steps:"
    echo "1. Test all login flows"
    echo "2. Test all protected routes"
    echo "3. Clear localStorage in browser"
    echo "4. Deploy to staging"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Migration mostly complete with $WARNINGS warnings"
    echo ""
    echo "Warnings found:"
    [ $OLD_USER_REFS -gt 0 ] && echo "  - Old state.user.* references"
    [ $OLD_AGENT_REFS -gt 0 ] && echo "  - Old state.agent.* references"
    [ $OLD_ADMIN_REFS -gt 0 ] && echo "  - Old state.admin.* references"
    [ $OLD_USER_IMPORTS -gt 0 ] && echo "  - Old userSlice imports"
    [ $OLD_AGENT_IMPORTS -gt 0 ] && echo "  - Old agentSlice imports"
    [ $OLD_ADMIN_IMPORTS -gt 0 ] && echo "  - Old adminSlice imports"
    [ -f "src/redux/userSlice.ts" ] && echo "  - userSlice.ts still exists"
    [ -f "src/redux/agentSlice.ts" ] && echo "  - agentSlice.ts still exists"
    [ -f "src/redux/adminSlice.ts" ] && echo "  - adminSlice.ts still exists"
    grep -q "redux-persist" package.json 2>/dev/null && echo "  - redux-persist in package.json"
    echo ""
    echo "Run './migrate-auth.sh' again or fix manually"
    exit 1
else
    echo "❌ Migration incomplete with $ERRORS errors and $WARNINGS warnings"
    echo ""
    echo "Please check the errors above and fix them"
    exit 2
fi
