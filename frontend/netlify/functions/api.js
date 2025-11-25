exports.handler = async (event, context) => {
  const { path, httpMethod, headers, body, queryStringParameters } = event;
  
  // Build backend URL
  const apiPath = path.replace('/.netlify/functions/api', '');
  const queryString = queryStringParameters ? 
    '?' + new URLSearchParams(queryStringParameters).toString() : '';
  const backendUrl = `http://13.53.39.8/api${apiPath}${queryString}`;
  
  try {
    // Forward request to backend
    const response = await fetch(backendUrl, {
      method: httpMethod,
      headers: {
        'Content-Type': headers['content-type'] || 'application/json',
        'Authorization': headers.authorization || ''
      },
      body: httpMethod !== 'GET' && httpMethod !== 'HEAD' ? body : undefined
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
