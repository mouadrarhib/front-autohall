// src/components/common/FormInput.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useFormContext, RegisterOptions } from 'react-hook-form';

interface FormInputProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  rules?: RegisterOptions;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  name, 
  rules, 
  ...textFieldProps 
}) => {
  const { 
    register, 
    formState: { errors } 
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <TextField
      {...textFieldProps}
      {...register(name, rules)}
      error={!!error}
      helperText={errorMessage || textFieldProps.helperText}
      fullWidth
      margin="normal"
    />
  );
};
