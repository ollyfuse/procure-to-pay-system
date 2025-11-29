exports.handler = async (event, context) => {
  const { path, httpMethod, headers, body, queryStringParameters, isBase64Encoded } = event;
  
  try {
    // Build backend URL
    const apiPath = path.replace('/.netlify/functions/api', '');
    const queryString = queryStringParameters ? 
      '?' + new URLSearchParams(queryStringParameters).toString() : '';
    const backendUrl = `http://16.171.30.43/api${apiPath}${queryString}`;
    
    console.log('Proxying request:', {
      method: httpMethod,
      url: backendUrl,
      hasBody: !!body,
      contentType: headers['content-type']
    });
    
    // Prepare headers
    const forwardHeaders = {};
    
    // Forward authorization header
    if (headers.authorization) {
      forwardHeaders['Authorization'] = headers.authorization;
    }
    
    // Handle content-type for file uploads
    if (headers['content-type']) {
      forwardHeaders['Content-Type'] = headers['content-type'];
    }
    
    // Prepare body for file uploads
    let requestBody = undefined;
    if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && body) {
      if (isBase64Encoded) {
        // For binary data (file uploads)
        requestBody = Buffer.from(body, 'base64');
      } else {
        // For regular JSON/form data
        requestBody = body;
      }
    }
    
    // Make request to backend
    const response = await fetch(backendUrl, {
      method: httpMethod,
      headers: forwardHeaders,
      body: requestBody
    });
    
    const responseText = await response.text();
    
    console.log('Backend response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 200) // Log first 200 chars
    });
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: responseText
    };
    
  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Function error: ' + error.message,
        stack: error.stack
      })
    };
  }
};
