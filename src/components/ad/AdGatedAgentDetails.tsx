'use client'

import React, { useState, useEffect } from 'react';
import { User, MailIcon, PhoneCallIcon, BuildingIcon, PlayCircle, Clock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Using title attribute for tooltip instead of custom component
import { AdGatedAgentDetailsProps } from '@/types/ad';
import AdSessionManager from '@/services/AdSessionManager';

/**
 * AdGatedAgentDetails Component
 * 
 * Manages the display state of agent details for non-subscribed users.
 * Shows blurred/hidden contact information with a call-to-action to watch an ad.
 */
export default function AdGatedAgentDetails({
  apartment,
  onUnlock,
  isUnlocked,
  remainingTime
}: AdGatedAgentDetailsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(remainingTime || 0);

  // Update remaining time every second
  useEffect(() => {
    if (!isUnlocked) return;

    const interval = setInterval(() => {
      const remaining = AdSessionManager.getRemainingTime();
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setShowDetails(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Update show details when unlock state changes
  useEffect(() => {
    setShowDetails(isUnlocked);
  }, [isUnlocked]);

  const handleViewDetailsClick = () => {
    onUnlock();
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderAgentInfo = () => {
    if (apartment?.agent_type === 'agent') {
      return (
        <>
          {apartment.agent && (
            <div className="flex items-center gap-2">
              <User className="text-orange-500 w-4 h-4" />
              <span className="text-gray-600">
                {String(apartment.agent_type).toLocaleUpperCase()}: {apartment.agent}
              </span>
            </div>
          )}
          
          {/* Email - Gated */}
          <div className="flex items-center gap-2">
            <MailIcon className="text-orange-500 w-4 h-4" />
            <span className={`text-gray-600 transition-all duration-300 ${
              showDetails ? '' : 'blur-sm select-none'
            }`}>
              Email: {showDetails ? apartment?.agent_email || 'Not provided' : '••••••@••••••.com'}
            </span>
            {!showDetails && (
              <EyeOff className="w-3 h-3 text-gray-400 ml-1" />
            )}
          </div>

          {/* Phone - Gated */}
          <div className="flex items-center gap-2">
            <PhoneCallIcon className="text-orange-500 w-4 h-4" />
            <span className={`text-gray-600 transition-all duration-300 ${
              showDetails ? '' : 'blur-sm select-none'
            }`}>
              Phone: {showDetails ? apartment?.agent_phone || 'Not provided' : '+234 ••• ••• ••••'}
            </span>
            {!showDetails && (
              <EyeOff className="w-3 h-3 text-gray-400 ml-1" />
            )}
          </div>
        </>
      );
    } else {
      return (
        <>
          {apartment?.business_name && (
            <div className="flex items-center gap-2">
              <BuildingIcon className="text-orange-500 w-4 h-4" />
              <span className="text-gray-600">
                {String(apartment.agent_type).toLocaleUpperCase()}: {apartment?.business_name}
              </span>
            </div>
          )}

          {/* Business Email - Gated */}
          <div className="flex items-center gap-2">
            <MailIcon className="text-orange-500 w-4 h-4" />
            <span className={`text-gray-600 transition-all duration-300 ${
              showDetails ? '' : 'blur-sm select-none'
            }`}>
              Email: {showDetails ? apartment?.business_email || 'Not provided' : '••••••@••••••.com'}
            </span>
            {!showDetails && (
              <EyeOff className="w-3 h-3 text-gray-400 ml-1" />
            )}
          </div>

          {/* Business Phone - Gated */}
          <div className="flex items-center gap-2">
            <PhoneCallIcon className="text-orange-500 w-4 h-4" />
            <span className={`text-gray-600 transition-all duration-300 ${
              showDetails ? '' : 'blur-sm select-none'
            }`}>
              Phone: {showDetails ? apartment?.business_phone || 'Not provided' : '+234 ••• ••• ••••'}
            </span>
            {!showDetails && (
              <EyeOff className="w-3 h-3 text-gray-400 ml-1" />
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Agent Information</h3>
        {showDetails && timeRemaining > 0 && (
          <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Agent/Business Information */}
      <div className="space-y-2">
        {renderAgentInfo()}
      </div>

      {/* Call-to-Action Button */}
      {!showDetails && (
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">
                Contact details are hidden
              </span>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">
              Watch a short advertisement to view agent contact information
            </p>

            <Button
              onClick={handleViewDetailsClick}
              title="Watch a short ad to view contact details"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-all duration-200 hover:scale-105"
            >
              <PlayCircle className="w-4 h-4" />
              View Contact Details
            </Button>

            <p className="text-xs text-gray-500 mt-2">
              Free • 5-15 seconds • Unlocks for 4 minutes
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {showDetails && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Eye className="w-4 h-4" />
            <span>Contact details unlocked! You can now reach out to the agent.</span>
          </div>
        </div>
      )}
    </div>
  );
}