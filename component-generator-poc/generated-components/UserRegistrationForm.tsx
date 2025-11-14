import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

type UserRegistrationFormValues = {
  fullName: string;
  email: string;
  password: string;
};

const UserRegistrationForm: React.FC = () => {
  const [values, setValues] = React.useState<UserRegistrationFormValues>({
    fullName: '',
    email: '',
    password: '',
  });


  const handleChange_fullName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, fullName: event.target.value }));
  };

  const handleChange_email = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, email: event.target.value }));
  };

  const handleChange_password = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, password: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form submitted with values:', values);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        UserRegistrationForm
      </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Nome completo"
          type="text"
          name="fullName"
          value={values.fullName}
          onChange={handleChange_fullName}
          required 
        />

        <TextField
          fullWidth
          margin="normal"
          label="E-mail"
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange_email}
          required 
        />

        <TextField
          fullWidth
          margin="normal"
          label="Senha"
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange_password}
          required 
        />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained">
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

export default UserRegistrationForm;
