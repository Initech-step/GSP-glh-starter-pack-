# 📚 Complete JavaScript & React Tutorial Using Your GLH Code

Let me walk you through each concept step-by-step using real examples from your codebase!

---

## Week 1: JavaScript Basics

### 1️⃣ Arrow Functions (1 hour)

**What are they?**
A shorter way to write functions in JavaScript.

#### Traditional Function vs Arrow Function

```javascript
// ❌ OLD WAY: Traditional function
function add(a, b) {
  return a + b;
}

// ✅ NEW WAY: Arrow function
const add = (a, b) => {
  return a + b;
};

// ✅ EVEN SHORTER: Implicit return (no curly braces needed)
const add = (a, b) => a + b;
```

#### Examples from YOUR CODE:

**Example 1: From `curriculum.js`**
```javascript
// Short arrow function with implicit return
export const getLevelByKey = (key) => curriculum[key];

// This is the same as:
export const getLevelByKey = function(key) {
  return curriculum[key];
};
```

**Example 2: From `HomeScreen.js`**
```javascript
// Arrow function as event handler
const handleLevelPress = (levelKey) => {
  navigation.navigate('Level', {
    level: levelKey,
    title: curriculum[levelKey].title,
  });
};

// Used in component:
<TouchableOpacity onPress={() => handleLevelPress(item.key)}>
```

**Example 3: From `storage.js`**
```javascript
// Arrow function with multiple lines
export const saveProgress = async (audioId, completed = false, position = 0) => {
  try {
    const progressData = await getProgress();
    progressData[audioId] = {
      completed,
      position,
      lastPlayed: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};
```

#### When to Use Curly Braces vs No Curly Braces

```javascript
// ✅ NO BRACES: Single expression, automatic return
const double = (x) => x * 2;
const getTitle = (level) => curriculum[level].title;

// ✅ WITH BRACES: Multiple statements, explicit return needed
const handlePress = (id) => {
  console.log('Pressed:', id);
  saveData(id);
  return true;
};
```

#### Practice Exercise
```javascript
// Rewrite these traditional functions as arrow functions:

// 1. Traditional
function getWeekCount(level) {
  return curriculum[level].weeks.length;
}

// Answer:
const getWeekCount = (level) => curriculum[level].weeks.length;

// 2. Traditional
function isCompleted(audioId, progress) {
  return progress[audioId]?.completed || false;
}

// Answer:
const isCompleted = (audioId, progress) => progress[audioId]?.completed || false;
```

---

### 2️⃣ Destructuring (1 hour)

**What is it?**
Extracting values from objects or arrays into separate variables.

#### Object Destructuring

```javascript
// ❌ WITHOUT DESTRUCTURING
const user = { name: 'John', age: 30, city: 'Lagos' };
const name = user.name;
const age = user.age;
const city = user.city;

// ✅ WITH DESTRUCTURING (much cleaner!)
const { name, age, city } = user;
console.log(name); // 'John'
console.log(age);  // 30
```

#### Examples from YOUR CODE:

**Example 1: From `WeekScreen.js`**
```javascript
// Destructuring route params
const { level, weekNumber, weekData } = route.params;

// Without destructuring, you'd write:
const level = route.params.level;
const weekNumber = route.params.weekNumber;
const weekData = route.params.weekData;
```

**Example 2: From `HomeScreen.js`**
```javascript
// Destructuring from useApp context
const { 
  currentLevel,
  currentWeek,
  currentAudioId,
  getCompletionStats,
  loading 
} = useApp();

// Without destructuring:
const appContext = useApp();
const currentLevel = appContext.currentLevel;
const currentWeek = appContext.currentWeek;
// ... and so on (very repetitive!)
```

**Example 3: From `PlayerScreen.js`**
```javascript
// Destructuring function parameters
export default function PlayerScreen({ route, navigation }) {
  const { level, weekNumber, audio } = route.params;
  
  // Without destructuring:
  // const route = props.route;
  // const navigation = props.navigation;
  // const level = props.route.params.level;
}
```

#### Array Destructuring

```javascript
// With arrays, position matters
const colors = ['red', 'green', 'blue'];
const [first, second, third] = colors;
console.log(first);  // 'red'
console.log(second); // 'green'

// Skip items you don't need
const [firstColor, , thirdColor] = colors;
console.log(firstColor);  // 'red'
console.log(thirdColor);  // 'blue'
```

**Example from YOUR CODE: `OnboardingScreen.js`**
```javascript
// useState returns an array with 2 items
const [currentIndex, setCurrentIndex] = useState(0);

// Item 0: current value
// Item 1: function to update value

// Without destructuring:
const stateArray = useState(0);
const currentIndex = stateArray[0];
const setCurrentIndex = stateArray[1];
```

#### Advanced: Nested Destructuring

```javascript
// From your curriculum structure
const levelData = {
  title: 'Beginners',
  weeks: [
    { weekNumber: 1, audios: [{ id: 'bg_w1_a1', title: 'Overview' }] }
  ]
};

// Destructure nested data
const { title, weeks: [firstWeek] } = levelData;
console.log(title);      // 'Beginners'
console.log(firstWeek);  // { weekNumber: 1, audios: [...] }
```

#### Practice Exercise
```javascript
// Given this object:
const audioData = {
  id: 'bg_w1_a1',
  title: 'Elementary Principles',
  fileName: 'principles.mp3',
  metadata: {
    duration: 3600,
    date: '2024-01-15'
  }
};

// 1. Destructure to get id, title, and fileName
const { id, title, fileName } = audioData;

// 2. Destructure to get duration from nested metadata
const { metadata: { duration } } = audioData;

// 3. Destructure with renaming
const { title: audioTitle } = audioData; // Rename to avoid conflicts
```

---

### 3️⃣ Template Literals (30 min)

**What are they?**
A way to create strings with embedded expressions using backticks.

#### Basic Syntax

```javascript
// ❌ OLD WAY: String concatenation
const name = 'John';
const age = 30;
const message = 'Hello ' + name + ', you are ' + age + ' years old';

// ✅ NEW WAY: Template literals
const message = `Hello ${name}, you are ${age} years old`;
```

#### Examples from YOUR CODE:

