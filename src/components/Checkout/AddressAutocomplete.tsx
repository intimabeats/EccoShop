import React, { useState, useRef, useEffect } from 'react';
import { TextField, CircularProgress } from '@mui/material';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { env } from '../../config/env';

interface AddressAutocompleteProps {
  onAddressSelect: (address: google.maps.places.PlaceResult) => void;
  label?: string;
  placeholder?: string;
  defaultValue?: string; // Add defaultValue prop
  required?: boolean;
}

// Explicitly type the libraries array
const libraries: (
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'places'
  | 'visualization'
)[] = ['places'];

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  label = 'Endereço',
  placeholder = 'Digite seu endereço',
  defaultValue = '', // Default value for the input
  required = false,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: env.google.mapsApiKey,
    libraries: libraries as ('drawing' | 'geometry' | 'localContext' | 'places' | 'visualization')[], // Cast to the correct type
  });
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue); // Use state for input value
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultValue && inputRef.current) {
      inputRef.current.value = defaultValue; // Set initial value if provided
    }
  }, [defaultValue]);

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        onAddressSelect(place);
        setInputValue(place.formatted_address); // Update input value with formatted address
      }
    }
  };

  if (loadError) {
    return <div>Error loading Google Maps API</div>;
  }

  return (
    <>
      {!isLoaded ? (
        <CircularProgress />
      ) : (
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <TextField
            fullWidth
            required={required}
            label={label}
            placeholder={placeholder}
            value={inputValue} // Controlled input value
            onChange={(e) => setInputValue(e.target.value)} // Update state on change
            inputRef={inputRef}
          />
        </Autocomplete>
      )}
    </>
  );
};
