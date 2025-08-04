import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - MyAddressHub',
  description: 'Manage your addresses and keep them organized.',
};

export default function AddressesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 