**Example 1: From `PlayerScreen.js`**
```javascript
// Dynamic path construction
const audioPath = require(`../../assets/audio/${level}/week${weekNumber}/${audio.fileName}`);

// This evaluates to:
// require('../../assets/audio/beginners/week1/elementary-principles-overview.mp3')

// Without template literals (impossible!):
// You can't use + inside require()
```

**Example 2: From `HomeScreen.js`**
```javascript
// Creating dynamic text
<Text style={styles.statsText}>
  {levelData.weeks.length} weeks • {stats.total} messages
</Text>

// If you needed this in a variable:
const statsText = `${levelData.weeks.length} weeks • ${stats.total} messages`;
```

**Example 3: From `WeekScreen.js`**
```javascript
// Progress text
<Text style={styles.weekProgressText}>
  {weekProgress.completed}/{weekProgress.total} completed
</Text>

// As template literal:
const progressText = `${weekProgress.completed}/${weekProgress.total} completed`;
```

#### Multi-line Strings

```javascript
// ❌ OLD WAY: Ugly and hard to read
const poem = 'Thy word is a lamp unto my feet,\n' +
             'and a light unto my path.\n' +
             '- Psalm 119:105';

// ✅ NEW WAY: Natural multi-line
const poem = `Thy word is a lamp unto my feet,
and a light unto my path.
- Psalm 119:105`;
```

**Example from YOUR CODE: `SettingsScreen.js`**
```javascript
<Text style={styles.footerVerse}>
  "Thy word is a lamp unto my feet,{'\n'}
  and a light unto my path."{'\n'}
  - Psalm 119:105
</Text>

// Could be written as:
const verse = `"Thy word is a lamp unto my feet,
and a light unto my path."
- Psalm 119:105`;
```

#### Expressions in Template Literals

```javascript
// You can put any expression inside ${}
const price = 100;
const tax = 0.07;

// Math operations
const total = `Total: $${price + (price * tax)}`;

// Function calls
const greeting = `Hello ${getName().toUpperCase()}`;

// Ternary operators
const status = `Status: ${isActive ? 'Active' : 'Inactive'}`;
```

**Example from YOUR CODE: `LevelScreen.js`**
```javascript
// Conditional expression in template literal
<Text style={styles.weekNumberText}>
  {unlocked ? week.weekNumber : '🔒'}
</Text>

// Could be:
const displayText = `${unlocked ? week.weekNumber : '🔒'}`;
```

#### Practice Exercise
```javascript
// Rewrite using template literals:

// 1. 
const level = 'beginners';
const week = 5;
const message = 'You are on ' + level + ' level, week ' + week;

// Answer:
const message = `You are on ${level} level, week ${week}`;

// 2.
const completed = 10;
const total = 30;
const percent = (completed / total) * 100;
const progress = 'Progress: ' + completed + '/' + total + ' (' + percent + '%)';

// Answer:
const progress = `Progress: ${completed}/${total} (${percent}%)`;

// 3. Create a file path
const level = 'beginners';
const week = 1;
const file = 'overview.mp3';
const path = './assets/audio/' + level + '/week' + week + '/' + file;

// Answer:
const path = `./assets/audio/${level}/week${week}/${file}`;
```

---

### 4️⃣ Optional Chaining (?.) ⭐ CRITICAL!

**What is it?**
A safe way to access nested properties that might not exist.

#### The Problem

```javascript
// This will CRASH if user or address is undefined
const street = user.address.street;

// Error: Cannot read property 'street' of undefined
```

#### The Solution: Optional Chaining

```javascript
// ✅ SAFE: Returns undefined instead of crashing
const street = user?.address?.street;

// If user is undefined → returns undefined
// If address is undefined → returns undefined
// If street exists → returns the value
```

#### Examples from YOUR CODE:

**Example 1: From `curriculum.js` ⭐ Most Important!**
```javascript
export const getTotalWeeks = (level) => curriculum[level]?.weeks?.length || 0;

// Step-by-step breakdown:
// 1. curriculum[level]        → Get level object
// 2. ?.weeks                  → If level exists, get weeks (safe)
// 3. ?.length                 → If weeks exists, get length (safe)
// 4. || 0                     → If anything is undefined, return 0

// Without optional chaining:
export const getTotalWeeks = (level) => {
  if (curriculum[level] && curriculum[level].weeks) {
    return curriculum[level].weeks.length;
  }
  return 0;
};
```

**Example 2: From `WeekScreen.js`**
```javascript
const isAudioCompleted = (audioId) => {
  return progress[audioId]?.completed || false;
};

// Safe access chain:
// 1. progress[audioId]        → Get audio progress object
// 2. ?.completed              → If object exists, get completed property
// 3. || false                 → If undefined, return false

// Without optional chaining (RISKY!):
const isAudioCompleted = (audioId) => {
  if (progress[audioId] && progress[audioId].completed) {
    return progress[audioId].completed;
  }
  return false;
};
```

**Example 3: From `HomeScreen.js`**
```javascript
const weekData = levelData.weeks.find(w => w.weekNumber === currentWeek);
const audioData = weekData?.audios.find(a => a.id === currentAudioId);

// Why optional chaining here?
// weekData might be undefined if week not found
// Without ?: would crash trying to access .audios on undefined
```

#### Optional Chaining with Function Calls

```javascript
// Call function only if it exists
obj.method?.();

// Example: Event handler that might not exist
onComplete?.();
```

**Example from YOUR CODE: `PlayerScreen.js`**
```javascript
return () => {
  if (sound) {
    sound.unloadAsync();
  }
};

// Could be written as:
return () => sound?.unloadAsync();
```

#### Optional Chaining with Arrays

```javascript
const firstWeek = levelData.weeks?.[0];
const firstAudio = firstWeek?.audios?.[0];
```

#### Combining with Nullish Coalescing (||)

```javascript
// Pattern used throughout your code:
const value = object?.property || defaultValue;

// Examples:
const weeks = curriculum[level]?.weeks || [];
const position = progress[audioId]?.position || 0;
const completed = progress[audioId]?.completed || false;
```

#### Practice Exercise
```javascript
// Fix these to make them safe:

// 1. UNSAFE
const duration = audioData.metadata.duration;

// Answer:
const duration = audioData?.metadata?.duration || 0;

// 2. UNSAFE
const lastAudio = levelData.weeks[levelData.weeks.length - 1].audios[0];

// Answer:
const lastWeek = levelData.weeks?.[levelData.weeks.length - 1];
const lastAudio = lastWeek?.audios?.[0];

// 3. UNSAFE
function getAudioTitle(audioId) {
  return progress[audioId].metadata.title;
}

// Answer:
const getAudioTitle = (audioId) => progress[audioId]?.metadata?.title || 'Unknown';
```

