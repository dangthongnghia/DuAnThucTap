import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconProps = { size?: number; color?: string; fill?: string };

type TabItem = {
  name: string;
  icon: (props: IconProps) => React.ReactElement;
};

export const TABS: TabItem[] = [
  { name: 'index', icon: (props) => <Ionicons name="home-outline" color='black' {...props} /> },
  { name: 'transaction', icon: (props) => <Ionicons name="trending-up-outline" {...props} /> },
  { name: 'add', icon: (props) => <Ionicons name="add-circle-outline" {...props} /> },
  { name: 'budget', icon: (props) => <Ionicons name="card-outline" {...props} /> },
  { name: 'recurring', icon: (props) => <Ionicons name="repeat-outline" {...props} /> },
  { name: 'profile', icon: (props) => <Ionicons name="person-outline" {...props} /> },
  { name: 'report', icon: (props) => <Ionicons name="bar-chart-outline" {...props} /> },
];
