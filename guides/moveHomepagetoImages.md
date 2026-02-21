# Replace Emojis with Images on HomeScreen

## Overview

Replace emoji icons with real images for Learning Paths, Recommended Books, and Audio Bible sections on the HomeScreen.

---

## Step 1: Import Image Component

**Location:**`HomeScreen.jsx` - Update imports (line 1-10)

**Add to imports:**

```javascript
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,  // ✅ Add this
} from 'react-native';
```

---

## Step 2: Update Learning Paths Configuration

**Location:**`HomeScreen.jsx` - Update levels array (around line 24)

**Current:**

```javascript
  const levels = [
    { key: 'beginners', color: '#360f5a', emoji: '🌱' },
    { key: 'intermediary', color: '#360f5a', emoji: '🌿' },
    { key: 'advanced', color: '#360f5a', emoji: '🌳' },
  ];
```

**Update to:**

```javascript
  const levels = [
    { 
      key: 'beginners', 
      color: '#360f5a', 
      // emoji: '🌱',  // ✅ Remove or comment out
      icon: require('../../assets/icons/beginner-icon.png'),  // ✅ Add local image
      // OR use online image:
      // iconUri: 'https://your-cdn.com/beginner-icon.png',
    },
    { 
      key: 'intermediary', 
      color: '#360f5a', 
      // emoji: '🌿',
      icon: require('../../assets/icons/intermediate-icon.png'),
    },
    { 
      key: 'advanced', 
      color: '#360f5a', 
      // emoji: '🌳',
      icon: require('../../assets/icons/advanced-icon.png'),
    },
  ];
```

---

## Step 3: Update Books Configuration

**Location:**`HomeScreen.jsx` - Update book\_levels array (around line 30)

**Current:**

```javascript
  const book_levels = [
    { key: 'beginner', color: '#360f5a', emoji: '📗' },
    { key: 'intermediate', color: '#360f5a', emoji: '📘' },
    { key: 'advanced', color: '#360f5a', emoji: '📙' },
  ];
```

**Update to:**

```javascript
  const book_levels = [
    { 
      key: 'beginner', 
      color: '#360f5a', 
      // emoji: '📗',
      icon: require('../../assets/icons/book-beginner.png'),
    },
    { 
      key: 'intermediate', 
      color: '#360f5a', 
      // emoji: '📘',
      icon: require('../../assets/icons/book-intermediate.png'),
    },
    { 
      key: 'advanced', 
      color: '#360f5a', 
      // emoji: '📙',
      icon: require('../../assets/icons/book-advanced.png'),
    },
  ];
```

---

## Step 4: Update Bible Configuration

**Location:**`HomeScreen.jsx` - Update bible\_levels array (around line 36)

**Current:**

```javascript
  const bible_levels = [
    { 
      key: 'old_testament', 
      name: 'Old Testament', 
      color: '#04642c', 
      emoji: '🐑', 
      description: 'English Standard Version (ESV)'
    },
    { 
      key: 'new_testament', 
      name: 'New Testament', 
      color: '#067e0e', 
      emoji: '˗ˏˋ ✞ ˎˊ˗' , 
      description: 'English Standard Version (ESV)'
    },
  ];
```

**Update to:**

```javascript
  const bible_levels = [
    { 
      key: 'old_testament', 
      name: 'Old Testament', 
      color: '#04642c', 
      // emoji: '🐑',
      icon: require('../../assets/icons/old-testament-icon.png'),
      description: 'English Standard Version (ESV)'
    },
    { 
      key: 'new_testament', 
      name: 'New Testament', 
      color: '#067e0e', 
      // emoji: '˗ˏˋ ✞ ˎˊ˗',
      icon: require('../../assets/icons/new-testament-icon.png'),
      description: 'English Standard Version (ESV)'
    },
  ];
```

---

## Step 5: Replace Emoji Rendering with Image Components

### 5A. Update Learning Paths Section

**Location:**`HomeScreen.jsx` - In the levels.map section (around line 115)

**Current:**

```javascript
{levels.map((item) => {
  const levelData = curriculum[item.key];
  const stats = getCompletionStats(item.key);
  const isCurrentLevel = item.key === currentLevel;

  return (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.levelCard,
        { borderLeftColor: item.color },
        isCurrentLevel && styles.levelCardActive
      ]}
      onPress={() => handleLevelPress(item.key)}
      activeOpacity={0.7}
    >
      <View style={styles.levelHeader}>
        <View style={styles.levelTitleRow}>
          <Text style={styles.levelEmoji}>{item.emoji}</Text>  {/* ❌ Replace this */}
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{levelData.title}</Text>
            <Text style={styles.levelDescription}>
              {levelData.description}
            </Text>
          </View>
        </View>
        {/* ... rest of card */}
      </View>
    </TouchableOpacity>
  );
})}
```

**Update to:**