---

### 5️⃣ Spread Operator (...) (1 hour)

**What is it?**
Spreads (unpacks) elements from arrays or properties from objects.

#### Array Spread

```javascript
// Copy an array
const original = [1, 2, 3];
const copy = [...original];

// Combine arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4]

// Add items to array
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5]; // [1, 2, 3, 4, 5]
```

#### Examples from YOUR CODE:

**Example 1: From `AppContext.js`**
```javascript
// Adding new message to conversation history
messages: [...history, newMsg];

// What this does:
const history = [
  { role: 'user', content: 'Hello' },
  { role: 'assistant', content: 'Hi!' }
];
const newMsg = { role: 'user', content: 'How are you?' };

const updated = [...history, newMsg];
// Result: [
//   { role: 'user', content: 'Hello' },
//   { role: 'assistant', content: 'Hi!' },
//   { role: 'user', content: 'How are you?' }
// ]

// Without spread operator:
const updated = history.concat([newMsg]);
// or
const updated = history.slice();
updated.push(newMsg);
```

**Example 2: From `HomeScreen.js` (Implicit)**
```javascript
// When mapping over weeks array
{levelData.weeks.map((week) => {
  // Process each week
})}

// If you wanted to add a new week:
const updatedWeeks = [...levelData.weeks, newWeek];
```

#### Object Spread

```javascript
// Copy an object
const user = { name: 'John', age: 30 };
const userCopy = { ...user };

// Update object properties (immutable)
const updatedUser = { ...user, age: 31 };
// Result: { name: 'John', age: 31 }
// Original user is unchanged!

// Merge objects
const personal = { name: 'John', age: 30 };
const work = { job: 'Developer', company: 'ABC' };
const complete = { ...personal, ...work };
// Result: { name: 'John', age: 30, job: 'Developer', company: 'ABC' }
```

#### Examples from YOUR CODE:

**Example 1: From `storage.js`**
```javascript
export const saveProgress = async (audioId, completed = false, position = 0) => {
  const progressData = await getProgress();
  
  // Update specific audio progress
  progressData[audioId] = {
    completed,
    position,
    lastPlayed: new Date().toISOString(),
  };
  
  // progressData is mutated here
  // With spread operator (immutable approach):
  const updatedProgress = {
    ...progressData,
    [audioId]: {
      completed,
      position,
      lastPlayed: new Date().toISOString(),
    }
  };
};
```

**Example 2: From `AppContext.js`**
```javascript
// Imagine updating audio metadata
const audio = {
  id: 'bg_w1_a1',
  title: 'Overview',
  fileName: 'overview.mp3'
};

// Add duration without mutating original
const audioWithDuration = {
  ...audio,
  duration: 3600
};
// Result: { id: 'bg_w1_a1', title: 'Overview', fileName: 'overview.mp3', duration: 3600 }
```

#### Spread with Function Arguments

```javascript
// Pass array elements as separate arguments
const numbers = [1, 2, 3];
Math.max(...numbers); // Same as Math.max(1, 2, 3)

// Without spread:
Math.max.apply(null, numbers);
```

#### Rest Parameters (Opposite of Spread)

```javascript
// Collect remaining arguments into array
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4); // returns 10
// numbers = [1, 2, 3, 4]
```

**Similar pattern in YOUR CODE:**
```javascript
// Destructuring with rest
const { level, weekNumber, ...otherParams } = route.params;
// otherParams contains everything except level and weekNumber
```

#### Practice Exercise
```javascript
// 1. Add a new week to the level
const currentWeeks = [
  { weekNumber: 1, title: 'Week 1' },
  { weekNumber: 2, title: 'Week 2' }
];
const newWeek = { weekNumber: 3, title: 'Week 3' };

// Answer:
const updatedWeeks = [...currentWeeks, newWeek];

// 2. Update audio completion status immutably
const progress = {
  'bg_w1_a1': { completed: false, position: 0 },
  'bg_w1_a2': { completed: false, position: 0 }
};

const audioId = 'bg_w1_a1';

// Answer:
const updatedProgress = {
  ...progress,
  [audioId]: {
    ...progress[audioId],
    completed: true
  }
};

// 3. Combine two audio arrays
const week1Audios = [{ id: 'bg_w1_a1' }, { id: 'bg_w1_a2' }];
const week2Audios = [{ id: 'bg_w2_a1' }, { id: 'bg_w2_a2' }];

// Answer:
const allAudios = [...week1Audios, ...week2Audios];
```

---

## Week 2: Array Methods & Async

### 1️⃣ Array Methods: map, filter, find (2 hours)

These are the most used array methods in React!

#### .map() - Transform Each Item

**What it does:** Creates a new array by transforming each item.

```javascript
// Basic example
const numbers = [1, 2, 3];
const doubled = numbers.map(num => num * 2);
// Result: [2, 4, 6]
```

**Examples from YOUR CODE:**

**Example 1: From `HomeScreen.js` ⭐ Most Common Pattern**
```javascript
{levels.map((item) => {
  const levelData = curriculum[item.key];
  const stats = getCompletionStats(item.key);
  
  return (
    <TouchableOpacity key={item.key}>
      <Text>{levelData.title}</Text>
      <Text>{stats.completed}/{stats.total}</Text>
    </TouchableOpacity>
  );
})}

// What's happening:
// Input: [
//   { key: 'beginners', color: '#10B981' },
//   { key: 'intermediary', color: '#F59E0B' },
//   { key: 'advanced', color: '#EF4444' }
// ]
//
// Output: 3 TouchableOpacity components (one for each level)
```

**Example 2: From `LevelScreen.js`**
```javascript
{levelData.weeks.map((week, index) => {
  const weekProgress = getWeekProgress(week);
  const unlocked = isWeekUnlocked(level, week.weekNumber);
  
  return (
    <TouchableOpacity key={week.weekNumber}>
      <Text>Week {week.weekNumber}</Text>
      <Text>{week.title}</Text>
    </TouchableOpacity>
  );
})}

// Transforms weeks array into week cards
```

