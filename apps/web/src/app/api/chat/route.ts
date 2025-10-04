import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  try {
    // Simple AI logic to parse user intent
    const parsedIntent = parseUserIntent(message);
    
    // Build query parameters for issues API
    const params = new URLSearchParams();
    
    if (parsedIntent.languages.length > 0) {
      params.set('languages', parsedIntent.languages.join(','));
    }
    
    if (parsedIntent.minStars) {
      params.set('minStars', parsedIntent.minStars.toString());
    }
    
    if (parsedIntent.unassignedOnly) {
      params.set('unassignedOnly', 'true');
    }
    
    if (parsedIntent.maxComments) {
      params.set('maxComments', parsedIntent.maxComments.toString());
    }

    params.set('limit', '5'); // Show 5 issues per response

    // Fetch filtered issues
    const baseUrl = request.nextUrl.origin;
    const issuesResponse = await fetch(`${baseUrl}/api/issues?${params.toString()}`);
    const issuesData = await issuesResponse.json();

    // Generate response message
    const responseMessage = generateResponseMessage(parsedIntent, issuesData);

    return NextResponse.json({
      success: true,
      message: responseMessage,
      issues: issuesData.data || [],
      meta: issuesData.meta,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function parseUserIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Detect languages - map to actual GitHub language names
  const languages: string[] = [];
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

  for (const [lang, keywords] of Object.entries(languageKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      if (!languages.includes(lang)) {
        languages.push(lang);
      }
    }
  }

  // Detect star requirements
  let minStars: number | undefined;
  if (lowerMessage.includes('popular')) {
    minStars = 500;
  } else if (lowerMessage.includes('very popular') || lowerMessage.includes('famous')) {
    minStars = 1000;
  }

  // Detect unassigned preference
  const unassignedOnly = lowerMessage.includes('unassigned') || 
                         lowerMessage.includes('available') ||
                         lowerMessage.includes('no one assigned');

  // Detect comment preference (beginner-friendly usually means fewer comments)
  let maxComments: number | undefined;
  if (lowerMessage.includes('beginner') || 
      lowerMessage.includes('easy') || 
      lowerMessage.includes('simple')) {
    maxComments = 5;
  }

  return {
    languages,
    minStars,
    unassignedOnly,
    maxComments,
  };
}

function generateResponseMessage(intent: any, data: any) {
  const { languages, minStars, unassignedOnly } = intent;
  const total = data.meta?.total || 0;

  if (total === 0) {
    return "I couldn't find any issues matching your criteria. Try adjusting your filters or asking for different languages!";
  }

  let message = `I found ${total} good first issue${total !== 1 ? 's' : ''}`;
  
  if (languages.length > 0) {
    message += ` for ${languages.join(', ')}`;
  }
  
  if (minStars) {
    message += ` from popular repositories (${minStars}+ stars)`;
  }
  
  if (unassignedOnly) {
    message += ` that are currently unassigned`;
  }

  message += '. Here are the top matches:';

  return message;
}

