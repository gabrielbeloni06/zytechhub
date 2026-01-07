import { NextResponse } from 'next/server';

function cleanPhone(rawPhone: string) {
  if (!rawPhone) return { phone: 'N/A', type: 'DESCONHECIDO' };
  
  let nums = rawPhone.replace(/\D/g, '');
  
  if (nums.length <= 11) nums = '55' + nums;
  
  const localNum = nums.substring(2); 
  let type = 'FIXO';
  if (localNum.length === 11 && localNum[2] === '9') {
    type = 'CELULAR';
  }

  return { phone: nums, type };
}

export async function POST(req: Request) {
  try {
    const { termo, cidade } = await req.json();
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) return NextResponse.json({ error: 'API Key não configurada' }, { status: 500 });

    const url = 'https://places.googleapis.com/v1/places:searchText';

    const textQuery = `${termo} em ${cidade}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount'
      },
      body: JSON.stringify({
        textQuery: textQuery,
        languageCode: "pt-BR"
      })
    });

    const data = await res.json();

    if (!data.places) {
      console.error("Google Error:", data);
      return NextResponse.json({ error: 'Nenhum resultado ou erro na API' }, { status: 400 });
    }

    const leads = data.places.map((place: any) => {
      const { phone, type } = cleanPhone(place.nationalPhoneNumber);
      
      return {
        nome: place.displayName?.text || 'Sem Nome',
        endereco: place.formattedAddress || 'Endereço não disponível',
        rating: place.rating || 'N/A',
        total_reviews: place.userRatingCount || 0,
        telefone_original: place.nationalPhoneNumber || null,
        telefone_api: phone,
        tipo: type
      };
    });

    leads.sort((a: any, b: any) => (a.tipo === 'CELULAR' ? -1 : 1));

    return NextResponse.json({ leads });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}