**Example 3: From `WeekScreen.js`**
```javascript
{weekData.audios.map((audio, index) => {
  const completed = isAudioCompleted(audio.id);
  
  return (
    <TouchableOpacity key={audio.id}>
      <Text>{completed ? '✓' : index + 1}</Text>
      <Text>{audio.title}</Text>
    </TouchableOpacity>
  );
})}

// Transforms audio objects into audio cards
```

**Important:** Always provide a `key` prop when mapping in React!

```javascript
// ✅ CORRECT
items.map(item => <View key={item.id}>{item.name}</View>)

// ❌ WRONG (React will warn you)
items.map(item => <View>{item.name}</View>)
```

#### .filter() - Keep Items That Match

**What it does:** Creates a new array with only items that pass a test.

```javascript
// Basic example
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(num => num % 2 === 0);
// Result: [2, 4]
```

**Examples from YOUR CODE:**

**Example 1: From `LevelScreen.js`**
```javascript
const getWeekProgress = (week) => {
  const completed = week.audios.filter(
    audio => progress[audio.id]?.completed
  ).length;
  
  return {
    completed,
    total: week.audios.length,
    percentage: (completed / week.audios.length) * 100
  };
};

// Step-by-step:
// 1. week.audios = [
//      { id: 'bg_w1_a1', ... },
//      { id: 'bg_w1_a2', ... }
//    ]
//
// 2. Filter keeps only completed audios
// 3. .length counts how many passed the test
//
// If progress = {
//   'bg_w1_a1': { completed: true },
//   'bg_w1_a2': { completed: false }
// }
//
// Result: completed = 1
```

**Example 2: From `NotesScreen.js` (Conceptual)**
```javascript
// Get all completed audios
const completedAudios = allAudios.filter(audio => 
  progress[audio.id]?.completed
);

// Get all audios with notes
const audiosWithNotes = allAudios.filter(audio => 
  notes[audio.id] && notes[audio.id].text
);

// Get audios for a specific week
const week1Audios = allAudios.filter(audio => 
  audio.id.startsWith('bg_w1_')
);
```

#### .find() - Get First Match

**What it does:** Returns the FIRST item that matches (not an array, just the item).

```javascript
// Basic example
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' }
];

const user = users.find(u => u.id === 2);
// Result: { id: 2, name: 'Jane' }

// If not found:
const missing = users.find(u => u.id === 99);
// Result: undefined
```

**Examples from YOUR CODE:**

**Example 1: From `AppContext.js` ⭐ Very Common**
```javascript
const levelData = curriculum[currentLevel];
const weekData = levelData.weeks.find(w => w.weekNumber === currentWeek);

// What's happening:
// levelData.weeks = [
//   { weekNumber: 1, title: 'Week 1', audios: [...] },
//   { weekNumber: 2, title: 'Week 2', audios: [...] },
//   { weekNumber: 3, title: 'Week 3', audios: [...] }
// ]
//
// If currentWeek = 2
// Result: { weekNumber: 2, title: 'Week 2', audios: [...] }
```

**Example 2: From `HomeScreen.js`**
```javascript
const weekData = levelData.weeks.find(w => w.weekNumber === currentWeek);
const audioData = weekData?.audios.find(a => a.id === currentAudioId);

// Chain of finds:
// 1. Find the week object
// 2. In that week, find the audio object
```

**Example 3: From `LevelScreen.js`**
```javascript
const handleWeekPress = (weekNumber) => {
  const weekData = levelData.weeks.find(w => w.weekNumber === weekNumber);
  
  navigation.navigate('Week', {
    level,
    weekNumber,
    weekData,
  });
};
```

#### Chaining Array Methods

You can combine these methods!

```javascript
// Get titles of all completed audios in week 1
const completedTitles = allAudios
  .filter(audio => audio.id.startsWith('bg_w1_'))  // Get week 1 audios
  .filter(audio => progress[audio.id]?.completed)   // Get completed ones
  .map(audio => audio.title);                       // Extract titles

// Result: ['Elementary Principles: Overview', ...]
```

**Example from YOUR CODE: `AppContext.js`**
```javascript
const getCompletionStats = (level) => {
  const levelData = curriculum[level];
  let totalAudios = 0;
  let completedAudios = 0;

  levelData.weeks.forEach(week => {
    week.audios.forEach(audio => {
      totalAudios++;
      if (progress[audio.id]?.completed) {
        completedAudios++;
      }
    });
  });

  return { total: totalAudios, completed: completedAudios };
};

// Could be rewritten with chaining:
const getCompletionStats = (level) => {
  const allAudios = curriculum[level].weeks
    .flatMap(week => week.audios);  // Flatten all audios into single array
  
  const completed = allAudios
    .filter(audio => progress[audio.id]?.completed)
    .length;
  
  return {
    total: allAudios.length,
    completed,
    percentage: (completed / allAudios.length) * 100
  };
};
```

#### Practice Exercise
```javascript
const audios = [
  { id: 'bg_w1_a1', title: 'Overview', weekNumber: 1, completed: true },
  { id: 'bg_w1_a2', title: 'Repentance', weekNumber: 1, completed: false },
  { id: 'bg_w2_a1', title: 'Faith', weekNumber: 2, completed: true },
  { id: 'bg_w2_a2', title: 'Baptism', weekNumber: 2, completed: true },
];

// 1. Get all titles
const titles = audios.map(audio => audio.title);

// 2. Get only completed audios
const completed = audios.filter(audio => audio.completed);

// 3. Get the audio with id 'bg_w2_a1'
const audio = audios.find(audio => audio.id === 'bg_w2_a1');

// 4. Get titles of completed audios only
const completedTitles = audios
  .filter(audio => audio.completed)
  .map(audio => audio.title);

// 5. Count completed audios in week 1
const week1Completed = audios
  .filter(audio => audio.weekNumber === 1 && audio.completed)
  .length;
```

---

### 2️⃣ reduce() ⭐ CRITICAL (2 hours)

**What it does:** "Reduces" an array to a single value by accumulating results.

This is the MOST POWERFUL but HARDEST to understand array method!

#### Basic Concept

```javascript
// Syntax
array.reduce((accumulator, currentItem) => {
  // return new accumulator value
}, initialValue);
```

Think of it like a snowball rolling downhill:
- Starts small (initialValue)
- Picks up more with each item (accumulator grows)
- Ends with final accumulated result

#### Simple Example: Sum Numbers

