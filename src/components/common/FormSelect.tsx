// src/components/common/FormSelect.tsx
import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectProps 
} from '@mui/material';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';

interface FormSelectProps extends Omit<SelectProps, 'name'> {
  name: string;
  label: string;
  rules?: RegisterOptions;
  options: Array<{ value: string | number; label: string }>;
}

export const FormSelect: React.FC<FormSelectProps> = ({ 
  name, 
  label, 
  rules, 
  options,
  ...selectProps 
}) => {
  const { 
    control, 
    formState: { errors } 
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Select {...field} {...selectProps} label={label}>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};
