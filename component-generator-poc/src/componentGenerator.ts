import { GenerateComponentPayload, FormField } from './types';

function mapFieldToMUIType(field: FormField): string {
  return field.type; // aqui você consegue customizar depois
}

export function generateReactComponentCode(payload: GenerateComponentPayload): string {
  const { componentName, fields } = payload;

  const formTypeLines = fields.map(
    (field) => `  ${field.name}: string;`
  );

  const initialStateLines = fields.map(
    (field) => `    ${field.name}: '',`
  );

  const handleChangeCases = fields.map(
    (field) => `
  const handleChange_${field.name} = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, ${field.name}: event.target.value }));
  };`
  );

  const fieldsJSX = fields
    .map((field) => {
      const requiredAttr = field.required ? 'required ' : '';
      const typeAttr = mapFieldToMUIType(field);
      return `
        <TextField
          fullWidth
          margin="normal"
          label="${field.label}"
          type="${typeAttr}"
          name="${field.name}"
          value={values.${field.name}}
          onChange={handleChange_${field.name}}
          ${requiredAttr}
        />`;
    })
    .join('\n');

  return `import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';

type ${componentName}Values = {
${formTypeLines.join('\n')}
};

const ${componentName}: React.FC = () => {
  const [values, setValues] = React.useState<${componentName}Values>({
${initialStateLines.join('\n')}
  });

${handleChangeCases.join('\n')}

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
        ${componentName}
      </Typography>
${fieldsJSX}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained">
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

export default ${componentName};
`;
}