```javascript
const numbers = [1, 2, 3, 4];

const sum = numbers.reduce((total, num) => {
  return total + num;
}, 0);  // Start with 0

// Step-by-step execution:
// total = 0, num = 1  →  return 0 + 1 = 1
// total = 1, num = 2  →  return 1 + 2 = 3
// total = 3, num = 3  →  return 3 + 3 = 6
// total = 6, num = 4  →  return 6 + 4 = 10
//
// Final result: 10
```

#### Example from YOUR CODE: `curriculum.js` ⭐

```javascript
export const getTotalAudios = (level) => {
  const weeks = curriculum[level]?.weeks || [];
  return weeks.reduce((total, week) => total + week.audios.length, 0);
};

// Let's trace through this with real data:
const weeks = [
  { weekNumber: 1, audios: [a1, a2] },          // 2 audios
  { weekNumber: 2, audios: [a1, a2] },          // 2 audios
  { weekNumber: 3, audios: [a1, a2, a3] }       // 3 audios
];

// Execution:
// total = 0, week = week1  →  return 0 + 2 = 2
// total = 2, week = week2  →  return 2 + 2 = 4
// total = 4, week = week3  →  return 4 + 3 = 7
//
// Final result: 7 total audios
```

Let me visualize this differently:

```javascript
// What reduce does:
total = 0
  ↓ (process week 1)
total = 0 + week1.audios.length (2) = 2
  ↓ (process week 2)
total = 2 + week2.audios.length (2) = 4
  ↓ (process week 3)
total = 4 + week3.audios.length (3) = 7
  ↓
return 7
```

#### More Complex Example: Build an Object

```javascript
// Convert array of audios to object keyed by ID
const audios = [
  { id: 'bg_w1_a1', title: 'Overview' },
  { id: 'bg_w1_a2', title: 'Repentance' }
];

const audioMap = audios.reduce((map, audio) => {
  map[audio.id] = audio;
  return map;
}, {});  // Start with empty object

// Result: {
//   'bg_w1_a1': { id: 'bg_w1_a1', title: 'Overview' },
//   'bg_w1_a2': { id: 'bg_w1_a2', title: 'Repentance' }
// }
```

#### Example: Count Completed vs Incomplete

```javascript
const audios = [
  { id: 'bg_w1_a1', completed: true },
  { id: 'bg_w1_a2', completed: false },
  { id: 'bg_w2_a1', completed: true }
];

const stats = audios.reduce((acc, audio) => {
  if (audio.completed) {
    acc.completed++;
  } else {
    acc.incomplete++;
  }
  return acc;
}, { completed: 0, incomplete: 0 });

// Result: { completed: 2, incomplete: 1 }
```

#### How Your Code Could Use reduce()

**From `AppContext.js` - Rewritten with reduce:**

```javascript
// Current implementation (using forEach):
const getCompletionStats = (level) => {
  const levelData = curriculum[level];
  let totalAudios = 0;
  let completedAudios = 0;

  levelData.weeks.forEach(week => {
    week.audios.forEach(audio => {
      totalAudios++;
      if (progress[audio.id]?.completed) {
        completedAudios++;
      }
    });
  });

  return { total: totalAudios, completed: completedAudios };
};

// With reduce (more functional):
const getCompletionStats = (level) => {
  const levelData = curriculum[level];
  
  return levelData.weeks.reduce((stats, week) => {
    week.audios.forEach(audio => {
      stats.total++;
      if (progress[audio.id]?.completed) {
        stats.completed++;
      }
    });
    return stats;
  }, { total: 0, completed: 0 });
};
```

#### Practice Exercise
```javascript
const weeks = [
  { weekNumber: 1, audios: [{ id: 'a1' }, { id: 'a2' }] },
  { weekNumber: 2, audios: [{ id: 'a3' }] },
  { weekNumber: 3, audios: [{ id: 'a4' }, { id: 'a5' }, { id: 'a6' }] }
];

const progress = {
  'a1': { completed: true },
  'a2': { completed: false },
  'a3': { completed: true },
  'a4': { completed: true },
  'a5': { completed: false },
  'a6': { completed: true }
};

// 1. Count total audios across all weeks
const total = weeks.reduce((sum, week) => sum + week.audios.length, 0);
// Answer: 6

// 2. Get all audio IDs in a single array
const allIds = weeks.reduce((ids, week) => {
  week.audios.forEach(audio => ids.push(audio.id));
  return ids;
}, []);
// Answer: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']

// 3. Count completed audios across all weeks
const completed = weeks.reduce((count, week) => {
  return count + week.audios.filter(audio => 
    progress[audio.id]?.completed
  ).length;
}, 0);
// Answer: 4
```

---

### 3️⃣ Promises (2 hours)

**What is a Promise?**
A Promise represents a value that will be available in the future (like ordering food - you get a receipt now, food comes later).

#### Three States

```javascript
// 1. Pending - waiting for result
// 2. Fulfilled - success! Got the result
// 3. Rejected - failed! Got an error
```

#### Basic Promise Syntax

```javascript
const promise = new Promise((resolve, reject) => {
  // Do async work
  if (success) {
    resolve(result);  // Promise fulfilled
  } else {
    reject(error);    // Promise rejected
  }
});

// Using the promise
promise
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.log('Error:', error);
  });
```

#### Real Example: Loading Data

```javascript
function loadUserData(userId) {
  return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
      if (userId) {
        resolve({ id: userId, name: 'John' });
      } else {
        reject(new Error('No user ID provided'));
      }
    }, 1000);
  });
}

// Using it:
loadUserData(1)
  .then(user => {
    console.log('User loaded:', user);
  })
  .catch(error => {
    console.log('Failed:', error);
  });
```

#### Examples from YOUR CODE:

**Example 1: AsyncStorage (returns Promises)**

```javascript
// From storage.js
export const getProgress = async () => {
  try {
    const data = await AsyncStorage.getItem('@glh_progress');
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting progress:', error);
    return {};
  }
};

// AsyncStorage.getItem() returns a Promise
// Behind the scenes it's like:
AsyncStorage.getItem('@glh_progress')
  .then(data => {
    return data ? JSON.parse(data) : {};
  })
  .catch(error => {
    console.error('Error:', error);
    return {};
  });
```

**Example 2: Audio Loading (from expo-av)**

