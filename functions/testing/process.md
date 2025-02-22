# Backend testing process

1. Start emulators.

```bash
firebase emulators:start --only functions,auth
```

2. Add mock user in UI, get `UID`.

3. Get auth token.

```bash
cd functions
node testing/getAuthToken.js <UID>
```

4. Put in header and test.

```bash
curl http://localhost:5001/quick-short-memos/asia-southeast1/app/api/ping -H "Authorization: Bearer <AUTH_TOKEN>"
```
