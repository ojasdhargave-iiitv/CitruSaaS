import React from 'react';

export interface Module {
  id: string;
  name: string;
  selected?: boolean;
  requiresFileType?: boolean;
}

export interface Framework {
  id: string;
  name: string;
  description: string;
  installs: string;
  modules: Module[];
}

export const frameworks: Framework[] = [
  {
    id: 'python',
    name: 'Python',
    description: 'Python is a high-level, interpreted, general-purpose programming language.',
    installs: '+ 34.8M',
    modules: []
  },
  {
    id: 'html',
    name: 'HTML, CSS, JS (Static)',
    description: 'The languages that make up the web. HTML provides the basic structure, CSS controls formatting, and JavaScript controls the...',
    installs: '+ 10.9M',
    modules: []
  },
  {
    id: 'node',
    name: 'Node.js',
    description: 'Node.js is an open-source, cross-platform, back-end JavaScript runtime environment.',
    installs: '+ 6.3M',
    modules: [
      { id: 'oauth', name: 'OAuth Setup', requiresFileType: true },
      { id: 'jwt', name: 'JWT Setup', requiresFileType: true },
      { id: 'sessions', name: 'Sessions Setup', requiresFileType: true },
      { id: 'websocket', name: 'WebSocket Setup', requiresFileType: true },
      { id: 'stripe', name: 'Stripe Payments Gateway Setup', requiresFileType: true },
      { id: 'mongodb', name: 'MongoDB Setup', requiresFileType: true },
      { id: 'mysql', name: 'MySQL Setup', requiresFileType: true },
      { id: 'zod', name: 'ZOD Setup', requiresFileType: true },
    ]
  },
  {
    id: 'cpp',
    name: 'C++',
    description: 'C++ is a low-level and cross-platform imperative language. It has object-oriented, generic, and functional features.',
    installs: '+ 4.7M',
    modules: []
  },
  {
    id: 'java',
    name: 'Java',
    description: 'Java is a concurrent, class-based, statically typed object-oriented language.',
    installs: '+ 4.5M',
    modules: []
  },
  {
    id: 'c',
    name: 'C',
    description: 'C is a general-purpose computer programming language. It\'s used in operating systems, device drivers, and...',
    installs: '+ 4.3M',
    modules: []
  }
];
