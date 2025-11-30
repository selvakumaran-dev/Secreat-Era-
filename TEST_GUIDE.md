# Quick Test Guide - Secure Era

## How to Test File Transfer

### Step 1: Open Sender Page
1. Open your browser (Chrome recommended)
2. Navigate to: `http://localhost:5173`
3. Click **"Send File"** button

### Step 2: Select a File
1. Click **"Choose File"** or drag-and-drop a file
2. Select a small test file (e.g., a text file or small image)
3. Wait for the room to be created
4. You'll see a shareable link like: `http://localhost:5173/receive/ABC123`

### Step 3: Open Receiver Page
1. **Copy the shareable link**
2. Open a **new incognito/private window** (Ctrl+Shift+N in Chrome)
3. Paste the link and press Enter
4. You should see "Waiting for sender to connect..."

### Step 4: Wait for Connection
- **Sender side**: Status will change from "Waiting for receiver..." → "Securely connecting..." → "Connected securely"
- **Receiver side**: Status will change from "Waiting..." → "Establishing secure connection..." → "Connected! Waiting for file..."

### Step 5: Send the File
1. Go back to the **sender window**
2. Click the **"Send File"** button
3. Watch the progress bar fill up
4. Status will show "Encrypted transfer in progress..."

### Step 6: Download the File
1. Go to the **receiver window**
2. Once transfer completes, you'll see "Transfer Complete!"
3. Click **"Download File"** button
4. The file will download to your Downloads folder
5. Verify the file is correct!

## Troubleshooting

### "Data channel is not ready" error
- **Solution**: Wait a few more seconds for the connection to fully establish
- The "Send File" button should only be enabled when status shows "Connected securely"

### No download button appears
- **Solution**: This was the bug we just fixed! Refresh both pages and try again
- Make sure you're using the latest code (the dev server should auto-reload)

### Connection fails
- **Solution**: 
  - Check that both backend and frontend servers are running
  - Try refreshing both pages
  - Make sure you're using different browser windows/tabs

### Transfer gets stuck
- **Solution**:
  - Check browser console for errors (F12)
  - Try with a smaller file first
  - Refresh and try again

## Expected Behavior

✅ **Sender sees**:
1. Room created with shareable link
2. "Waiting for receiver..."
3. "Securely connecting..."
4. "Connected securely" (Send File button enabled)
5. Progress bar during transfer
6. "Transfer Complete!"

✅ **Receiver sees**:
1. Room code displayed
2. "Waiting for sender to connect..."
3. "Establishing secure connection..."
4. "Connected! Waiting for file..."
5. File metadata shown (name, size)
6. Progress bar during transfer
7. "Transfer Complete!" with Download button
8. File preview (if image/video)

## Testing Different File Types

### Small Text File (< 1MB)
- Should transfer almost instantly
- Good for initial testing

### Image File (1-10MB)
- Should show preview after download
- Test the preview functionality

### Video File (10-50MB)
- Tests chunking and progress tracking
- Should show video player after download

### Large File (50-100MB)
- Tests sustained transfer
- Watch the speed and ETA calculations

## Browser Console Logs

Open browser console (F12) to see detailed logs:

**Sender logs:**
```
[SendPage] Room created: ABC123
[SendPage] Receiver joined
[SendPage] Connection state: connecting
[WebRTC] Data channel opened
[SendPage] Data channel is open and ready
[SendPage] File sent successfully
```

**Receiver logs:**
```
[ReceivePage] Joined room: ABC123
[ReceivePage] Received offer
[WebRTC] Data channel opened
[ReceivePage] Received metadata
[ReceivePage] File received: filename.txt
```

## Success Criteria

✅ File transfers successfully
✅ Download button appears
✅ Downloaded file matches original
✅ Progress bar updates smoothly
✅ No errors in console
✅ Both sender and receiver see "Transfer Complete!"

---

**Note**: The frontend dev server auto-reloads when code changes, so the fixes are already applied!
