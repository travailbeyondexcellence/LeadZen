# Component Examples

## React Native Code Snippets

> These examples show how to implement the design system in React Native components.

---

## 🎴 Cards

### Standard Card

```jsx
const StandardCard = ({ children }) => {
  return (
    <View style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    }}>
      {children}
    </View>
  );
};
```

### Featured Card with Gradient

```jsx
const FeaturedCard = ({ title, subtitle, buttonText, onPress }) => {
  return (
    <View style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '24px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 8px 24px rgba(79, 70, 229, 0.2)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circle */}
      <View style={{
        position: 'absolute',
        right: '-20px',
        bottom: '-20px',
        width: '120px',
        height: '120px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
      }} />
    
      <Text style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
      }}>
        {title}
      </Text>
    
      <Text style={{
        fontSize: '14px',
        opacity: 0.9,
        marginBottom: '20px',
      }}>
        {subtitle}
      </Text>
    
      <TouchableOpacity 
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '12px 24px',
          borderRadius: '12px',
          alignItems: 'center',
        }}
        onPress={onPress}
      >
        <Text style={{
          color: 'white',
          fontWeight: '600',
          fontSize: '14px',
        }}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Stat Card

```jsx
const StatCard = ({ icon, value, label, gradient }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <View style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      textAlign: 'center',
    }}>
      <View style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s ease',
      }}>
        {icon}
      </View>
    
      <Text style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: '4px',
      }}>
        {value}
      </Text>
    
      <Text style={{
        fontSize: '12px',
        color: '#64748B',
      }}>
        {label}
      </Text>
    </View>
  );
};

// Usage
<StatCard 
  icon={<MapPin size={20} color="white" />}
  value="12"
  label="Visited"
  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
