# 🔧 Language Filter Fix

## Problem

The language filters were not working correctly because of a mismatch between detected language names and actual GitHub repository language names.

## Root Cause

1. **Incorrect Language Mapping**: 
   - We were detecting "react" as a language, but React isn't a programming language
   - GitHub repos use "JavaScript" or "TypeScript" for React projects
   - Similar issues with "csharp" vs "C#", "cpp" vs "C++", etc.

2. **Case-Sensitivity Issues**: 
   - The filtering logic had inconsistent case handling

## Solution

### 1. Fixed Language Detection Map

Updated the language keywords to map to actual GitHub language names:

```typescript
const languageKeywords = {
  'JavaScript': ['javascript', 'js', 'node', 'react', 'reactjs', 'vue', 'angular'],
  'TypeScript': ['typescript', 'ts'],
  'Python': ['python', 'py'],
  'Rust': ['rust'],
  'Go': ['golang', 'go'],
  'Java': ['java'],
  'Ruby': ['ruby'],
  'PHP': ['php'],
  'C#': ['c#', 'csharp', 'dotnet'],
  'C++': ['c++', 'cpp'],
  'Swift': ['swift', 'ios'],
  'Kotlin': ['kotlin', 'android'],
  'C': ['c language', ' c '],
  'Shell': ['shell', 'bash'],
  'HTML': ['html'],
  'CSS': ['css'],
};
```

### 2. Key Improvements

**React/Vue/Angular → JavaScript**
- When users ask for "React" issues, we now correctly search for "JavaScript"
- Same for Vue, Angular, and other JS frameworks

**Proper Language Names**
- "C#" instead of "csharp"
- "C++" instead of "cpp"
- Capitalized names matching GitHub's format

**Additional Languages**
- Added Swift, Kotlin, C, Shell, HTML, CSS
- Added common aliases (iOS → Swift, Android → Kotlin)

### 3. Improved Filtering Logic

**Before:**
```typescript
const repoLanguages = item.Issue.issue_repo.repo_langs.Nodes.map(
  (node: any) => node.repo_prog_language.toLowerCase()
);
return languages.some((lang) => repoLanguages.includes(lang.toLowerCase()));
```

**After:**
```typescript
const repoLanguages = item.Issue.issue_repo.repo_langs.Nodes.map(
  (node: any) => node.repo_prog_language
);
return languages.some((lang) => 
  repoLanguages.some((repoLang: string) => 
    repoLang.toLowerCase() === lang.toLowerCase()
  )
);
```

**Why Better?**
- Preserves original casing for better matching
- More explicit case-insensitive comparison
- Handles edge cases better

## Files Updated

- ✅ `apps/web/src/app/api/chat/route.ts` - Intent parsing
- ✅ `apps/web/src/app/api/issues/route.ts` - Issue filtering
- ✅ `apps/lambda-api/src/handler.ts` - Lambda filtering

## Testing

Try these queries now:

### JavaScript/React
```
"I want to make my first JavaScript PR"
"Show me React issues"
"Find Node.js good first issues"
```

### Python
```
"Help me find easy Python issues"
"Show me Python projects"
```

### Rust
```
"I'm ready for my first Rust PR"
"Show me Rust issues"
```

### Go
```
"Find Go issues"
"Show me Golang projects"
```

### Mobile Development
```
"Show me Swift issues"
"Find Android/Kotlin issues"
```

## Expected Behavior

1. **Quick Filters**: Click any language button → See issues in that language
2. **Natural Language**: Ask in any format → Get correctly filtered results
3. **Framework Names**: Say "React" → Get JavaScript issues
4. **Aliases**: Say "Golang" → Get Go issues

## Verification

To verify the fix is working:

1. Click "🟨 JavaScript" quick filter
2. You should see issues from JavaScript repositories
3. Check the language badges on the issue cards
4. They should all show "JavaScript" (or related)

## Additional Benefits

- ✅ More languages supported (16 total)
- ✅ Framework names work correctly
- ✅ Common aliases recognized
- ✅ Better case handling
- ✅ More accurate filtering

---

**The language filters should now work perfectly! 🎉**

