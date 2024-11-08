import React, { useState, useEffect } from "react";
import { FormControl, Grid, TextField, Autocomplete } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { locationCoordinates } from "@/utils/locationCoordinates";

const LocationSelect = ({ setLocation, initialLocation }) => {
  const [location, setLocalLocation] = useState(initialLocation || "");
  const [inputValue, setInputValue] = useState(initialLocation || "");

  // Update local state when initialLocation prop changes
  useEffect(() => {
    if (initialLocation) {
      setLocalLocation(initialLocation);
      setInputValue(initialLocation);
    }
  }, [initialLocation]);

  const handleLocationChange = (event, newLocation) => {
    if (newLocation) {
      setLocalLocation(newLocation);
      setLocation(newLocation);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    if (!/\d/.test(newInputValue)) {
      setInputValue(newInputValue);
    }
  };

  return (
    <Grid item xs={12}>
      <FormControl fullWidth>
        <Autocomplete
          value={location}
          onChange={handleLocationChange}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          options={Object.keys(locationCoordinates)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select Location"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <LocationOnIcon sx={{ color: 'action.active', mr: 1 }} />
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <LocationOnIcon sx={{ color: 'action.active', mr: 1 }} />
              {option}
            </li>
          )}
          sx={{
            borderRadius: '10px',
            "& .MuiAutocomplete-popupIndicator": { display: 'none' },
            "& .MuiOutlinedInput-root": {
              borderRadius: '10px',
            },
          }}
        />
      </FormControl>
    </Grid>
  );
};

export default LocationSelect;