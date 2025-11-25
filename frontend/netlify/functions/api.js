exports.handler = async (event, context) => {
  const { path, httpMethod, headers, body, queryStringParameters, isBase64Encoded } = event;
  
  // Build backend URL
  const apiPath = path.replace('/.netlify/functions/api', '');
  const queryString = queryStringParameters ? 
    '?' + new URLSearchParams(queryStringParameters).toString() : '';
  const backendUrl = `http://13.53.39.8/api${apiPath}${queryString}`;
  
  try {
    // Prepare headers
    const forwardHeaders = {};
    
    // Forward important headers
    if (headers.authorization) {
      forwardHeaders['Authorization'] = headers.authorization;
    }
    
    // Handle content-type properly for file uploads
    if (headers['content-type']) {
      forwardHeaders['Content-Type'] = headers['content-type'];
    }
    
    // Prepare body
    let requestBody = undefined;
    if (httpMethod !== 'GET' && httpMethod !== 'HEAD' && body) {
      if (isBase64Encoded) {
        requestBody = Buffer.from(body, 'base64');
      } else {
        requestBody = body;
      }
    }
    
    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: httpMethod,
      headers: forwardHeaders,
      body: requestBody
    });
    
    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': response.headers.get('content-type') || 'application/json'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
