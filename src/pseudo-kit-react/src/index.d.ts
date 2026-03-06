/**
 * TypeScript definitions for pseudo-kit-react
 */

import type { ReactNode } from 'react';

export interface PseudoKitProviderProps {
  components?: string[];
  baseUrl?: string;
  children: ReactNode;
}

export interface UseComponentResult {
  ready: boolean;
}

export interface UsePseudoKitResult {
  ready: boolean;
}

export interface UseRegisterComponentResult {
  ready: boolean;
}

export interface UsePseudoKitReadyResult {
  ready: boolean;
}

export function PseudoKitProvider(props: PseudoKitProviderProps): JSX.Element;

export function useComponent(url: string): UseComponentResult;

export function usePseudoKit(urls: string[]): UsePseudoKitResult;

export function useRegisterComponent(url: string): UseRegisterComponentResult;

export function usePseudoKitReady(): UsePseudoKitReadyResult;
