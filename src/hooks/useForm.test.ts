import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm', () => {
  it('initializes with provided values', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(initialValues));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('updates values on change', () => {
    const initialValues = { email: '' };
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('validates required fields', () => {
    const initialValues = { email: '' };
    const validationRules = {
      email: { required: true },
    };

    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleBlur({
        target: { name: 'email', value: '' },
      } as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.errors.email).toBe('Este campo é obrigatório');
  });

  it('validates email pattern', () => {
    const initialValues = { email: '' };
    const validationRules = {
      email: { pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i },
    };

    const { result } = renderHook(() => useForm(initialValues, validationRules));

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalid-email' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleBlur({
        target: { name: 'email', value: 'invalid-email' },
      } as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.errors.email).toBe('Formato inválido');
  });

  it('resets form to initial values', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });
});
