# 🧪 Testing Guide - Persona Protocol

## ✅ Quick Test (30 seconds)

### **Step 1: Run Tests**
```bash
npm test
```
**Expected**: ✅ 49 tests passing

### **Step 2: Start Server**
```bash
npm run build
npm run server
```
**Expected**: Server running on http://localhost:3000

### **Step 3: Open Web Interface**
```
Open browser: http://localhost:3000
```

---

## 🎬 **DEMO MODE - Perfect for Video** (Works Offline!)

### **Option 1: JSON Upload Demo** (Easiest - No Internet Needed!)

1. **Open**: http://localhost:3000
2. **Click**: "Analyze from JSON" tab
3. **Click**: "DeFi Degen" button (loads example)
4. **Click**: "🚀 Analyze Wallet"
5. **See Results** in 1 second!

**What You'll See**:
- Persona Title: "DeFi Degen" or similar
- Risk Score: ~75-85
- Loyalty Score: ~40-50
- Activity Score: ~80-90
- Traits: Airdrop Hunter, Early Adopter
- Protocols: Uniswap, NewProtocol

### **Option 2: Try Other Examples**

**Steady Staker** (Click "Steady Staker" button):
- High Loyalty (85+)
- Low Risk (30-40)
- Traits: Diamond Hands, Governance Participant
- Protocol: Lido

**NFT Collector** (Click "NFT Collector" button):
- NFT-focused title
- High Activity
- Protocols: OpenSea, Rarible

---

## 🔧 **API Testing** (For Technical Demo)

### **Test 1: Health Check**
```bash
curl http://localhost:3000/api/health
```
**Expected**:
```json
{"status":"healthy","version":"1.0.0","timestamp":"..."}
```

### **Test 2: Analyze Wallet (JSON)**
```bash
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d "{\"walletAddress\":\"0x123...\",\"transactions\":[{\"hash\":\"0xabc\",\"timestamp\":\"2024-01-01T00:00:00Z\",\"type\":\"swap\",\"details\":{\"protocol\":\"Uniswap\"}}]}"
```

### **Test 3: Get Statistics**
```bash
curl http://localhost:3000/api/statistics
```

---

## 📝 **CLI Testing**

```bash
# Analyze example wallet
npm run analyze examples/wallet1-defi-degen.json
```

**Expected**: Complete JSON persona profile

---

## 🎥 **For Demo Video - Follow This Script**

### **Scene 1: Show Tests** (15 seconds)
```bash
npm test
```
**Say**: "All 49 tests passing, including property-based tests with 2,800+ test cases"

### **Scene 2: Start Server** (10 seconds)
```bash
npm run server
```
**Say**: "Starting the full-stack application with Web UI, API, and blockchain integration"

### **Scene 3: Web Interface** (90 seconds)
1. Open http://localhost:3000
2. **Say**: "Here's the beautiful web interface"
3. Click "Analyze from JSON" tab
4. Click "DeFi Degen" button
5. **Say**: "Loading example wallet data"
6. Click "🚀 Analyze Wallet"
7. **Say**: "The AI analyzes transactions and generates a persona profile"
8. Show results:
   - **Say**: "Risk Appetite score of 85 - this is an aggressive trader"
   - **Say**: "Loyalty score of 45 - tends to flip positions quickly"
   - **Say**: "Activity score of 90 - very active in DeFi"
   - **Say**: "Key traits identified: Airdrop Hunter, Early Adopter"
   - **Say**: "Most used protocols: Uniswap, NewProtocol"

### **Scene 4: Try Another Example** (30 seconds)
1. Click "Steady Staker" button
2. Click "🚀 Analyze Wallet"
3. **Say**: "This wallet has completely different behavior"
4. **Say**: "High loyalty of 88, low risk of 32 - a long-term holder"
5. **Say**: "Diamond Hands trait identified"

### **Scene 5: Show Code** (20 seconds)
1. Open `AI_DEVELOPMENT_LOG.md`
2. Scroll through
3. **Say**: "100% AI-generated using Kiro AI with Claude"
4. **Say**: "Complete development log with all prompts documented"

### **Scene 6: Show Architecture** (15 seconds)
1. Open `ARCHITECTURE.md`
2. **Say**: "Five-stage pipeline: Validation, Analysis, Scoring, Generation, Output"
3. **Say**: "Web UI, REST API, Blockchain integration, all working together"

---

## ❌ **Troubleshooting**

### **Problem: Server won't start**
```bash
# Solution: Rebuild
npm run build
npm run server
```

### **Problem: Port 3000 already in use**
```bash
# Solution: Kill process or use different port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in src/server.ts
```

### **Problem: Tests failing**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
npm test
```

### **Problem: Web interface not loading**
```bash
# Solution: Check if server is running
curl http://localhost:3000/api/health

# If not running:
npm run build
npm run server
```

---

## ✅ **Verification Checklist**

Before recording demo video:

- [ ] Tests pass: `npm test` shows 49 passing
- [ ] Server starts: `npm run server` shows success message
- [ ] Web UI loads: http://localhost:3000 opens
- [ ] Example loads: Click "DeFi Degen" button works
- [ ] Analysis works: Click "Analyze Wallet" shows results
- [ ] Results display: Scores, traits, protocols all visible

---

## 🎯 **Quick Demo Script** (2 minutes)

```
1. "Let me show you Persona Protocol in action"
2. [Open http://localhost:3000]
3. "This is the web interface"
4. [Click "Analyze from JSON"]
5. [Click "DeFi Degen"]
6. "Loading example wallet with 5 transactions"
7. [Click "Analyze Wallet"]
8. "The AI analyzes the transactions..."
9. [Results appear]
10. "And generates a complete persona profile"
11. "Risk score 85 - aggressive trader"
12. "Loyalty 45 - quick flipper"
13. "Activity 90 - very active"
14. "Traits: Airdrop Hunter, Early Adopter"
15. "Most used: Uniswap"
16. [Click "Steady Staker"]
17. [Click "Analyze"]
18. "Completely different profile"
19. "High loyalty, low risk - long-term holder"
20. "That's Persona Protocol!"
```

---

## 📊 **What Makes This Demo Great**

✅ **Works Offline** - No internet needed for JSON examples
✅ **Instant Results** - No waiting for blockchain API
✅ **Multiple Examples** - Show different persona types
✅ **Beautiful UI** - Professional, modern interface
✅ **Real Analysis** - Actual AI algorithms, not fake data
✅ **Complete Features** - Shows full system capabilities

---

**Your demo is ready!** Just follow the script above for a perfect video! 🎬
