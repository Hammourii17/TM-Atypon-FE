
import React from 'react';
import TextField from '@mui/material/TextField';

const FormField = ({ id, label, type, value, onChange, error }) => (
  <TextField
    margin="normal"
    required
    fullWidth
    id={id}
    name={id}
    label={label}
    type={type}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={error}
  />
);

export default FormField;
