import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { authService } from './services/authService';
import { TopNav } from './components/layout/TopNav';
import { ShipmentSearchPanel } from './components/search/ShipmentSearchPanel';
import { MatchingResultsPanel } from './components/search/MatchingResultsPanel';
import { DedicatedResultsPanel } from './components/search/DedicatedResultsPanel';
import { MatchBreakdownModal } from './components/search/MatchBreakdownModal';
import { BookingReviewModal } from './components/booking/BookingReviewModal';
import { BookingConfirmationModal } from './components/booking/BookingConfirmationModal';
import { MyShipmentsModal } from './components/shipments/MyShipmentsModal';
import { LiveTrackingModal } from './components/tracking/LiveTrackingModal';
import { AuthModal } from './components/auth/AuthModal';
import { MyProfileModal } from './components/auth/MyProfileModal';
import { DriverDashboardModal } from './components/driver/DriverDashboardModal';
import { TruckDetailCard } from './components/map/TruckDetailCard';
import { HubDetailCard } from './components/map/HubDetailCard';
import { FreightNetworkMap } from './components/map/FreightNetworkMap';
import { INITIAL_TRUCKS } from './data/mockTrucks';
import { INITIAL_DEDICATED_FLEET } from './data/mockDedicatedFleet';
import { MOCK_HUBS } from './data/mockHubs';
import {
  Truck,
  DedicatedTruck,
  LogisticsHub,
  CargoSearchQuery,
  ShipmentSearchCriteria,
  RecommendationResultSet,
  DedicatedSearchResult,
  BookingMode,
  BookingRecord,
  ScoredTruckMatch
} from './types/logistics';
import { interpolateCoordinates } from './utils/geoUtils';
import { executeTruckFilter } from './services/truckFilterService';
import { generateRecommendations } from './services/recommendationService';
import { searchDedicatedFleet } from './services/dedicatedMatchingService';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  // --- FLEET & STATE ---
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [dedicatedFleet, setDedicatedFleet] = useState<DedicatedTruck[]>(INITIAL_DEDICATED_FLEET);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [selectedHub, setSelectedHub] = useState<LogisticsHub | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<'explore' | 'shipments' | 'howItWorks'>('explore');

  // --- SEARCH & RECOMMENDATIONS ---
  const [activeCriteria, setActiveCriteria] = useState<ShipmentSearchCriteria>({
    origin: 'Hyderabad',
    destination: 'Chennai',
    weightKg: 700,
    cargoType: 'General Cargo',
    priority: '⚡ Fastest',
    unit: 'kg',
    bookingMode: 'SHARE_CAPACITY'
  });
  const [bookingMode, setBookingMode] = useState<BookingMode>('SHARE_CAPACITY');
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [sharedResult, setSharedResult] = useState<RecommendationResultSet | null>(null);
  const [dedicatedResult, setDedicatedResult] = useState<DedicatedSearchResult | null>(null);

  // --- MODALS & BOOKING ---
  const [breakdownTruckId, setBreakdownTruckId] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isMyShipmentsOpen, setIsMyShipmentsOpen] = useState(false);
  const [isLiveTrackingOpen, setIsLiveTrackingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDriverDashboardOpen, setIsDriverDashboardOpen] = useState(false);
  const [activeTrackingShipment, setActiveTrackingShipment] = useState<BookingRecord | null>(null);
  const [selectedSharedMatch, setSelectedSharedMatch] = useState<ScoredTruckMatch | null>(null);
  const [selectedDedicatedTruck, setSelectedDedicatedTruck] = useState<DedicatedTruck | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [confirmedTruckId, setConfirmedTruckId] = useState<string | null>(null);
  
  // Pending booking state when guest is redirected to login
  const [pendingGuestConfirmation, setPendingGuestConfirmation] = useState(false);

  // Stored Bookings for "My Shipments"
  const [myShipments, setMyShipments] = useState<BookingRecord[]>(() => {
    return authService.getUserShipments(user?.id || 'USR-1001');
  });

  // Reload user shipments whenever active user session changes
  useEffect(() => {
    if (user) {
      setMyShipments(authService.getUserShipments(user.id));
    } else {
      setMyShipments([]);
    }
  }, [user]);

  const [isSimulationActive, setIsSimulationActive] = useState(true);

  // Telemetry truck simulation
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      setTrucks((prevTrucks) =>
        prevTrucks.map((truck) => {
          if (!truck.routePolyline || truck.status === 'At Smart Hub') return truck;

          const currentProgress = truck.currentRouteProgress ?? 0.1;
          let nextProgress = currentProgress + 0.005;
          if (nextProgress > 0.95) nextProgress = 0.05;

          const { coords, heading } = interpolateCoordinates(truck.routePolyline, nextProgress);

          return {
            ...truck,
            lat: coords.lat,
            lng: coords.lng,
            heading: heading || truck.heading,
            currentRouteProgress: nextProgress
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulationActive]);

  // Handle Search Execution
  const handleSearch = (query: CargoSearchQuery) => {
    const criteria: ShipmentSearchCriteria = {
      origin: query.origin,
      destination: query.destination,
      weightKg: query.weightKg,
      cargoType: query.cargoType,
      priority: query.priority,
      unit: query.unit,
      bookingMode: query.bookingMode || bookingMode
    };

    setActiveCriteria(criteria);
    setBookingMode(criteria.bookingMode);

    if (criteria.bookingMode === 'SHARE_CAPACITY') {
      const filterResult = executeTruckFilter(trucks, criteria);
      const recommendations = generateRecommendations(filterResult, criteria, MOCK_HUBS);
      setSharedResult(recommendations);
      setDedicatedResult(null);
    } else {
      const dedResult = searchDedicatedFleet(dedicatedFleet, criteria);
      setDedicatedResult(dedResult);
      setSharedResult(null);
    }

    setShowResultsPanel(true);
    setSelectedTruck(null);
    setSelectedHub(null);
  };

  // Handle Switch Booking Mode
  const handleSwitchMode = (mode: BookingMode) => {
    setBookingMode(mode);
    const updatedCriteria: ShipmentSearchCriteria = {
      ...activeCriteria,
      bookingMode: mode
    };
    setActiveCriteria(updatedCriteria);

    if (mode === 'SHARE_CAPACITY') {
      const filterResult = executeTruckFilter(trucks, updatedCriteria);
      const recommendations = generateRecommendations(filterResult, updatedCriteria, MOCK_HUBS);
      setSharedResult(recommendations);
      setDedicatedResult(null);
    } else {
      const dedResult = searchDedicatedFleet(dedicatedFleet, updatedCriteria);
      setDedicatedResult(dedResult);
      setSharedResult(null);
    }
  };

  // Open Review Modals
  const handleOpenSharedBookingReview = (match: ScoredTruckMatch) => {
    setSelectedSharedMatch(match);
    setSelectedDedicatedTruck(null);
    setIsReviewOpen(true);
  };

  const handleOpenDedicatedBookingReview = (truck: DedicatedTruck) => {
    setSelectedDedicatedTruck(truck);
    setSelectedSharedMatch(null);
    setIsReviewOpen(true);
  };

  // Actual booking execution helper
  const finalizeBookingExecution = (activeUser: { id: string; name: string }) => {
    if (bookingMode === 'SHARE_CAPACITY' && selectedSharedMatch) {
      const targetTruck = selectedSharedMatch.truck;
      const weight = activeCriteria.weightKg;
      const bookingId = `RSL-SHP-${Math.floor(100000 + Math.random() * 900000)}`;

      // Update truck capacity
      setTrucks((prev) =>
        prev.map((t) => {
          if (t.id === targetTruck.id) {
            const newAvail = Math.max(0, t.availableCapacityKg - weight);
            const newBooked = t.bookedCapacityKg + weight;
            return {
              ...t,
              availableCapacityKg: newAvail,
              bookedCapacityKg: newBooked
            };
          }
          return t;
        })
      );

      setConfirmedTruckId(targetTruck.id);

      const newRecord: BookingRecord = {
        bookingId,
        userId: activeUser.id,
        userName: activeUser.name,
        mode: 'SHARE_CAPACITY',
        createdAt: new Date().toLocaleString(),
        status: 'AWAITING HUB PICKUP',
        origin: activeCriteria.origin,
        destination: activeCriteria.destination,
        weightKg: weight,
        cargoType: activeCriteria.cargoType,
        totalPriceRs: selectedSharedMatch.pricing.sharedCapacityEstimateRs,
        truckId: targetTruck.id,
        truckReg: targetTruck.registrationNumber,
        pickupHubId: selectedSharedMatch.hubRecommendation?.recommendedHub?.hub.id,
        pickupHubName: selectedSharedMatch.hubRecommendation?.recommendedHub?.hub.name,
        carrierName: targetTruck.carrierName,
        estimatedArrival: targetTruck.estimatedArrival
      };

      authService.saveShipment(newRecord);
      setMyShipments((prev) => [newRecord, ...prev]);
      setConfirmedBooking(newRecord);
      setIsReviewOpen(false);
      setIsConfirmationOpen(true);

    } else if (bookingMode === 'FULL_VEHICLE' && selectedDedicatedTruck) {
      const targetTruck = selectedDedicatedTruck;
      const bookingId = `RSL-DED-${Math.floor(100000 + Math.random() * 900000)}`;

      // Lock dedicated vehicle
      setDedicatedFleet((prev) =>
        prev.map((dt) => {
          if (dt.id === targetTruck.id) {
            return {
              ...dt,
              availabilityStatus: 'RESERVED'
            };
          }
          return dt;
        })
      );

      const newRecord: BookingRecord = {
        bookingId,
        userId: activeUser.id,
        userName: activeUser.name,
        mode: 'FULL_VEHICLE',
        createdAt: new Date().toLocaleString(),
        status: 'VEHICLE RESERVED',
        origin: activeCriteria.origin,
        destination: activeCriteria.destination,
        weightKg: activeCriteria.weightKg,
        cargoType: activeCriteria.cargoType,
        totalPriceRs: targetTruck.pricing?.totalDedicatedPriceRs || 18500,
        vehicleType: targetTruck.vehicleType,
        totalVehicleCapacityKg: targetTruck.totalCapacityKg,
        carrierName: targetTruck.carrierName,
        estimatedArrival: targetTruck.estimatedArrival
      };

      authService.saveShipment(newRecord);
      setMyShipments((prev) => [newRecord, ...prev]);
      setConfirmedBooking(newRecord);
      setIsReviewOpen(false);
      setIsConfirmationOpen(true);
    }
  };

  // Handle Confirm Booking with Authentication Check (Feature 9)
  const handleConfirmBooking = () => {
    if (!isAuthenticated || !user) {
      // Intercept unauthenticated guest: preserve state and trigger Auth Modal
      setPendingGuestConfirmation(true);
      openAuthModal('SIGN_IN', 'BOOKING_FLOW');
      return;
    }

    finalizeBookingExecution(user);
  };

  // Resume booking or route to appropriate dashboard when authentication completes
  const handleAuthSuccess = (authenticatedUser?: any) => {
    const activeUser = authenticatedUser || authService.getCachedUser() || user;
    
    if (activeUser?.role === 'DRIVER' || activeUser?.accountType === 'Driver') {
      setIsDriverDashboardOpen(true);
      return;
    }

    if (pendingGuestConfirmation) {
      setPendingGuestConfirmation(false);
      if (activeUser) {
        finalizeBookingExecution(activeUser);
      }
    }
  };

  const handleResetSearch = () => {
    setShowResultsPanel(false);
    setSharedResult(null);
    setDedicatedResult(null);
    setSelectedTruck(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Background Pan-India Leaflet Map */}
      <FreightNetworkMap
        trucks={trucks}
        hubs={MOCK_HUBS}
        selectedTruck={selectedTruck}
        selectedHub={selectedHub}
        onSelectTruck={(truck) => {
          setSelectedHub(null);
          setSelectedTruck(truck);
        }}
        onSelectHub={(hub) => {
          setSelectedTruck(null);
          setSelectedHub(hub);
        }}
      />

      {/* Top Navigation with Auth Dropdown */}
      <TopNav
        activeTrucksCount={trucks.length}
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'shipments') {
            setIsMyShipmentsOpen(true);
          }
        }}
        onOpenHowItWorks={() => {}}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenDriverApp={() => setIsDriverDashboardOpen(true)}
      />

      {/* Floating Shipment Search Panel (Features 1 & 6) */}
      {!showResultsPanel && (
        <ShipmentSearchPanel
          onSearch={handleSearch}
          initialMode={bookingMode}
          initialOrigin={activeCriteria.origin}
          initialDestination={activeCriteria.destination}
          initialWeight={activeCriteria.weightKg}
          initialCargoType={activeCriteria.cargoType}
        />
      )}

      {/* SHARED RESULTS PANEL (Feature 2, 3, 4) */}
      {showResultsPanel && bookingMode === 'SHARE_CAPACITY' && sharedResult && (
        <MatchingResultsPanel
          recSet={sharedResult}
          onClose={() => setShowResultsPanel(false)}
          onReset={handleResetSearch}
          onSelectTruck={(truck) => {
            setSelectedHub(null);
            setSelectedTruck(truck);
          }}
          onOpenBreakdown={(truckId) => setBreakdownTruckId(truckId)}
          onConfirmPickup={(hubId, truckId) => {
            const match =
              sharedResult.bestValue.find((m) => m.truck.id === truckId) ||
              sharedResult.topRecommendation;
            if (match) handleOpenSharedBookingReview(match);
          }}
          confirmedTruckId={confirmedTruckId}
        />
      )}

      {/* DEDICATED RESULTS PANEL (Feature 6) */}
      {showResultsPanel && bookingMode === 'FULL_VEHICLE' && dedicatedResult && (
        <DedicatedResultsPanel
          searchResult={dedicatedResult}
          onSelectDedicatedTruck={handleOpenDedicatedBookingReview}
          onSwitchToSharedMode={() => handleSwitchMode('SHARE_CAPACITY')}
          onModifySearch={handleResetSearch}
        />
      )}

      {/* Selected Truck Detail Card */}
      {selectedTruck && !showResultsPanel && (
        <TruckDetailCard
          truck={selectedTruck}
          onClose={() => setSelectedTruck(null)}
        />
      )}

      {/* Selected Hub Detail Card */}
      {selectedHub && (
        <HubDetailCard
          hub={selectedHub}
          onClose={() => setSelectedHub(null)}
        />
      )}

      {/* Match Breakdown Modal */}
      {breakdownTruckId && sharedResult && (
        <MatchBreakdownModal
          isOpen={true}
          match={
            sharedResult.bestValue.find((m) => m.truck.id === breakdownTruckId) ||
            sharedResult.fastest.find((m) => m.truck.id === breakdownTruckId) ||
            sharedResult.cheapest.find((m) => m.truck.id === breakdownTruckId) ||
            sharedResult.topRecommendation!
          }
          onClose={() => setBreakdownTruckId(null)}
          onViewTruckOnMap={(truckId) => {
            const truck = trucks.find((t) => t.id === truckId);
            if (truck) {
              setSelectedHub(null);
              setSelectedTruck(truck);
            }
            setBreakdownTruckId(null);
          }}
        />
      )}

      {/* BOOKING REVIEW MODAL (Feature 6 & 9) */}
      <BookingReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleConfirmBooking}
        mode={bookingMode}
        criteria={activeCriteria}
        sharedMatch={selectedSharedMatch}
        dedicatedTruck={selectedDedicatedTruck}
      />

      {/* BOOKING CONFIRMATION MODAL (Feature 6) */}
      <BookingConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        booking={confirmedBooking}
        onViewMyShipments={() => {
          setIsConfirmationOpen(false);
          setIsMyShipmentsOpen(true);
        }}
        onNewSearch={() => {
          setIsConfirmationOpen(false);
          handleResetSearch();
        }}
      />

      {/* MY SHIPMENTS MODAL (Feature 6, 8, 9) */}
      <MyShipmentsModal
        isOpen={isMyShipmentsOpen}
        onClose={() => {
          setIsMyShipmentsOpen(false);
          setActiveNavTab('explore');
        }}
        shipments={myShipments}
        onTrackShipment={(shp) => {
          setActiveTrackingShipment(shp);
          setIsMyShipmentsOpen(false);
          setIsLiveTrackingOpen(true);
        }}
      />

      {/* LIVE SHIPMENT TRACKING MODAL (Feature 8) */}
      <LiveTrackingModal
        isOpen={isLiveTrackingOpen}
        onClose={() => setIsLiveTrackingOpen(false)}
        shipment={activeTrackingShipment}
      />

      {/* AUTHENTICATION MODAL (Feature 9) */}
      <AuthModal onSuccess={handleAuthSuccess} />

      {/* USER PROFILE MODAL (Feature 9) */}
      <MyProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onViewMyShipments={() => {
          setIsProfileOpen(false);
          setIsMyShipmentsOpen(true);
        }}
      />

      {/* DRIVER WEB/MOBILE DASHBOARD (Phase 10) */}
      <DriverDashboardModal
        isOpen={isDriverDashboardOpen}
        onClose={() => setIsDriverDashboardOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
