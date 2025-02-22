# Frontend testing process

1. Start emulators.

```bash
firebase emulators:start --only functions
```

Note: do not start `auth` emulator - use mock user in production.

2. Run dev server.

```bash
npm run dev
```

3. Go to `http://localhost:5173`.
