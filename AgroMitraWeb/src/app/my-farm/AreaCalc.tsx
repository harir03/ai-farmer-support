"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface AreaCalcProps {
  apiKey: string;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
  onAreaCalculated: (area: number, unit: string, coordinates: Array<{ lat: number; lng: number }>) => void;
  onLocationFound?: (location: { lat: number; lng: number }) => void;
  height?: string;
  className?: string;
}

const AreaCalc: React.FC<AreaCalcProps> = ({
  apiKey,
  defaultCenter,
  defaultZoom,
  onAreaCalculated,
  onLocationFound,
  height = "500px",
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // Add CSS for pulse animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [currentPolygon, setCurrentPolygon] = useState<any>(null);
  const [area, setArea] = useState<number>(0);
  const [unit, setUnit] = useState<string>('square meters');
  const [coordinates, setCoordinates] = useState<Array<{ lat: number; lng: number }>>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if script is already loaded or loading
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript || (window.google && window.google.maps)) {
        if (window.google && window.google.maps) {
          setIsScriptLoaded(true);
        }
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker&loading=async&callback=initMap`;
      script.async = true;
      script.defer = true;

      window.initMap = () => {
        setIsScriptLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      mapTypeId: 'satellite',
      mapId: 'aifarmcare-map', // Required for AdvancedMarkerElement
    });

    setMap(mapInstance);
  }, [isScriptLoaded, defaultCenter, defaultZoom]);

  // Initialize click-based polygon drawing with auto-completion
  useEffect(() => {
    if (!map) return;

    let isDrawingActive = false;
    let currentPath: any[] = [];
    let drawingMarkers: any[] = [];
    let drawingPolyline: any = null;
    let firstMarker: any = null;

    // Create custom drawing controls
    const drawingControlDiv = document.createElement('div');
    drawingControlDiv.style.margin = '10px';
    
    const drawingButton = document.createElement('button');
    drawingButton.innerHTML = '🖍️ Draw Farm Boundary';
    drawingButton.style.backgroundColor = '#4CAF50';
    drawingButton.style.color = 'white';
    drawingButton.style.border = 'none';
    drawingButton.style.padding = '8px 16px';
    drawingButton.style.borderRadius = '4px';
    drawingButton.style.cursor = 'pointer';
    drawingButton.style.fontSize = '14px';
    drawingButton.style.fontWeight = 'bold';
    
    const clearButton = document.createElement('button');
    clearButton.innerHTML = '🗑️ Clear';
    clearButton.style.backgroundColor = '#f44336';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.padding = '8px 16px';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.fontSize = '14px';
    clearButton.style.fontWeight = 'bold';
    clearButton.style.marginLeft = '8px';
    
    drawingControlDiv.appendChild(drawingButton);
    drawingControlDiv.appendChild(clearButton);
    
    map.controls[window.google.maps.ControlPosition.TOP_CENTER].push(drawingControlDiv);

    // Toggle drawing mode
    drawingButton.addEventListener('click', () => {
      isDrawingActive = !isDrawingActive;
      setIsDrawing(isDrawingActive);
      
      if (isDrawingActive) {
        drawingButton.innerHTML = '🛑 Cancel Drawing';
        drawingButton.style.backgroundColor = '#ff5722';
        map.setOptions({ 
          draggable: false,
          disableDoubleClickZoom: true
        });
      } else {
        // Cancel drawing mode
        cleanupDrawing();
        drawingButton.innerHTML = '🖍️ Draw Farm Boundary';
        drawingButton.style.backgroundColor = '#4CAF50';
        map.setOptions({ 
          draggable: true,
          disableDoubleClickZoom: false
        });
      }
    });

    // Clear all drawings
    clearButton.addEventListener('click', () => {
      if (currentPolygon) {
        currentPolygon.setMap(null);
        setCurrentPolygon(null);
      }
      
      cleanupDrawing();
      
      isDrawingActive = false;
      setIsDrawing(false);
      drawingButton.innerHTML = '🖍️ Draw Farm Boundary';
      drawingButton.style.backgroundColor = '#4CAF50';
      map.setOptions({ 
        draggable: true,
        disableDoubleClickZoom: false
      });
      setArea(0);
      setCoordinates([]);
    });

    // Function to clean up drawing elements
    const cleanupDrawing = () => {
      drawingMarkers.forEach(marker => marker.setMap(null));
      drawingMarkers = [];
      
      if (drawingPolyline) {
        drawingPolyline.setMap(null);
        drawingPolyline = null;
      }
      
      if (firstMarker) {
        firstMarker.setMap(null);
        firstMarker = null;
      }
      
      currentPath = [];
    };

    // Function to create a marker
    const createMarker = (position: any, isFirst: boolean = false, canComplete: boolean = false) => {
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        const markerElement = document.createElement('div');
        markerElement.innerHTML = `
          <div class="marker-element" style="
            width: ${isFirst ? '20px' : '12px'}; 
            height: ${isFirst ? '20px' : '12px'}; 
            background-color: ${isFirst ? '#ff4444' : '#4CAF50'}; 
            border-radius: 50%; 
            border: 2px solid white; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: ${canComplete ? 'pointer' : 'default'};
            ${canComplete ? 'transform: scale(1.2); animation: pulse 1s infinite;' : ''}
            position: relative;
          ">
          </div>
          ${canComplete ? 
            '<div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; white-space: nowrap; pointer-events: none;">Click to finish</div>' 
            : ''}
        `;
        
        // Add click listener directly to the marker element if it's the first marker and can complete
        if (isFirst && canComplete) {
          markerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            completePolygon();
          });
        }
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: position,
          map: map,
          content: markerElement,
          title: isFirst ? (canComplete ? 'Click to complete polygon' : 'First point') : `Point ${currentPath.length}`
        });

        // Also add click listener to the marker itself
        if (isFirst && canComplete) {
          marker.addListener('click', (e: any) => {
            e.stop();
            completePolygon();
          });
        }

        return marker;
      }
      return null;
    };

    // Map click listener for drawing
    const mapClickListener = map.addListener('click', (event: any) => {
      if (!isDrawingActive) return;
      
      const clickedLatLng = event.latLng;
      
      // Check if clicking close to the first point to complete polygon (fallback)
      if (currentPath.length >= 3) {
        const firstPoint = currentPath[0];
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(clickedLatLng, firstPoint);
        
        // If clicked within 50 meters of first point, complete polygon
        if (distance < 50) {
          completePolygon();
          return;
        }
      }
      
      // Add point to path
      currentPath.push(clickedLatLng);
      
      // Create marker for this point (not the first one)
      if (currentPath.length > 1) {
        const marker = createMarker(clickedLatLng, false, false);
        if (marker) {
          drawingMarkers.push(marker);
        }
      }
      
      // Create or update first marker
      if (currentPath.length === 1) {
        firstMarker = createMarker(clickedLatLng, true, false);
      } else if (currentPath.length >= 3) {
        // Remove old first marker and create new one that's clickable
        if (firstMarker) {
          firstMarker.setMap(null);
        }
        firstMarker = createMarker(currentPath[0], true, true);
      }
      
      // Update polyline to show connected lines
      if (currentPath.length >= 2) {
        if (drawingPolyline) {
          drawingPolyline.setMap(null);
        }
        
        drawingPolyline = new window.google.maps.Polyline({
          path: currentPath,
          strokeColor: '#4CAF50',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          geodesic: true,
        });
        
        drawingPolyline.setMap(map);
      }
    });

    const completePolygon = () => {
      if (currentPath.length < 3) return;
      
      // Remove previous polygon
      if (currentPolygon) {
        currentPolygon.setMap(null);
      }
      
      // Create final editable polygon
      const finalPolygon = new window.google.maps.Polygon({
        paths: currentPath,
        fillColor: '#4CAF50',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#4CAF50',
        editable: true,
        draggable: false,
        zIndex: 1,
      });
      
      finalPolygon.setMap(map);
      setCurrentPolygon(finalPolygon);
      calculateAreaAndPerimeter(finalPolygon);
      
      // Add listeners for editing
      finalPolygon.getPath().addListener('set_at', () => {
        calculateAreaAndPerimeter(finalPolygon);
      });

      finalPolygon.getPath().addListener('insert_at', () => {
        calculateAreaAndPerimeter(finalPolygon);
      });

      finalPolygon.getPath().addListener('remove_at', () => {
        calculateAreaAndPerimeter(finalPolygon);
      });
      
      // Clean up drawing elements
      cleanupDrawing();
      
      // Reset drawing state
      isDrawingActive = false;
      setIsDrawing(false);
      drawingButton.innerHTML = '🖍️ Draw Farm Boundary';
      drawingButton.style.backgroundColor = '#4CAF50';
      map.setOptions({ 
        draggable: true,
        disableDoubleClickZoom: false
      });
    };

    return () => {
      window.google.maps.event.removeListener(mapClickListener);
      cleanupDrawing();
    };
  }, [map, currentPolygon]);

  const calculateAreaAndPerimeter = useCallback((polygon: any) => {
    const path = polygon.getPath();
    const vertices = path.getArray();
    
    // Calculate area using Google Maps geometry library
    const areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(path);
    
    // Extract coordinates
    const coords = vertices.map((vertex: any) => ({
      lat: vertex.lat(),
      lng: vertex.lng()
    }));
    
    setArea(areaInSquareMeters);
    setCoordinates(coords);
    setUnit('square meters');
    
    // Notify parent component
    onAreaCalculated(areaInSquareMeters, 'square meters', coords);
  }, [onAreaCalculated]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        if (map) {
          map.setCenter(location);
          map.setZoom(15);
          
          // Add advanced marker for current location
          if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
            const markerElement = document.createElement('div');
            markerElement.innerHTML = `
              <div style="
                width: 24px; 
                height: 24px; 
                background-color: #4285F4; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                position: relative;
                cursor: pointer;
              ">
                <div style="
                  width: 6px; 
                  height: 6px; 
                  background-color: white; 
                  border-radius: 50%; 
                  position: absolute; 
                  top: 50%; 
                  left: 50%; 
                  transform: translate(-50%, -50%);
                "></div>
              </div>
            `;
            
            new window.google.maps.marker.AdvancedMarkerElement({
              position: location,
              map: map,
              title: 'Your Location',
              content: markerElement,
            });
          }
        }
        
        if (onLocationFound) {
          onLocationFound(location);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information unavailable.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out.');
            break;
          default:
            alert('An unknown error occurred.');
            break;
        }
      }
    );
  };

  if (!isScriptLoaded) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Farm Boundary Mapping</h3>
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            📍 Find My Location
          </button>
        </div>
        
        {area > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
            <div>
              <span className="text-sm text-gray-600">Area: </span>
              <span className="font-semibold text-green-600">
                {(area / 4047).toFixed(2)} acres
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Points: </span>
              <span className="font-semibold text-blue-600">{coordinates.length}</span>
            </div>
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500">
          Click "Draw Farm Boundary", then click points on the map to create your polygon. Click the red starting point again to complete the boundary.
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        style={{ height }} 
        className="w-full rounded-lg border border-gray-300"
      />
    </div>
  );
};

export default AreaCalc;