/>
```

---

## 🔘 Buttons

### Primary Button

```jsx
const PrimaryButton = ({ title, onPress, size = 'medium' }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const sizes = {
    small: { padding: '10px 20px', fontSize: '13px', height: '36px' },
    medium: { padding: '12px 24px', fontSize: '15px', height: '44px' },
    large: { padding: '14px 32px', fontSize: '16px', height: '48px' },
  };
  
  return (
    <TouchableOpacity
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        ...sizes[size],
        boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isPressed ? 'translateY(0)' : 'translateY(-2px)',
        transition: 'all 0.2s ease',
      }}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Text style={{
        color: 'white',
        fontWeight: '600',
        fontSize: sizes[size].fontSize,
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

### Secondary Button (Glassmorphism)

```jsx
const SecondaryButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      style={{
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '12px 24px',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
      }}
      onPress={onPress}
    >
      <Text style={{
        color: 'white',
        fontWeight: '600',
        fontSize: '14px',
      }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
```

### Icon Button

```jsx
const IconButton = ({ icon, onPress, size = 'medium', variant = 'default' }) => {
  const sizes = {
    small: '36px',
    medium: '44px',
    large: '48px',
  };
  
  const iconSizes = {
    small: 18,
    medium: 20,
    large: 22,
  };
  
  return (
    <TouchableOpacity
      style={{
        width: sizes[size],
        height: sizes[size],
        borderRadius: '12px',
        background: variant === 'gradient' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
      onPress={onPress}
    >
      {React.cloneElement(icon, { 
        size: iconSizes[size],
        color: variant === 'gradient' ? 'white' : '#1E293B'
      })}
    </TouchableOpacity>
  );
};
```

---

## 🎨 Icon Badges

### Icon Badge Component

```jsx
const IconBadge = ({ icon, gradient, size = 'medium' }) => {
  const sizes = {
    small: { container: '36px', icon: 18, radius: '10px' },
    medium: { container: '44px', icon: 20, radius: '12px' },
    large: { container: '48px', icon: 24, radius: '14px' },
  };
  
  return (
    <View style={{
      width: sizes[size].container,
      height: sizes[size].container,
      borderRadius: sizes[size].radius,
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {React.cloneElement(icon, { 
        size: sizes[size].icon,
        color: 'white'
      })}
    </View>
  );
};

// Usage examples
<IconBadge 
  icon={<Compass />}
  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  size="medium"
/>

<IconBadge 
  icon={<Heart />}
  gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  size="large"
/>
```

---

## 📝 Input Fields

### Standard Input

```jsx
const Input = ({ placeholder, value, onChangeText, icon }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      background: '#FFFFFF',
      border: `1px solid ${isFocused ? '#4F46E5' : '#E5E7EB'}`,
      borderRadius: '12px',
      padding: '12px 16px',
      gap: '12px',
      transition: 'border-color 0.2s ease',
    }}>
      {icon && React.cloneElement(icon, { size: 20, color: '#64748B' })}
    
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          flex: 1,
          fontSize: '15px',
          color: '#1E293B',
          border: 'none',
          outline: 'none',
        }}
      />
    </View>
  );
};
```

### Search Bar

```jsx
const SearchBar = ({ placeholder, onSearch }) => {
  return (
    <View style={{
      display: 'flex',
      alignItems: 'center',
      background: '#F8FAFC',
      padding: '12px 16px',
      borderRadius: '16px',
      gap: '12px',
    }}>
      <Search size={20} color="#64748B" />
      <TextInput 
        placeholder={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          flex: 1,
          fontSize: '15px',
          color: '#1E293B',
        }}
      />
    </View>
  );
};
```

---

## 🧭 Bottom Navigation

```jsx
const BottomNavigation = ({ items, activeItem, onItemPress }) => {
  return (
    <View style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '428px',
      width: '100%',
      background: '#FFFFFF',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
      padding: '12px 20px 20px',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 10,
    }}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '16px',
            background: activeItem === item.id ? '#F8FAFC' : 'transparent',
            transition: 'all 0.3s ease',
          }}
          onPress={() => onItemPress(item.id)}
        >
          {React.cloneElement(item.icon, { 
            size: 22,
            color: activeItem === item.id ? '#4F46E5' : '#64748B'
          })}
        
          <Text style={{
            fontSize: '12px',
            fontWeight: activeItem === item.id ? '600' : '500',
            color: activeItem === item.id ? '#4F46E5' : '#64748B',
          }}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Usage
const navItems = [
  { id: 'home', icon: <Home />, label: 'Home' },
  { id: 'explore', icon: <Compass />, label: 'Explore' },
  { id: 'saved', icon: <Heart />, label: 'Saved' },
  { id: 'profile', icon: <User />, label: 'Profile' },
];
```

---

## 📱 Bottom Sheet

```jsx
const BottomSheet = ({ isOpen, onClose, children }) => {
  return (
    <>
      {/* Overlay */}
      <TouchableOpacity
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onPress={onClose}
      />
    
      {/* Sheet */}
      <View style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: `translateX(-50%) translateY(${isOpen ? '0' : '100%'})`,
        maxWidth: '428px',
        width: '100%',
        background: '#FFFFFF',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '24px 20px 32px',
        zIndex: 1000,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        {/* Handle */}
        <View style={{
          width: '40px',
          height: '4px',
          background: '#64748B',
          opacity: 0.3,
          borderRadius: '2px',
          margin: '0 auto 24px',
        }} />
      
        {children}
      </View>
    </>
  );
};
```

---

## 🎭 Badges

```jsx
const Badge = ({ count, variant = 'error' }) => {
  const variants = {
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#06B6D4',
  };
  
  return (
    <View style={{
      background: variants[variant],
      color: 'white',
      fontSize: '10px',
      fontWeight: '600',
      padding: '2px 6px',
      borderRadius: '6px',
      minWidth: '18px',
      textAlign: 'center',
    }}>
      <Text style={{ color: 'white' }}>{count}</Text>
    </View>
  );
};

// Avatar Stack for collaboration indicators
const AvatarStack = ({ colors, extraCount }) => {
  return (
    <View style={{
      display: 'flex',
      flexDirection: 'row',
    }}>
      {colors.map((color, i) => (
        <View 
          key={i}
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: color,
            border: '2px solid white',
            marginLeft: i === 0 ? '0' : '-8px',
            zIndex: colors.length - i,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '9px',
            fontWeight: '600',
          }}
        >
          {i === colors.length - 1 && extraCount && (
            <Text style={{ color: 'white' }}>+{extraCount}</Text>
          )}
        </View>
      ))}
    </View>
  );
};
```

---

## 📊 Progress Indicators

```jsx
const ProgressBar = ({ percentage, height = '8px', gradient }) => {
  return (
    <View style={{
      width: '100%',
      height: height,
      background: '#F1F5F9',
      borderRadius: '999px',
      overflow: 'hidden',
    }}>
      <View style={{
        width: `${percentage}%`,
        height: '100%',
        background: gradient || '#4F46E5',
        borderRadius: '999px',
        transition: 'width 0.5s ease',
      }} />
    </View>
  );
};

// Circular Progress
const CircularProgress = ({ percentage, size = '80px' }) => {
  return (
    <View style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="50%"
          cy="50%"
          r="36"
          fill="none"
          stroke="#F1F5F9"
          strokeWidth="8"
        />
        <circle
          cx="50%"
          cy="50%"
          r="36"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeDasharray={`${(percentage / 100) * 226} 226`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>
    
      <Text style={{
        position: 'absolute',
        fontSize: '20px',
        fontWeight: '700',
        color: '#1E293B',
      }}>
        {percentage}%
      </Text>
    </View>
  );
};
```

---

## 🎯 Empty States

```jsx
const EmptyState = ({ icon, title, description, actionText, onAction }) => {
  return (
    <View style={{
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <View style={{
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
      }}>
        {React.cloneElement(icon, { size: 36, color: 'white' })}
      </View>
    
      <Text style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1E293B',
      }}>
        {title}
      </Text>
    
      <Text style={{
        fontSize: '15px',
        color: '#64748B',
        lineHeight: 1.6,
        maxWidth: '280px',
      }}>
        {description}
      </Text>
    
      {actionText && (
        <PrimaryButton title={actionText} onPress={onAction} />
      )}
    </View>
  );
};
```

---

## 💡 Usage Tips

1. **Always use the design tokens** - Reference colors, spacing, etc. from the design system
2. **Combine components** - Build complex UIs by composing these base components
3. **Maintain consistency** - Use the same border radius, shadow, and spacing values
4. **Add transitions** - Every interactive element should have smooth transitions
5. **Test on device** - Always test on actual mobile devices for proper spacing and touch targets