```javascript
// From PlayerScreen.js
Audio.Sound.createAsync(audioPath, options)
  .then(({ sound }) => {
    setSound(sound);
  })
  .catch(error => {
    console.error('Failed to load audio:', error);
  });
```

#### Chaining Promises

```javascript
// Each .then() returns a new Promise
loadUser(1)
  .then(user => {
    console.log('Got user:', user);
    return loadUserPosts(user.id);  // Returns another Promise
  })
  .then(posts => {
    console.log('Got posts:', posts);
    return loadPostComments(posts[0].id);
  })
  .then(comments => {
    console.log('Got comments:', comments);
  })
  .catch(error => {
    console.log('Something failed:', error);
  });
```

#### Promise.all() - Wait for Multiple

```javascript
// Wait for multiple promises to complete
const promise1 = loadAudio('file1.mp3');
const promise2 = loadAudio('file2.mp3');
const promise3 = loadAudio('file3.mp3');

Promise.all([promise1, promise2, promise3])
  .then(([audio1, audio2, audio3]) => {
    console.log('All audios loaded!');
  })
  .catch(error => {
    console.log('At least one failed:', error);
  });
```

**How this could be used in YOUR CODE:**

```javascript
// Load multiple audios at once
const loadWeekAudios = async (weekData) => {
  const audioPromises = weekData.audios.map(audio => {
    return Audio.Sound.createAsync(
      require(`../../assets/audio/${audio.fileName}`)
    );
  });
  
  try {
    const sounds = await Promise.all(audioPromises);
    console.log('All week audios preloaded!');
    return sounds;
  } catch (error) {
    console.error('Failed to load some audios:', error);
  }
};
```

---

### 4️⃣ Async/Await ⭐ CRITICAL (2 hours)

**What is it?**
A cleaner way to work with Promises. Makes async code look like sync code!

#### Promise vs Async/Await

```javascript
// ❌ OLD WAY: Promise chains
function loadData() {
  return fetchUser()
    .then(user => {
      return fetchPosts(user.id);
    })
    .then(posts => {
      return fetchComments(posts[0].id);
    })
    .catch(error => {
      console.error(error);
    });
}

// ✅ NEW WAY: Async/Await
async function loadData() {
  try {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return comments;
  } catch (error) {
    console.error(error);
  }
}
```

#### The Rules

1. Use `async` keyword before function
2. Use `await` keyword before Promises
3. Wrap in `try/catch` for error handling

```javascript
// Template:
async function myFunction() {
  try {
    const result = await somePromise();
    // Do something with result
  } catch (error) {
    // Handle error
  }
}
```

#### Examples from YOUR CODE:

**Example 1: From `storage.js` ⭐ Perfect Example**

```javascript
export const saveProgress = async (audioId, completed = false, position = 0) => {
  try {
    // WAIT for getProgress to finish
    const progressData = await getProgress();
    
    // Update the data
    progressData[audioId] = {
      completed,
      position,
      lastPlayed: new Date().toISOString(),
    };
    
    // WAIT for save to finish
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

// Step-by-step execution:
// 1. Call getProgress() - returns Promise
// 2. WAIT for it to complete
// 3. Get the result (progressData)
// 4. Update progressData
// 5. Call AsyncStorage.setItem() - returns Promise
// 6. WAIT for it to complete
// 7. Function completes
```

**Example 2: From `AppContext.js`**

```javascript
const loadSavedState = async () => {
  try {
    const position = await getCurrentPosition();
    const progressData = await getProgress();
    
    setCurrentLevel(position.level);
    setCurrentWeek(position.weekNumber);
    setCurrentAudioId(position.audioId);
    setProgress(progressData);
  } catch (error) {
    console.error('Error loading saved state:', error);
  } finally {
    setLoading(false);
  }
};

// Each 'await' waits for that operation to complete before moving to next line
```

**Example 3: From `PlayerScreen.js`**

```javascript
const loadAudio = async () => {
  try {
    setIsLoading(true);
    
    // 1. Configure audio (wait)
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    // 2. Get saved position (wait)
    const savedPosition = await getPlaybackPosition(audio.id);

    // 3. Load audio file (wait)
    const { sound: newSound } = await Audio.Sound.createAsync(
      audioPath,
      { positionMillis: savedPosition }
    );

    // 4. All done, update state
    setSound(newSound);
    setIsLoading(false);
  } catch (error) {
    Alert.alert('Error', 'Failed to load audio file');
    setIsLoading(false);
  }
};
```

#### Sequential vs Parallel

```javascript
// ❌ SEQUENTIAL (slow - waits for each)
const data1 = await fetchData1();  // Wait 1 second
const data2 = await fetchData2();  // Wait 1 second
const data3 = await fetchData3();  // Wait 1 second
// Total: 3 seconds

// ✅ PARALLEL (fast - all at once)
const [data1, data2, data3] = await Promise.all([
  fetchData1(),
  fetchData2(),
  fetchData3()
]);
// Total: 1 second (all run simultaneously)
```

**Example from YOUR CODE:**

```javascript
// From AppContext.js - Sequential (they depend on each other)
const position = await getCurrentPosition();
const progressData = await getProgress();

// Could be parallel (they're independent):
const [position, progressData] = await Promise.all([
  getCurrentPosition(),
  getProgress()
]);
```

#### Error Handling Patterns

```javascript
// Pattern 1: Try/Catch (most common)
async function loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('Failed:', error);
    return null;
  }
}

// Pattern 2: Catch on await
async function loadData() {
  const data = await fetchData().catch(error => {
    console.error('Failed:', error);
    return null;
  });
  return data;
}

// Pattern 3: Finally block
async function loadData() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    setLoading(false);  // Always runs
  }
}
```

**From YOUR CODE: `PlayerScreen.js`**

```javascript
useEffect(() => {
  loadAudio();
  
  return () => {
    if (sound) {
      sound.unloadAsync();  // Cleanup
    }
  };
}, [audio.id]);
```

#### Practice Exercise

