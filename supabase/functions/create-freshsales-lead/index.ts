
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ContactFormData {
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  subject: string;
  message: string;
}

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Define the response error helper
const responseError = (message: string, status = 400) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return responseError('Method not allowed', 405);
  }

  try {
    // Parse the request body
    const formData = await req.json() as ContactFormData;
    
    // Validate required fields
    if (!formData.name || !formData.email) {
      return responseError('Name and email are required');
    }
    
    // Get the Freshsales API key from environment variables
    const freshsalesApiKey = Deno.env.get('FRESHSALES_API_KEY');
    const freshsalesSubdomain = Deno.env.get('FRESHSALES_SUBDOMAIN') || 'uae';
    
    if (!freshsalesApiKey) {
      return responseError('Freshsales API key not configured', 500);
    }
    
    // Parse name into first and last name
    const nameParts = formData.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
    
    // Prepare the lead data for Freshsales API
    const leadData = {
      lead: {
        first_name: firstName,
        last_name: lastName || '-',
        email: formData.email,
        mobile_number: formData.phone || null,
        company: formData.organization || null,
        custom_field: {
          cf_subject: formData.subject,
          cf_message: formData.message
        },
        lead_source_id: 1, // Assuming 1 is the ID for "Website"
        lead_type_id: 1,    // Assuming 1 is the ID for "Potential Customer"
      }
    };

    console.log(`Creating lead in Freshsales with data:`, leadData);
    
    // Send the lead data to Freshsales API
    const freshsalesUrl = `https://${freshsalesSubdomain}.freshsales.io/api/leads`;
    const response = await fetch(freshsalesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token token=${freshsalesApiKey}`
      },
      body: JSON.stringify(leadData)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Freshsales API error:', responseData);
      return responseError(`Error creating lead: ${JSON.stringify(responseData)}`, response.status);
    }
    
    // Return success response with lead data
    return new Response(JSON.stringify({
      success: true,
      message: 'Lead created successfully in Freshsales',
      leadId: responseData.lead?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return responseError(`Server error: ${error.message}`, 500);
  }
});
