'use client'
import React, { useState, useEffect, useRef } from 'react';
import {
  Banknote,
  Boxes,
  BuildingIcon,
  Clock,
  GlobeIcon,
  HeartIcon,
  Home,
  List,
  LucideEye,
  MailIcon,
  MapPin,
  PhoneCallIcon,
  Shield,
  User,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Apartment } from '@/types/apartment';
import { filterAmenities } from '@/types/apartment';
import { useRouter } from 'next/navigation';
import ChatDialog from '@/features/landing/components/ChatDialog';
import { baseURL, frontendURL } from '@/../next.config';
import { AxiosApi, formatAmountNumber, saveFormData } from '@/lib/utils';
import { EmailIcon, FacebookIcon, FacebookShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
import { useAlert } from '@/contexts/AlertContext';
import AdGatedAgentDetails from '@/components/ad/AdGatedAgentDetails';
import VideoAdModal from '@/components/ad/VideoAdModal';
import AdSessionManager from '@/services/AdSessionManager';
import { createAdConfiguration } from '@/utils/adConfig';
import { trackAgentDetailsUnlocked } from '@/services/AdAnalytics';

/**
 * Props for ProductInfoOverlay component
 */
export interface ProductInfoOverlayProps {
  apartment: Apartment;
  isLoggedIn: boolean;
  isSubscribed: boolean;
  token?: string;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

/**
 * ProductInfoOverlay - Collapsible bottom sheet for mobile layout
 * 
 * Features:
 * - Collapsed state showing minimal info (title, price, location)
 * - Expanded state showing full product details
 * - Swipe gesture detection for expand/collapse
 * - Semi-transparent background overlay
 * - Action buttons always accessible
 * - Visible only on mobile (below md breakpoint)
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 5.1
 */
export default function ProductInfoOverlay({
  apartment: initialApartment,
  isLoggedIn,
  isSubscribed,
  token,
  isExpanded,
  onExpandedChange
}: ProductInfoOverlayProps): JSX.Element {
  const router = useRouter();
  const { showAlert } = useAlert();
  const overlayRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // ============================================================================
  // State Management
  // ============================================================================
  
  const [apartment, setApartment] = useState<Apartment>(initialApartment);
  const [likedApartment, setLikedApartment] = useState(initialApartment?.like_apartment ?? false);
  const [bookingData, setBookingData] = useState({
    start: '',
    end: '',
  });
  const [visitDate, setVisitDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [isVisiting, setIsVisiting] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [dragOffset, setDragOffset] = useState(0);

  // Ad Gate State Management
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isAgentDetailsUnlocked, setIsAgentDetailsUnlocked] = useState(false);
  const [remainingUnlockTime, setRemainingUnlockTime] = useState(0);
  const [adConfig] = useState(() => createAdConfiguration());

  // ============================================================================
  // Effects
  // ============================================================================
  
  useEffect(() => {
    // Set minimum date for visitation booking
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setMinDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  useEffect(() => {
    setApartment(initialApartment);
    setLikedApartment(initialApartment?.like_apartment ?? false);
  }, [initialApartment]);

  // Ad Gate Effects
  useEffect(() => {
    // Check if agent details are already unlocked
    const checkUnlockStatus = () => {
      const isUnlocked = AdSessionManager.isUnlocked();
      const remaining = AdSessionManager.getRemainingTime();
      
      setIsAgentDetailsUnlocked(isUnlocked);
      setRemainingUnlockTime(remaining);
    };

    checkUnlockStatus();

    // Update remaining time every second
    const interval = setInterval(checkUnlockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset unlock state when apartment changes
  useEffect(() => {
    if (initialApartment?.id) {
      const isUnlocked = AdSessionManager.isUnlocked();
      setIsAgentDetailsUnlocked(isUnlocked);
      setRemainingUnlockTime(AdSessionManager.getRemainingTime());
    }
  }, [initialApartment?.id]);

  // ============================================================================
  // Reduced Motion Support
  // ============================================================================
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // ============================================================================
  // Enhanced Swipe Gesture Detection with Touch Velocity
  // ============================================================================
  
  const touchStartTime = useRef<number>(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;
    
    // Only allow dragging in valid directions
    if (isExpanded && diff > 0) {
      // Dragging down when expanded
      setDragOffset(diff);
    } else if (!isExpanded && diff < 0) {
      // Dragging up when collapsed
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    
    const diff = touchCurrentY.current - touchStartY.current;
    const touchDuration = Date.now() - touchStartTime.current;
    const velocity = Math.abs(diff) / touchDuration; // pixels per millisecond
    
    // Minimum swipe distance in pixels (Requirement 4.5)
    const threshold = 50;
    // Fast swipe threshold (Requirement 2.5: < 100ms responsiveness)
    const fastSwipeVelocity = 0.5; // pixels per ms
    
    // Trigger expand/collapse on sufficient distance OR fast swipe
    if (Math.abs(diff) > threshold || velocity > fastSwipeVelocity) {
      if (diff > 0 && isExpanded) {
        // Swipe down - collapse
        onExpandedChange(false);
      } else if (diff < 0 && !isExpanded) {
        // Swipe up - expand
        onExpandedChange(true);
      }
    }
    
    // Reset
    isDragging.current = false;
    setDragOffset(0);
    touchStartY.current = 0;
    touchCurrentY.current = 0;
    touchStartTime.current = 0;
  };

  // ============================================================================
  // Like/Unlike Functionality
  // ============================================================================
  
  const toggleLike = async () => {
    const newState = !likedApartment;
    setLikedApartment(newState);

    if (newState && apartment) {
      const res = (apartment?.like_count ?? 0) + 1;
      setApartment({ ...apartment, like_count: res });
      
      await AxiosApi().post(baseURL + '/apartment/' + apartment.id + '/like')
        .then(res => {
          const fetched = res.data?.data;
          if (fetched) {
            setApartment(fetched);
            setLikedApartment(fetched.like_apartment);
          }
        })
        .catch((error: any) => showAlert(
          error?.response?.data?.message || error.message || "Unable to Process, Please try again.",
          "error"
        ));
    } else {
      const res = (apartment?.like_count ?? 1) - 1;
      setApartment({ ...apartment, like_count: res });
      
      await AxiosApi().post(baseURL + '/apartment/' + apartment?.id + '/unlike')
        .then(res => {
          const fetched = res.data?.data;
          if (fetched) {
            setApartment(fetched);
            setLikedApartment(fetched.like_apartment);
          }
        })
        .catch((error: any) => showAlert(
          error?.response?.data?.message || error.message || "Unable to Process, Please try again.",
          "error"
        ));
    }
  };

  // ============================================================================
  // Ad Gate Functionality
  // ============================================================================

  const handleUnlockAgentDetails = () => {
    setIsAdModalOpen(true);
  };

  const handleAdComplete = () => {
    // Set unlock state for 4 minutes
    AdSessionManager.setUnlocked();
    setIsAgentDetailsUnlocked(true);
    setRemainingUnlockTime(AdSessionManager.getRemainingTime());
    setIsAdModalOpen(false);
    
    // Track unlock event
    const sessionId = AdSessionManager.getSessionId() || 'no-session';
    trackAgentDetailsUnlocked(
      apartment.id?.toString() || 'unknown',
      sessionId,
      'ad_watched',
      isLoggedIn,
      isSubscribed,
      {
        unlockMethod: 'ad_watched',
        apartmentType: apartment.agent_type
      }
    );
    
    showAlert('Agent contact details unlocked for 4 minutes!', 'success');
  };

  const handleAdSkipped = (watchDuration: number) => {
    // Set unlock state for 4 minutes even if skipped
    AdSessionManager.setUnlocked();
    setIsAgentDetailsUnlocked(true);
    setRemainingUnlockTime(AdSessionManager.getRemainingTime());
    setIsAdModalOpen(false);
    
    // Track unlock event
    const sessionId = AdSessionManager.getSessionId() || 'no-session';
    trackAgentDetailsUnlocked(
      apartment.id?.toString() || 'unknown',
      sessionId,
      'ad_watched',
      isLoggedIn,
      isSubscribed,
      {
        unlockMethod: 'ad_watched',
        apartmentType: apartment.agent_type,
        watchDuration
      }
    );
    
    showAlert('Agent contact details unlocked for 4 minutes!', 'success');
  };

  const handleAdModalClose = () => {
    setIsAdModalOpen(false);
  };

  // ============================================================================
  // Rent Booking Functionality
  // ============================================================================
  
  const calculateEndDate = (startDate: string, duration?: string): string => {
    const start = new Date(startDate);
    const durationMatch = duration?.match(/(\d+)\s*(Year|Month|Week|Day)s?/i);

    if (!durationMatch) return startDate;

    const [, amount, unit] = durationMatch;
    const numAmount = parseInt(amount);

    switch (unit.toLowerCase()) {
      case 'year':
        start.setFullYear(start.getFullYear() + numAmount);
        break;
      case 'month':
        start.setMonth(start.getMonth() + numAmount);
        break;
      case 'week':
        start.setDate(start.getDate() + (numAmount * 7));
        break;
      case 'day':
        start.setDate(start.getDate() + numAmount);
        break;
    }

    return start.toISOString().split('T')[0];
  };

  const handleBooking = async () => {
    if (!apartment) return;

    if (!isLoggedIn || !token) {
      alert('Please log in to book a viewing session');
      return;
    }

    if (!bookingData.start) {
      alert('Please select a start date');
      return;
    }

    setIsBooking(true);
    try {
      const formattedStart = bookingData?.start?.split('T')[0];
      const formattedEnd = calculateEndDate(formattedStart, apartment?.duration);

      const deposit = Number(apartment?.security_deposit && parseInt(apartment?.security_deposit.replace(/[^0-9]/g, '')));
      const bookingPayload = {
        apartment_id: apartment.id,
        amount: Number(apartment?.amount ? apartment?.amount?.replace(/[^0-9]/g, '') : 0) + deposit,
        currency_code: "NGN",
        start: formattedStart,
        end: formattedEnd
      };

      const response = await fetch(baseURL + '/rented-apartment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingPayload),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Viewing Session Booked successfully!');
        setBookingData({ start: '', end: '' });
        router.push(frontendURL + '/user/rent/' + data.data.id);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to book viewing session. Please try again.');
      }
    } catch (error) {
      alert('Failed to book viewing session. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // ============================================================================
  // Visitation Booking Functionality
  // ============================================================================
  
  const handleVisiting = async () => {
    if (!apartment) return;

    if (!isLoggedIn || !token) {
      alert('Please log in to Register Visit Date');
      return;
    }

    if (!visitDate) {
      alert('Please select a date');
      return;
    }
    
    setIsVisiting(true);
    try {
      const response = await fetch(baseURL + '/visitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date: visitDate, apartment_id: apartment.id }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showAlert('Visitation Booked! Please contact ' + (apartment?.user?.business_name || apartment?.user?.name) + ' for directions and further instructions.', 'success');
          router.push(frontendURL + '/user/rent/');
        } else {
          showAlert(data?.message, 'error');
        }
      } else {
        const errorData = await response.json();
        showAlert(errorData.message || 'Failed to book viewing session. Please try again.', 'error');
      }
    } catch (error) {
      showAlert('Failed to book viewing session. Please try again.', 'error');
    } finally {
      setIsVisiting(false);
    }
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================
  
  const renderRentDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
          Rent Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rent Apartment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              value={bookingData.start}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                start: e.target.value
              }))}
              className="col-span-3"
            />
          </div>

          <div className="bg-orange-50 p-3 rounded-md mt-2">
            <p className="text-sm text-orange-800">
              The rent duration will be {apartment?.duration} from the
              selected start date.
            </p>
          </div>

          <Button
            onClick={handleBooking}
            disabled={isBooking || !bookingData.start}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-2"
          >
            {isBooking ? 'Registering...' : 'Confirm Rent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderVisitationDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-indigo-500 hover:bg-indigo-600 text-white w-full">
          Book Visitation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Visitation</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="bg-orange-50 p-3 rounded-md mt-2">
            <p className="text-sm text-orange-800">
              Select the day you will like to go for inspection.
            </p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="visit-date" className="text-sm font-medium">
              Visit Date
            </label>
            <Input
              id="visit-date"
              type="datetime-local"
              min={minDate}
              value={visitDate}
              onChange={(e: any) => setVisitDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <Button
            onClick={handleVisiting}
            disabled={visitDate === '' || isVisiting}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full mt-2"
          >
            {isVisiting ? 'Registration...' : 'Confirm Visitation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ============================================================================
  // Calculate overlay height and position with reduced motion support
  // ============================================================================
  
  const getOverlayStyle = () => {
    const collapsedHeight = '25vh'; // 25% of screen height
    const expandedHeight = '80vh'; // 80% of screen height
    
    // Respect reduced motion preference (Requirement 2.5)
    const transitionDuration = prefersReducedMotion ? '0ms' : '300ms';
    
    const baseStyle = {
      transition: isDragging.current ? 'none' : `all ${transitionDuration} ease-in-out`,
    };
    
    if (isDragging.current) {
      // Apply drag offset during gesture
      return {
        ...baseStyle,
        height: isExpanded ? expandedHeight : collapsedHeight,
        transform: `translateY(${dragOffset}px)`,
      };
    }
    
    return {
      ...baseStyle,
      height: isExpanded ? expandedHeight : collapsedHeight,
      transform: 'translateY(0)',
    };
  };

  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <>
      {/* Semi-transparent background overlay - only visible when expanded */}
      {isExpanded && (
        <div 
          className={`md:hidden fixed inset-0 bg-black/40 z-40 ${
            prefersReducedMotion ? '' : 'transition-opacity duration-300'
          }`}
          onClick={() => onExpandedChange(false)}
        />
      )}
      
      {/* Bottom sheet overlay */}
      <div
        ref={overlayRef}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 overflow-hidden"
        style={getOverlayStyle()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        {/* Expand/Collapse button */}
        <button
          onClick={() => onExpandedChange(!isExpanded)}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto h-full pb-6 px-4">
          {/* Collapsed state - minimal info */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-gray-800 pr-12">{apartment.title}</h2>
            
            <div className="flex items-center gap-2">
              <Banknote className="text-orange-500 w-5 h-5" />
              <span className="text-gray-800 font-semibold">{apartment.amount}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="text-orange-500 w-5 h-5" />
              <span className="text-gray-600 text-sm">
                {`${apartment.city_code}, ${apartment.state_code}`}
              </span>
            </div>
          </div>

          {/* Expanded state - full details */}
          {isExpanded && (
            <div className="mt-6 space-y-4">
              {/* Additional product details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Home className="text-orange-500 w-5 h-5" />
                  <span className="text-gray-600 text-sm">Rooms: {apartment.number_of_rooms}</span>
                </div>

                {apartment.category && (
                  <div className="flex items-center gap-2">
                    <Boxes className="text-orange-500 w-5 h-5" />
                    <span className="text-gray-600 text-sm">Category: {apartment.category}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="text-orange-500 w-5 h-5" />
                  <span className="text-gray-600 text-sm">Duration: {apartment?.duration}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="text-orange-500 w-5 h-5" />
                  <span className="text-gray-800 text-sm">
                    Security Deposit: {apartment?.security_deposit_currency_code}
                    {formatAmountNumber(apartment?.security_deposit)}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <List className="text-orange-500 w-5 h-5 mt-0.5" />
                  <span className="text-gray-600 text-sm">
                    Amenities: {
                      apartment.amenities
                        ? filterAmenities(apartment.amenities)?.join(', ')
                        : 'None listed'
                    }
                  </span>
                </div>
              </div>

              {/* Agent/Business Information - Ad Gated */}
              {(isSubscribed || isAgentDetailsUnlocked) ? (
                // Subscribed users see details immediately
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-base font-semibold text-gray-800">{String(apartment.agent_type).toLocaleUpperCase()} Information</h3>
                    {(
                    <>
                      <div className="flex justify-start space-x-2">
                        {apartment?.business_logo && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={apartment?.business_logo}
                              alt="Business logo"
                              className="w-24 rounded-lg hover:shadow-lg"
                            />
                          </div>
                        )}
                        {apartment?.business_name ? (
                          <div className="flex items-center gap-2">
                            <BuildingIcon className="text-orange-500 w-5 h-5" />
                            <span className="text-gray-600 text-sm">
                              {String(apartment.agent_type).toLocaleUpperCase()}: {apartment?.business_name}
                            </span>
                          </div>
                        ):apartment?.agent && (
                          <div className="flex items-center gap-2">
                            <BuildingIcon className="text-orange-500 w-5 h-5" />
                            <span className="text-gray-600 text-sm">
                              {String(apartment.agent_type).toLocaleUpperCase()}: {apartment?.agent}
                            </span>
                          </div>
                        )}
                      </div>
                      {apartment?.business_address && (
                        <div className="flex items-center gap-2">
                          <GlobeIcon className="text-orange-500 w-5 h-5" />
                          <span className="text-gray-600 text-sm">Address: {apartment?.business_address}</span>
                        </div>
                      )}
                      {apartment?.business_email && (
                        <div className="flex items-center gap-2">
                          <EmailIcon className="text-orange-500 w-5 h-5" />
                          <a href={`mailto:${apartment?.business_email}`} className="text-gray-600 text-sm hover:text-orange-500 hover:underline">Email: {apartment?.business_email}</a>
                        </div>
                      )}
                      {apartment?.business_phone && (
                        <div className="flex items-center gap-2">
                          <PhoneCallIcon className="text-orange-500 w-5 h-5" />
                          <a href={`tel:${apartment?.business_phone}`} className="text-gray-600 text-sm hover:text-orange-500 hover:underline">Phone: {apartment?.business_phone}</a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                // Non-subscribed users see ad-gated version
                <AdGatedAgentDetails
                  apartment={apartment}
                  onUnlock={handleUnlockAgentDetails}
                  isUnlocked={isAgentDetailsUnlocked}
                  remainingTime={remainingUnlockTime}
                />
              )}

              {/* Description */}
              <div className="pt-4 border-t">
                <h3 className="text-base font-semibold mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{apartment.description}</p>
              </div>

              {/* Like and Share Controls */}
              <div className="pt-4 border-t">
                <div className="flex justify-center items-center space-x-6">
                  <div className="flex items-center gap-2">
                    <LucideEye className="text-gray-600 w-5 h-5" />
                    <span className="text-gray-600 text-sm">{apartment?.views_count}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">{apartment?.like_count}</span>
                    {isLoggedIn ? (
                      <HeartIcon
                        onClick={toggleLike}
                        className={`cursor-pointer w-5 h-5 ${
                          likedApartment 
                            ? 'text-red-800 fill-red-800' 
                            : 'text-green-800 fill-green-800'
                        }`}
                      />
                    ) : (
                      <HeartIcon
                        className={`w-5 h-5 ${
                          likedApartment 
                            ? 'text-red-800 fill-red-800' 
                            : 'text-green-800 fill-green-800'
                        }`}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Share:</span>
                    <FacebookShareButton url={typeof window !== 'undefined' ? window.location.href : ''}>
                      <FacebookIcon size={20} round />
                    </FacebookShareButton>
                    <WhatsappShareButton url={typeof window !== 'undefined' ? window.location.href : ''}>
                      <WhatsappIcon size={20} round />
                    </WhatsappShareButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Always accessible in both states */}
          <div className="pt-4 border-t mt-4">
            {isLoggedIn ? (
              <div className="grid grid-cols-1 gap-3">
                {renderRentDialog()}
                {renderVisitationDialog()}
                {apartment?.agent_id && (apartment?.agent || apartment?.business_name) && (
                  <ChatDialog
                    agentId={apartment?.agent_id}
                    agentName={apartment?.agent ?? apartment?.business_name}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4 text-sm">
                  Please log in to continue
                </p>
                <Button
                  onClick={() => {
                    saveFormData('intended_url', '/find-homes/' + apartment.id);
                    router.push('/auth/login');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Ad Modal */}
      <VideoAdModal
        isOpen={isAdModalOpen}
        onClose={handleAdModalClose}
        onAdComplete={handleAdComplete}
        onAdSkipped={handleAdSkipped}
        adConfig={adConfig}
        apartmentId={apartment.id?.toString() || 'unknown'}
      />
    </>
  );
}
