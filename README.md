# Bolt Monorepo

Welcome to the Bolt monorepo! This repository contains the codebase for Bolt, an AI assistant developed by StackBlitz.

## Repository Structure

Currently, this monorepo contains a single package:

- [`bolt`](packages/bolt): The main package containing the UI interface for Bolt as well as the server components.

As the project grows, additional packages may be added to this workspace.

## Getting Started

### Prerequisites

- Node.js (v18.20.3)
- pnpm (v9.4.0)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/stackblitz/bolt.git
cd bolt
```

2. Install dependencies:

```bash
pnpm i
```

### Development

To start developing the Bolt UI:

1. Navigate to the bolt package:

```bash
cd packages/bolt
```

2. Start the development server:

```bash
pnpm run dev
```