```javascript
{levels.map((item) => {
  const levelData = curriculum[item.key];
  const stats = getCompletionStats(item.key);
  const isCurrentLevel = item.key === currentLevel;

  return (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.levelCard,
        { borderLeftColor: item.color },
        isCurrentLevel && styles.levelCardActive
      ]}
      onPress={() => handleLevelPress(item.key)}
      activeOpacity={0.7}
    >
      <View style={styles.levelHeader}>
        <View style={styles.levelTitleRow}>
          {/* ✅ Replace emoji with Image */}
          <Image 
            source={item.icon}
            // For online images: source={{ uri: item.iconUri }}
            style={styles.levelIcon}
            resizeMode="contain"
          />
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{levelData.title}</Text>
            <Text style={styles.levelDescription}>
              {levelData.description}
            </Text>
          </View>
        </View>
        {/* ... rest of card */}
      </View>
    </TouchableOpacity>
  );
})}
```

### 5B. Update Recommended Books Section

**Location:**`HomeScreen.jsx` - In the book\_levels.map section (around line 170)

**Current:**

```javascript
{book_levels.map((item) => {
  const levelData = book_curriculum[item.key];

  return (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.levelCard,
        { borderLeftColor: item.color },
      ]}
      onPress={() => handleBookLevelPress(levelData)}
      activeOpacity={0.7}
    >
      <View style={styles.levelHeader}>
        <View style={styles.levelTitleRow}>
          <Text style={styles.levelEmoji}>{item.emoji}</Text>  {/* ❌ Replace this */}
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{levelData.title}</Text>
            <Text style={styles.levelDescription}>
              {levelData.description}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
})}
```

**Update to:**

```javascript
{book_levels.map((item) => {
  const levelData = book_curriculum[item.key];

  return (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.levelCard,
        { borderLeftColor: item.color },
      ]}
      onPress={() => handleBookLevelPress(levelData)}
      activeOpacity={0.7}
    >
      <View style={styles.levelHeader}>
        <View style={styles.levelTitleRow}>
          {/* ✅ Replace emoji with Image */}
          <Image 
            source={item.icon}
            style={styles.levelIcon}
            resizeMode="contain"
          />
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{levelData.title}</Text>
            <Text style={styles.levelDescription}>
              {levelData.description}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
})}
```

### 5C. Update Audio Bible Section

**Location:**`HomeScreen.jsx` - In the bible\_levels.map section (around line 195)

**Current:**

```javascript
{bible_levels.map((item) => {
  return (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.levelCard,
        { borderLeftColor: item.color },
      ]}
      onPress={() => handleBibleTestamentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.levelHeader}>
        <View style={styles.levelTitleRow}>
          <Text style={styles.levelEmoji}>{item.emoji}</Text>  {/* ❌ Replace this */}
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{item.name}</Text>
            <Text style={styles.levelDescription}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
})}
```

**Update to:**

```javascript
{bible_levels.map((item) => {
  return (
    <TouchableOpacity
      key={item.key}
      style={[
        styles.levelCard,
        { borderLeftColor: item.color },
      ]}
      onPress={() => handleBibleTestamentPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.levelHeader}>
        <View style={styles.levelTitleRow}>
          {/* ✅ Replace emoji with Image */}
          <Image 
            source={item.icon}
            style={styles.levelIcon}
            resizeMode="contain"
          />
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{item.name}</Text>
            <Text style={styles.levelDescription}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
})}
```

---

## Step 6: Update Styles

**Location:**`HomeScreen.jsx` - StyleSheet section (around line 220)

**Current:**

```javascript
  levelEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
```

**Replace with:**

```javascript
  // ✅ Replace levelEmoji style with levelIcon
  levelIcon: {
    width: 48,          // Adjust size as needed
    height: 48,
    marginRight: 12,
    borderRadius: 8,    // Optional: rounded corners
    // backgroundColor: '#F8FAFC',  // Optional: background color
  },
```

---

## Step 7: Add Images to Your Project

### Option A: Local Images (Recommended)

Create a folder structure for your icons:

```
project/
├── assets/
│   ├── icons/
│   │   ├── beginner-icon.png
│   │   ├── intermediate-icon.png
│   │   ├── advanced-icon.png
│   │   ├── book-beginner.png
│   │   ├── book-intermediate.png
│   │   ├── book-advanced.png
│   │   ├── old-testament-icon.png
│   │   └── new-testament-icon.png
│   └── icon.png
└── src/
```

### Image Specifications:

* **Format**: PNG with transparency or JPG
* **Size**: 96x96px to 192x192px (2x to 4x for retina)
* **File size**: < 100KB each
* **Style**: Consistent design language across all icons

---

## Step 8: Icon Design Suggestions

### Learning Paths Icons:

* **Beginner**: Seedling, sprout, young plant
* **Intermediate**: Growing tree, sapling, vine
* **Advanced**: Full tree, mountain peak, lighthouse

### Recommended Books Icons:

* **Beginner**: Open book (green tones)
* **Intermediate**: Stack of books (blue tones)
* **Advanced**: Library, wisdom (yellow/gold tones)

### Bible Icons:

* **Old Testament**: Scroll, tablets, menorah, lamb
* **New Testament**: Cross, fish symbol, dove, light

### Where to Find Icons:

**Free Icon Resources:**

