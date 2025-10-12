# AsyncStorage + PostgreSQL Integration Theory

## Overview

This document outlines the hybrid storage architecture for LeadZen CRM, combining PostgreSQL as the primary database with AsyncStorage for local caching and offline functionality.

## Architecture Overview

### PostgreSQL (Server-side)
- **Primary data source** - all leads, contacts, deals, activities
- **Centralized database** on backend server
- **Multi-user synchronization** across devices
- **Data integrity and relationships**
- **ACID compliance** for financial data consistency

### AsyncStorage (Client-side)
- **Local cache** for offline functionality
- **App settings and preferences**
- **Authentication tokens**
- **Draft data** before syncing to server
- **Performance optimization** for frequently accessed data

## Data Flow Architecture

```
Mobile App → AsyncStorage (local) ↔ REST API ↔ PostgreSQL (server)
```

### Data Syncing Process

#### 1. Download Flow
1. App requests data from PostgreSQL via API
2. API returns structured data (leads, contacts, deals)
3. Data is cached locally in AsyncStorage
4. App uses cached data for immediate UI rendering

#### 2. Upload Flow
1. User creates/edits data locally
2. Changes stored temporarily in AsyncStorage
3. When online, data syncs to PostgreSQL via API
4. Successful sync updates local cache

#### 3. Conflict Resolution
- Timestamp-based conflict resolution
- Last-write-wins or manual conflict resolution
- Version control for critical data

## Data Distribution Strategy

### What Stays in AsyncStorage

| Data Type | Purpose | Example |
|-----------|---------|---------|
| **Authentication** | User sessions | JWT tokens, refresh tokens |
| **App Settings** | User preferences | Theme, notifications, language |
| **Cached Data** | Offline access | Recent leads, contacts |
| **Draft Data** | Unsaved changes | Form drafts, notes in progress |
| **Sync Metadata** | Data management | Last sync timestamps, dirty flags |

### What Goes to PostgreSQL

| Data Type | Reason | Example |
|-----------|--------|---------|
| **Lead Records** | Multi-user access | Lead details, status, priority |
| **Contact Data** | Relationship integrity | Contact info, company associations |
| **Deal Pipeline** | Financial accuracy | Deal values, stages, forecasts |
| **Activity Logs** | Audit trail | Calls, emails, meetings |
| **User Management** | Security & permissions | User accounts, roles, teams |
| **Analytics Data** | Reporting & insights | Performance metrics, conversion rates |

## Implementation Patterns

### Online Data Access
```javascript
const fetchLeads = async () => {
  try {
    if (isOnline) {
      // Fetch from PostgreSQL via API
      const response = await fetch('/api/leads');
      const leads = await response.json();
      
      // Cache locally for offline access
      await AsyncStorage.setItem('cached_leads', JSON.stringify(leads));
      await AsyncStorage.setItem('last_sync', Date.now().toString());
      
      return leads;
    } else {
      // Use cached data when offline
      const cachedLeads = await AsyncStorage.getItem('cached_leads');
      return cachedLeads ? JSON.parse(cachedLeads) : [];
    }
  } catch (error) {
    console.error('Data fetch error:', error);
    // Fallback to cached data
    const cachedLeads = await AsyncStorage.getItem('cached_leads');
    return cachedLeads ? JSON.parse(cachedLeads) : [];
  }
};
```

### Data Synchronization
```javascript
const syncData = async () => {
  // Get pending changes from AsyncStorage
  const pendingChanges = await AsyncStorage.getItem('pending_changes');
  
  if (pendingChanges && isOnline) {
    const changes = JSON.parse(pendingChanges);
    
    for (const change of changes) {
      try {
        // Sync each change to PostgreSQL
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(change)
        });
        
        // Remove from pending changes on success
        // Update local cache
      } catch (error) {
        // Handle sync conflicts
        console.error('Sync error:', error);
      }
    }
  }
};
```

### Offline-First Approach
```javascript
const createLead = async (leadData) => {
  // Always save locally first
  const leads = await getLocalLeads();
  const newLead = { ...leadData, id: generateTempId(), isDirty: true };
  leads.push(newLead);
  
  await AsyncStorage.setItem('cached_leads', JSON.stringify(leads));
  
  // Try to sync immediately if online
  if (isOnline) {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData)
      });
      
      const savedLead = await response.json();
      
      // Update local cache with server ID
      await updateLocalLead(newLead.id, savedLead);
    } catch (error) {
      // Will sync later when connection restored
      await addToPendingChanges(newLead);
    }
  }
  
  return newLead;
};
```

## Benefits of This Architecture

### 1. Offline Capability
- Users can view and edit data without internet connection
- Changes sync automatically when connection restored
- Seamless user experience regardless of connectivity

### 2. Performance Optimization
- Instant data access from local cache
- Reduced API calls and server load
- Faster app startup and navigation

### 3. Data Consistency
- PostgreSQL ensures ACID compliance for critical operations
- Multi-user synchronization prevents data conflicts
- Audit trails and version control

### 4. Scalability
- PostgreSQL handles complex queries and relationships
- AsyncStorage provides fast local operations
- Clean separation of concerns

## Data Synchronization Strategies

### 1. Pull Synchronization
- Periodic fetch of updated data from server
- Based on last sync timestamp
- Handles new leads, status updates, etc.

### 2. Push Synchronization
- Upload local changes to server
- Conflict detection and resolution
- Batch operations for efficiency

### 3. Real-time Updates (Future Enhancement)
- WebSocket connections for live updates
- Push notifications for critical changes
- Collaborative editing capabilities

## Security Considerations

### Local Storage Security
- Encrypt sensitive data in AsyncStorage
- Secure token storage
- Automatic session timeout

### API Security
- JWT token authentication
- HTTPS-only communication
- Input validation and sanitization
- Rate limiting and abuse prevention

## Migration Strategy

### Phase 1: Maintain Current AsyncStorage
- Continue using AsyncStorage for all local operations
- Prepare API endpoints for PostgreSQL integration

### Phase 2: Implement Hybrid Architecture
- Add PostgreSQL backend with API layer
- Implement data sync functionality
- Gradual migration of data types

### Phase 3: Full Integration
- All new data flows through PostgreSQL
- AsyncStorage becomes pure cache layer
- Advanced sync and conflict resolution

## Performance Considerations

### AsyncStorage Optimization
- Store frequently accessed data
- Implement data pagination for large datasets
- Regular cache cleanup and management

### PostgreSQL Optimization
- Proper indexing for lead queries
- Connection pooling for mobile clients
- Efficient query design for mobile bandwidth

### Sync Optimization
- Delta sync (only changed data)
- Compression for large datasets
- Background sync with proper error handling

## Conclusion

The hybrid AsyncStorage + PostgreSQL architecture provides the best of both worlds:
- **Local performance** and offline capability from AsyncStorage
- **Data integrity** and multi-user support from PostgreSQL
- **Scalable foundation** for future CRM features

This approach ensures LeadZen can grow from a mobile-first application to a full-featured CRM system while maintaining excellent user experience.