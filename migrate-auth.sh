#!/bin/bash

# Migration script to update Redux state references from user/agent/admin to auth

echo "Starting migration to unified auth state..."

# Find all TypeScript/JavaScript files
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i.bak \
  -e 's/state\.user\.isLoggedIn/state.auth.isLoggedIn/g' \
  -e 's/state\.agent\.isLoggedIn/state.auth.isLoggedIn/g' \
  -e 's/state\.admin\.isLoggedIn/state.auth.isLoggedIn/g' \
  -e 's/state\.user\.token/state.auth.token/g' \
  -e 's/state\.agent\.token/state.auth.token/g' \
  -e 's/state\.admin\.token/state.auth.token/g' \
  -e 's/state\.user\.userId/state.auth.userId/g' \
  -e 's/state\.agent\.userId/state.auth.userId/g' \
  -e 's/state\.admin\.userId/state.auth.userId/g' \
  -e 's/state\.user\.firstName/state.auth.firstName/g' \
  -e 's/state\.agent\.firstName/state.auth.firstName/g' \
  -e 's/state\.admin\.firstName/state.auth.firstName/g' \
  -e 's/state\.user\.lastName/state.auth.lastName/g' \
  -e 's/state\.agent\.lastName/state.auth.lastName/g' \
  -e 's/state\.admin\.lastName/state.auth.lastName/g' \
  -e 's/state\.user\.email/state.auth.email/g' \
  -e 's/state\.agent\.email/state.auth.email/g' \
  -e 's/state\.admin\.email/state.auth.email/g' \
  -e 's/state\.user\.accountType/state.auth.accountType/g' \
  -e 's/state\.agent\.accountType/state.auth.accountType/g' \
  -e 's/state\.admin\.accountType/state.auth.accountType/g' \
  -e 's/state\.user\.account_id/state.auth.account_id/g' \
  -e 's/state\.agent\.account_id/state.auth.account_id/g' \
  -e 's/state\.admin\.account_id/state.auth.account_id/g' \
  -e 's/state\.user\.apartments/state.auth.apartments/g' \
  -e 's/state\.agent\.apartments/state.auth.apartments/g' \
  -e 's/state\.user\.rentedApartments/state.auth.rentedApartments/g' \
  -e 's/state\.agent\.rentedApartments/state.auth.rentedApartments/g' \
  -e 's/state\.user\.isSubscribed/state.auth.isSubscribed/g' \
  -e 's/state\.user\.phoneNumber/state.auth.phoneNumber/g' \
  -e 's/state\.agent\.phoneNumber/state.auth.phoneNumber/g' \
  -e 's/state\.admin\.phoneNumber/state.auth.phoneNumber/g' \
  -e 's/state\.agent\.businessDetails/state.auth.businessDetails/g' \
  -e 's/state\.user\b/state.auth/g' \
  -e 's/state\.agent\b/state.auth/g' \
  -e 's/state\.admin\b/state.auth/g' \
  {} \;

# Update import statements
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i.bak \
  -e "s/from '@\/redux\/userSlice'/from '@\/redux\/authSlice'/g" \
  -e "s/from '@\/redux\/agentSlice'/from '@\/redux\/authSlice'/g" \
  -e "s/from '@\/redux\/adminSlice'/from '@\/redux\/authSlice'/g" \
  -e "s/import.*{.*login.*}.*from.*'@\/redux\/userSlice'/import { login } from '@\/redux\/authSlice'/g" \
  -e "s/import.*{.*loginAgent.*}.*from.*'@\/redux\/agentSlice'/import { login } from '@\/redux\/authSlice'/g" \
  -e "s/import.*{.*loginAdmin.*}.*from.*'@\/redux\/adminSlice'/import { login } from '@\/redux\/authSlice'/g" \
  -e "s/loginAgent/login/g" \
  -e "s/loginAdmin/login/g" \
  -e "s/logoutAgent/logout/g" \
  -e "s/logoutAdmin/logout/g" \
  {} \;

# Remove backup files
find src -type f -name "*.bak" -delete

echo "Migration complete!"
echo "Please review the changes and test thoroughly."
echo ""
echo "Next steps:"
echo "1. Remove old slice files: userSlice.ts, agentSlice.ts, adminSlice.ts"
echo "2. Clean localStorage: userState, agentState, adminState, agentToken, adminToken, token"
echo "3. Update any remaining manual references"
echo "4. Test all login flows for each account type"
