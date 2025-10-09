# Task 7: Built-in Dialer with T9 Search

## 🎯 Goal
Implement a fully functional built-in dialer with T9 search, lead suggestions, and call initiation.

## 📋 Scope
- Create Material Design 3 dialer interface with number pad
- Implement T9 search functionality for lead suggestions
- Add recent calls display and favorites
- Enable direct calling from dialer
- Integrate with lead database for smart suggestions

## 🛠️ Technical Requirements
- Design custom dialer keypad with T9 functionality
- Implement lead search algorithm for T9 input
- Add call initiation using `CALL_PHONE` permission
- Create recent calls list from call logs
- Add click-to-call from lead profiles

## 📱 Expected Deliverable
Complete dialer system with:
- Beautiful Material Design 3 number pad
- Real-time T9 search showing lead suggestions
- Recent calls list with lead information
- One-tap calling functionality
- Search suggestions updating as user types
- Integration with existing lead database

## 🔍 Acceptance Criteria
- [ ] Dialer tab shows clean, modern number pad
- [ ] T9 search works and shows relevant lead suggestions
- [ ] Typing numbers filters leads in real-time
- [ ] Recent calls display with lead names (where available)
- [ ] Call button initiates actual phone calls
- [ ] Lead suggestions show name, company, and status
- [ ] Backspace and clear functions work properly
- [ ] Phone number formatting appears correctly

## 📚 Files to Create/Modify
- `src/screens/Dialer.tsx` - Main dialer screen
- `src/components/DialerKeypad.tsx` - Number pad component
- `src/components/T9Search.tsx` - T9 search logic and display
- `src/components/RecentCalls.tsx` - Recent calls list
- `src/services/DialerService.js` - Call initiation and T9 logic
- `src/utils/t9Utils.js` - T9 search algorithm
- `src/services/DatabaseService.js` - Add search methods

## 🎨 UI Design - Dialer Interface
```
┌─────────────────────────────────────┐
│ 🎯 LeadZen Dialer                   │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ (555) 123-4567                  │ │ ← Number display
│ └─────────────────────────────────┘ │
│                                     │
│ 📞 Lead Suggestions:                │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Sarah Johnson - Tech Ltd     │ │ ← T9 suggestions
│ │    (555) 123-4567               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⌨️ Keypad:                          │
│ ┌─────┬─────┬─────┐                 │
│ │  1  │  2  │  3  │                 │
│ │     │ ABC │ DEF │                 │
│ ├─────┼─────┼─────┤                 │
│ │  4  │  5  │  6  │                 │
│ │ GHI │ JKL │ MNO │                 │
│ ├─────┼─────┼─────┤                 │
│ │  7  │  8  │  9  │                 │
│ │PQRS │ TUV │WXYZ │                 │
│ ├─────┼─────┼─────┤                 │
│ │  *  │  0  │  #  │                 │
│ │     │ + ⎵ │     │                 │
│ └─────┴─────┴─────┘                 │
│                                     │
│ [🗑️ Clear] [📞 Call] [⌫ Back]      │ ← Action buttons
└─────────────────────────────────────┘
```

## 🔤 T9 Search Algorithm Implementation
```javascript
const T9_MAPPING = {
  '2': 'abc',
  '3': 'def', 
  '4': 'ghi',
  '5': 'jkl',
  '6': 'mno',
  '7': 'pqrs',
  '8': 'tuv',
  '9': 'wxyz'
};

class T9Search {
  static searchLeads(input, leads) {
    if (!input || input.length < 2) return [];
    
    const matches = leads.filter(lead => {
      return this.matchesT9Pattern(lead.name, input) ||
             this.matchesT9Pattern(lead.company, input) ||
             lead.phone_primary.includes(input);
    });
    
    return matches.slice(0, 5); // Limit to 5 suggestions
  }

  static matchesT9Pattern(text, pattern) {
    if (!text) return false;
    
    const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');
    let textIndex = 0;
    
    for (let i = 0; i < pattern.length; i++) {
      const digit = pattern[i];
      const letters = T9_MAPPING[digit];
      
      if (!letters) continue;
      
      let found = false;
      while (textIndex < cleanText.length) {
        if (letters.includes(cleanText[textIndex])) {
          found = true;
          textIndex++;
          break;
        }
        textIndex++;
      }
      
      if (!found) return false;
    }
    
    return true;
  }
}
```

## 📞 Call Initiation Service
```javascript
class DialerService {
  static async makeCall(phoneNumber) {
    try {
      const cleanNumber = this.formatPhoneNumber(phoneNumber);
      const url = `tel:${cleanNumber}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        
        // Log call attempt to database
        await this.logOutgoingCall(cleanNumber);
        
        return { success: true };
      } else {
        throw new Error('Phone calling not supported');
      }
    } catch (error) {
      console.error('Call failed:', error);
      return { success: false, error: error.message };
    }
  }

  static formatPhoneNumber(number) {
    // Remove all non-digits
    const digits = number.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length === 10) {
      return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    
    return digits;
  }

  static async logOutgoingCall(phoneNumber) {
    const callLog = {
      phone_number: phoneNumber,
      call_type: 'outgoing',
      started_at: new Date().toISOString(),
      lead_id: await this.findLeadIdByPhone(phoneNumber)
    };
    
    await DatabaseService.addCallLog(callLog);
  }
}
```

## 📋 Recent Calls Implementation
```javascript
const RecentCallsComponent = () => {
  const [recentCalls, setRecentCalls] = useState([]);

  useEffect(() => {
    loadRecentCalls();
  }, []);

  const loadRecentCalls = async () => {
    const calls = await DatabaseService.getRecentCalls(10);
    setRecentCalls(calls);
  };

  const renderCallItem = (call) => (
    <TouchableOpacity 
      style={styles.callItem}
      onPress={() => DialerService.makeCall(call.phone_number)}
    >
      <View style={styles.callInfo}>
        <Text style={styles.contactName}>
          {call.lead_name || 'Unknown'}
        </Text>
        <Text style={styles.phoneNumber}>
          {call.phone_number}
        </Text>
        <Text style={styles.callTime}>
          {formatCallTime(call.started_at)}
        </Text>
      </View>
      <View style={styles.callTypeIcon}>
        {call.call_type === 'outgoing' ? '📱' : '📞'}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={recentCalls}
      renderItem={({ item }) => renderCallItem(item)}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

## 🎭 Animation & Interaction Details
- **Keypad Press:** Scale down animation (100ms) with haptic feedback
- **Number Display:** Smooth typing animation with cursor
- **Suggestions:** Fade in/out as user types
- **Call Button:** Pulse animation when number is ready to call
- **Recent Calls:** Slide animations for list items

## 🔧 Advanced Features
1. **Speed Dial:** Assign numbers 2-9 for quick contact access
2. **International Calling:** Country code prefix support
3. **Call History Search:** Search through recent calls
4. **Voice Input:** Speech-to-text for number entry
5. **Smart Formatting:** Auto-format numbers as user types

## ⚠️ Testing Requirements
- **T9 Search:** Test with various name combinations
- **Call Integration:** Verify actual calls work from dialer
- **Number Formatting:** Test various phone number formats
- **Lead Matching:** Ensure suggestions match correctly
- **Performance:** Smooth typing with large lead database

## 🚀 Next Task Preview
Task 8 will focus on final UI polish, animations, and APK optimization for demo readiness.