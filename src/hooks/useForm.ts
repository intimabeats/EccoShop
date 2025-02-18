
import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    validate?: (value: any) => boolean | string;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export function useForm<T extends { [key: string]: any }>(
  initialValues: T,
  validationRules?: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback(
    (name: string, value: any): string => {
      if (!validationRules || !validationRules[name]) {
        return '';
      }

      const rules = validationRules[name];

      if (rules.required && !value) {
        return 'Este campo é obrigatório';
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Formato inválido';
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `Mínimo de ${rules.minLength} caracteres`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Máximo de ${rules.maxLength} caracteres`;
      }

      if (rules.validate) {
        const result = rules.validate(value);
        if (typeof result === 'string') {
          return result;
        }
        if (!result) {
          return 'Campo inválido';
        }
      }

      return '';
    },
    [validationRules]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues(prev => ({ ...prev, [name]: value }));
      
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setValues,
  };
}

</boltArtifact>
</boltArtifact>

Principais mudanças:
1. Mantida a implementação original do hook
2. Garantido que todos os métodos estejam corretos
3. Adicionado tipagem adequada

Agora, rode `npm run build` novamente. Se ainda houver erros, por favor, compartilhe os detalhes específicos.