```javascript
// Convert these Promise chains to async/await:

// 1. Promise chain
function getAudioInfo(audioId) {
  return getProgress()
    .then(progress => {
      return getPlaybackPosition(audioId);
    })
    .then(position => {
      return { completed: progress[audioId]?.completed, position };
    })
    .catch(error => {
      console.error(error);
      return null;
    });
}

// Answer:
async function getAudioInfo(audioId) {
  try {
    const progress = await getProgress();
    const position = await getPlaybackPosition(audioId);
    return {
      completed: progress[audioId]?.completed,
      position
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 2. Multiple sequential operations
function saveAndLoad(audioId) {
  return saveProgress(audioId, true)
    .then(() => {
      return getProgress();
    })
    .then(progress => {
      console.log('Progress:', progress);
    });
}

// Answer:
async function saveAndLoad(audioId) {
  await saveProgress(audioId, true);
  const progress = await getProgress();
  console.log('Progress:', progress);
}
```

---

## Week 3: React Fundamentals

### 1️⃣ Components & JSX (2 hours)

**What is a Component?**
A reusable piece of UI. Think of it like a Lego block - you can use it multiple times and combine them to build complex UIs.

#### Function Components

```javascript
// Simple component
function Welcome() {
  return <Text>Hello World</Text>;
}

// With arrow function (modern style)
const Welcome = () => {
  return <Text>Hello World</Text>;
};

// Even shorter (implicit return)
const Welcome = () => <Text>Hello World</Text>;
```

#### JSX - JavaScript + XML

```javascript
// JSX looks like HTML but it's JavaScript!
const element = <Text>Hello</Text>;

// Babel converts it to:
const element = React.createElement('Text', null, 'Hello');
```

#### Examples from YOUR CODE:

**Example 1: From `HomeScreen.js` - Complete Component**

```javascript
export default function HomeScreen({ navigation }) {
  const { currentLevel, getCompletionStats } = useApp();
  
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.greeting}>Welcome back! 🙏</Text>
        <Text style={styles.subtitle}>Continue your spiritual journey</Text>
      </ScrollView>
    </View>
  );
}

// This component:
// 1. Receives props ({ navigation })
// 2. Uses hooks (useApp)
// 3. Returns JSX (UI structure)
```

**Example 2: From `OnboardingScreen.js` - Component with Logic**

```javascript
export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList data={slides} renderItem={renderItem} />
      <TouchableOpacity onPress={handleNext}>
        <Text>Next</Text>
      </TouchableOpacity>
    </View>
  );
}
```

#### JSX Rules

**1. Must return single parent element**

```javascript
// ❌ WRONG - multiple roots
return (
  <Text>Hello</Text>
  <Text>World</Text>
);

// ✅ CORRECT - wrapped in parent
return (
  <View>
    <Text>Hello</Text>
    <Text>World</Text>
  </View>
);

// ✅ ALSO CORRECT - React Fragment (invisible wrapper)
return (
  <>
    <Text>Hello</Text>
    <Text>World</Text>
  </>
);
```

**2. Use curly braces {} for JavaScript expressions**

```javascript
const name = 'John';
const age = 30;

return (
  <View>
    <Text>{name}</Text>                    {/* Variable */}
    <Text>{age + 5}</Text>                 {/* Expression */}
    <Text>{age > 18 ? 'Adult' : 'Minor'}</Text>  {/* Conditional */}
    <Text>{getName()}</Text>               {/* Function call */}
  </View>
);
```

**From YOUR CODE: `HomeScreen.js`**

```javascript
<Text style={styles.levelTitle}>{levelData.title}</Text>
<Text>{levelData.weeks.length} weeks • {stats.total} messages</Text>
<Text>{stats.completed}/{stats.total} completed</Text>
```

**3. camelCase for attributes**

```javascript
// HTML:          JSX:
// <div class="">  <View className="">
// <label for="">  <Text htmlFor="">
// onclick=""      onPress={}
```

**4. Self-closing tags need /**

```javascript
// ❌ WRONG
<Image>

// ✅ CORRECT
<Image />
```

#### Conditional Rendering

**Pattern 1: && operator**

```javascript
{isLoading && <ActivityIndicator />}

// Only renders if isLoading is true
```

**From YOUR CODE: `PlayerScreen.js`**

```javascript
{isLoading && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#2563EB" />
    <Text>Loading audio...</Text>
  </View>
)}
```

**Pattern 2: Ternary operator**

```javascript
{isPlaying ? <Text>⏸</Text> : <Text>▶️</Text>}
```

**From YOUR CODE: `PlayerScreen.js`**

```javascript
<Text style={styles.playIcon}>
  {isPlaying ? '⏸' : '▶️'}
</Text>
```

**Pattern 3: Early return**

```javascript
function PlayerScreen() {
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return <PlayerUI />;
}
```

**From YOUR CODE: `HomeScreen.js`**

```javascript
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

return (
  <View style={styles.container}>
    {/* Main content */}
  </View>
);
```

#### Lists & Keys

**Rendering lists with .map()**

```javascript
const items = ['Apple', 'Banana', 'Orange'];

return (
  <View>
    {items.map((item, index) => (
      <Text key={index}>{item}</Text>
    ))}
  </View>
);
```

**From YOUR CODE: `LevelScreen.js`**

```javascript
{levelData.weeks.map((week, index) => {
  const weekProgress = getWeekProgress(week);
  const unlocked = isWeekUnlocked(level, week.weekNumber);

  return (
    <TouchableOpacity
      key={week.weekNumber}  // ⚠️ Important! Unique key
      style={styles.weekCard}
      onPress={() => handleWeekPress(week.weekNumber)}
    >
      <Text>Week {week.weekNumber}</Text>
      <Text>{week.title}</Text>
    </TouchableOpacity>
  );
})}
```

**Why keys matter:**

```javascript
// ❌ BAD - using index as key
items.map((item, index) => <View key={index}>{item}</View>)

// ✅ GOOD - using unique ID
items.map(item => <View key={item.id}>{item.name}</View>)

// Keys help React identify which items changed, added, or removed
```

#### Practice Exercise

Create a simple component:

```javascript
// 1. Create a LevelCard component
const LevelCard = () => {
  const title = 'Beginners';
  const weeks = 30;
  const completed = 15;
  const percentage = (completed / weeks) * 100;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text>{weeks} weeks</Text>
      <Text>{completed}/{weeks} completed</Text>
      {percentage === 100 && <Text>✅ Complete!</Text>}
    </View>
  );
};

// 2. Render a list of levels
const levels = [
  { id: 1, name: 'Beginners', weeks: 30 },
  { id: 2, name: 'Intermediary', weeks: 33 },
  { id: 3, name: 'Advanced', weeks: 12 }
];

