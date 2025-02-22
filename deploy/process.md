# Deployment process

## Firestore

1. Run deploy command.

```bash
firebase deploy --only firestore
```

## Functions

1. Run deploy command.

```bash
firebase deploy --only functions
```

## Hosting

1. Build.

```bash
npm run build
```

2. Run deploy command.

```bash
firebase deploy --only hosting
```
