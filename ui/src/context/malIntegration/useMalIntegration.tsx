import { useContext } from 'react';
import { MalIntegrationContext } from './MalIntegrationContext';

export function useMalIntegration() {
    const context = useContext(MalIntegrationContext);
    if (context === undefined) {
        throw new Error('useMalIntegration must be used within an MalIntegrationProvider');
    }
    return context;
}