const LevelList = () => {
  return (
    <View>
      {levels.map(level => (
        <View key={level.id}>
          <Text>{level.name}</Text>
          <Text>{level.weeks} weeks</Text>
        </View>
      ))}
    </View>
  );
};
```

---

### 2️⃣ Props (2 hours)

**What are Props?**
Props (properties) are how you pass data from parent component to child component. Think of them like function arguments.

#### Basic Props

```javascript
// Parent component
function App() {
  return <Greeting name="John" age={30} />;
}

// Child component
function Greeting(props) {
  return (
    <View>
      <Text>Hello {props.name}</Text>
      <Text>You are {props.age} years old</Text>
    </View>
  );
}

// With destructuring (cleaner!)
function Greeting({ name, age }) {
  return (
    <View>
      <Text>Hello {name}</Text>
      <Text>You are {age} years old</Text>
    </View>
  );
}
```

#### Examples from YOUR CODE:

**Example 1: From `App.js` passing props to screens**

```javascript
<Stack.Navigator>
  <Stack.Screen
    name="Home"
    component={HomeScreen}
    options={{ title: "God's Lighthouse" }}
  />
  <Stack.Screen
    name="Level"
    component={LevelScreen}
    options={({ route }) => ({ title: route.params?.title || 'Level' })}
  />
</Stack.Navigator>

// React Navigation automatically passes:
// - navigation prop (for navigating)
// - route prop (for params)
```

**Example 2: From `HomeScreen.js` navigating with params**

```javascript
const handleLevelPress = (levelKey) => {
  navigation.navigate('Level', {
    level: levelKey,              // ← This becomes a prop
    title: curriculum[levelKey].title,  // ← This too
  });
};

// LevelScreen receives these as route.params:
export default function LevelScreen({ route, navigation }) {
  const { level, title } = route.params;  // Destructure props
}
```

**Example 3: From `WeekScreen.js` to `PlayerScreen.js`**

```javascript
// WeekScreen sends props:
navigation.navigate('Player', {
  level,           // 'beginners'
  weekNumber,      // 1
  audio,          // { id: 'bg_w1_a1', title: '...', fileName: '...' }
});

// PlayerScreen receives props:
export default function PlayerScreen({ route, navigation }) {
  const { level, weekNumber, audio } = route.params;
  
  // Now can use:
  // level → 'beginners'
  // weekNumber → 1
  // audio.id → 'bg_w1_a1'
  // audio.title → 'Elementary Principles'
}
```

#### Prop Types

```javascript
// String prop
<Component name="John" />

// Number prop (use curly braces for non-strings!)
<Component age={30} />

// Boolean prop
<Component isActive={true} />
<Component isActive />  {/* Shorthand for true */}

// Array prop
<Component items={[1, 2, 3]} />

// Object prop
<Component user={{ name: 'John', age: 30 }} />

// Function prop
<Component onPress={() => console.log('Pressed')} />
```

**From YOUR CODE: `HomeScreen.js`**

```javascript
<TouchableOpacity
  style={styles.levelCard}                    // Object prop
  onPress={() => handleLevelPress(item.key)}  // Function prop
  activeOpacity={0.7}                         // Number prop
>
  <Text style={styles.levelTitle}>{levelData.title}</Text>
</TouchableOpacity>
```

#### Function Props (Callbacks)

**Passing functions as props for communication back to parent:**

```javascript
// Parent
function ParentScreen() {
  const handleAudioComplete = (audioId) => {
    console.log('Audio completed:', audioId);
  };

  return (
    <AudioPlayer 
      audioId="bg_w1_a1"
      onComplete={handleAudioComplete}  // Pass function as prop
    />
  );
}

// Child
function AudioPlayer({ audioId, onComplete }) {
  const finishAudio = () => {
    // Do some work...
    onComplete(audioId);  // Call parent's function
  };

  return <Button onPress={finishAudio}>Finish</Button>;
}
```

**From YOUR CODE: `HomeScreen.js` (TouchableOpacity)**

```javascript
<TouchableOpacity
  onPress={() => handleLevelPress(item.key)}
>
  {/* Content */}
</TouchableOpacity>

// TouchableOpacity is receiving a function prop (onPress)
// When pressed, it calls your function
```

#### Default Props

```javascript
function Greeting({ name = 'Guest', age = 0 }) {
  return <Text>Hello {name}, age {age}</Text>;
}

// Usage:
<Greeting />                    // "Hello Guest, age 0"
<Greeting name="John" />        // "Hello John, age 0"
<Greeting name="John" age={30} /> // "Hello John, age 30"
```

**From YOUR CODE: `storage.js`**

```javascript
export const saveProgress = async (
  audioId,
  completed = false,    // Default prop
  position = 0          // Default prop
) => {
  // If not provided, completed = false, position = 0
};

// Usage:
saveProgress('bg_w1_a1');                    // Uses defaults
saveProgress('bg_w1_a1', true);              // completed=true, position=0
saveProgress('bg_w1_a1', true, 45000);       // All provided
```

#### Props are Read-Only

```javascript
// ❌ WRONG - Never modify props
function MyComponent({ count }) {
  count = count + 1;  // ERROR! Props are immutable
  return <Text>{count}</Text>;
}

// ✅ CORRECT - Use state if you need to modify
function MyComponent({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  
  const increment = () => setCount(count + 1);
  
  return (
    <View>
      <Text>{count}</Text>
      <Button onPress={increment}>Increment</Button>
    </View>
  );
}
```

#### Props vs State

| Props | State |
|-------|-------|
| Passed from parent | Created in component |
| Read-only | Can be modified |
| Like function arguments | Like local variables |
| Trigger re-render when changed | Trigger re-render when changed |

#### Practice Exercise

```javascript
// 1. Create a WeekCard component that receives props
const WeekCard = ({ weekNumber, title, totalAudios, completedAudios, onPress }) => {
  const percentage = (completedAudios / totalAudios) * 100;
  
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>Week {weekNumber}</Text>
      <Text>{title}</Text>
      <Text>{completedAudios}/{totalAudios} completed</Text>
      <Text>{percentage}%</Text>
    </TouchableOpacity>
  );
};

// 2. Use it in a parent component
function WeekList() {
  const weeks = [
    { weekNumber: 1, title: 'Elementary Principles', total: 2, completed: 1 },
    { weekNumber: 2, title: 'Faith &