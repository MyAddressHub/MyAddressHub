'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const addressSchema = z.object({
  addressName: z.string().min(1, 'Address name is required'),
  street: z.string().min(1, 'Street is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData & { address: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || {
      addressName: '',
      street: '',
      suburb: '',
      state: '',
      postcode: '',
      isDefault: false,
    },
  });

  // Watch form values to build full address
  const watchedValues = useWatch({
    control,
    name: ['street', 'suburb', 'state', 'postcode'],
  });

  // Build full address from sub-parts
  const buildFullAddress = (street: string, suburb: string, state: string, postcode: string): string => {
    const parts = [street, suburb, state, postcode].filter(part => part && part.trim());
    return parts.join(', ');
  };

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof AddressFormData, value);
      });
    }
  }, [initialData, setValue]);

  const handleFormSubmit = async (data: AddressFormData) => {
    console.log('AddressForm: handleFormSubmit called with data:', data);
    setIsSubmitting(true);
    try {
      // Build the full address from sub-parts
      const fullAddress = buildFullAddress(
        data.street,
        data.suburb,
        data.state,
        data.postcode
      );
      
      console.log('AddressForm: Built full address:', fullAddress);
      
      // Submit with both the form data and the built full address
      const submitData = {
        ...data,
        address: fullAddress,
      };
      
      console.log('AddressForm: Submitting data:', submitData);
      await onSubmit(submitData);
      console.log('AddressForm: onSubmit completed successfully');
    } catch (error) {
      console.error('AddressForm: Error submitting address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current full address for preview
  const currentFullAddress = buildFullAddress(
    watchedValues[0] || '',
    watchedValues[1] || '',
    watchedValues[2] || '',
    watchedValues[3] || ''
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address Name */}
        <div className="md:col-span-2">
          <label htmlFor="addressName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Address Name *
          </label>
          <input
            type="text"
            id="addressName"
            {...register('addressName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., Home, Work, Office"
          />
          {errors.addressName && (
            <p className="mt-1 text-sm text-red-600">{errors.addressName.message}</p>
          )}
        </div>

        {/* Full Address Preview */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Address Preview
          </label>
          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentFullAddress || 'Address will be built from the fields below'}
            </p>
          </div>
        </div>

        {/* Street */}
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Street Address *
          </label>
          <input
            type="text"
            id="street"
            {...register('street')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., 123 Main Street"
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
          )}
        </div>

        {/* Suburb */}
        <div>
          <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Suburb/City *
          </label>
          <input
            type="text"
            id="suburb"
            {...register('suburb')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., Downtown"
          />
          {errors.suburb && (
            <p className="mt-1 text-sm text-red-600">{errors.suburb.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            State/Province *
          </label>
          <input
            type="text"
            id="state"
            {...register('state')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., New York"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        {/* Postcode */}
        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Postcode *
          </label>
          <input
            type="text"
            id="postcode"
            {...register('postcode')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., 10001"
          />
          {errors.postcode && (
            <p className="mt-1 text-sm text-red-600">{errors.postcode.message}</p>
          )}
        </div>

        {/* Default Address Checkbox */}
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Set as default address
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isLoading ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}; 