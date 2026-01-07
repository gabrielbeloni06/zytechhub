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

    const query = `${termo} em ${cidade}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}&language=pt-BR`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ error: data.error_message || 'Erro no Google' }, { status: 400 });
    }

    const leads = data.results.map((place: any) => {
      const { phone, type } = cleanPhone(place.formatted_phone_number);
      return {
        nome: place.name,
        endereco: place.formatted_address,
        rating: place.rating || 'N/A',
        total_reviews: place.user_ratings_total || 0,
        telefone_original: place.formatted_phone_number,
        telefone_api: phone,
        tipo: type
      };
    });

    leads.sort((a: any, b: any) => (a.tipo === 'CELULAR' ? -1 : 1));

    return NextResponse.json({ leads });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}