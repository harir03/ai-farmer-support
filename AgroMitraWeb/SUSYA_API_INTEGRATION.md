# Susya API Integration Documentation

## Overview
The AI Farm Care web application now uses the Susya API as the primary disease detection service, with Google Gemini as a fallback option.

## API Endpoint
- **URL**: `https://susya.onrender.com`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Request Format
```json
{
  "image": "base64_encoded_image_string"
}
```

## Expected Response Formats

### Option 1: JSON Response
```json
{
  "diagnosis": "Disease identification and details",
  "confidence": 85,
  "recommendations": [
    "Treatment recommendation 1",
    "Treatment recommendation 2"
  ]
}
```

### Option 2: Plain Text Response
```
The plant shows signs of [disease name]. 
Treatment: [treatment details]
Prevention: [prevention measures]
Confidence: 90%
```

## Integration Flow

1. **User uploads/captures image** → Base64 conversion
2. **Primary**: Send to Susya API
3. **Fallback**: If Susya fails, try Gemini API (if configured)
4. **Response parsing**: Extract diagnosis, confidence, recommendations
5. **Display results** → User sees formatted analysis

## Features

### ✅ **Implemented Features**
- Primary Susya API integration
- Automatic fallback to Gemini API
- Response parsing for both JSON and text formats
- Error handling with detailed logging
- Request timeout (30 seconds)
- Confidence level extraction
- Recommendation parsing
- Test interface for API validation

### 🔧 **Error Handling**
- API timeout handling
- Network error recovery
- Malformed response handling
- Fallback API switching
- Detailed error logging

## Testing

### Manual Testing
1. Visit `/test-disease-detection`
2. Click "Test Susya API" button
3. Check console logs for detailed request/response info
4. Verify parsed results

### Production Testing
1. Upload real plant images via `/upload-detection`
2. Use camera detection via `/disease-detection`
3. Monitor API response times and accuracy

## Configuration

### Environment Variables (Optional)
```bash
# Fallback API (optional)
GEMINI_API_KEY=your_gemini_key_here
```

### No Configuration Required
- Susya API requires no API keys
- Works out of the box
- No rate limits mentioned

## Response Processing

### Confidence Extraction
The system looks for confidence indicators in the response:
- `confidence: 85%`
- `accuracy: 90%` 
- `90% confident`
- Default: 85% if not specified

### Recommendations Extraction
The system extracts recommendations from:
- Numbered lists (`1. Treatment...`)
- Bullet points (`• Apply...`)
- Keywords: "recommend", "treatment", "spray", "apply"
- Structured sections: "Treatment:", "Prevention:", "Control:"

## API Performance

### Timeout Settings
- Request timeout: 30 seconds
- Automatic retry: None (immediate fallback)
- Response size: No limit

### Logging
All requests are logged with:
- Request timestamp
- Response status
- Response preview (first 200 chars)
- Error details if failed
- Fallback usage

## Usage Examples

### Camera Detection
```typescript
// User says "detect disease" or "scan my plants"
// → Redirects to /disease-detection
// → Camera captures image
// → Sends to Susya API
// → Displays results
```

### Image Upload
```typescript
// User uploads image via /upload-detection
// → Image converted to base64
// → Sent to Susya API
// → Results displayed with history
```

### Voice Command Integration
```typescript
// Voice agent detects disease-related queries
// → Automatically opens camera detection
// → Guides user through scanning process
```

## Troubleshooting

### Common Issues

1. **API Timeout**
   - Issue: Susya API takes > 30 seconds
   - Solution: Automatic fallback to Gemini
   - Log: "Susya API request timeout"

2. **Invalid Response**
   - Issue: API returns unexpected format
   - Solution: Response parsing handles both JSON and text
   - Log: "Successfully parsed Susya API response"

3. **Network Error**
   - Issue: Unable to reach Susya API
   - Solution: Immediate fallback to Gemini
   - Log: "Susya API failed, trying fallback"

### Debug Steps
1. Check browser console for detailed logs
2. Verify image base64 encoding
3. Test with `/test-disease-detection` page
4. Monitor network requests in DevTools

## Future Enhancements

### Potential Improvements
- Response caching for similar images
- Batch processing for multiple images
- Real-time streaming analysis
- Offline mode with local model
- Custom confidence thresholds
- Multi-language support

### API Enhancements
- Request queuing for high traffic
- Image preprocessing optimization
- Response compression
- WebSocket support for real-time analysis