1. **Flaticon** (flaticon.com) - Huge collection, free & premium
2. **Icons8** (icons8.com) - Free with attribution
3. **Noun Project** (thenounproject.com) - Simple icons
4. **Unsplash** (unsplash.com) - Free photos/graphics
5. **Freepik** (freepik.com) - Free vectors

**Search terms:**

* "seedling icon"
* "tree growth icon"
* "book icon"
* "bible scroll icon"
* "christian cross icon"

---

## Alternative: Use Icon Libraries (No Image Files Needed)

If you don't want to manage image files, use icon libraries:

### Option 1: Using expo/vector-icons (Already installed)

```javascript
// Instead of Image component
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// In the config:
const levels = [
  { 
    key: 'beginners', 
    color: '#360f5a', 
    IconComponent: FontAwesome5,
    iconName: 'seedling',
  },
  // ...
];

// In the render:
<item.IconComponent 
  name={item.iconName} 
  size={32} 
  color={item.color}
  style={styles.levelIconVector}
/>
```

### Option 2: React Native SVG Icons

Install:

```bash
npm install react-native-svg
```

Use SVG components for crisp, scalable icons.

---

## Complete Example with Images

Here's a complete example showing all three sections:

```javascript
export default function HomeScreen({ navigation }) {
  const { 
    currentLevel, 
    currentWeek, 
    currentAudioId,
    getCompletionStats,
    loading 
  } = useApp();

  const levels = [
    { 
      key: 'beginners', 
      color: '#360f5a', 
      icon: require('../../assets/icons/beginner-icon.png'),
    },
    { 
      key: 'intermediary', 
      color: '#360f5a', 
      icon: require('../../assets/icons/intermediate-icon.png'),
    },
    { 
      key: 'advanced', 
      color: '#360f5a', 
      icon: require('../../assets/icons/advanced-icon.png'),
    },
  ];
  
  const book_levels = [
    { 
      key: 'beginner', 
      color: '#360f5a', 
      icon: require('../../assets/icons/book-beginner.png'),
    },
    { 
      key: 'intermediate', 
      color: '#360f5a', 
      icon: require('../../assets/icons/book-intermediate.png'),
    },
    { 
      key: 'advanced', 
      color: '#360f5a', 
      icon: require('../../assets/icons/book-advanced.png'),
    },
  ];

  const bible_levels = [
    { 
      key: 'old_testament', 
      name: 'Old Testament', 
      color: '#04642c', 
      icon: require('../../assets/icons/old-testament-icon.png'),
      description: 'English Standard Version (ESV)'
    },
    { 
      key: 'new_testament', 
      name: 'New Testament', 
      color: '#067e0e', 
      icon: require('../../assets/icons/new-testament-icon.png'),
      description: 'English Standard Version (ESV)'
    },
  ];

  // ... rest of component code ...

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      
        {/* Learning Paths Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Paths</Text>
        
          {levels.map((item) => {
            const levelData = curriculum[item.key];
            const stats = getCompletionStats(item.key);
            const isCurrentLevel = item.key === currentLevel;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.levelCard,
                  { borderLeftColor: item.color },
                  isCurrentLevel && styles.levelCardActive
                ]}
                onPress={() => handleLevelPress(item.key)}
                activeOpacity={0.7}
              >
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleRow}>
                    {/* ✅ Image instead of emoji */}
                    <Image 
                      source={item.icon}
                      style={styles.levelIcon}
                      resizeMode="contain"
                    />
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitle}>{levelData.title}</Text>
                      <Text style={styles.levelDescription}>
                        {levelData.description}
                      </Text>
                    </View>
                  </View>
                  {/* ... rest of card ... */}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Similar for books and bible sections... */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... other styles ...
  
  levelIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 8,
  },
  
  // ... rest of styles ...
});
```

---

## Bonus: Add Subtle Shadow to Icons

Make the icons pop with a subtle shadow:

```javascript
levelIcon: {
  width: 48,
  height: 48,
  marginRight: 12,
  borderRadius: 8,
  // ✅ Add shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  elevation: 3,
  backgroundColor: '#fff',  // Needed for shadow on Android
},
```

---

## Testing Checklist

* [ ]  All learning path icons display correctly
* [ ]  All book icons display correctly
* [ ]  All bible icons display correctly
* [ ]  Icons are properly sized and aligned
* [ ]  Icons match the app's visual style
* [ ]  No broken image icons (check paths)
* [ ]  Icons look good on both iOS and Android
* [ ]  Performance is smooth (images not too large)

---

## Troubleshooting

**Issue:** Images don't appear

* ✅ Verify file paths are correct
* ✅ Check that images exist in assets/icons folder
* ✅ Try rebuilding: `expo start --clear`

**Issue:** Images are blurry

* ✅ Use @2x or @3x resolution (96px to 192px)
* ✅ Use PNG format for better quality
* ✅ Set `resizeMode="contain"`

**Issue:** Images load slowly

* ✅ Optimize/compress images (< 100KB each)
* ✅ Use appropriate dimensions (not 4000px for a 48px icon)

---

That's it! Your HomeScreen will now have professional image icons instead of emojis. 🎨
