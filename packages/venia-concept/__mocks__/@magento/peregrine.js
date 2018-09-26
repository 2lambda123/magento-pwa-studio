import React from 'react';

export const mockRequest = jest.fn();

export const RestApi = {
    Magento2: {
        request: mockRequest
    }
};

/**
 * the Price component from @magento/peregrine
 * has browser-specific functionality and cannot
 * currently by rendered in the test environment
 */
export const Price = () => <div />;
