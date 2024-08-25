// import the component you want to make a story for
import React, { Key } from 'react';
import '../../app/globals.css';
import Report from '../Report/Report';
import { ListData } from '@react-stately/data';
import { Selection } from '@nextui-org/react';

// Setting up the story's default component
export default {
  component: Report,
};

const data: ListData<unknown> = {
  items: [
    {
      companyName: 'Tech Innovators',
      numberOfEmployees: 120,
      netWorth: 5000000,
      annualRevenue: 2000000,
      profitMargin: 0.4,
    },
    {
      companyName: 'Creative Solutions',
      numberOfEmployees: 85,
      netWorth: 3500000,
      annualRevenue: 1500000,
      profitMargin: 0.3,
    },
    {
      companyName: 'Future Enterprises',
      numberOfEmployees: 200,
      netWorth: 7500000,
      annualRevenue: 3000000,
      profitMargin: 0.35,
    },
    {
      companyName: 'Smart Industries',
      numberOfEmployees: 150,
      netWorth: 6200000,
      annualRevenue: 2500000,
      profitMargin: 0.38,
    },
    {
      companyName: 'Green Tech',
      numberOfEmployees: 95,
      netWorth: 4000000,
      annualRevenue: 1800000,
      profitMargin: 0.45,
    },
    {
      companyName: 'NextGen Labs',
      numberOfEmployees: 170,
      netWorth: 6800000,
      annualRevenue: 2700000,
      profitMargin: 0.42,
    },
    {
      companyName: 'Innovatech',
      numberOfEmployees: 110,
      netWorth: 5200000,
      annualRevenue: 2200000,
      profitMargin: 0.36,
    },
    {
      companyName: 'Visionary Solutions',
      numberOfEmployees: 130,
      netWorth: 5700000,
      annualRevenue: 2400000,
      profitMargin: 0.39,
    },
    {
      companyName: 'Digital Ventures',
      numberOfEmployees: 140,
      netWorth: 6000000,
      annualRevenue: 2600000,
      profitMargin: 0.41,
    },
    {
      companyName: 'Eco Enterprises',
      numberOfEmployees: 90,
      netWorth: 3800000,
      annualRevenue: 1700000,
      profitMargin: 0.32,
    },
    {
      companyName: 'Tech Pioneers',
      numberOfEmployees: 160,
      netWorth: 6500000,
      annualRevenue: 2800000,
      profitMargin: 0.37,
    },
    {
      companyName: 'Smart Solutions',
      numberOfEmployees: 105,
      netWorth: 4900000,
      annualRevenue: 2100000,
      profitMargin: 0.34,
    },
    {
      companyName: 'Green Ventures',
      numberOfEmployees: 80,
      netWorth: 3300000,
      annualRevenue: 1600000,
      profitMargin: 0.31,
    },
    {
      companyName: 'Future Innovations',
      numberOfEmployees: 125,
      netWorth: 5400000,
      annualRevenue: 2300000,
      profitMargin: 0.33,
    },
  ],
  selectedKeys: 'all',
  setSelectedKeys: function (keys: Selection): void {
    throw new Error('Function not implemented.');
  },
  filterText: '',
  setFilterText: function (filterText: string): void {
    throw new Error('Function not implemented.');
  },
  getItem: (key: Key) => undefined,
  insert: function (index: number, ...values: unknown[]): void {
    throw new Error('Function not implemented.');
  },
  insertBefore: (key: Key, ...values: unknown[]): void => {},
  insertAfter: (key: Key, ...values: unknown[]): void => {},
  append: function (...values: unknown[]): void {
    throw new Error('Function not implemented.');
  },
  prepend: function (...values: unknown[]): void {
    throw new Error('Function not implemented.');
  },
  remove: (...keys: Key[]) => {},
  removeSelectedItems: function (): void {
    throw new Error('Function not implemented.');
  },
  move: (key: Key, toIndex: number): void => {},
  moveBefore: (key: Key, keys: Iterable<Key>): void => {
    // Implement the moveBefore logic here
  },
  moveAfter: (key: Key, keys: Iterable<Key>): void => {
    // Implement the moveAfter logic here
  },
  update: (key: Key, newValue: unknown): void => {
    // Implement the update logic here
  }
};

// Can have multiple different variants of a component
export const DefaultReport = {
  render: () => <Report data={data.items as JSON[]} />,
};
