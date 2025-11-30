# Debugging Guide - File Transfer Issue

## The Problem
File metadata shows up on receiver but no download button appears.

## What to Check

### 1. Open Browser Console (F12)

**On SENDER side**, look for these logs:
```
[SendPage] Data channel is open and ready
[FileSender] Starting file transfer: filename.txt 1234 bytes
[FileSender] Starting to read first chunk
[FileSender] Read chunk: 1234 bytes, offset: 0
[FileSender] Encrypted chunk: 1246 bytes
[FileSender] Sent encrypted chunk
[FileSender] All chunks sent, sending complete message
```

**On RECEIVER side**, look for these logs:
```
[ReceivePage] Received metadata
[FileReceiver] Received data, type: string, size: ...
[FileReceiver] Received data, type: object, size: 1246
[FileReceiver] Received chunk: 1246 bytes
[FileReceiver] Progress: 100.00% Speed: X.XX MB/s
[FileReceiver] Received complete message, assembling file from 1 chunks
[FileReceiver] Assembling file from 1 chunks
[ReceivePage] File received: filename.txt
```

### 2. Common Issues

#### Issue: "Data channel not ready" alert
**Solution**: Wait longer for connection. The button should be disabled until "Connected securely" appears.

#### Issue: No logs after "Starting file transfer"
**Cause**: File reading failed or encryption failed
**Solution**: Check console for errors

#### Issue: Metadata received but no chunks
**Cause**: Sender didn't click "Send File" button OR data channel closed
**Solution**: 
- Make sure sender clicks the "Send File" button
- Check data channel state in console

#### Issue: Chunks received but no "complete" message
**Cause**: Transfer interrupted or complete message lost
**Solution**: Refresh and try again

### 3. Step-by-Step Debug Process

1. **Clear browser console** (right-click → Clear console)
2. **Sender**: Select file and wait for "Connected securely"
3. **Sender**: Click "Send File" button
4. **Watch sender console** for file transfer logs
5. **Watch receiver console** for chunk reception logs
6. **If no logs appear**: Data channel issue - refresh both pages

### 4. Quick Fix

If the file transfer still doesn't work:

1. **Close both browser windows**
2. **Refresh the backend** (it's still running)
3. **Open sender**: `http://localhost:5173` → Send File
4. **Select a VERY SMALL file** (< 1KB text file)
5. **Copy link**
6. **Open receiver in incognito**
7. **Wait for "Connected securely" on BOTH sides**
8. **Click "Send File"**
9. **Watch console logs**

### 5. What the Logs Tell You

| Log Message | Meaning |
|------------|---------|
| `Data channel is open and ready` | ✅ Ready to send |
| `Starting file transfer` | ✅ Send button clicked |
| `Read chunk: X bytes` | ✅ File being read |
| `Encrypted chunk: X bytes` | ✅ Encryption working |
| `Sent encrypted chunk` | ✅ Data sent to receiver |
| `Received chunk: X bytes` | ✅ Receiver got data |
| `Assembling file from X chunks` | ✅ Transfer complete |
| `File received: filename` | ✅ SUCCESS! |

### 6. Expected Timeline

1. **0s**: Both pages load
2. **1-2s**: WebSocket connects
3. **2-3s**: WebRTC negotiation
4. **3-5s**: Data channel opens → "Connected securely"
5. **User clicks "Send File"**
6. **Immediate**: File transfer starts
7. **< 1s for small files**: Transfer complete
8. **Download button appears**

## Current Status

Based on your screenshot:
- ✅ Metadata received (filename shows)
- ❌ File chunks NOT received (no download button)
- ❌ Transfer NOT complete

**Most likely cause**: Sender hasn't clicked "Send File" button yet, OR data channel closed before sending.

## Next Steps

1. Open browser console (F12) on BOTH windows
2. Try the transfer again
3. Share the console logs if it still doesn't work
