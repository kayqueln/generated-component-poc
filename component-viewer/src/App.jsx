import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';

function DynamicForm({ schema }) {
  const [values, setValues] = useState(
    schema.fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {})
  );

  const handleChange = (name) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // PoC: só mostra o que foi preenchido
    alert(`Valores enviados:\n${JSON.stringify(values, null, 2)}`);
  };

  return (
    <Paper
      elevation={3}
      sx={{ maxWidth: 480, mx: 'auto', mt: 4, p: 3, borderRadius: 2 }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        {schema.componentName}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {schema.fields.map((field) => (
          <TextField
            key={field.name}
            fullWidth
            margin="normal"
            label={field.label}
            type={field.type}
            required={field.required}
            name={field.name}
            value={values[field.name] || ''}
            onChange={handleChange(field.name)}
          />
        ))}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained">
            Enviar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default function App() {
  const [componentName, setComponentName] = useState('UserRegistrationForm');
  const [schema, setSchema] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoadSchema = async () => {
    if (!componentName.trim()) return;

    setIsLoading(true);
    setError('');
    setSchema(null);

    try {
      const response = await fetch(
        `http://localhost:4000/components/${componentName}`
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao buscar schema');
      }

      const data = await response.json();
      setSchema(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao carregar schema');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Visualizador de Componentes (React puro)
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Digite o <strong>componentName</strong> que você usou na API
          (por exemplo: <code>UserRegistrationForm</code>) e carregue o
          formulário gerado.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Nome do componente"
            fullWidth
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleLoadSchema}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Carregar'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {schema && <DynamicForm schema={schema} />}
      </Box>
    </Box>
  );
}
